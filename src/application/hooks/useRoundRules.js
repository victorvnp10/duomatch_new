import { useEffect, useCallback, useRef } from "react";
import { db, doc, increment, runTransaction } from "../../infrastructure/firebase";
import { getTodayDateString } from "../../shared/utils";
import {
  findActiveRound,
  evaluateCyclicalRules,
  shouldEvaluateCyclicalRules,
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
  // O tamanho dos arrays nao muda quando alguem marca/desmarca uma atividade.
  // Estas revisoes incluem apenas campos que alteram a contagem das regras.
  const rulesRevision = rounds
    .map((round) =>
      [
        round.id,
        round.startDate,
        round.endDate,
        JSON.stringify(round.rules || {}),
      ].join(":"),
    )
    .join("|");
  const activitiesRevision = allActivities
    .map((activity) => {
      const mySelection = activity.selections?.[user?.uid];
      const partnerSelection = activity.selections?.[userData?.partnerId];
      return [
        activity.id,
        activity.type,
        activity.createdBy,
        activity.challengeState,
        mySelection?.status,
        mySelection?.date,
        partnerSelection?.status,
        partnerSelection?.date,
      ].join(":");
    })
    .join("|");

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

        const roundUpdate = {};
        for (const [uid, delta] of Object.entries(plan.scoreDeltas)) {
          if (delta !== 0) {
            roundUpdate[`scores.${uid}`] = increment(delta);
          }
        }
        for (const [key, value] of Object.entries(plan.lastCheckedUpdates)) {
          roundUpdate[`rulesLastChecked.${key}`] = value;
        }
        // Uma única escrita no documento da rodada. Várias chamadas
        // transaction.update() para o mesmo documento podem fazer a
        // transação falhar, deixando o painel sem registrar a avaliação.
        if (Object.keys(roundUpdate).length > 0) {
          transaction.update(roundRef, roundUpdate);
        }
      });
    } catch (error) {
      console.error("Erro ao processar regras cíclicas da rodada:", error);
    }
  }, [rounds, allActivities, user?.uid, userData?.partnerId, userData?.coupleId]);

  // Mantém sempre a versão mais recente da avaliação sem recriar o listener.
  // O efeito depende das revisões primitivas acima: uma marcação/desmarcação
  // da mesma atividade dispara a avaliação, mas um re-render sem mudança de
  // dados não abre outra transação.
  const runEvaluationRef = useRef(runEvaluation);
  useEffect(() => {
    runEvaluationRef.current = runEvaluation;
  });

  useEffect(() => {
    if (
      shouldEvaluateCyclicalRules({
        rounds,
        coupleId: userData?.coupleId,
      })
    ) {
      runEvaluationRef.current();
    }
  }, [rulesRevision, activitiesRevision, userData?.coupleId]);
};
