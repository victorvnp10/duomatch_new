import React, { useMemo, useState, useEffect, useRef } from "react";
import { FireIcon, ArrowLeftIcon, ChatBubbleIcon, ChallengeIcon } from "./Icons";
import LevelUpAnimation from "./LevelUpAnimation";
import MatchNotification from "./MatchNotification";
import { isActivityForToday } from "../../shared/lib/dateUtils";
import SignalGame from "./hotzone/SignalGame";
import IntimateMemoriesSection from "./hotzone/IntimateMemoriesSection";
import HotSuggestionsSection from "./hotzone/HotSuggestionsSection";
import SecretWishesSection from "./hotzone/SecretWishesSection";
import IntimacyMeter from "./hotzone/IntimacyMeter";
import { getSortedSpecialSuggestions } from "../../application/services/specialSuggestionsService";

// --- COMPONENTE PRINCIPAL APRIMORADO ---
export default function HotZone(props) {
  const {
    user,
    hotSuggestions = {},
    handleSelectHotSuggestion,
    allActivities,
    mySelections,
    partnerSelections,
    coupleData,
    userData,
    handleSetDailySignal,
    handleSelectActivity,
    handleAcceptChallenge,
    handleDeclineChallenge,
    handleResolveChallenge,
    setView,
    setActiveChatActivity,
  } = props;

  // B2-55: `showHistory` fantasma removido — o controle vive apenas em
  // `IntimateMemoriesSection` (linha ~438). Este estado nunca era usado.
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [matchedActivityName, setMatchedActivityName] = useState('');

  // Controle de animação de level up
  const previousLevelRef = useRef(null);

  useEffect(() => {
    const currentPoints = coupleData?.intimacyPoints || 0;
    const currentLevel = Math.floor(currentPoints / 4);

    // Inicializar referência na primeira execução
    if (previousLevelRef.current === null) {
      previousLevelRef.current = currentLevel;
      return;
    }

    // Detectar level up apenas quando o nível aumenta
    if (currentLevel > previousLevelRef.current) {
      setNewLevel(currentLevel);
      setShowLevelUpAnimation(true);
    }

    previousLevelRef.current = currentLevel;
  }, [coupleData?.intimacyPoints]);

  // Sistema de eventos para notificação de match (igual ao MainView)
  useEffect(() => {
    const handleMatchEvent = (event) => {
      const name = typeof event.detail === "string" ? event.detail : event.detail?.activityName;
      setMatchedActivityName(name || "");
      setShowMatchNotification(true);
    };

    window.addEventListener('activityMatch', handleMatchEvent);
    window.addEventListener('hotActivityMatch', handleMatchEvent);

    return () => {
      window.removeEventListener('activityMatch', handleMatchEvent);
      window.removeEventListener('hotActivityMatch', handleMatchEvent);
    };
  }, []);

  const hotItems = useMemo(() => allActivities.filter(
    (activity) => activity.category === "Hot" && isActivityForToday(activity)
  ), [allActivities]);

  const finalizedHotItems = useMemo(() => hotItems.filter(
    (item) => {
      const isCompletedChallenge = ["completed", "not_completed", "declined", "expired"].includes(
        item.challengeState
      );
      // Desafios só entram como finalizados via challengeState — nunca por
      // "match" de seleções (que era fruto do clique indevido).
      const isMatchedActivity = !item.type?.startsWith("desafio") &&
        mySelections[item.id]?.status === "confirmed" &&
        partnerSelections?.[item.id]?.status === "confirmed";

      return isCompletedChallenge || isMatchedActivity;
    }
  ), [hotItems, mySelections, partnerSelections]);

  const availableHotItems = useMemo(() => hotItems.filter(
    (item) => !finalizedHotItems.some((finalized) => finalized.id === item.id)
  ), [hotItems, finalizedHotItems]);

  // Fonte única: mesma função usada por MainView para as Sugestões Especiais.
  const sortedHotSuggestions = useMemo(
    () =>
      getSortedSpecialSuggestions(hotSuggestions, {
        userId: user.uid,
        partnerId: userData.partnerId,
      }),
    [hotSuggestions, user.uid, userData.partnerId]
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-red-950 to-black text-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-500/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-32 right-16 w-48 h-48 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-purple-500/10 rounded-full blur-lg animate-pulse delay-500" />
      </div>

      <header className="relative z-20 bg-black/50 backdrop-blur-xl p-4 sticky top-0 border-b border-red-500/30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => setView("main")}
            className="p-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
            aria-label="Voltar"
          >
            <ArrowLeftIcon />
          </button>
          <div className="flex items-center">
            <FireIcon className="h-10 w-10 text-red-500 animate-pulse" />
            <h1
              className="ml-4 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400 tracking-widest uppercase"
              style={{ textShadow: "0 0 20px rgba(248, 113, 113, 0.8)" }}
            >
              Hot Zone
            </h1>
          </div>
          <div className="w-12"></div>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto p-4 md:p-6 space-y-8">
        {/* Nível de Intimidade */}
        <IntimacyMeter user={user} userData={userData} coupleData={coupleData} />

        {/* Jogo de Sinais */}
        <SignalGame
          user={user}
          userData={userData}
          coupleData={coupleData}
          handleSetDailySignal={handleSetDailySignal}
          setView={setView}
        />

        {/* Sugestões Picantes */}
        <HotSuggestionsSection
          sortedHotSuggestions={sortedHotSuggestions}
          user={user}
          handleSelectHotSuggestion={handleSelectHotSuggestion}
        />

        {/* Interesses Secretos */}
        <SecretWishesSection
          availableHotItems={availableHotItems}
          user={user}
          mySelections={mySelections}
          handleSelectActivity={handleSelectActivity}
          handleAcceptChallenge={handleAcceptChallenge}
          handleDeclineChallenge={handleDeclineChallenge}
          handleResolveChallenge={handleResolveChallenge}
        />

        {/* Memórias Íntimas - Reescrito para compatibilidade com produção */}
        <IntimateMemoriesSection 
          finalizedHotItems={finalizedHotItems}
          user={user}
          userData={userData}
          setActiveChatActivity={setActiveChatActivity}
        />
      </main>

      {/* Animações */}
      {showLevelUpAnimation && (
        <LevelUpAnimation 
          isVisible={showLevelUpAnimation}
          newLevel={newLevel}
          onComplete={() => setShowLevelUpAnimation(false)}
        />
      )}

      {showMatchNotification && (
        <MatchNotification 
          isVisible={showMatchNotification}
          activityName={matchedActivityName}
          isHot={true}
          onComplete={() => {
            setShowMatchNotification(false);
          }}
        />
      )}
    </div>
  );
}