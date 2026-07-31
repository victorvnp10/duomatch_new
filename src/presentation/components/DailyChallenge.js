
import React, { useState, useEffect, useMemo } from 'react';
import { doc, updateDoc, getFirestore, increment } from 'firebase/firestore';
import { ChallengeIcon, TrophyIcon } from './Icons';

const db = getFirestore();

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

  // Lista expandida de desafios semanais
  const weeklyChallenges = [
    {
      id: "week-msg-5",
      title: "5 mensagens carinhosas",
      description: "Troquem pelo menos 5 mensagens especiais de carinho durante a semana",
      points: 10,
      type: "communication"
    },
    {
      id: "week-date-night",
      title: "1 encontro especial",
      description: "Organizem pelo menos 1 momento romântico juntos durante a semana",
      points: 15,
      type: "romance"
    },
    {
      id: "week-surprise",
      title: "Uma surpresa carinhosa",
      description: "Cada um deve fazer pelo menos 1 pequena surpresa para o outro",
      points: 12,
      type: "surprise"
    },
    {
      id: "week-activities",
      title: "3 atividades juntos",
      description: "Realizem pelo menos 3 atividades do app juntos durante a semana",
      points: 18,
      type: "activities"
    },
    {
      id: "week-appreciation",
      title: "3 dias de gratidão",
      description: "Em 3 dias da semana, digam uma coisa que amam no parceiro",
      points: 10,
      type: "appreciation"
    },
    {
      id: "week-photos",
      title: "3 fotos da semana",
      description: "Tirem pelo menos 3 fotos juntos durante a semana",
      points: 8,
      type: "memory"
    },
    {
      id: "week-planning",
      title: "Planos para próxima semana",
      description: "Sentem juntos e planejem algo especial para a próxima semana",
      points: 12,
      type: "planning"
    },
    {
      id: "week-cooking",
      title: "Cozinhar juntos 1 vez",
      description: "Preparem pelo menos 1 refeição juntos durante a semana",
      points: 15,
      type: "together"
    },
    {
      id: "week-compliments",
      title: "2 elogios sinceros",
      description: "Façam pelo menos 2 elogios genuínos um para o outro durante a semana",
      points: 8,
      type: "appreciation"
    },
    {
      id: "week-quality-time",
      title: "30 minutos sem celular",
      description: "Passem pelo menos 30 minutos juntos sem usar o celular",
      points: 10,
      type: "connection"
    },
    {
      id: "week-touch",
      title: "Mais carinho físico",
      description: "Aumentem o carinho físico: abraços, beijos e carícias ao longo da semana",
      points: 12,
      type: "physical"
    },
    {
      id: "week-laugh",
      title: "Momentos de risada",
      description: "Assistam algo engraçado ou contem piadas para se divertirem juntos",
      points: 8,
      type: "fun"
    },
    {
      id: "week-walk",
      title: "1 caminhada juntos",
      description: "Façam pelo menos 1 caminhada ou passeio ao ar livre durante a semana",
      points: 10,
      type: "outdoor"
    },
    {
      id: "week-movie",
      title: "Assistir algo juntos",
      description: "Escolham um filme, série ou vídeo para assistirem juntos",
      points: 8,
      type: "entertainment"
    },
    {
      id: "week-music",
      title: "Playlist do casal",
      description: "Criem uma playlist com 5 músicas que representam vocês",
      points: 10,
      type: "music"
    },
    {
      id: "week-massage",
      title: "Massagem relaxante",
      description: "Façam uma massagem relaxante um no outro durante a semana",
      points: 15,
      type: "physical"
    },
    {
      id: "week-morning",
      title: "Café da manhã especial",
      description: "Preparem um café da manhã especial juntos em um dia da semana",
      points: 12,
      type: "together"
    },
    {
      id: "week-dreams",
      title: "Conversa sobre sonhos",
      description: "Conversem sobre seus sonhos e planos futuros como casal",
      points: 15,
      type: "connection"
    },
    {
      id: "week-game",
      title: "Jogo para dois",
      description: "Joguem um jogo de tabuleiro, cartas ou videogame juntos",
      points: 10,
      type: "fun"
    },
    {
      id: "week-dance",
      title: "Dança em casa",
      description: "Dancem juntos na sala de casa, mesmo que por 5 minutos",
      points: 8,
      type: "fun"
    },
    {
      id: "week-memory",
      title: "Memória especial",
      description: "Compartilhem uma memória especial de quando se conheceram",
      points: 10,
      type: "memory"
    },
    {
      id: "week-learning",
      title: "Aprender algo novo",
      description: "Aprendam algo novo juntos: receita, habilidade ou hobby",
      points: 15,
      type: "growth"
    },
    {
      id: "week-gratitude",
      title: "Lista de gratidão",
      description: "Façam uma lista de 3 coisas pelas quais são gratos no relacionamento",
      points: 12,
      type: "appreciation"
    },
    {
      id: "week-adventure",
      title: "Mini aventura",
      description: "Façam uma pequena aventura: novo restaurante, lugar ou atividade",
      points: 18,
      type: "adventure"
    },
    {
      id: "week-phone-free",
      title: "Jantar sem celular",
      description: "Tenham pelo menos 1 refeição juntos sem usar o celular",
      points: 10,
      type: "connection"
    },
    {
      id: "week-surprise-note",
      title: "Bilhetinho carinhoso",
      description: "Deixem pelo menos 1 bilhetinho carinhoso para o outro encontrar",
      points: 8,
      type: "surprise"
    },
    {
      id: "week-workout",
      title: "Exercício juntos",
      description: "Façam algum exercício físico juntos: caminhada, dança, alongamento",
      points: 12,
      type: "health"
    },
    {
      id: "week-stargazing",
      title: "Observar as estrelas",
      description: "Passem alguns minutos observando o céu noturno juntos",
      points: 10,
      type: "romantic"
    },
    {
      id: "week-breakfast-bed",
      title: "Café na cama",
      description: "Um prepare café da manhã na cama para o outro",
      points: 15,
      type: "surprise"
    },
    {
      id: "week-pet-names",
      title: "Novos apelidos carinhosos",
      description: "Criem novos apelidos carinhosos um para o outro",
      points: 8,
      type: "fun"
    },
    {
      id: "week-plan-weekend",
      title: "Planejar fim de semana",
      description: "Planejem juntos como querem passar o próximo fim de semana",
      points: 10,
      type: "planning"
    },
    {
      id: "week-meditation",
      title: "5 minutos de relaxamento",
      description: "Façam 5 minutos de respiração profunda ou meditação juntos",
      points: 10,
      type: "wellness"
    },
    {
      id: "week-video-call",
      title: "Chamada de vídeo especial",
      description: "Se estiverem distantes, façam uma chamada de vídeo romântica",
      points: 12,
      type: "communication"
    },
    {
      id: "week-handwritten",
      title: "Carta manuscrita",
      description: "Escrevam uma pequena carta de próprio punho um para o outro",
      points: 15,
      type: "romantic"
    },
    {
      id: "week-favorite-things",
      title: "Coisas favoritas",
      description: "Compartilhem 3 coisas favoritas de cada um que o outro ainda não sabe",
      points: 10,
      type: "connection"
    },
    {
      id: "week-sunset",
      title: "Assistir pôr do sol",
      description: "Assistam ao pôr do sol juntos, mesmo que seja da janela",
      points: 8,
      type: "romantic"
    },
    {
      id: "week-compliment-public",
      title: "Elogio público",
      description: "Façam um elogio público um ao outro nas redes sociais",
      points: 12,
      type: "appreciation"
    },
    {
      id: "week-bucket-list",
      title: "Lista de desejos",
      description: "Criem uma lista de 5 coisas que querem fazer juntos este ano",
      points: 15,
      type: "planning"
    },
    {
      id: "week-random-kiss",
      title: "Beijo surpresa",
      description: "Deem pelo menos 3 beijos surpresa um no outro durante a semana",
      points: 8,
      type: "physical"
    },
    {
      id: "week-photo-album",
      title: "Álbum de memórias",
      description: "Olhem fotos antigas juntos e relembrem momentos especiais",
      points: 12,
      type: "memory"
    },
    {
      id: "week-future-talk",
      title: "Conversa sobre o futuro",
      description: "Conversem sobre onde se veem como casal daqui a 5 anos",
      points: 18,
      type: "connection"
    },
    {
      id: "week-silly-dance",
      title: "Dança boba",
      description: "Façam uma dança boba e engraçada juntos para se divertirem",
      points: 8,
      type: "fun"
    },
    {
      id: "week-love-language",
      title: "Linguagem do amor",
      description: "Descubram e pratiquem a linguagem do amor preferida do parceiro",
      points: 15,
      type: "connection"
    },
    {
      id: "week-no-tv",
      title: "Noite sem TV",
      description: "Passem uma noite juntos sem assistir TV, só conversando",
      points: 12,
      type: "connection"
    },
    {
      id: "week-favorite-meal",
      title: "Refeição favorita",
      description: "Preparem a refeição favorita um do outro durante a semana",
      points: 15,
      type: "together"
    },
    {
      id: "week-vision-board",
      title: "Quadro de sonhos",
      description: "Criem um quadro visual com seus sonhos e objetivos como casal",
      points: 20,
      type: "planning"
    },
    {
      id: "week-thank-you",
      title: "3 agradecimentos",
      description: "Agradeçam especificamente por 3 coisas que o parceiro fez na semana",
      points: 10,
      type: "appreciation"
    },
    {
      id: "week-childhood",
      title: "Histórias da infância",
      description: "Compartilhem uma história engraçada ou marcante da infância",
      points: 12,
      type: "connection"
    },
    {
      id: "week-goals",
      title: "Metas pessoais",
      description: "Conversem sobre suas metas pessoais e como podem se apoiar",
      points: 15,
      type: "growth"
    },
    {
      id: "week-creative",
      title: "Projeto criativo",
      description: "Façam algo criativo juntos: desenho, artesanato, decoração",
      points: 18,
      type: "creative"
    },
    {
      id: "week-local-explore",
      title: "Explorar o bairro",
      description: "Explorem algo novo no seu bairro ou cidade natal",
      points: 15,
      type: "adventure"
    }
  ];

  // Função para obter o desafio da semana
  const getWeeklyChallenge = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Segunda-feira
    startOfWeek.setHours(0, 0, 0, 0);

    // Usar a data da segunda-feira para gerar um índice consistente
    const weekSeed = startOfWeek.getTime();
    const challengeIndex = Math.floor(weekSeed / (1000 * 60 * 60 * 24 * 7)) % weeklyChallenges.length;

    return weeklyChallenges[challengeIndex];
  }, []);

  // Calcular progresso da semana
  const calculateWeeklyProgress = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Segunda-feira
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

    const startOfWeek = calculateWeeklyProgress.startOfWeek;
    const year = startOfWeek.getFullYear();
    const month = String(startOfWeek.getMonth() + 1).padStart(2, '0');
    const day = String(startOfWeek.getDate()).padStart(2, '0');
    const weekKey = `${year}-${month}-${day}`;

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

  const handleAcceptWeeklyChallenge = async () => {
    if (!userData?.uid || isLoading) return;
    if (!userData?.coupleId) {
      alert('Vincule seu parceiro(a) para aceitar desafios de verdade — no modo de demonstração isso é só ilustrativo. 💕');
      return;
    }

    setIsLoading(true);
    try {
      const weekKey = getChallengeState?.weekKey || (() => {
        const startOfWeek = calculateWeeklyProgress.startOfWeek;
        const year = startOfWeek.getFullYear();
        const month = String(startOfWeek.getMonth() + 1).padStart(2, '0');
        const day = String(startOfWeek.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      })();
      
      const coupleRef = doc(db, 'duomatches', userData.coupleId);
      
      // Obter dados existentes ou criar novo array
      const existingData = getChallengeState?.challengeData || {};
      const existingAccepted = Array.isArray(existingData.acceptedBy) ? existingData.acceptedBy : [];
      
      // Adicionar apenas se ainda não estiver no array
      const newAcceptedBy = existingAccepted.includes(userData.uid) 
        ? existingAccepted 
        : [...existingAccepted, userData.uid];

      const challengeData = {
        ...existingData,
        challengeId: getWeeklyChallenge.id,
        acceptedBy: newAcceptedBy,
        acceptedAt: existingData.acceptedAt || new Date(),
        weekStartDate: calculateWeeklyProgress.startOfWeek.toISOString(),
        state: 'in_progress',
        confirmations: existingData.confirmations || {}
      };

      await updateDoc(coupleRef, {
        [`weeklyChallenge.${weekKey}`]: challengeData
      });

      // Atualizar estado local para resposta imediata na UI
      setLocalChallengeData({
        [weekKey]: challengeData
      });

      console.log('Desafio semanal aceito com sucesso!');
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

      // Preservar todos os dados existentes
      const existingData = getChallengeState.challengeData || {};
      const existingConfirmations = existingData.confirmations || {};

      const updateData = {
        [`weeklyChallenge.${weekKey}`]: {
          ...existingData,
          confirmations: {
            ...existingConfirmations,
            [userData.uid]: {
              claimed: true,
              claimedAt: new Date(),
              status: 'pending_partner_confirmation'
            }
          },
          state: 'pending_confirmations'
        }
      };

      await updateDoc(coupleRef, updateData);
      
      // Atualizar estado local para resposta imediata na UI
      const currentLocal = localChallengeData || coupleData?.weeklyChallenge || {};
      setLocalChallengeData({
        ...currentLocal,
        [weekKey]: updateData[`weeklyChallenge.${weekKey}`]
      });
      
      console.log('Conclusão reivindicada com sucesso!');
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

      // Preservar todos os dados existentes
      const existingData = getChallengeState.challengeData || {};
      const existingConfirmations = existingData.confirmations || {};
      const partnerConfirmation = existingConfirmations[partnerUid] || {};

      const updatedPartnerConfirmation = {
        ...partnerConfirmation,
        status: confirmed ? 'confirmed' : 'denied',
        confirmedBy: userData.uid,
        confirmedAt: new Date()
      };

      if (confirmed) {
        updatedPartnerConfirmation.pointsAwarded = getWeeklyChallenge.points;
      }

      const updateData = {
        [`weeklyChallenge.${weekKey}`]: {
          ...existingData,
          confirmations: {
            ...existingConfirmations,
            [partnerUid]: updatedPartnerConfirmation
          }
        }
      };

      // Se confirmado, adicionar pontos no placar da rodada ativa
      if (confirmed) {
        const today = new Date().toISOString().slice(0, 10);
        const activeRound = rounds?.find(
          (r) => today >= r.startDate && today <= r.endDate
        );

        if (activeRound) {
          const roundRef = doc(db, `duomatches/${userData.coupleId}/rounds`, activeRound.id);
          
          // Usar increment para adicionar pontos ao placar do parceiro
          await updateDoc(roundRef, {
            [`scores.${partnerUid}`]: increment(getWeeklyChallenge.points)
          });
          
          console.log(`Pontos adicionados ao placar: +${getWeeklyChallenge.points} para ${partnerUid}`);
        }
      }

      await updateDoc(coupleRef, updateData);
      
      // Atualizar estado local para resposta imediata na UI
      const currentLocal = localChallengeData || coupleData?.weeklyChallenge || {};
      setLocalChallengeData({
        ...currentLocal,
        [weekKey]: updateData[`weeklyChallenge.${weekKey}`]
      });
      
      const message = confirmed ? 
        'Conclusão do parceiro confirmada! Pontos foram concedidos.' : 
        'Conclusão do parceiro negada.';
      console.log(message);
    } catch (error) {
      console.error('Erro ao confirmar parceiro:', error);
      alert(`Erro ao confirmar: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Resetar dados locais quando dados do Firestore chegarem
  useEffect(() => {
    if (coupleData?.weeklyChallenge && localChallengeData) {
      // Se os dados do Firestore foram atualizados, limpar cache local
      const startOfWeek = calculateWeeklyProgress.startOfWeek;
      const year = startOfWeek.getFullYear();
      const month = String(startOfWeek.getMonth() + 1).padStart(2, '0');
      const day = String(startOfWeek.getDate()).padStart(2, '0');
      const weekKey = `${year}-${month}-${day}`;
      
      if (coupleData.weeklyChallenge[weekKey] && localChallengeData[weekKey]) {
        // Se os dados do servidor estão mais recentes, limpar cache local
        setLocalChallengeData(null);
      }
    }
  }, [coupleData?.weeklyChallenge, localChallengeData, calculateWeeklyProgress.startOfWeek]);

  // Verificar se há uma rodada ativa
  const activeRound = useMemo(() => {
    if (!rounds || rounds.length === 0) return null;

    const today = new Date().toISOString().slice(0, 10);
    return rounds.find(round => 
      today >= round.startDate && today <= round.endDate
    );
  }, [rounds]);

  if (!userData || !getWeeklyChallenge) {
    return null;
  }

  const challengeState = getChallengeState;
  const categoryStyle = CATEGORY_STYLES[getWeeklyChallenge.type] || DEFAULT_CATEGORY_STYLE;

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
          🎯 {getWeeklyChallenge.title}
        </h4>
        <p className="text-gray-300 text-sm mb-3 leading-relaxed">
          {getWeeklyChallenge.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-yellow-400">
            <TrophyIcon className="h-4 w-4 mr-1" />
            <span className="font-bold text-sm">+{getWeeklyChallenge.points} pontos</span>
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
                  `✅ Confirmado! +${challengeState.myConfirmation.pointsAwarded || getWeeklyChallenge.points} pontos`}
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
                  `✅ Confirmado por você! Parceiro ganhou +${challengeState.partnerConfirmation.pointsAwarded || getWeeklyChallenge.points} pontos`}
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
