/**
 * Aplicação: separação das atividades em "Matches de Hoje" e "Jornada do
 * Casal" para as duas seções da tela principal.
 *
 * Estas regras viviam inline em `MainView` (`todayMatches` e
 * `coupleJourneyMatches`). Extraídas como funções puras para a camada de
 * aplicação; `todayStr` e `now` são injetáveis para teste determinístico
 * (default reproduz exatamente o comportamento anterior: data local de hoje
 * e o relógio corrente).
 */

const isChallenge = (activity) => activity.type?.startsWith("desafio");

/**
 * Matches de hoje: atividade normal confirmada pelos DOIS lados com data de
 * hoje, OU desafio aceito e ainda não expirado.
 */
export const getTodayMatches = (
  allActivities,
  { userId, partnerId, todayStr, now = new Date() }
) =>
  allActivities.filter((activity) => {
    const myChoice = activity.selections?.[userId];
    const partnerChoice = activity.selections?.[partnerId];

    const isNormalMatch =
      myChoice?.date === todayStr &&
      myChoice?.status === "confirmed" &&
      partnerChoice?.date === todayStr &&
      partnerChoice?.status === "confirmed" &&
      !isChallenge(activity);

    // Para desafios, só mostrar os que estão aceitos (ativos) hoje
    const isChallengeMatch =
      isChallenge(activity) &&
      activity.challengeState === "accepted" &&
      activity.expiresAt &&
      activity.expiresAt.toDate() > now;

    return isNormalMatch || isChallengeMatch;
  });

/**
 * Jornada do casal: matches normais de dias PASSADOS (ambos confirmados e a
 * data da seleção anterior a hoje) e desafios encerrados (concluído, não
 * cumprido, recusado ou expirado).
 */
export const getCoupleJourneyMatches = (
  allActivities,
  { userId, partnerId, todayStr }
) =>
  allActivities.filter((activity) => {
    // Atividades normais do passado
    const selectionDateStr = activity.selections?.[userId]?.date;
    if (selectionDateStr && selectionDateStr < todayStr) {
      const isNormalMatch =
        activity.selections?.[userId]?.status === "confirmed" &&
        activity.selections?.[partnerId]?.status === "confirmed" &&
        !isChallenge(activity);
      if (isNormalMatch) return true;
    }

    // Desafios concluídos, não cumpridos, recusados ou expirados
    const isChallengeFinished =
      isChallenge(activity) &&
      ["completed", "not_completed", "declined", "expired"].includes(
        activity.challengeState
      );

    return isChallengeFinished;
  });
