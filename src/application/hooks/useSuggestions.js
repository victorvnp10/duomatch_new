import { useState, useEffect, useCallback, useMemo } from "react";
import {
  db,
  doc,
  arrayUnion,
  onSnapshot,
  serverTimestamp,
  runTransaction,
} from "../../infrastructure/firebase";
import {
  getActivityCatalog,
  pickVaried,
} from "../../infrastructure/firebase/repositories/ContentRepository";
import { getTodayDateString } from "../../shared/utils";

// Gera um objeto de sugestões aleatórias no formato persistido, evitando
// itens usados recentemente (anti-repetição). Devolve também os ids
// escolhidos para registrar no histórico do casal.
// Chamado apenas DENTRO de transações, para concorrência segura.
const buildRandomSuggestions = (pool, recentIds) => {
  const picked = pickVaried(pool || [], 5, recentIds);
  const suggestions = picked.reduce((acc, s, index) => {
    const id = `sug_${index}`;
    acc[id] = {
      ...s,
      id,
      selections: {},
      matched: false,
      type: "atividade",
      periodicity: null,
    };
    return acc;
  }, {});
  return { suggestions, pickedIds: picked.map((s) => s.id) };
};

export const useSuggestions = (userData, _handleAddActivity, suggestionType) => {
  // O estado agora é um OBJETO, que é mais eficiente para o Firestore
  const [suggestions, setSuggestions] = useState({});

  // Dia de referência do listener e dos handlers. Reavaliado periodicamente
  // para que o app aberto na virada da meia-noite migre para o doc do novo
  // dia — listener e cliques sempre operam sobre o MESMO dia.
  const [today, setToday] = useState(getTodayDateString());

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = getTodayDateString();
      setToday((prev) => (prev === now ? prev : now));
    }, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Pool carregado do catálogo global no Firestore (assíncrono), filtrado
  // pelo flavor correspondente. Até carregar, fica vazio — a geração do dia
  // só acontece quando houver itens disponíveis.
  const [activityPool, setActivityPool] = useState(null);

  useEffect(() => {
    let active = true;
    setActivityPool(null);
    getActivityCatalog()
      .then((catalog) => {
        if (!active) return;
        const flavor = suggestionType === "hot" ? "hot" : "normal";
        setActivityPool(catalog.filter((a) => a.flavor === flavor));
      })
      .catch(() => {
        if (active) setActivityPool([]);
      });
    return () => {
      active = false;
    };
  }, [suggestionType]);

  // Objeto de configuração para tornar o hook dinâmico
  const config = useMemo(() => {
    if (suggestionType === "hot") {
      return {
        pool: activityPool || [],
        collectionName: "hotSuggestions", // Coleção separada no Firestore
      };
    }
    return {
      pool: activityPool || [],
      collectionName: "dailySuggestions", // Coleção padrão
    };
  }, [suggestionType, activityPool]);

  // Geração transacional: só grava um conjunto novo se o doc do dia ainda
  // não existir. Dois clientes gerando em paralelo chegam ao MESMO doc —
  // o segundo reutiliza o primeiro em vez de sobrescrevê-lo (um setDoc
  // full-replace apagaria seleções já feitas).
  const ensureSuggestionsForDay = useCallback(
    async (ref) => {
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(ref);
        if (snap.exists()) return;

        const coupleRef = doc(db, "duomatches", userData?.coupleId);
        const coupleSnap = await transaction.get(coupleRef);
        const recent = coupleSnap.data()?.recentActivityIds || [];

        const { suggestions, pickedIds } = buildRandomSuggestions(
          config.pool,
          recent
        );
        // Se o catálogo ainda não carregou, não trava o dia com um doc vazio.
        if (!Object.keys(suggestions).length) return;
        transaction.set(ref, { suggestions });
        if (pickedIds.length) {
          transaction.update(coupleRef, {
            recentActivityIds: arrayUnion(...pickedIds),
          });
        }
      });
    },
    [config.pool, userData?.coupleId]
  );

  // Efeito para "ouvir" as sugestões do dia em tempo real
  useEffect(() => {
    if (!userData?.coupleId) return;
    const suggestionsRef = doc(
      db,
      `duomatches/${userData.coupleId}/${config.collectionName}`,
      today
    );

    const unsubscribe = onSnapshot(suggestionsRef, (docSnap) => {
      if (docSnap.exists()) {
        setSuggestions(docSnap.data().suggestions || {});
      } else {
        ensureSuggestionsForDay(suggestionsRef);
      }
    });

    return () => unsubscribe();
  }, [userData?.coupleId, ensureSuggestionsForDay, config.collectionName, today]);

  // Função para lidar com o clique em uma sugestão.
  // Toda a leitura/escrita acontece DENTRO da transação (estado real do
  // servidor, não o estado React possivelmente obsoleto) e os efeitos
  // colaterais (eventos/toasts) acontecem DEPOIS que a transação commita —
  // o corpo de uma transação pode executar várias vezes em caso de retry.
  const handleSelectSuggestion = useCallback(
    async (suggestionId) => {
      if (!userData?.coupleId || !userData?.uid || !userData?.partnerId) return;

      const suggestionsRef = doc(
        db,
        `duomatches/${userData.coupleId}/${config.collectionName}`,
        today
      );
      const suggestionType =
        config.collectionName === "hotSuggestions" ? "hot" : "normal";

      let matchInfo = null;

      try {
        await runTransaction(db, async (transaction) => {
          const docSnap = await transaction.get(suggestionsRef);
          const existing = docSnap.exists()
            ? docSnap.data().suggestions
            : null;

          let workingSuggestions = existing;
          const mustCreateDoc = !existing;
          let pickedIds = [];

          if (!workingSuggestions) {
            // Doc do dia ainda não existe — gera dentro da própria transação,
            // garantindo que clientes simultâneos compartilhem o mesmo doc.
            const coupleRef = doc(db, "duomatches", userData.coupleId);
            const coupleSnap = await transaction.get(coupleRef);
            const recent = coupleSnap.data()?.recentActivityIds || [];
            const built = buildRandomSuggestions(config.pool, recent);
            workingSuggestions = built.suggestions;
            pickedIds = built.pickedIds;
          }

          const freshSuggestion = workingSuggestions[suggestionId];
          if (!freshSuggestion || freshSuggestion.matched) return;

          // Toggle calculado a partir do estado REAL do servidor
          const myCurrentStatus = freshSuggestion.selections?.[userData.uid];
          const newStatus =
            myCurrentStatus === "selected" ? null : "selected";

          if (mustCreateDoc) {
            workingSuggestions = {
              ...workingSuggestions,
              [suggestionId]: {
                ...freshSuggestion,
                selections: { [userData.uid]: newStatus },
              },
            };
            transaction.set(suggestionsRef, {
              suggestions: workingSuggestions,
            });
            if (pickedIds.length) {
              transaction.update(doc(db, "duomatches", userData.coupleId), {
                recentActivityIds: arrayUnion(...pickedIds),
              });
            }
          } else {
            // Notação de ponto altera apenas o campo do usuário, sem
            // sobrescrever a seleção do parceiro.
            transaction.update(suggestionsRef, {
              [`suggestions.${suggestionId}.selections.${userData.uid}`]:
                newStatus,
            });
          }

          // Match: ambos selecionaram a mesma sugestão
          if (
            newStatus === "selected" &&
            freshSuggestion.selections?.[userData.partnerId] === "selected"
          ) {
            // Marcar como matched. NÃO zerar o mapa `selections` inteiro:
            // isso sobrepõe o path `selections.{uid}` gravado acima na mesma
            // escrita (paths de update sobrepostos são rejeitados pelo
            // Firestore, abortando a transação). A UI filtra matched.
            transaction.update(suggestionsRef, {
              [`suggestions.${suggestionId}.matched`]: true,
            });

            const confirmedSelections = {
              [userData.uid]: { status: "confirmed", date: today },
              [userData.partnerId]: { status: "confirmed", date: today },
            };
            const {
              id,
              selections,
              matched,
              ...baseActivityData
            } = freshSuggestion;
            const finalActivityData = {
              ...baseActivityData,
              selections: confirmedSelections,
              completionStatus: null,
              createdBy: "SYSTEM",
              createdAt: serverTimestamp(),
            };

            // Gravar a atividade dentro da mesma transação
            const newActivityRef = doc(
              db,
              `duomatches/${userData.coupleId}/activities`
            );
            transaction.set(newActivityRef, finalActivityData);

            matchInfo = {
              name: freshSuggestion.name,
              type: suggestionType,
            };
          }
        });
      } catch (error) {
        console.error("Erro ao selecionar sugestão:", error);
        alert("Não foi possível registrar sua escolha. Tente novamente.");
        return;
      }

      // Notificar sobre o match FORA da transação — disparado uma única vez,
      // somente se o commit realmente aconteceu.
      if (matchInfo) {
        setTimeout(() => {
          if (matchInfo.type === "hot") {
            // dispatchHotMatchEvent já dispara 'hotActivityMatch' — usar
            // UMA única vez para não duplicar o evento.
            if (window.dispatchHotMatchEvent) {
              window.dispatchHotMatchEvent(matchInfo.name);
            } else {
              window.dispatchEvent(
                new CustomEvent("hotActivityMatch", {
                  detail: { activityName: matchInfo.name },
                })
              );
            }
          } else {
            window.dispatchEvent(
              new CustomEvent("activityMatch", { detail: matchInfo.name })
            );
          }
        }, 1500);
      }
    },
    [userData, config.collectionName, config.pool, today]
  );

  return { suggestions, handleSelectSuggestion };
};