import React, { useMemo, useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../infrastructure/firebase";
import {
  HeartIcon,
  TagIcon,
  TrophyIcon,
  CalendarIcon,
  GiftIcon,
  FireIcon,
  categoryIcons,
  HelpIcon,
  CheckCircleIcon,
  ChallengeIcon,
  UserCircleIcon,
  WalletIcon,
} from "./Icons";
import MatchItem from "./MatchItem";
import StreakTracker from "./StreakTracker";
import DailyChallenge from "./DailyChallenge";
import AchievementSystem from "./AchievementSystem";
import MatchNotification from "./MatchNotification";
import { isActivityForToday, getTodayDateString, getDateString } from "../../shared/utils";
import { updateStreak } from "../../shared/utils/streakUtils";
import CountdownTimer from "./CountdownTimer";
import { useAchievements } from "../../application/hooks/useAchievements";
import { useMenstrualCycle } from "../../application/hooks/useMenstrualCycle";
import DailyTipCard from "./DailyTipCard";
import { useNotificationCenter } from "../../application/hooks/useNotificationCenter";
import NotificationCenter from "./NotificationCenter";
import { Avatar } from "./avatars/AvatarCatalog";

const RuleProgressDisplay = ({ title, icon, ruleData, nicknames }) => {
  if (!ruleData) return null;
  const { myProgress, partnerProgress, penalty, daysRemaining } = ruleData;

  const IndividualProgressBar = ({ name, progress }) => {
    const { count, target } = progress;
    const percentage = target > 0 ? Math.min((count / target) * 100, 100) : 0;
    const getBarColor = () => {
      if (target === 0) return "bg-gray-500";
      const ratio = count / target;
      if (ratio >= 1) return "bg-green-400";
      if (ratio >= 0.5) return "bg-yellow-400";
      return "bg-red-400";
    };
    return (
      <div className="w-[35%] flex flex-col items-center">
        <p className="text-xs text-gray-300 mb-1 font-semibold">{name}</p>
        <div className="bg-gray-600 rounded-full h-2.5 w-full overflow-hidden">
          <div
            className={`${getBarColor()} h-full rounded-full transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-xs font-mono mt-1 text-gray-400">
          {count}/{target}
        </p>
      </div>
    );
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-700">
      <div className="flex items-center justify-center text-sm font-semibold text-gray-300 mb-3">
        {icon}
        <span className="ml-2">{title}</span>
      </div>
      <div className="flex justify-between items-center text-center">
        <IndividualProgressBar name={nicknames.me} progress={myProgress} />
        <div className="text-center px-2">
          <p className="font-bold text-red-500 text-base">{penalty} pts</p>
          <p className="text-xs text-gray-400 italic">
            {daysRemaining > 0
              ? `${daysRemaining} ${
                  daysRemaining === 1 ? "dia" : "dias"
                } p/ ciclo`
              : "Hoje!"}
          </p>
        </div>
        <IndividualProgressBar
          name={nicknames.partner}
          progress={partnerProgress}
        />
      </div>
    </div>
  );
};

export default function MainView(props) {
  const {
    user,
    userData,
    partnerNickname,
    rounds,
    matches,
    allActivities,
    mySelections,
    partnerSelections,
    rewards,
    wishlistItems,
    setView,
    handleSelectActivity,
    handleResolveChallenge,
    handleSetActivityResolution,
    setActiveChatActivity,
    dailySuggestions,
    handleSelectSuggestion,
    hotSuggestions,
    handleAcceptChallenge,
    handleDeclineChallenge,
    handleOpenTour,
    setIsAddRoundModalOpen,
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [dailyActivities, setDailyActivities] = useState([]);
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [matchedActivityName, setMatchedActivityName] = useState('');

  // Data LOCAL (convenção do projeto) — toISOString() é UTC e, no fuso
  // brasileiro, viraria "amanhã" entre 21h e 23:59, quebrando rodada ativa,
  // placar e regras cíclicas à noite.
  const todayStr = getTodayDateString();
  const activeRound = rounds.find(
    (r) => todayStr >= r.startDate && todayStr <= r.endDate
  );
  const myScore = activeRound ? activeRound.scores?.[user.uid] || 0 : 0;
  const partnerScore = activeRound
    ? activeRound.scores?.[userData.partnerId] || 0
    : 0;

  const sortedSpecialSuggestions = useMemo(() => {
    if (!dailySuggestions) return [];
    return Object.values(dailySuggestions)
      .filter((activity) => {
        if (!activity || !activity.name) return false;
        // Se já teve match, não mostrar
        if (activity.matched) return false;
        // Se ambos selecionaram (mas ainda não processou o match), não mostrar
        const mySelection = activity.selections?.[user.uid];
        const partnerSelection = activity.selections?.[userData.partnerId];
        if (mySelection === "selected" && partnerSelection === "selected") return false;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [dailySuggestions, user.uid, userData.partnerId]);

  const getRoundCountdownInfo = () => {
    const baseClasses = "text-center text-sm mt-4";
    if (!activeRound) return { text: null, className: baseClasses };
    const endDate = new Date(activeRound.endDate + "T23:59:59");
    const diffTime = endDate.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1)
      return {
        text: "A rodada acaba hoje!",
        className: `${baseClasses} text-yellow-400 font-bold`,
      };
    const text =
      diffDays === 1
        ? "Falta 1 dia para acabar a rodada."
        : `Faltam ${diffDays} dias para acabar a rodada.`;
    return { text, className: `${baseClasses} text-gray-400 italic` };
  };

  const countdownInfo = getRoundCountdownInfo();

  const availableActivities = useMemo(
    () =>
      allActivities.filter((activity) => {
        if (
          !isActivityForToday(activity) ||
          matches.some((m) => m.id === activity.id) ||
          activity.category === "Hot"
        )
          return false;
        
        const isChallenge = activity.type?.startsWith("desafio");
        if (isChallenge)
          return activity.challengeState === "pending_acceptance";
        
        // Para atividades criadas pelo sistema (não sugestões especiais), aplicar a mesma lógica
        if (activity.createdBy === "SYSTEM") return false;
        
        // Para atividades normais, verificar se já houve match
        const mySelection = activity.selections?.[user.uid];
        const partnerSelection = activity.selections?.[userData.partnerId];
        
        // Se ambos confirmaram, não mostrar (será exibido em "Matches de Hoje")
        if (mySelection?.status === "confirmed" && partnerSelection?.status === "confirmed") {
          return false;
        }
        
        return true;
      }),
    [allActivities, matches, user.uid, userData.partnerId]
  );

  useEffect(() => {
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
      const seededHash = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = (hash << 5) - hash + char;
          hash &= hash;
        }
        return hash;
      };
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
    const uniqueActivities = combinedList.filter(
      (activity, index, self) =>
        index === self.findIndex((a) => a.id === activity.id)
    );
    setDailyActivities(uniqueActivities);
  }, [availableActivities, todayStr]);

  const roundRulesProgress = useMemo(() => {
    if (!activeRound || !activeRound.rules) return {};

    const result = {};
    const activitiesRule = activeRound.rules.minActivities;
    const challengesRule = activeRound.rules.minChallenges;

    if (activitiesRule) {
      // B2-18: usa os MESMOS contadores do domínio que o avaliador usa
      // para pontuar. A implementação inline anterior divergia em dois
      // pontos (critério de criação na rodada + bônus de sugestões
      // marcadas), então o painel mostrava "meta cumprida" enquanto o
      // avaliador aplicava penalidade.
      const myCount = countConfirmedActivitiesInRound(
        allActivities,
        user.uid,
        activeRound,
        todayStr
      );
      const partnerCount = countConfirmedActivitiesInRound(
        allActivities,
        userData.partnerId,
        activeRound,
        todayStr
      );

      const today = new Date(todayStr);
      const startDate = new Date(activeRound.startDate);
      const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
      const daysUntilNextCheck = activitiesRule.days - (daysSinceStart % activitiesRule.days);

      result.activitiesRule = {
        myProgress: { count: myCount, target: activitiesRule.quantity },
        partnerProgress: { count: partnerCount, target: activitiesRule.quantity },
        penalty: activitiesRule.penalty,
        daysRemaining: daysUntilNextCheck === activitiesRule.days ? 0 : daysUntilNextCheck,
      };
    }

    if (challengesRule) {
      // Mesmo critério do avaliador (desafios criados por cada pessoa)
      const myChallengesCount = countChallengesCreatedInRound(
        allActivities,
        user.uid,
        activeRound
      );
      const partnerChallengesCount = countChallengesCreatedInRound(
        allActivities,
        userData.partnerId,
        activeRound
      );

      const today = new Date(todayStr);
      const startDate = new Date(activeRound.startDate);
      const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
      const daysUntilNextCheck = challengesRule.days - (daysSinceStart % challengesRule.days);

      result.challengesRule = {
        myProgress: { count: myChallengesCount, target: challengesRule.quantity },
        partnerProgress: { count: partnerChallengesCount, target: challengesRule.quantity },
        penalty: challengesRule.penalty,
        daysRemaining: daysUntilNextCheck === challengesRule.days ? 0 : daysUntilNextCheck,
      };
    }

    return result;
  }, [
    activeRound,
    allActivities,
    user.uid,
    userData.partnerId,
    todayStr,
  ]);
  // Separar matches de hoje dos da jornada do casal
  const todayMatches = useMemo(() => {
    const today = getTodayDateString();

    return allActivities.filter((activity) => {
      const myChoice = activity.selections?.[user.uid];
      const partnerChoice = activity.selections?.[userData.partnerId];

      const isNormalMatch =
        myChoice?.date === today &&
        myChoice?.status === "confirmed" &&
        partnerChoice?.date === today &&
        partnerChoice?.status === "confirmed" &&
        !activity.type?.startsWith("desafio");

      // Para desafios, só mostrar os que estão aceitos (ativos) hoje
      const isChallengeMatch =
        activity.type?.startsWith("desafio") &&
        activity.challengeState === "accepted" &&
        activity.expiresAt &&
        activity.expiresAt.toDate() > new Date();

      return isNormalMatch || isChallengeMatch;
    });
  }, [allActivities, user.uid, userData.partnerId]);

  const coupleJourneyMatches = useMemo(() => {
    const journeyToday = new Date();
    journeyToday.setHours(0, 0, 0, 0);
    const today = journeyToday.toISOString().slice(0, 10);

    return allActivities.filter((activity) => {
      // Atividades normais do passado
      const selectionDateStr = activity.selections?.[user.uid]?.date;
      if (selectionDateStr && selectionDateStr < today) {
        const isNormalMatch =
          activity.selections?.[user.uid]?.status === "confirmed" &&
          activity.selections?.[userData.partnerId]?.status === "confirmed" &&
          !activity.type?.startsWith("desafio");
        if (isNormalMatch) return true;
      }

      // Desafios concluídos, não cumpridos, recusados ou expirados
      const isChallengeFinished =
        activity.type?.startsWith("desafio") &&
        ["completed", "not_completed", "declined", "expired"].includes(
          activity.challengeState
        );

      return isChallengeFinished;
    });
  }, [allActivities, user.uid, userData.partnerId]);

  const { coupleData, handleSelectHotSuggestion } = props;

  // Hook para gerenciar conquistas automaticamente (com memoização mais estável)
  const memoizedUserData = useMemo(() => ({
    coupleId: userData?.coupleId,
    uid: userData?.uid,
    partnerId: userData?.partnerId
  }), [userData?.coupleId, userData?.uid, userData?.partnerId]);

  const memoizedCoupleData = useMemo(() => ({
    achievements: coupleData?.achievements || [],
    partnerId: coupleData?.partnerId,
    streak: coupleData?.streak || 0,
    messageCount: coupleData?.messageCount || 0
  }), [
    coupleData?.achievements?.length,
    coupleData?.partnerId,
    coupleData?.streak,
    coupleData?.messageCount
  ]);

  const memoizedActivities = useMemo(() => allActivities, [allActivities.length]);
  const memoizedRewards = useMemo(() => rewards || [], [rewards?.length]);
  const memoizedWishlistItems = useMemo(() => wishlistItems || [], [wishlistItems?.length]);

  useAchievements({
    userData: memoizedUserData,
    coupleData: memoizedCoupleData,
    allActivities: memoizedActivities,
    rewards: memoizedRewards,
    wishlistItems: memoizedWishlistItems,
  });

  const { isOwner: isCycleOwner, isConfigured: isCycleConfigured, dailyInsight } =
    useMenstrualCycle({ user, userData, coupleData });

  const { notifications, count: notificationCount } = useNotificationCenter({
    user,
    userData,
    allActivities,
    mySelections,
    partnerSelections,
    matches,
    rewards,
    dailyActivities,
  });

  // Sistema de eventos para notificações de match.
  // Matches HOT não são tratados aqui: o overlay temático fica no
  // DuoMatchApp (global) e no HotZone — evita overlay duplicado/errado.
  useEffect(() => {
    const handleMatchEvent = (event) => {
      const name = typeof event.detail === "string" ? event.detail : event.detail?.activityName;
      setMatchedActivityName(name || "");
      setShowMatchNotification(true);
    };

    window.addEventListener('activityMatch', handleMatchEvent);

    return () => {
      window.removeEventListener('activityMatch', handleMatchEvent);
    };
  }, []);

  // Usar as funções já existentes do useActivities
  const handleSelectActivityAndUpdateStreak = async (activityId) => {
    setIsLoading(true);
    try {
      await handleSelectActivity(activityId);

      // Atualizar sequência após seleção
      if (userData?.coupleId) {
        updateStreak(userData.coupleId, { ...userData, coupleData }, allActivities, dailySuggestions, hotSuggestions);
      }
    } catch (error) {
      console.error("Erro ao selecionar atividade:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSuggestionAndUpdateStreak = async (suggestionId) => {
    setIsLoading(true);
    try {
      await handleSelectSuggestion(suggestionId);

      // Atualizar sequência após seleção de sugestão especial
      if (userData?.coupleId) {
        updateStreak(userData.coupleId, { ...userData, coupleData }, allActivities, dailySuggestions, hotSuggestions);
      }
    } catch (error) {
      console.error("Erro ao selecionar sugestão:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHotSuggestionAndUpdateStreak = async (hotId) => {
    setIsLoading(true);
    try {
      await handleSelectHotSuggestion(hotId);

      // Atualizar sequência após seleção de sugestão picante
      if (userData?.coupleId) {
        updateStreak(userData.coupleId, { ...userData, coupleData }, allActivities, dailySuggestions, hotSuggestions);
      }
    } catch (error) {
      console.error("Erro ao selecionar hot suggestion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-bg-glow text-white min-h-screen">
      <header className="bg-gray-900/70 backdrop-blur-md p-4 sticky top-0 z-20 border-b border-gray-700/50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setView("main")}
          >
            <HeartIcon />
            <h1 className="ml-2 text-xl font-bold text-white">DuoMatch</h1>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <div className="text-right mr-2">
              <p className="font-semibold text-sm text-white">
                {userData.nickname}
              </p>
              <p className="text-xs text-gray-400">
                Conectado com{" "}
                <span className="font-medium text-yellow-400">
                  {partnerNickname}
                </span>
              </p>
            </div>
            <button
              onClick={() => setView("profile")}
              className="p-2 text-gray-300 hover:text-white"
              aria-label="Meu Perfil"
            >
              <UserCircleIcon className="h-6 w-6" />
            </button>
            <NotificationCenter
              notifications={notifications}
              count={notificationCount}
              setView={setView}
            />
            <button
              data-tour-id="nav-shop"
              onClick={() => setView("shop")}
              className="p-2 text-gray-300 hover:text-white"
              aria-label="Shop"
            >
              <TagIcon />
            </button>
            <button
              data-tour-id="nav-wallet"
              onClick={() => setView("wallet")}
              className="p-2 text-gray-300 hover:text-white"
              aria-label="Wallet"
            >
              <WalletIcon />
            </button>
            <button
              data-tour-id="nav-rounds"
              onClick={() => setView("rounds")}
              className="p-2 text-gray-300 hover:text-white"
              aria-label="Rounds"
            >
              <TrophyIcon />
            </button>
            <button
              onClick={() => setView("all")}
              className="p-2 text-gray-300 hover:text-white"
              aria-label="All Activities"
            >
              <CalendarIcon />
            </button>
            <button
              data-tour-id="nav-wishlist"
              onClick={() => setView("wishlist")}
              className="p-2 text-gray-300 hover:text-white"
              aria-label="Wishlist"
            >
              <GiftIcon />
            </button>
            <button
              data-tour-id="nav-hot"
              onClick={() => setView("hot")}
              className="p-2 text-gray-300 hover:text-red-400"
              aria-label="Hot Zone"
            >
              <FireIcon isPulsing={true} />
            </button>
            <button
              data-tour-id="nav-help"
              onClick={handleOpenTour}
              className="p-2 text-gray-300 hover:text-white"
              aria-label="Ajuda"
            >
              <HelpIcon />
            </button>
            <button
              onClick={() => signOut(auth)}
              className="text-sm text-gray-400 hover:text-red-500"
            >
              Sair
            </button>
          </div>
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setView("profile")}
              className="p-2 text-gray-300 hover:text-white"
              aria-label="Meu Perfil"
            >
              <UserCircleIcon className="h-6 w-6" />
            </button>
            <NotificationCenter
              notifications={notifications}
              count={notificationCount}
              setView={setView}
            />
            <button
              data-tour-id="nav-help"
              onClick={handleOpenTour}
              className="p-2 text-gray-300 hover:text-white"
              aria-label="Ajuda"
            >
              <HelpIcon />
            </button>
            <button
              onClick={() => setView("all")}
              className="p-2 text-gray-300 hover:text-white"
            >
              <CalendarIcon />
            </button>
            <button
              onClick={() => signOut(auth)}
              className="text-sm font-semibold text-gray-400 hover:text-red-500"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-8 pb-24">
        <div
          data-tour-id="rounds-card"
          className="bg-gray-800/50 border border-gray-700/50 rounded-2xl shadow-lg p-6 backdrop-blur-sm"
        >
          {!activeRound ? (
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-300 mb-2">
                Nenhuma rodada em andamento
              </h3>
              <p className="text-gray-400 mb-4">
                Que tal começar uma nova disputa?
              </p>
              <button
                onClick={() => setIsAddRoundModalOpen(true)}
                className="w-full bg-yellow-500 text-gray-900 font-bold py-3 px-4 rounded-lg hover:bg-yellow-400 transition-all transform hover:scale-105 flex items-center justify-center text-lg"
              >
                <TrophyIcon />
                <span className="ml-2">Criar Nova Rodada</span>
              </button>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-display font-semibold mb-4 text-center text-gold">
                Placar da Rodada "{activeRound.name}"
              </h3>
              <div className="flex justify-around items-start text-center">
                <div className="flex flex-col items-center w-2/5">
                  <Avatar
                    photoURL={userData.photoURL}
                    nickname={userData.nickname}
                    size="w-20 h-20"
                    className="border-2 border-accent/40 mb-2 shadow-glow-accent"
                  />
                  <p className="font-bold text-3xl text-white">{myScore}</p>
                  <p className="text-sm font-semibold text-gray-300 truncate">
                    {userData.nickname}
                  </p>
                </div>

                <div className="font-display font-bold text-2xl text-gray-500 pt-8">VS</div>

                <div className="flex flex-col items-center w-2/5">
                  <Avatar
                    photoURL={userData.partnerData?.photoURL}
                    nickname={partnerNickname}
                    size="w-20 h-20"
                    className="border-2 border-gold/40 mb-2 shadow-glow-gold"
                  />
                  <p className="font-bold text-3xl text-white">
                    {partnerScore}
                  </p>
                  <p className="text-sm font-semibold text-gray-300 truncate">
                    {partnerNickname}
                  </p>
                </div>
              </div>

              {roundRulesProgress.activitiesRule && (
                <RuleProgressDisplay
                  title="Atividades Marcadas (Ciclo)"
                  icon={<CheckCircleIcon className="h-4 w-4" />}
                  ruleData={roundRulesProgress.activitiesRule}
                  nicknames={{ me: "Você", partner: partnerNickname }}
                />
              )}
              {roundRulesProgress.challengesRule && (
                <RuleProgressDisplay
                  title="Desafios Lançados (Ciclo)"
                  icon={<ChallengeIcon className="h-4 w-4" />}
                  ruleData={roundRulesProgress.challengesRule}
                  nicknames={{ me: "Você", partner: partnerNickname }}
                />
              )}
              {countdownInfo.text && (
                <p className={countdownInfo.className}>{countdownInfo.text}</p>
              )}
            </>
          )}
        </div>

        {/* STREAK TRACKER */}
        <StreakTracker userData={userData} coupleData={coupleData} />

        {/* DICA DO DIA (ciclo) */}
        {!isCycleOwner && isCycleConfigured && (
          <DailyTipCard
            dailyInsight={dailyInsight}
            onOpenCycleView={() => setView("cycle")}
          />
        )}

        {/* DESAFIO DIÁRIO */}
        <DailyChallenge 
          userData={userData} 
          coupleData={coupleData} 
          rounds={rounds}
          onAcceptChallenge={handleAcceptChallenge}
        />

        {todayMatches.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl shadow-lg p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-3 text-gray-200">
              Matches de Hoje! 🎉
            </h3>
            <ul className="space-y-3">
              {todayMatches.map((match) => (
                <MatchItem
                  key={match.id}
                  match={match}
                  user={user}
                  userData={userData}
                  partnerNickname={partnerNickname}
                  handleResolveChallenge={handleResolveChallenge}
                  handleSetActivityResolution={handleSetActivityResolution}
                  setActiveChatActivity={setActiveChatActivity}
                />
              ))}
            </ul>
          </div>
        )}

        {dailyActivities.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl shadow-lg p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">
              Sugestões do Dia!
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Escolha uma atividade em segredo. Se a escolha de vocês for a
              mesma, ela vira um match!
            </p>
            <ul className="space-y-3">
              {dailyActivities.map((activity) => {
                const isChallenge = activity.type?.startsWith("desafio");
                const iAmChallenged =
                  isChallenge && activity.createdBy !== user.uid;
                const myStatus = mySelections[activity.id]?.status;

                let borderColor = "border-transparent";
                if (iAmChallenged) borderColor = "border-pink-500/50";
                if (myStatus === "confirmed") borderColor = "border-yellow-400";

                return (
                  <li
                    key={activity.id}
                    className={`bg-gray-800/60 rounded-lg p-4 shadow-lg backdrop-blur-sm border-l-4 transition-all duration-200 ${borderColor}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <span
                          className={`mr-3 text-2xl ${
                            isChallenge ? "text-pink-400" : "text-green-400"
                          }`}
                        >
                          {isChallenge ? (
                            <ChallengeIcon />
                          ) : (
                            categoryIcons[activity.category]
                          )}
                        </span>
                        <div>
                          <p className="font-semibold text-white">
                            {activity.name}{" "}
                            {activity.points > 0 && (
                              <span
                                className={`font-bold ${
                                  isChallenge
                                    ? "text-pink-400"
                                    : "text-yellow-400"
                                }`}
                              >
                                ({activity.points} pts)
                              </span>
                            )}
                          </p>
                          {activity.description && (
                            <p className="text-xs text-gray-400 italic">
                              {activity.description}
                            </p>
                          )}
                          {activity.expiresAt &&
                            typeof activity.expiresAt.toDate === "function" && (
                              <CountdownTimer
                                expiryTimestamp={activity.expiresAt}
                              />
                            )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-700/50 flex justify-end items-center">
                      {isChallenge ? (
                        iAmChallenged ? (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm font-semibold text-pink-300 animate-pulse">
                              Novo desafio para você!
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleDeclineChallenge(activity.id)
                                }
                                className="text-xs font-bold text-white bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-md"
                              >
                                Recusar
                              </button>
                              <button
                                onClick={() =>
                                  handleAcceptChallenge(activity.id)                                }
                                className="text-xs font-bold text-gray-900 bg-green-400 hover:bg-green-300 px-3 py-1.5 rounded-md"
                              >
                                Aceitar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm font-semibold text-gray-400">
                            Aguardando resposta...
                          </span>
                        )
                      ) : myStatus === "confirmed" ? (
                        <div
                          className="flex items-center justify-between w-full cursor-pointer"
                          onClick={() => handleSelectActivity(activity.id)}
                        >
                          <span className="text-sm font-semibold text-yellow-400">
                            Sua escolha!
                          </span>
                          <span className="text-xs text-gray-400">
                            (Clique para desmarcar)
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSelectActivityAndUpdateStreak(activity.id)}
                          className="w-full flex items-center justify-between text-gray-300 hover:text-white"
                        >
                          <span className="text-sm font-semibold">
                            Escolher esta atividade
                          </span>
                          <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-gray-500" />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {sortedSpecialSuggestions.length > 0 && (
          <div
            data-tour-id="sugestoes-dia"
            className="bg-gray-800/50 border border-gray-700/50 rounded-2xl shadow-lg p-6 backdrop-blur-sm"
          >
            <h2 className="text-xl font-semibold mb-2 text-gray-200">
              Sugestões Especiais ✨
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Escolha uma atividade em segredo. Se a escolha de vocês for a
              mesma, ela vira um match!
            </p>
            <ul className="space-y-3">
              {sortedSpecialSuggestions.map((activity) => {
                if (!activity || !activity.id || activity.matched) return null;
                const myStatus = activity.selections?.[user.uid];
                const isSelected = myStatus === "selected";

                return (
                  <li
                    key={activity.id}
                    className={`bg-gray-800/60 rounded-lg p-4 shadow-lg backdrop-blur-sm border-l-4 transition-all duration-200 ${
                      isSelected ? "border-yellow-400" : "border-transparent"
                    }`}                      >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <span className="mr-3 text-2xl text-green-400">
                          {categoryIcons[activity.category]}
                        </span>
                        <div>
                          <p className="font-semibold text-white">
                            {activity.name}{" "}
                            {activity.points > 0 && (
                              <span className="font-bold text-yellow-400">
                                ({activity.points} pts)
                              </span>
                            )}
                          </p>
                          {activity.description && (
                            <p className="text-xs text-gray-400 italic">
                              {activity.description}
                            </p>
                          )}
                        </div>
                      </div>
                                        </div>

                    <div className="mt-3 pt-3 border-t border-gray-700/50 flex justify-end items-center">
                      {isSelected ? (
                        <div
                          className="flex items-center justify-between w-full cursor-pointer"
                          onClick={() => handleSelectSuggestion(activity.id)}
                        >
                          <span className="text-sm font-semibold text-yellow-400">
                            Sua escolha!
                          </span>
                          <span className="text-xs text-gray-400">
                            (Clique para desmarcar)
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSelectSuggestionAndUpdateStreak(activity.id)}
                          className="w-full flex items-center justify-between text-gray-300 hover:text-white"
                        >
                          <span className="text-sm font-semibold">
                            Escolher esta atividade
                          </span>
                          <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-gray-500" />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="text-center text-xs text-yellow-400 mt-3">
              💡 Sugestões únicas renovadas diariamente!
            </div>
          </div>
        )}

        {coupleJourneyMatches.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl shadow-lg p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-3 text-gray-200">
              Jornada do Casal ❤️</h3>
            <ul className="space-y-3">
              {coupleJourneyMatches.map((match) => (
                <MatchItem
                  key={match.id}
                  match={match}
                  user={user}
                  userData={userData}
                  partnerNickname={partnerNickname}
                  handleResolveChallenge={handleResolveChallenge}
                  handleSetActivityResolution={handleSetActivityResolution}
                  setActiveChatActivity={setActiveChatActivity}
                />
              ))}
            </ul>

            <div className="text-center text-xs text-rose-400 mt-3">
              💡 Recordações dos momentos especiais que viveram juntos!
            </div>
          </div>
        )}

        {/* SISTEMA DE CONQUISTAS */}
        <div data-tour-id="achievements-card">
          <AchievementSystem achievements={coupleData?.achievements || []} />
        </div>
      </main>

      {/* Notificação de Match */}
      <MatchNotification 
        isVisible={showMatchNotification}
        activityName={matchedActivityName}
        isHot={false}
        onComplete={() => setShowMatchNotification(false)}
      />
    </div>
  );
}