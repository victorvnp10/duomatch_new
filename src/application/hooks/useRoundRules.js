import { useEffect, useCallback, useRef } from "react";
import { db, doc, increment, runTransaction } from "../../infrastructure/firebase";
import { getTodayDateString } from "../../shared/utils";
import {
  findActiveRound,
  evaluateCyclicalRules,
} from "../../domain/services/RoundRulesEvaluator";

/**
 * Hook de aplicação: dispara a avaliação das regras cíclicas de pontuação
 * (mínimo de atividades / desafios por período) sempre que rodadas ou
 * atividades mudam, e persiste o resultado no Firestore.
 *
 * A decisão de negócio (quem cumpriu a meta, qual a penalidade) vive em
 * `src/domain/services/RoundRulesEvaluator.js` — este hook só orquestra
 * quando avaliar e como gravar o resultado.
 *
 * A avaliação roda em TODOS os clientes do casal simultaneamente; por isso
 * a escrita é uma transação que relê o documento do servidor e reavalia as
 * regras com o `rulesLastChecked` FRESCO — se outro cliente já avaliou o
 * período, o intervalo ainda não se passou de novo e o plano sai vazio
 * (compare-and-set), impedindo penalidade/bônus aplicado em dobro.
 */
export const useRoundRules = ({ user, userData, rounds, allActivities }) => {
  const runEvaluation = useCallback(async () => {
    if (!userData?.coupleId || !rounds.length) return;

    const todayStr = getTodayDateString();
    const activeRound = findActiveRound(rounds, todayStr);
    if (!activeRound) return;

    const roundRef = doc(db, `duomatches/${userData.coupleId}/rounds`, activeRound.id);

    try {
      await runTransaction(db, async (transaction) => {
        const roundSnap = await transaction.get(roundRef);
        if (!roundSnap.exists()) return;

        // Reavalia com o estado REAL do servidor, não com o snapshot local.
        const freshRound = { ...activeRound, ...roundSnap.data() };
        const plan = evaluateCyclicalRules({
          activeRound: freshRound,
          allActivities,
          userId: user.uid,
          partnerId: userData.partnerId,
          todayStr,
        });
        if (!plan) return;

        const hasDeltas = Object.values(plan.scoreDeltas || {}).some((d) => d !== 0);
        const hasChecks = Object.keys(plan.lastCheckedUpdates || {}).length > 0;
        if (!hasDeltas && !hasChecks) return;

        for (const [uid, delta] of Object.entries(plan.scoreDeltas)) {
          if (delta !== 0) {
            transaction.update(roundRef, { [`scores.${uid}`]: increment(delta) });
          }
        }
        for (const [key, value] of Object.entries(plan.lastCheckedUpdates)) {
          transaction.update(roundRef, { [`rulesLastChecked.${key}`]: value });
        }
      });
    } catch (error) {
      console.error("Erro ao processar regras cíclicas da rodada:", error);
    }
  }, [rounds, allActivities, user?.uid, userData?.partnerId, userData?.coupleId]);

  // Mantém sempre a versão mais recente da avaliação sem recriar o listener.
  // O efeito abaixo só depende de primitivas (tamanhos + coupleId), então não
  // dispara a cada mudança de identidade dos arrays/rodadas, evitando a
  // cascata de re-transactions a cada snapshot do Firestore.
  const runEvaluationRef = useRef(runEvaluation);
  useEffect(() => {
    runEvaluationRef.current = runEvaluation;
  });

  useEffect(() => {
    if (rounds.length > 0 && allActivities.length > 0 && userData?.coupleId) {
      runEvaluationRef.current();
    }
  }, [rounds.length, allActivities.length, userData?.coupleId]);
};
