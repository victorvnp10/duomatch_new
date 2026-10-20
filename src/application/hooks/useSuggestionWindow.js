import { useEffect, useState } from "react";
import { db, doc, getDoc } from "../../infrastructure/firebase";
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

  useEffect(() => {
    if (!coupleId || !startDate) {
      setWindowSuggestions({});
      return;
    }

    const today = getTodayDateString();
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
        const requests = [];
        for (const day of days) {
          for (const name of ["dailySuggestions", "hotSuggestions"]) {
            requests.push(
              getDoc(doc(db, `duomatches/${coupleId}/${name}`, day)).catch(() => null)
            );
          }
        }
        const snaps = await Promise.all(requests);
        if (cancelled) return;

        const merged = {};
        for (const snap of snaps) {
          if (!snap?.exists?.()) continue;
          Object.assign(merged, snap.data()?.suggestions || {});
        }
        setWindowSuggestions(merged);
      } catch (error) {
        // Falha de leitura não pode derrubar o painel: mantém o que já havia.
        console.error("Erro ao carregar as sugestões da janela da rodada:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [coupleId, startDate, endDate]);

  return windowSuggestions;
};
