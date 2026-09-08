
import React, { useState, useEffect, useMemo } from 'react';
import { doc, runTransaction, increment, arrayUnion } from 'firebase/firestore';
import { db } from '../../infrastructure/firebase';
import { getChallengeCatalog } from '../../infrastructure/firebase/repositories/ContentRepository';
import {
  mergeWeeklyAcceptance,
  mergeWeeklyClaim,
} from '../../domain/services/WeeklyChallengeState';
import { ChallengeIcon, TrophyIcon } from './Icons';
import { getTodayDateString, getDateString } from '../../shared/utils';

/**
 * Retorna a SEGUNDA-FEIRA que inicia a semana da data informada.
 * A fórmula `date - day + 1` erra no domingo (getDay() === 0 avançaria
 * para a segunda da semana SEGUINTE, mudando o desafio e o weekKey).
 */
const getStartOfWeek = (date) => {
  const start = new Date(date);
  const day = start.getDay(); // 0 = domingo
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
};

/**
 * Cada desafio semanal já vem com um `type` (romance, connection,
 * appreciation...). Antes disso, o card inteiro era pintado com
 * purple/pink fixos, sem relação com a paleta de marca (accent/gold/sage)
 * usada no resto do app. Agora a cor do card reflete a categoria real do
 * desafio, usando só cores que já existem na paleta.
 */
const CATEGORY_STYLES = {
  romance: { label: "Romance", card: "from-accent/20 to-accent-dark/20 border-accent/40", text: "text-accent-light", track: "bg-accent-dark/40", bar: "from-accent to-accent-dark" },
  surprise: { label: "Surpresa", card: "from-accent/20 to-accent-dark/20 border-accent/40", text: "text-accent-light", track: "bg-accent-dark/40", bar: "from-accent to-accent-dark" },
  together: { label: "Juntos", card: "from-accent/20 to-accent-dark/20 border-accent/40", text: "text-accent-light", track: "bg-accent-dark/40", bar: "from-accent to-accent-dark" },
  touch: { label: "Carinho", card: "from-accent/20 to-accent-dark/20 border-accent/40", text: "text-accent-light", track: "bg-accent-dark/40", bar: "from-accent to-accent-dark" },
  connection: { label: "Conexão", card: "from-sage/20 to-sage-light/10 border-sage/40", text: "text-sage-light", track: "bg-sage/40", bar: "from-sage to-sage-light" },
  communication: { label: "Comunicação", card: "from-sage/20 to-sage-light/10 border-sage/40", text: "text-sage-light", track: "bg-sage/40", bar: "from-sage to-sage-light" },
  planning: { label: "Planejamento", card: "from-sage/20 to-sage-light/10 border-sage/40", text: "text-sage-light", track: "bg-sage/40", bar: "from-sage to-sage-light" },
  appreciation: { label: "Gratidão", card: "from-gold/20 to-gold-dark/10 border-gold/40", text: "text-gold-light", track: "bg-gold-dark/40", bar: "from-gold to-gold-dark" },
  memory: { label: "Memórias", card: "from-gold/20 to-gold-dark/10 border-gold/40", text: "text-gold-light", track: "bg-gold-dark/40", bar: "from-gold to-gold-dark" },
};
const DEFAULT_CATEGORY_STYLE = { label: "Desafio", card: "from-gold/20 to-gold-dark/10 border-gold/40", text: "text-gold-light", track: "bg-gold-dark/40", bar: "from-gold to-gold-dark" };

export const DailyChallenge = ({ userData, coupleData, rounds, onAcceptChallenge }) => {
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
  const getWeeklyChallenge = useMemo(() => {
    if (!challengeCatalog || !challengeCatalog.length) return null;
    const startOfWeek = getStartOfWeek(new Date());

    // Usar a data da segunda-feira para gerar um índice consistente
    const weekSeed = startOfWeek.getTime();

    // Anti-repetição: prioriza desafios que não apareceram recentemente.
    // Se todos foram usados recentemente, cai no pool completo.
    const recent = new Set(coupleData?.recentChallengeIds || []);
    const available = challengeCatalog.filter((c) => !recent.has(c.id));
    const pool = available.length ? available : challengeCatalog;

    const challengeIndex = Math.floor(weekSeed / (1000 * 60 * 60 * 24 * 7)) % pool.length;

    return pool[challengeIndex];
  }, [challengeCatalog, coupleData?.recentChallengeIds]);

  // Calcular progresso da semana
  const calculateWeeklyProgress = useMemo(() => {
    const now = new Date();
    const startOfWeek = getStartOfWeek(now);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Domingo
    endOfWeek.setHours(23, 59, 59, 999);

    const totalDays = 7;
    const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // Domingo = 7

    return {
      currentDay,
      totalDays,
      percentage: Math.round((currentDay / totalDays) * 100),
      daysRemaining: totalDays - currentDay,
      startOfWeek,
      endOfWeek
    };
  }, []);

  // Verificar estado do desafio para o usuário atual
  const getChallengeState = useMemo(() => {
    if (!userData?.uid) return null;

    const weekKey = getDateString(calculateWeeklyProgress.startOfWeek);

    // Usar dados locais primeiro, depois dados do Firestore
    const sourceData = localChallengeData || coupleData?.weeklyChallenge;
    if (!sourceData) return null;

    const challengeData = sourceData[weekKey];
    
    if (!challengeData) {
      return { 
        state: 'not_accepted', 
        myAccepted: false, 
        partnerAccepted: false,
        weekKey 
      };
    }

    // Verificar aceitações individuais
    const myAccepted = challengeData.acceptedBy?.includes(userData.uid);
    const partnerUid = userData.partnerId;
    const partnerAccepted = challengeData.acceptedBy?.includes(partnerUid);

    // Verificar confirmações individuais
    const myConfirmation = challengeData.confirmations?.[userData.uid];
    const partnerConfirmation = challengeData.confirmations?.[partnerUid];

    return {
      state: challengeData.state || 'not_accepted',
      myAccepted,
      partnerAccepted,
      myConfirmation,
      partnerConfirmation,
      weekKey,
      challengeData,
      partnerUid
    };
  }, [coupleData, userData, calculateWeeklyProgress.startOfWeek, localChallengeData]);

  // Depois que um dos parceiros aceita, o desafio da semana passa a ser o
  // desafio persistido no casal. O pool calculado localmente depende de
  // recentChallengeIds e poderia mudar entre dois clientes, exibindo um
  // desafio diferente daquele que foi aceito.
  const selectedChallenge = useMemo(() => {
    const persistedChallengeId = getChallengeState?.challengeData?.challengeId;
    return (
      challengeCatalog?.find((challenge) => challenge.id === persistedChallengeId) ||
      getWeeklyChallenge
    );
  }, [challengeCatalog, getChallengeState, getWeeklyChallenge]);

  const handleAcceptWeeklyChallenge = async () => {
    if (!selectedChallenge) return;
    if (!userData?.uid || isLoading) return;
    if (!userData?.coupleId) {
      alert('Vincule seu parceiro(a) para aceitar desafios de verdade — no modo de demonstração isso é só ilustrativo. 💕');
      return;
    }

    setIsLoading(true);
    try {
      const weekKey =
        getChallengeState?.weekKey ||
        getDateString(calculateWeeklyProgress.startOfWeek);

      const coupleRef = doc(db, 'duomatches', userData.coupleId);
      const challengeData = await runTransaction(db, async (transaction) => {
        const coupleSnap = await transaction.get(coupleRef);
        if (!coupleSnap.exists()) {
          throw new Error('Casal não encontrado.');
        }

        const serverData = coupleSnap.data()?.weeklyChallenge?.[weekKey] || {};
        const persistedChallenge =
          challengeCatalog?.find((challenge) => challenge.id === serverData.challengeId) ||
          selectedChallenge;
        const mergedData = mergeWeeklyAcceptance({
          existingData: serverData,
          userId: userData.uid,
          challenge: persistedChallenge,
          weekStartDate: getDateString(calculateWeeklyProgress.startOfWeek),
          acceptedAt: new Date(),
        });

        transaction.update(coupleRef, {
          [`weeklyChallenge.${weekKey}`]: mergedData,
          recentChallengeIds: arrayUnion(mergedData.challengeId),
        });
        return mergedData;
      });

      // Atualizar estado local para resposta imediata na UI
      const currentLocal = localChallengeData || coupleData?.weeklyChallenge || {};
      setLocalChallengeData({ ...currentLocal, [weekKey]: challengeData });

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
      const weekKey = getChallengeState.weekKey;
      const coupleRef = doc(db, 'duomatches', userData.coupleId);
      const updatedChallengeData = await runTransaction(db, async (transaction) => {
        const coupleSnap = await transaction.get(coupleRef);
        if (!coupleSnap.exists()) {
          throw new Error('Casal não encontrado.');
        }

        const existingData = coupleSnap.data()?.weeklyChallenge?.[weekKey] || {};
        const mergedData = mergeWeeklyClaim({
          existingData,
          userId: userData.uid,
          claimedAt: new Date(),
        });
        if (!mergedData) {
          throw new Error('Aceite o desafio antes de reivindicar.');
        }

        transaction.update(coupleRef, {
          [`weeklyChallenge.${weekKey}`]: mergedData,
        });
        return mergedData;
      });
      
      // Atualizar estado local para resposta imediata na UI
      const currentLocal = localChallengeData || coupleData?.weeklyChallenge || {};
      setLocalChallengeData({
        ...currentLocal,
        [weekKey]: updatedChallengeData,
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
      const weekKey = getChallengeState.weekKey;
      const coupleRef = doc(db, 'duomatches', userData.coupleId);
      const partnerUid = getChallengeState.partnerUid;

      if (!partnerUid) {
        alert('Erro: Não foi possível encontrar o UID do parceiro.');
        return;
      }

      // Se confirmado, registrar status E pontos na MESMA transação,
      // relendo o servidor para garantir que os pontos sejam concedidos
      // apenas na PRIMEIRA confirmação (idempotência contra duplo clique
      // ou falha entre a transação e a gravação do status).
      const today = getTodayDateString();
      const activeRound = rounds?.find(
        (r) => today >= r.startDate && today <= r.endDate
      );
      const roundRef = activeRound
        ? doc(db, `duomatches/${userData.coupleId}/rounds`, activeRound.id)
        : null;

      let updatedChallengeDataForLocal = null;

      await runTransaction(db, async (transaction) => {
        const coupleSnap = await transaction.get(coupleRef);
        const roundSnap = roundRef ? await transaction.get(roundRef) : null;

        // Estado REAL do servidor (não o snapshot React possivelmente antigo)
        const serverData =
          coupleSnap.exists()
            ? coupleSnap.data()?.weeklyChallenge?.[weekKey] || {}
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
          [`weeklyChallenge.${weekKey}`]: updatedChallengeDataForLocal
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
          [weekKey]: updatedChallengeDataForLocal
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

    const weekKey = getDateString(calculateWeeklyProgress.startOfWeek);
    if (coupleData.weeklyChallenge[weekKey] && localChallengeData[weekKey]) {
      // Se os dados do servidor já chegaram, limpar o cache local — sem
      // incluir `localChallengeData` nas deps, o efeito só dispara quando o
      // dado do servidor muda (e não a cada re-render/atualização local),
      // evitando o ping-pong de re-render que travava o componente.
      setLocalChallengeData(null);
    }
  }, [coupleData?.weeklyChallenge]);

  // Verificar se há uma rodada ativa
  const activeRound = useMemo(() => {
    if (!rounds || rounds.length === 0) return null;

    const today = getTodayDateString();
    return rounds.find(round =>
      today >= round.startDate && today <= round.endDate
    );
  }, [rounds]);

  if (!userData || !selectedChallenge) {
    return null;
  }

  const challengeState = getChallengeState;
  const categoryStyle = CATEGORY_STYLES[selectedChallenge.type] || DEFAULT_CATEGORY_STYLE;

  return (
    <div className={`bg-gradient-to-r ${categoryStyle.card} border rounded-2xl shadow-lg p-6 backdrop-blur-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <ChallengeIcon className={`h-6 w-6 ${categoryStyle.text} mr-2`} />
          <h3 className="text-xl font-bold text-white">
            Desafio Semanal
          </h3>
        </div>
        <div className="text-right">
          <div className={`text-xs ${categoryStyle.text}`}>
            {calculateWeeklyProgress.daysRemaining > 0 
              ? `${calculateWeeklyProgress.daysRemaining} dias restantes`
              : 'Último dia!'
            }
          </div>
          <div className={`w-20 ${categoryStyle.track} rounded-full h-2 mt-1`}>
            <div 
              className={`bg-gradient-to-r ${categoryStyle.bar} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${calculateWeeklyProgress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-black/20 rounded-lg p-4 mb-4">
        <p className={`text-xs uppercase tracking-wide font-bold ${categoryStyle.text} mb-1`}>
          {categoryStyle.label}
        </p>
        <h4 className="font-semibold text-white text-lg mb-2">
          🎯 {selectedChallenge.title}
        </h4>
        <p className="text-gray-300 text-sm mb-3 leading-relaxed">
          {selectedChallenge.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-yellow-400">
            <TrophyIcon className="h-4 w-4 mr-1" />
            <span className="font-bold text-sm">+{selectedChallenge.points} pontos</span>
          </div>

          {/* Status de aceitação independente */}
          <div className="text-xs text-gray-300 text-right">
            <div className="mb-1">
              {challengeState?.myAccepted ? (
                <span className="text-green-400">✅ Você: Aceito</span>
              ) : (
                <span className="text-gray-400">❌ Você: Não aceito</span>
              )}
            </div>
            <div>
              {challengeState?.partnerAccepted ? (
                <span className="text-green-400">✅ Parceiro: Aceito</span>
              ) : (
                <span className="text-gray-400">❌ Parceiro: Não aceito</span>
              )}
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="space-y-3">
          {/* Botão de aceitar desafio */}
          {!challengeState?.myAccepted && (
            <button
              onClick={handleAcceptWeeklyChallenge}
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-lg font-semibold text-sm transition-all transform hover:scale-105 bg-gradient-to-r from-accent to-accent-dark hover:from-accent-light hover:to-accent text-white disabled:opacity-50"
            >
              {isLoading ? 'Aceitando...' : 'Aceitar Desafio'}
            </button>
          )}

          {/* Botão de reivindicar conclusão - só aparece se EU aceitei */}
          {challengeState?.myAccepted && !challengeState?.myConfirmation && (
            <button
              onClick={handleClaimCompletion}
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-lg font-semibold text-sm transition-all bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white disabled:opacity-50"
            >
              {isLoading ? 'Reivindicando...' : 'Reivindicar Conclusão'}
            </button>
          )}

          {/* Status da minha reivindicação */}
          {challengeState?.myConfirmation && (
            <div className="p-3 bg-blue-900/30 rounded-lg">
              <p className="text-blue-300 text-sm font-semibold mb-1">Minha reivindicação:</p>
              <p className="text-blue-300 text-sm">
                {challengeState.myConfirmation.status === 'pending_partner_confirmation' && 
                  '⏳ Aguardando confirmação do parceiro'}
                {challengeState.myConfirmation.status === 'confirmed' && 
                  `✅ Confirmado! +${challengeState.myConfirmation.pointsAwarded || selectedChallenge.points} pontos`}
                {challengeState.myConfirmation.status === 'denied' && 
                  '❌ Negado pelo parceiro - você pode tentar novamente'}
              </p>
            </div>
          )}

          {/* Confirmação do parceiro - só aparece se o parceiro reivindicou */}
          {challengeState?.partnerConfirmation?.status === 'pending_partner_confirmation' && (
            <div className="p-3 bg-orange-900/30 rounded-lg space-y-2">
              <p className="text-orange-300 text-sm font-semibold">
                🤔 Seu parceiro reivindicou ter completado o desafio. Confirma?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleConfirmPartner(true)}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 rounded-md font-semibold text-sm bg-green-600 hover:bg-green-500 text-white disabled:opacity-50"
                >
                  ✅ Confirmar
                </button>
                <button
                  onClick={() => handleConfirmPartner(false)}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 rounded-md font-semibold text-sm bg-red-600 hover:bg-red-500 text-white disabled:opacity-50"
                >
                  ❌ Negar
                </button>
              </div>
            </div>
          )}

          {/* Status da reivindicação do parceiro */}
          {challengeState?.partnerConfirmation && challengeState.partnerConfirmation.status !== 'pending_partner_confirmation' && (
            <div className="p-3 bg-gray-900/30 rounded-lg">
              <p className="text-gray-300 text-sm font-semibold mb-1">Reivindicação do parceiro:</p>
              <p className="text-gray-300 text-sm">
                {challengeState.partnerConfirmation.status === 'confirmed' && 
                  `✅ Confirmado por você! Parceiro ganhou +${challengeState.partnerConfirmation.pointsAwarded || selectedChallenge.points} pontos`}
                {challengeState.partnerConfirmation.status === 'denied' && 
                  '❌ Negado por você'}
              </p>
            </div>
          )}
        </div>
      </div>

      {!activeRound && (
        <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-3">
          <p className="text-blue-300 text-xs text-center">
            💡 Crie uma rodada ativa para ganhar pontos pelos desafios semanais
          </p>
        </div>
      )}

      <div className="text-center text-xs text-gray-400 mt-3">
        💡 Novos desafios toda segunda-feira!
      </div>
    </div>
  );
};

export default DailyChallenge;
