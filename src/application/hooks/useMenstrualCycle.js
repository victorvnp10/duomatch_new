import { useMemo, useCallback } from "react";
import { doc, updateDoc, db } from "../../infrastructure/firebase";
import { getTodayDateString } from "../../shared/utils";
import { summarizeCycle } from "../../domain/valueObjects/MenstrualCycle";
import { getDailyInsight } from "../../domain/services/CycleInsightService";

/**
 * Hook de aplicação: acompanhamento de ciclo menstrual do casal.
 *
 * Quem é "quem registra" (owner) é decidido assim, nesta ordem:
 *   1. `coupleData.cycleTracking.ownerId`, se já definido explicitamente
 *      (permite corrigir manualmente, veja `handleClaimOwnership`).
 *   2. Caso contrário, o padrão sugerido é o perfil com `gender ===
 *      "feminino"` — mas nada é gravado até a pessoa efetivamente
 *      preencher o formulário pela primeira vez.
 *
 * Dados brutos (data da última menstruação, duração do ciclo) só ficam
 * visíveis para quem é o owner. O parceiro recebe apenas o insight do
 * dia (ícone + frase), nunca as datas.
 */
export function useMenstrualCycle({ user, userData, coupleData }) {
  const cycleTracking = coupleData?.cycleTracking || null;
  const partnerData = userData?.partnerData;

  const ownerId =
    cycleTracking?.ownerId ||
    (userData?.gender === "feminino"
      ? user?.uid
      : partnerData?.gender === "feminino"
      ? partnerData?.uid
      : null);

  const isOwner = Boolean(ownerId && ownerId === user?.uid);
  const isConfigured = Boolean(cycleTracking?.lastPeriodStart);

  const cycleSummary = useMemo(() => {
    if (!isConfigured) return null;
    return summarizeCycle({
      lastPeriodStart: cycleTracking.lastPeriodStart,
      cycleLength: cycleTracking.cycleLength || 28,
      periodLength: cycleTracking.periodLength || 5,
      todayStr: getTodayDateString(),
    });
  }, [
    isConfigured,
    cycleTracking?.lastPeriodStart,
    cycleTracking?.cycleLength,
    cycleTracking?.periodLength,
  ]);

  const dailyInsight = useMemo(() => {
    if (!cycleSummary) return null;
    return getDailyInsight(cycleSummary);
  }, [cycleSummary]);

  const handleSaveCycleData = useCallback(
    async ({ lastPeriodStart, cycleLength, periodLength }) => {
      if (!userData?.coupleId || !user?.uid) return;
      const coupleRef = doc(db, "duomatches", userData.coupleId);
      await updateDoc(coupleRef, {
        cycleTracking: {
          ownerId: user.uid,
          lastPeriodStart,
          cycleLength: Number(cycleLength) || 28,
          periodLength: Number(periodLength) || 5,
        },
      });
    },
    [userData?.coupleId, user?.uid]
  );

  /** Permite corrigir manualmente quem é a pessoa que registra o ciclo. */
  const handleClaimOwnership = useCallback(async () => {
    if (!userData?.coupleId || !user?.uid) return;
    const coupleRef = doc(db, "duomatches", userData.coupleId);
    await updateDoc(coupleRef, {
      "cycleTracking.ownerId": user.uid,
    });
  }, [userData?.coupleId, user?.uid]);

  return {
    isOwner,
    isConfigured,
    ownerId,
    cycleTracking,
    cycleSummary,
    dailyInsight,
    handleSaveCycleData,
    handleClaimOwnership,
  };
}
