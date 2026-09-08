const unique = (values = []) => [...new Set(values)];

/**
 * Mescla o aceite atual sobre o estado lido do servidor, preservando
 * aceite, desafio, confirmações e demais dados já gravados pelo parceiro.
 */
export const mergeWeeklyAcceptance = ({
  existingData = {},
  userId,
  challenge,
  weekStartDate,
  acceptedAt,
}) => {
  if (!userId || !challenge?.id) return existingData;

  return {
    ...existingData,
    challengeId: existingData.challengeId || challenge.id,
    acceptedBy: unique([...(existingData.acceptedBy || []), userId]),
    acceptedAt: existingData.acceptedAt || acceptedAt,
    weekStartDate: existingData.weekStartDate || weekStartDate,
    state: existingData.state || "in_progress",
    confirmations: existingData.confirmations || {},
  };
};

/** Mescla uma reivindicação sem apagar a reivindicação do parceiro. */
export const mergeWeeklyClaim = ({
  existingData = {},
  userId,
  claimedAt,
}) => {
  if (!userId || !existingData.challengeId) return null;
  if (!existingData.acceptedBy?.includes(userId)) return null;

  const existingConfirmation = existingData.confirmations?.[userId];
  if (existingConfirmation?.claimed) return existingData;

  return {
    ...existingData,
    confirmations: {
      ...(existingData.confirmations || {}),
      [userId]: {
        claimed: true,
        claimedAt,
        status: "pending_partner_confirmation",
      },
    },
    state: "pending_confirmations",
  };
};
