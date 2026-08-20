/**
 * Domínio: Regras cíclicas de uma Rodada (Round)
 *
 * Esta lógica de negócio vivia inteiramente dentro de
 * `src/components/DuoMatchApp.js` (função `checkCyclicalRules`), misturada
 * com estado de React e chamadas diretas ao Firestore. Isso violava a
 * regra da dependência da Clean Architecture (regra de negócio dependendo
 * de infraestrutura) e tinha duas implementações quase idênticas
 * (atividades x desafios) coladas lado a lado — uma violação clara de DRY.
 *
 * Aqui a decisão de negócio ("quem cumpriu a meta, quem não cumpriu, e
 * qual é a penalidade resultante") é isolada em funções puras, sem
 * nenhuma dependência de Firestore ou React. A camada de aplicação
 * (`src/application/hooks/useRoundRules.js`) usa o resultado para decidir
 * o que gravar.
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const daysBetween = (laterDateStr, earlierDateStr) =>
  Math.floor((new Date(laterDateStr) - new Date(earlierDateStr)) / MS_PER_DAY);

/** Retorna a rodada ativa na data informada, ou `null`. */
export const findActiveRound = (rounds, todayStr) =>
  rounds.find((r) => todayStr >= r.startDate && todayStr <= r.endDate) || null;

const activityCreationDate = (activity, fallback) => {
  if (activity.createdAt?.toDate) {
    return activity.createdAt.toDate().toISOString().slice(0, 10);
  }
  return activity.createdAt?.slice(0, 10) || fallback;
};

/**
 * Conta quantas atividades (não-desafio) um usuário confirmou dentro da
 * rodada atual, considerando apenas atividades criadas depois do início
 * da rodada (evita contar atividades antigas de rodadas anteriores).
 */
const countConfirmedActivitiesInRound = (allActivities, userId, activeRound, todayStr) => {
  return allActivities.filter((activity) => {
    if (activity.type?.startsWith("desafio")) return false;

    const creationDate = activityCreationDate(activity, todayStr);
    const wasCreatedInCurrentRound = creationDate >= activeRound.startDate;
    if (!wasCreatedInCurrentRound) return false;

    const selection = activity.selections?.[userId];
    if (selection?.status !== "confirmed") return false;

    return (
      selection.date >= activeRound.startDate &&
      selection.date <= activeRound.endDate
    );
  }).length;
};

/** Conta quantos desafios um usuário criou dentro da rodada atual. */
const countChallengesCreatedInRound = (allActivities, userId, activeRound) => {
  return allActivities.filter((activity) => {
    if (!activity.type?.startsWith("desafio")) return false;
    if (activity.createdBy !== userId) return false;

    const activityDate = activityCreationDate(activity, activeRound.startDate);
    return (
      activityDate >= activeRound.startDate && activityDate <= activeRound.endDate
    );
  }).length;
};

/**
 * Avalia uma meta cíclica (atividades OU desafios) e devolve o resultado
 * da avaliação, sem gravar nada. `countFn` decide como contar cada lado.
 */
const evaluateGoal = ({ rule, lastCheckedDate, todayStr, userId, partnerId, countFn }) => {
  if (!rule) return null;

  const referenceDate = lastCheckedDate || todayStr;
  if (daysBetween(todayStr, referenceDate) < rule.days) return null;

  const myCount = countFn(userId);
  const partnerCount = countFn(partnerId);
  const iMetGoal = myCount >= rule.quantity;
  const partnerMetGoal = partnerCount >= rule.quantity;

  let scoreDeltas = null;
  if (iMetGoal && !partnerMetGoal) {
    scoreDeltas = { [userId]: rule.penalty, [partnerId]: -rule.penalty };
  } else if (!iMetGoal && partnerMetGoal) {
    scoreDeltas = { [userId]: -rule.penalty, [partnerId]: rule.penalty };
  }

  return { myCount, partnerCount, iMetGoal, partnerMetGoal, scoreDeltas };
};

/**
 * Avalia as duas metas cíclicas (mínimo de atividades e mínimo de
 * desafios) de uma rodada ativa e retorna um "plano" com as alterações
 * de placar e os marcadores `rulesLastChecked` a atualizar.
 *
 * Retorna `null` quando não há nada a fazer (nenhuma regra configurada,
 * ou nenhuma regra venceu ainda).
 *
 * @returns {{ scoreDeltas: Object<string, number>, lastCheckedUpdates: Object<string,string> } | null}
 */
export const evaluateCyclicalRules = ({
  activeRound,
  allActivities,
  userId,
  partnerId,
  todayStr,
}) => {
  if (!activeRound) return null;

  const activitiesRule = activeRound.rules?.minActivities;
  const challengesRule = activeRound.rules?.minChallenges;
  if (!activitiesRule && !challengesRule) return null;

  const scoreDeltas = {};
  const lastCheckedUpdates = {};
  let hasUpdates = false;

  const activitiesResult = evaluateGoal({
    rule: activitiesRule,
    lastCheckedDate: activeRound.rulesLastChecked?.activities || activeRound.startDate,
    todayStr,
    userId,
    partnerId,
    countFn: (uid) =>
      countConfirmedActivitiesInRound(allActivities, uid, activeRound, todayStr),
  });
  if (activitiesResult) {
    if (activitiesResult.scoreDeltas) {
      for (const [uid, delta] of Object.entries(activitiesResult.scoreDeltas)) {
        scoreDeltas[uid] = (scoreDeltas[uid] || 0) + delta;
      }
    }
    lastCheckedUpdates.activities = todayStr;
    hasUpdates = true;
  }

  const challengesResult = evaluateGoal({
    rule: challengesRule,
    lastCheckedDate: activeRound.rulesLastChecked?.challenges || activeRound.startDate,
    todayStr,
    userId,
    partnerId,
    countFn: (uid) => countChallengesCreatedInRound(allActivities, uid, activeRound),
  });
  if (challengesResult) {
    if (challengesResult.scoreDeltas) {
      for (const [uid, delta] of Object.entries(challengesResult.scoreDeltas)) {
        scoreDeltas[uid] = (scoreDeltas[uid] || 0) + delta;
      }
    }
    lastCheckedUpdates.challenges = todayStr;
    hasUpdates = true;
  }

  if (!hasUpdates) return null;
  return { scoreDeltas, lastCheckedUpdates };
};
