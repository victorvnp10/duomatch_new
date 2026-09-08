/**
 * Regra pura de elegibilidade para pontuação de atividades em casal.
 * Pontos de conclusão só existem quando os dois usuários concluíram.
 */
export const isActivityCompletedByBoth = ({ activity, userId, partnerId }) =>
  activity?.selections?.[userId]?.resolution === "completed" &&
  activity?.selections?.[partnerId]?.resolution === "completed";
