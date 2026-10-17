import { useState, useEffect, useMemo } from 'react';
import { doc, runTransaction, increment, arrayUnion } from 'firebase/firestore';
import { db } from '../../infrastructure/firebase';
import { getChallengeCatalog } from '../../infrastructure/firebase/repositories/ContentRepository';
import {
  mergeWeeklyAcceptance,
  mergeWeeklyClaim,
} from '../../domain/services/WeeklyChallengeState';
import {
  calculateWeeklyProgress,
  getWeeklyChallenge,
  getChallengeState,
  selectWeeklyChallenge,
  findActiveRound,
} from '../../domain/services/WeeklyChallengeSchedule';
import { getTodayDateString, getDateString } from '../../shared/lib/dateUtils';

/**
 * Hook de aplicação do Desafio Diário/Semanal.
 *
 * Toda a lógica que antes vivia dentro de `DailyChallenge.js` — o acesso ao
 * Firestore (catálogo, aceite, reivindicação e confirmação) e as derivações
 * de estado/progresso — foi movida para cá. O componente de apresentação
 * volta a ser só apresentação.
 *
 * Os cálculos puros vivem em `src/domain/services/WeeklyChallengeSchedule.js`;
 * a mesclagem transacional em `src/domain/services/WeeklyChallengeState.js`.
 * Este hook apenas orquestra quando ler/gravar e mantém o estado local
 * otimista para resposta imediata na UI.
 *
 * NOTA DE TESTE: o hook não tem teste unitário próprio porque o projeto não
 * tem `@testing-library/react` nem `react-test-renderer` instalados (e a
 * tarefa proíbe instalar). A parte pura extraída está coberta em
 * `WeeklyChallengeSchedule.test.js`. Registrar como pendência: testar o hook
 * quando um harness de hooks for adicionado.
 */
export const useDailyChallenge = ({ userData, coupleData, rounds }) => {
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [weeklyProgress, setWeeklyProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [localChallengeData, setLocalChallengeData] = useState(null);
  const [challengeCatalog, setChallengeCatalog] = useState(null);

  // Carrega o catálogo global de desafios do Firestore (com seed automático).
  useEffect(() => {
    let active = true;
    getChallengeCatalog()
      .then((cat) => {
        if (active) setChallengeCatalog(cat);
      })
      .catch(() => {
        if (active) setChallengeCatalog([]);
      });
    return () => {
      active = false;
    };
  }, []);

  // Função para obter o desafio da semana
  const getWeeklyChallengeValue = useMemo(
    () =>
      getWeeklyChallenge({
        catalog: challengeCatalog,
        recentChallengeIds: coupleData?.recentChallengeIds,
        now: new Date(),
      }),
    [challengeCatalog, coupleData?.recentChallengeIds]
  );

  // Calcular progresso da semana
  const calculateWeeklyProgressValue = useMemo(
    () => calculateWeeklyProgress(new Date()),
    []
  );

  const weekKey = getDateString(calculateWeeklyProgressValue.startOfWeek);

  // Verificar estado do desafio para o usuário atual
  const getChallengeStateValue = useMemo(
    () =>
      getChallengeState({
        userData,
        localChallengeData,
        coupleData,
        weekKey,
      }),
    // `weekKey` deriva de `calculateWeeklyProgressValue.startOfWeek`, que é
    // estável após o mount — mantê-lo nas deps preserva o comportamento
    // anterior (que dependia de `calculateWeeklyProgress.startOfWeek`).
    [coupleData, userData, weekKey, localChallengeData]
  );

  const selectedChallenge = useMemo(
    () =>
      selectWeeklyChallenge({
        catalog: challengeCatalog,
        challengeState: getChallengeStateValue,
        weeklyChallenge: getWeeklyChallengeValue,
      }),
    [challengeCatalog, getChallengeStateValue, getWeeklyChallengeValue]
  );

  const handleAcceptWeeklyChallenge = async () => {
    if (!selectedChallenge) return;
    if (!userData?.uid || isLoading) return;
    if (!userData?.coupleId) {
      alert('Vincule seu parceiro(a) para aceitar desafios de verdade — no modo de demonstração isso é só ilustrativo. 💕');
      return;
    }

    setIsLoading(true);
    try {
      const acceptWeekKey =
        getChallengeStateValue?.weekKey ||
        getDateString(calculateWeeklyProgressValue.startOfWeek);

      const coupleRef = doc(db, 'duomatches', userData.coupleId);
      const challengeData = await runTransaction(db, async (transaction) => {
        const coupleSnap = await transaction.get(coupleRef);
        if (!coupleSnap.exists()) {
          throw new Error('Casal não encontrado.');
        }

        const serverData = coupleSnap.data()?.weeklyChallenge?.[acceptWeekKey] || {};
        const persistedChallenge =
          challengeCatalog?.find((challenge) => challenge.id === serverData.challengeId) ||
          selectedChallenge;
        const mergedData = mergeWeeklyAcceptance({
          existingData: serverData,
          userId: userData.uid,
          challenge: persistedChallenge,
          weekStartDate: getDateString(calculateWeeklyProgressValue.startOfWeek),
          acceptedAt: new Date(),
        });

        transaction.update(coupleRef, {
          [`weeklyChallenge.${acceptWeekKey}`]: mergedData,
          recentChallengeIds: arrayUnion(mergedData.challengeId),
        });
        return mergedData;
      });

      // Atualizar estado local para resposta imediata na UI
      const currentLocal = localChallengeData || coupleData?.weeklyChallenge || {};
      setLocalChallengeData({ ...currentLocal, [acceptWeekKey]: challengeData });

    } catch (error) {
      console.error('Erro ao aceitar desafio semanal:', error);
      alert(`Erro ao aceitar desafio: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimCompletion = async () => {
    if (!userData?.coupleId || !userData?.uid || isLoading) {
      alert('Erro: Dados do usuário incompletos.');
      return;
    }

    setIsLoading(true);
    try {
      const claimWeekKey = getChallengeStateValue.weekKey;
      const coupleRef = doc(db, 'duomatches', userData.coupleId);
      const updatedChallengeData = await runTransaction(db, async (transaction) => {
        const coupleSnap = await transaction.get(coupleRef);
        if (!coupleSnap.exists()) {
          throw new Error('Casal não encontrado.');
        }

        const existingData = coupleSnap.data()?.weeklyChallenge?.[claimWeekKey] || {};
        const mergedData = mergeWeeklyClaim({
          existingData,
          userId: userData.uid,
          claimedAt: new Date(),
        });
        if (!mergedData) {
          throw new Error('Aceite o desafio antes de reivindicar.');
        }

        transaction.update(coupleRef, {
          [`weeklyChallenge.${claimWeekKey}`]: mergedData,
        });
        return mergedData;
      });

      // Atualizar estado local para resposta imediata na UI
      const currentLocal = localChallengeData || coupleData?.weeklyChallenge || {};
      setLocalChallengeData({
        ...currentLocal,
        [claimWeekKey]: updatedChallengeData,
      });

    } catch (error) {
      console.error('Erro ao reivindicar conclusão:', error);
      alert(`Erro ao reivindicar conclusão: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPartner = async (confirmed) => {
    if (!userData?.coupleId || !userData?.uid || isLoading) {
      alert('Erro: Dados do usuário incompletos.');
      return;
    }

    setIsLoading(true);
    try {
      const confirmWeekKey = getChallengeStateValue.weekKey;
      const coupleRef = doc(db, 'duomatches', userData.coupleId);
      const partnerUid = getChallengeStateValue.partnerUid;

      if (!partnerUid) {
        alert('Erro: Não foi possível encontrar o UID do parceiro.');
        return;
      }

      // Se confirmado, registrar status E pontos na MESMA transação,
      // relendo o servidor para garantir que os pontos sejam concedidos
      // apenas na PRIMEIRA confirmação (idempotência contra duplo clique
      // ou falha entre a transação e a gravação do status).
      const today = getTodayDateString();
      const activeRoundForWrite = findActiveRound(rounds, today);
      const roundRef = activeRoundForWrite
        ? doc(db, `duomatches/${userData.coupleId}/rounds`, activeRoundForWrite.id)
        : null;

      let updatedChallengeDataForLocal = null;

      await runTransaction(db, async (transaction) => {
        const coupleSnap = await transaction.get(coupleRef);
        const roundSnap = roundRef ? await transaction.get(roundRef) : null;

        // Estado REAL do servidor (não o snapshot React possivelmente antigo)
        const serverData =
          coupleSnap.exists()
            ? coupleSnap.data()?.weeklyChallenge?.[confirmWeekKey] || {}
            : {};
        const serverConfirmations = serverData.confirmations || {};
        const partnerServerConfirmation = serverConfirmations[partnerUid] || {};
        const persistedChallenge =
          challengeCatalog?.find((challenge) => challenge.id === serverData.challengeId) ||
          selectedChallenge;
        if (!persistedChallenge) {
          throw new Error('Desafio semanal não encontrado.');
        }

        const alreadyAwarded =
          partnerServerConfirmation.status === 'confirmed' &&
          partnerServerConfirmation.pointsAwarded != null;

        const updatedPartnerConfirmation = {
          ...partnerServerConfirmation,
          status: confirmed ? 'confirmed' : 'denied',
          confirmedBy: userData.uid,
          confirmedAt: new Date()
        };

        if (confirmed) {
          updatedPartnerConfirmation.pointsAwarded = persistedChallenge.points;
        }

        updatedChallengeDataForLocal = {
          ...serverData,
          confirmations: {
            ...serverConfirmations,
            [partnerUid]: updatedPartnerConfirmation
          }
        };

        transaction.update(coupleRef, {
          [`weeklyChallenge.${confirmWeekKey}`]: updatedChallengeDataForLocal
        });

        if (
          confirmed &&
          !alreadyAwarded &&
          roundSnap &&
          roundSnap.exists()
        ) {
          transaction.update(roundRef, {
            [`scores.${partnerUid}`]: increment(persistedChallenge.points)
          });
        }
      });

      // Atualizar estado local para resposta imediata na UI
      if (updatedChallengeDataForLocal) {
        const currentLocal = localChallengeData || coupleData?.weeklyChallenge || {};
        setLocalChallengeData({
          ...currentLocal,
          [confirmWeekKey]: updatedChallengeDataForLocal
        });
      }
    } catch (error) {
      console.error('Erro ao confirmar parceiro:', error);
      alert(`Erro ao confirmar: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Resetar dados locais quando dados do Firestore chegarem
  useEffect(() => {
    if (!coupleData?.weeklyChallenge || !localChallengeData) return;

    if (coupleData.weeklyChallenge[weekKey] && localChallengeData[weekKey]) {
      // Se os dados do servidor já chegaram, limpar o cache local — sem
      // incluir `localChallengeData` nas deps, o efeito só dispara quando o
      // dado do servidor muda (e não a cada re-render/atualização local),
      // evitando o ping-pong de re-render que travava o componente.
      setLocalChallengeData(null);
    }
  }, [coupleData?.weeklyChallenge]);

  // Verificar se há uma rodada ativa
  const activeRound = useMemo(
    () => findActiveRound(rounds, getTodayDateString()),
    [rounds]
  );

  // Estado morto preservado para não alterar a ordem/quantidade de hooks.
  void currentChallenge;
  void weeklyProgress;

  return {
    selectedChallenge,
    challengeState: getChallengeStateValue,
    calculateWeeklyProgress: calculateWeeklyProgressValue,
    activeRound,
    isLoading,
    handleAcceptWeeklyChallenge,
    handleClaimCompletion,
    handleConfirmPartner,
  };
};
