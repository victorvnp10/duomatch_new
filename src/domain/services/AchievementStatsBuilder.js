/**
 * Serviço de domínio: calcula as estatísticas do casal usadas para avaliar
 * conquistas (ver src/domain/entities/Achievement.js).
 *
 * Função pura: recebe dados já carregados pelas camadas de aplicação
 * (hooks) e devolve um objeto de estatísticas. Não conhece Firestore,
 * React ou qualquer detalhe de infraestrutura — pode ser testado
 * isoladamente com dados de exemplo.
 */

export const buildAchievementStats = ({
  userId,
  partnerId,
  allActivities = [],
  coupleData = {},
  rewards = [],
  wishlistItems = [],
}) => {
  const isConfirmedByEither = (activity) => {
    const myStatus = activity.selections?.[userId]?.status;
    const partnerStatus = activity.selections?.[partnerId]?.status;
    return myStatus === "confirmed" || partnerStatus === "confirmed";
  };

  const isConfirmedByBoth = (activity) => {
    const myStatus = activity.selections?.[userId]?.status;
    const partnerStatus = activity.selections?.[partnerId]?.status;
    return myStatus === "confirmed" && partnerStatus === "confirmed";
  };

  const isChallenge = (activity) => activity.type?.startsWith("desafio");
  const isHot = (activity) => activity.category === "Hot";

  const completedChallenges = allActivities.filter(
    (a) => isChallenge(a) && isConfirmedByEither(a)
  ).length;
  const completedDailyChallenges = coupleData?.dailyChallengeCompletions || 0;

  const completedActivities = allActivities.filter((a) =>
    isConfirmedByBoth(a)
  ).length;

  const completedHotActivities = allActivities.filter(
    (a) => isConfirmedByBoth(a) && isHot(a)
  ).length;

  const completedHotChallenges = allActivities.filter(
    (a) => isChallenge(a) && isHot(a) && isConfirmedByEither(a)
  ).length;

  // Pontos gastos: soma o custo de todas as recompensas já compradas.
  // Calculado ao vivo a partir de `rewards` em vez de exigir um contador
  // redundante no Firestore — evita que o total fique desatualizado.
  const totalPointsSpent = rewards
    .filter((r) => r.status === "purchased")
    .reduce((sum, r) => sum + (r.cost || 0), 0);

  // Itens da wishlist já presenteados e confirmados.
  const wishlistItemsGifted = wishlistItems.filter(
    (item) => item.status === "gifted" || item.status === "confirmed"
  ).length;

  return {
    totalChallengesCompleted: completedChallenges + completedDailyChallenges,
    completedActivities,
    completedHotActivities,
    completedHotChallenges,
    currentStreak: coupleData?.streak || 0,
    messagesSent: coupleData?.messageCount || 0,
    totalPointsSpent,
    wishlistItemsGifted,
  };
};
