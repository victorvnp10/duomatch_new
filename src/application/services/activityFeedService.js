import { isActivityForToday, getDateString } from "../../shared/lib/dateUtils";
import { seededHash } from "../../shared/lib/seededHash";

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

/**
 * Aplicação: monta a lista de atividades do feed diário ("Sugestões do Dia").
 *
 * Lógica que vivia inteira dentro do useEffect de `MainView`. Ordem:
 * atividades de dias anteriores (limitadas a 5, escolhidas de forma
 * determinística por `seededHash`), depois as de hoje, depois os desafios
 * pendentes — sempre sem duplicatas (a primeira ocorrência vence).
 */
export const selectDailyActivities = (availableActivities, todayStr) => {
  const creationDateOf = (act) =>
    act.createdAt?.toDate ? getDateString(act.createdAt.toDate()) : null;

  const activitiesFromToday = availableActivities.filter(
    (act) => creationDateOf(act) === todayStr
  );
  const activitiesFromBeforeToday = availableActivities.filter(
    (act) => creationDateOf(act) !== todayStr
  );
  const pendingChallenges = availableActivities.filter((act) =>
    act.type?.startsWith("desafio")
  );

  let randomBaseActivities = [];
  if (activitiesFromBeforeToday.length > 5) {
    const shuffled = [...activitiesFromBeforeToday].sort(
      (a, b) => seededHash(a.id + todayStr) - seededHash(b.id + todayStr)
    );
    randomBaseActivities = shuffled.slice(0, 5);
  } else {
    randomBaseActivities = activitiesFromBeforeToday;
  }

  const combinedList = [
    ...randomBaseActivities,
    ...activitiesFromToday,
    ...pendingChallenges,
  ];

  return combinedList.filter(
    (activity, index, self) =>
      index === self.findIndex((a) => a.id === activity.id)
  );
};
