import { useMemo, useCallback } from "react";
import { doc, updateDoc, db } from "../../infrastructure/firebase";
import { getTodayDateString } from "../../shared/utils";
import {
  summarizeCycle,
  computeCycleStatistics,
  computeAveragePeriodLength,
  getLastPeriodStart,
} from "../../domain/valueObjects/MenstrualCycle";
import { getDailyInsight } from "../../domain/services/CycleInsightService";

const MAX_HISTORY_ENTRIES = 12;

/**
 * Normaliza o formato salvo no Firestore para a lista de períodos
 * (`periods: [{ startDate, periodLength }]`), migrando automaticamente
 * o formato antigo (`lastPeriodStart` + `cycleLength` + `periodLength`
 * únicos, sem histórico) usado antes desta atualização.
 */
const normalizeCycleTracking = (cycleTracking) => {
  if (!cycleTracking) return { ownerId: null, periods: [], cycleLengthOverride: null };

  if (Array.isArray(cycleTracking.periods)) {
    return {
      ownerId: cycleTracking.ownerId,
      periods: cycleTracking.periods,
      cycleLengthOverride: cycleTracking.cycleLengthOverride || null,
    };
  }

  // Formato antigo: um único registro, sem histórico.
  if (cycleTracking.lastPeriodStart) {
    return {
      ownerId: cycleTracking.ownerId,
      periods: [
        {
          startDate: cycleTracking.lastPeriodStart,
          periodLength: cycleTracking.periodLength || 5,
        },
      ],
      cycleLengthOverride: cycleTracking.cycleLength || null,
    };
  }

  return { ownerId: cycleTracking.ownerId, periods: [], cycleLengthOverride: null };
};

/**
 * Hook de aplicação: acompanhamento de ciclo menstrual do casal.
 *
 * Por decisão de produto, só a pessoa com `gender === "feminino"` no
 * casal pode registrar o ciclo — não existe troca manual de
 * responsável. Se `cycleTracking.ownerId` já estiver gravado (definido
 * automaticamente no primeiro registro), ele é respeitado; caso
 * contrário, o dono é inferido pelo gênero de cada perfil.
 *
 * Dados brutos (histórico de datas) só ficam visíveis para quem é o
 * owner. O parceiro recebe apenas o insight do dia (ícone + frase),
 * nunca as datas.
 */
export function useMenstrualCycle({ user, userData, coupleData }) {
  const normalized = useMemo(
    () => normalizeCycleTracking(coupleData?.cycleTracking),
    [coupleData?.cycleTracking]
  );
  const { periods, cycleLengthOverride } = normalized;
  const partnerData = userData?.partnerData;

  const ownerId =
    normalized.ownerId ||
    (userData?.gender === "feminino"
      ? user?.uid
      : partnerData?.gender === "feminino"
      ? partnerData?.uid
      : null);

  const isOwner = Boolean(ownerId && ownerId === user?.uid);
  const isConfigured = periods.length > 0;

  const cycleStats = useMemo(() => computeCycleStatistics(periods), [periods]);

  const cycleSummary = useMemo(() => {
    if (!isConfigured) return null;
    return summarizeCycle({
      lastPeriodStart: getLastPeriodStart(periods),
      cycleLength: cycleLengthOverride || cycleStats.averageLength || 28,
      periodLength: computeAveragePeriodLength(periods),
      todayStr: getTodayDateString(),
    });
  }, [isConfigured, periods, cycleLengthOverride, cycleStats.averageLength]);

  const dailyInsight = useMemo(() => {
    if (!cycleSummary) return null;
    return getDailyInsight(cycleSummary);
  }, [cycleSummary]);

  /** Registra o início de um novo período (menstruação) no histórico. */
  const handleLogPeriodStart = useCallback(
    async ({ startDate, periodLength }) => {
      if (!userData?.coupleId || !user?.uid || !startDate) return;

      const withoutDuplicate = periods.filter((p) => p.startDate !== startDate);
      const updatedPeriods = [
        ...withoutDuplicate,
        { startDate, periodLength: Number(periodLength) || 5 },
      ]
        .sort((a, b) => (a.startDate < b.startDate ? -1 : 1))
        .slice(-MAX_HISTORY_ENTRIES);

      const coupleRef = doc(db, "duomatches", userData.coupleId);
      await updateDoc(coupleRef, {
        cycleTracking: {
          ownerId: user.uid,
          periods: updatedPeriods,
          cycleLengthOverride: cycleLengthOverride || null,
        },
      });
    },
    [userData?.coupleId, user?.uid, periods, cycleLengthOverride]
  );

  /** Remove um registro do histórico (correção de um lançamento errado). */
  const handleDeletePeriodEntry = useCallback(
    async (startDate) => {
      if (!userData?.coupleId || !user?.uid) return;
      const updatedPeriods = periods.filter((p) => p.startDate !== startDate);
      const coupleRef = doc(db, "duomatches", userData.coupleId);
      await updateDoc(coupleRef, {
        cycleTracking: {
          ownerId: user.uid,
          periods: updatedPeriods,
          cycleLengthOverride: cycleLengthOverride || null,
        },
      });
    },
    [userData?.coupleId, user?.uid, periods, cycleLengthOverride]
  );

  return {
    isOwner,
    isConfigured,
    ownerId,
    periods,
    cycleStats,
    cycleSummary,
    dailyInsight,
    handleLogPeriodStart,
    handleDeletePeriodEntry,
  };
}
