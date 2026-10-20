import { useEffect, useMemo, useState } from "react";
import { db, doc, getDoc, onSnapshot } from "../../infrastructure/firebase";
import { getTodayDateString } from "../../shared/lib/dateUtils";

/**
 * Carrega as sugestões (diárias e da hot zone) de TODOS os dias da janela de
 * avaliação corrente, para a meta cíclica da rodada.
 *
 * Por que não usar o que o app já tem: `useSuggestions` mantém apenas o
 * documento de HOJE. A regra da rodada conta marcações dentro de uma janela de
 * dias, e as sugestões vivem em um documento por dia
 * (`duomatches/{coupleId}/dailySuggestions/{YYYY-MM-DD}`). Contar só o de hoje
 * faria o painel mostrar menos do que o avaliador realmente pontua — o usuário
 * veria "1 de 5" e poderia ser avaliado como "3 de 5". Painel e avaliador
 * precisam do MESMO conjunto de dados.
 *
 * Duas partes, de propósito:
 *
 *  1. JANELA — os dias passados são imutáveis (a marcação só existe no dia em
 *     que foi feita), então uma leitura única basta e evita dezenas de
 *     listeners abertos.
 *  2. HOJE — ao vivo, por `onSnapshot`. É a única parte que muda enquanto o
 *     usuário está na tela. Sem isso o painel recalcula com o dado velho e o
 *     contador NÃO ANDA quando a pessoa marca uma sugestão — que é exatamente
 *     o defeito relatado ("marco as sugestões especiais e o placar não conta").
 *     Reagir à marcação por dependência de estado não resolve: quem escreve é
 *     `useSuggestions`, e o estado dele não é o dado.
 *
 * Somente leitura e somente para exibição: a marcação continua sendo feita por
 * `useSuggestions`. Este hook não escreve nada.
 *
 * @param {string|null} coupleId
 * @param {string|null} startDate  início da janela (YYYY-MM-DD), inclusive
 * @param {string|null} endDate    fim da janela (YYYY-MM-DD), inclusive
 * @returns {Object} mapa mesclado `{ [suggestionId]: sugestão }`
 */
export const useSuggestionWindow = (coupleId, startDate, endDate) => {
  const [windowSuggestions, setWindowSuggestions] = useState({});
  const [dailyToday, setDailyToday] = useState({});
  const [hotToday, setHotToday] = useState({});

  const today = getTodayDateString();

  // Parte 1 — a janela, uma leitura por janela.
  useEffect(() => {
    if (!coupleId || !startDate) {
      setWindowSuggestions({});
      return;
    }

    const end = endDate && endDate < today ? endDate : today;
    if (startDate > end) {
      setWindowSuggestions({});
      return;
    }

    // Lista de dias da janela. Teto de segurança: uma janela mal configurada
    // (anos) não pode disparar centenas de leituras.
    const days = [];
    const cursor = new Date(`${startDate}T12:00:00`);
    const last = new Date(`${end}T12:00:00`);
    while (cursor <= last && days.length < 62) {
      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, "0");
      const d = String(cursor.getDate()).padStart(2, "0");
      days.push(`${y}-${m}-${d}`);
      cursor.setDate(cursor.getDate() + 1);
    }

    let cancelled = false;

    (async () => {
      try {
        // Cada leitura leva o DIA junto: o dia do documento é a data exata da
        // marcação (a sugestão mora em `dailySuggestions/{dia}` e o app só
        // marca o documento de hoje). Sem isso, marcação antiga — sem
        // `selectionDates` — fica invisível para o painel.
        const requests = [];
        for (const day of days) {
          for (const name of ["dailySuggestions", "hotSuggestions"]) {
            requests.push({
              day,
              promise: getDoc(doc(db, `duomatches/${coupleId}/${name}`, day)).catch(
                () => null
              ),
            });
          }
        }
        const settled = await Promise.all(requests.map((r) => r.promise));
        if (cancelled) return;

        const merged = {};
        settled.forEach((snap, index) => {
          if (!snap?.exists?.()) return;
          const day = requests[index].day;
          for (const [id, suggestion] of Object.entries(
            snap.data()?.suggestions || {}
          )) {
            merged[id] = { ...suggestion, suggestionDay: day };
          }
        });
        setWindowSuggestions(merged);
      } catch (error) {
        // Falha de leitura não pode derrubar o painel: mantém o que já havia.
        console.error("Erro ao carregar as sugestões da janela da rodada:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [coupleId, startDate, endDate, today]);

  // Parte 2 — HOJE, ao vivo. É aqui que a marcação aparece.
  useEffect(() => {
    if (!coupleId) {
      setDailyToday({});
      setHotToday({});
      return;
    }

    const subscribe = (collectionName, setter) =>
      onSnapshot(
        doc(db, `duomatches/${coupleId}/${collectionName}`, today),
        (snap) => {
          const raw = snap.exists() ? snap.data()?.suggestions || {} : {};
          const withDay = {};
          for (const [id, suggestion] of Object.entries(raw)) {
            withDay[id] = { ...suggestion, suggestionDay: today };
          }
          setter(withDay);
        },
        () => {
          // Erro de assinatura não pode derrubar o painel.
        }
      );

    const unsubscribeDaily = subscribe("dailySuggestions", setDailyToday);
    const unsubscribeHot = subscribe("hotSuggestions", setHotToday);

    return () => {
      unsubscribeDaily();
      unsubscribeHot();
    };
  }, [coupleId, today]);

  // Hoje por último: se um id existir nos dois, o dado ao vivo prevalece.
  return useMemo(
    () => ({ ...windowSuggestions, ...dailyToday, ...hotToday }),
    [windowSuggestions, dailyToday, hotToday]
  );
};
