/**
 * Regra pura de elegibilidade para pontuação de atividades em casal.
 * Pontos de conclusão só existem quando os dois usuários concluíram.
 */
export const isActivityCompletedByBoth = ({ activity, userId, partnerId }) => {
  const mySelection = activity?.selections?.[userId];
  const partnerSelection = activity?.selections?.[partnerId];

  const isMatch =
    mySelection?.status === "confirmed" &&
    partnerSelection?.status === "confirmed" &&
    mySelection.date &&
    mySelection.date === partnerSelection.date;

  return (
    isMatch &&
    mySelection.resolution === "completed" &&
    partnerSelection.resolution === "completed"
  );
};

export const isChallengeCompleted = (challengeState) =>
  challengeState === "completed";
