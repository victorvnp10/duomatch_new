import { useMemo } from "react";

/**
 * Hook de aplicação: Central de Notificações.
 *
 * Diferente dos toasts efêmeros já existentes (NotificationManager.js,
 * que aparecem e somem sozinhos), esta central mostra o estado ATUAL de
 * pendências — não fica presa a um evento momentâneo. Por isso não
 * precisa de nenhum campo novo no Firestore nem de um "marcar como
 * lido": um item desaparece sozinho da lista assim que deixa de ser
 * verdade (por exemplo, assim que você confirma a atividade que seu par
 * já tinha marcado).
 *
 * @returns {{ notifications: Array, count: number }}
 */
export function useNotificationCenter({
  user,
  userData,
  allActivities = [],
  mySelections = {},
  partnerSelections = {},
  matches = [],
  rewards = [],
  dailyActivities = [],
}) {
  const notifications = useMemo(() => {
    if (!user?.uid || !userData?.partnerId) return [];

    const items = [];
    const matchedIds = new Set(matches.map((m) => m.id));

    // 1) Atividades que o parceiro já marcou e ainda esperam sua confirmação.
    allActivities.forEach((activity) => {
      if (activity.type?.startsWith("desafio")) return;
      if (matchedIds.has(activity.id)) return;

      const partnerConfirmed = partnerSelections[activity.id]?.status === "confirmed";
      const myConfirmed = mySelections[activity.id]?.status === "confirmed";
      if (partnerConfirmed && !myConfirmed) {
        items.push({
          id: `partner-activity-${activity.id}`,
          type: "partner_selected_activity",
          icon: "😉",
          title: "Seu par já marcou uma atividade!",
          message: `"${activity.name}" está esperando sua confirmação.`,
          targetView: "main",
        });
      }
    });

    // 2) Desafios lançados pelo parceiro que ainda não foram respondidos.
    allActivities.forEach((activity) => {
      if (!activity.type?.startsWith("desafio")) return;
      if (activity.createdBy !== userData.partnerId) return;
      // "pending_acceptance" é o estado inicial de TODO desafio criado pelo
      // parceiro (AddItemModal) e é exatamente o caso a notificar — só
      // ignorar quando já foi aceito/recusado/resolvido.
      if (
        activity.challengeState &&
        activity.challengeState !== "pending_acceptance"
      )
        return;

      // B2-34: desafio já expirado não deve notificar "esperando sua
      // resposta" para sempre — mesmo critério de validade de `isActivityForToday`.
      const expiresAt = activity.expiresAt;
      if (!(expiresAt?.toDate && expiresAt.toDate() > new Date())) return;

      items.push({
        id: `partner-challenge-${activity.id}`,
        type: "partner_created_challenge",
        icon: "🏆",
        title: "Seu par lançou um desafio!",
        message: `"${activity.name}" está esperando sua resposta.`,
        targetView: "main",
      });
    });

    // 3) Lembrete: nenhuma atividade marcada hoje ainda.
    const hasConfirmedSomethingToday = dailyActivities.some(
      (activity) => mySelections[activity.id]?.status === "confirmed"
    );
    if (dailyActivities.length > 0 && !hasConfirmedSomethingToday) {
      items.push({
        id: "remind-mark-activity",
        type: "remind_mark_activity",
        icon: "📌",
        title: "Não esqueça de marcar uma atividade hoje!",
        message: "Escolha algo na lista de sugestões para manter a sequência de vocês.",
        targetView: "main",
      });
    }

    // 4) Recompensas aguardando sua aprovação.
    rewards.forEach((reward) => {
      if (reward.status === "pending_approval" && reward.createdBy !== user.uid) {
        items.push({
          id: `reward-approval-${reward.id}`,
          type: "reward_approval_pending",
          icon: "🎁",
          title: "Recompensa para aprovar",
          message: `Seu par sugeriu: "${reward.name}".`,
          targetView: "shop",
        });
      }
    });

    return items;
  }, [
    user?.uid,
    userData?.partnerId,
    allActivities,
    mySelections,
    partnerSelections,
    matches,
    rewards,
    dailyActivities,
  ]);

  return { notifications, count: notifications.length };
}
