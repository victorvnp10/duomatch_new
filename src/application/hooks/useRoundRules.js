import { useEffect, useCallback } from "react";
import { db, doc, writeBatch, increment } from "../../infrastructure/firebase";
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
 */
export const useRoundRules = ({ user, userData, rounds, allActivities }) => {
  const runEvaluation = useCallback(async () => {
    if (!userData?.coupleId || !rounds.length) return;

    const todayStr = getTodayDateString();
    const activeRound = findActiveRound(rounds, todayStr);
    if (!activeRound) return;

    const plan = evaluateCyclicalRules({
      activeRound,
      allActivities,
      userId: user.uid,
      partnerId: userData.partnerId,
      todayStr,
    });
    if (!plan) return;

    const roundRef = doc(db, `duomatches/${userData.coupleId}/rounds`, activeRound.id);
    const batch = writeBatch(db);

    for (const [uid, delta] of Object.entries(plan.scoreDeltas)) {
      if (delta !== 0) {
        batch.update(roundRef, { [`scores.${uid}`]: increment(delta) });
      }
    }
    for (const [key, value] of Object.entries(plan.lastCheckedUpdates)) {
      batch.update(roundRef, { [`rulesLastChecked.${key}`]: value });
    }

    try {
      await batch.commit();
    } catch (error) {
      console.error("Erro ao processar regras cíclicas da rodada:", error);
    }
  }, [rounds, allActivities, user?.uid, userData?.partnerId, userData?.coupleId]);

  useEffect(() => {
    if (rounds.length > 0 && allActivities.length > 0 && userData?.coupleId) {
      runEvaluation();
    }
  }, [rounds, allActivities, userData?.coupleId, runEvaluation]);
};
