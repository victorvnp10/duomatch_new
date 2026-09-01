import { useMemo, useCallback } from "react";
import { doc, runTransaction, db } from "../../infrastructure/firebase";
import { getTodayDateString } from "../../shared/utils";
import {
  summarizeCycle,
  computeCycleStatistics,
  computeAveragePeriodLength,
  getLastPeriodStart,
  clampCycleLength,
  MIN_CYCLE_LENGTH,
} from "../../domain/valueObjects/MenstrualCycle";
import { getDailyInsight } from "../../domain/services/CycleInsightService";

const MAX_HISTORY_ENTRIES = 12;

const DAY_MS = 1000 * 60 * 60 * 24;
const daysBetween = (laterStr, earlierStr) =>
  Math.round(
    (new Date(`${laterStr}T00:00:00`) - new Date(`${earlierStr}T00:00:00`)) / DAY_MS
  );

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

  // B2-28: desempate DETERMINÍSTICO quando as duas pessoas do casal são
  // "feminino". Antes, cada perfil se inferia como owner enquanto
  // `cycleTracking.ownerId` não existia — ambos viam o formulário e cada
  // registro sobrescrevia o histórico do outro. Menor uid vence enquanto
  // o ownerId não for persistido (o primeiro registro grava o dono de vez).
  const feminineUids = [];
  if (userData?.gender === "feminino") feminineUids.push(user?.uid);
  if (partnerData?.gender === "feminino") feminineUids.push(partnerData?.uid);
  const inferredOwnerId =
    feminineUids.length ? [...feminineUids].sort()[0] : null;

  const ownerId = normalized.ownerId || inferredOwnerId;

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

      const length = Math.max(1, Math.min(10, Number(periodLength) || 5));
      const coupleRef = doc(db, "duomatches", userData.coupleId);

      // B2-29: proteção contra typo — um novo registro não pode ficar a menos
      // de `MIN_CYCLE_LENGTH` dias de um período adjacente já salvo (isso
      // criaria um "ciclo" absurdamente curto e distorceria toda a previsão).
      const sorted = [...periods].sort((a, b) =>
        a.startDate < b.startDate ? -1 : 1
      );
      const prevEntry = sorted.filter((p) => p.startDate < startDate).pop();
      const nextEntry = sorted.find((p) => p.startDate > startDate);
      const gapToPrev = prevEntry ? daysBetween(startDate, prevEntry.startDate) : null;
      const gapToNext = nextEntry ? daysBetween(nextEntry.startDate, startDate) : null;
      if (
        (gapToPrev !== null && gapToPrev < MIN_CYCLE_LENGTH) ||
        (gapToNext !== null && gapToNext < MIN_CYCLE_LENGTH)
      ) {
        alert(
          `A data fica a menos de ${MIN_CYCLE_LENGTH} dias de outro registro já salvo — provavelmente um engano. Confira a data antes de salvar.`
        );
        return;
      }

      try {
        // B2-27: read-modify-write DENTRO da transação — antes o array era
        // reconstruído do snapshot local e sobrescrito; dois dispositivos
        // da owner registrando/removendo concorrentemente perdiam histórico.
        await runTransaction(db, async (transaction) => {
          const coupleSnap = await transaction.get(coupleRef);
          if (!coupleSnap.exists()) return;
          const current = normalizeCycleTracking(coupleSnap.data().cycleTracking);
          const currentPeriods = current.periods || [];

          const withoutDuplicate = currentPeriods.filter(
            (p) => p.startDate !== startDate
          );
          const updatedPeriods = [
            ...withoutDuplicate,
            { startDate, periodLength: length },
          ]
            .sort((a, b) => (a.startDate < b.startDate ? -1 : 1))
            .slice(-MAX_HISTORY_ENTRIES);

          // B2-28: primeiro registro persiste o ownerId de vez — depois
          // disso o dono nunca mais é disputado entre os dois clientes.
          const override = current.cycleLengthOverride;
          transaction.update(coupleRef, {
            cycleTracking: {
              ownerId: current.ownerId || user.uid,
              periods: updatedPeriods,
              cycleLengthOverride:
                override && clampCycleLength(Number(override)) || null,
            },
          });
        });
      } catch (error) {
        console.error("Erro ao registrar período:", error);
        alert("Não foi possível salvar o período. Tente novamente.");
      }
    },
    [userData?.coupleId, user?.uid, periods]
  );

  /** Remove um registro do histórico (correção de um lançamento errado). */
  const handleDeletePeriodEntry = useCallback(
    async (startDate) => {
      if (!userData?.coupleId || !user?.uid) return;
      const coupleRef = doc(db, "duomatches", userData.coupleId);
      try {
        await runTransaction(db, async (transaction) => {
          const coupleSnap = await transaction.get(coupleRef);
          if (!coupleSnap.exists()) return;
          const current = normalizeCycleTracking(coupleSnap.data().cycleTracking);
          const updatedPeriods = (current.periods || []).filter(
            (p) => p.startDate !== startDate
          );
          const override = current.cycleLengthOverride;
          transaction.update(coupleRef, {
            cycleTracking: {
              ownerId: current.ownerId || user.uid,
              periods: updatedPeriods,
              cycleLengthOverride:
                override && clampCycleLength(Number(override)) || null,
            },
          });
        });
      } catch (error) {
        console.error("Erro ao remover período:", error);
        alert("Não foi possível remover o registro. Tente novamente.");
      }
    },
    [userData?.coupleId, user?.uid]
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
