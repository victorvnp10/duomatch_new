import { isActivityForToday } from "../../shared/lib/dateUtils";

/**
 * Aplicação: filtro das atividades "disponíveis para escolha hoje" exibidas
 * no feed principal.
 *
 * Esta regra vivia inline dentro de `MainView` (useMemo `availableActivities`).
 * Extraída como função pura para a camada de aplicação — não depende de
 * React, só das atividades e do estado de match/seleção.
 *
 * `isForToday` é injetável para permitir teste determinístico da regra sem
 * depender do relógio; por padrão usa a regra de negócio real
 * (`isActivityForToday`, baseada na periodicidade da atividade).
 */
export const filterAvailableActivities = (
  allActivities,
  { matches, userId, partnerId, isForToday = isActivityForToday }
) =>
  allActivities.filter((activity) => {
    if (
      !isForToday(activity) ||
      matches.some((m) => m.id === activity.id) ||
      activity.category === "Hot"
    )
      return false;

    const isChallenge = activity.type?.startsWith("desafio");
    if (isChallenge) return activity.challengeState === "pending_acceptance";

    // Para atividades criadas pelo sistema (não sugestões especiais),
    // não exibir no feed de escolha.
    if (activity.createdBy === "SYSTEM") return false;

    const mySelection = activity.selections?.[userId];
    const partnerSelection = activity.selections?.[partnerId];

    // Se ambos confirmaram, não mostrar (será exibido em "Matches de Hoje")
    if (
      mySelection?.status === "confirmed" &&
      partnerSelection?.status === "confirmed"
    ) {
      return false;
    }

    return true;
  });
