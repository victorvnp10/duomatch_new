import React, { useMemo, useState, useEffect, useRef } from "react";
import { FireIcon, ArrowLeftIcon, ChatBubbleIcon, ChallengeIcon } from "./Icons";
import LevelUpAnimation from "./LevelUpAnimation";
import MatchNotification from "./MatchNotification";
import { isActivityForToday } from "../../shared/lib/dateUtils";
import SignalGame from "./hotzone/SignalGame";
import IntimacyMeter from "./hotzone/IntimacyMeter";
import HotListItem from "./hotzone/HotListItem";

// --- COMPONENTE DE MEMÓRIAS ÍNTIMAS ---
const IntimateMemoriesSection = ({ finalizedHotItems, user, userData, setActiveChatActivity }) => {
  const [showHistory, setShowHistory] = useState(false);
  
  // Verificação de segurança
  if (!finalizedHotItems || !Array.isArray(finalizedHotItems) || finalizedHotItems.length === 0) {
    return null;
  }

  const getStatusIcon = (resolution) => {
    if (resolution === "completed") return "✅";
    if (resolution === "not_completed") return "❌";
    return "⏳";
  };

  const getStatusText = (item) => {
    const isChallenge = item.type?.startsWith("desafio");
    if (isChallenge) {
      switch (item.challengeState) {
        case "completed": return "✅ Cumprido";
        case "not_completed": return "❌ Não Cumprido";
        case "declined": return "🚫 Recusado";
        case "expired": return "⏰ Expirado";
        default: return "⏳ Pendente";
      }
    }
    return "💞 Match realizado!";
  };

  return (
    <div className="bg-gradient-to-br from-black/40 to-gray-900/40 p-6 rounded-2xl border border-gray-500/20 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-300 flex items-center">
          📖 Memórias Íntimas
        </h3>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1 rounded-full hover:bg-gray-700/30"
        >
          {showHistory ? "Ocultar" : "Mostrar"} ({finalizedHotItems.length})
        </button>
      </div>

      {showHistory && (
        <div className="space-y-4">
          {finalizedHotItems.map((item, index) => {
            const isChallenge = item.type?.startsWith("desafio");
            const myResolution = item.selections?.[user?.uid]?.resolution;
            const partnerResolution = item.selections?.[userData?.partnerId]?.resolution;

            return (
              <div
                key={item.id || `memory-${index}`}
                className="bg-gray-800/50 border-l-4 border-pink-500/50 rounded-lg p-4 shadow-lg backdrop-blur-sm"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center flex-grow min-w-0">
                    <span className="mr-3 text-2xl text-pink-400">
                      {isChallenge ? "🏆" : "🔥"}
                    </span>
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold text-white truncate" title={item.name}>
                        {item.name || "Atividade sem nome"}{" "}
                        {item.points > 0 && (
                          <span className="font-bold text-pink-400">
                            ({item.points} pts)
                          </span>
                        )}
                      </p>
                      {item.description && (
                        <p className="text-xs text-gray-400 italic mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {!isChallenge && (
                    <div className="text-sm text-right flex-shrink-0 ml-4">
                      <p className="text-gray-300">
                        Você:{" "}
                        <span className="font-mono">{getStatusIcon(myResolution)}</span>
                      </p>
                      <p className="text-gray-300">
                        {userData?.partnerData?.nickname || "Parceiro"}:{" "}
                        <span className="font-mono">
                          {getStatusIcon(partnerResolution)}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-gray-700/50 flex justify-between items-center">
                  <button
                    onClick={() => setActiveChatActivity && setActiveChatActivity(item)}
                    className="p-2 rounded-full flex items-center group transition-colors duration-200 hover:bg-gray-700/50"
                    aria-label="Abrir chat"
                  >
                    <div
                      className={`${
                        item.lastMessage ? "text-pink-400" : "text-gray-400"
                      } group-hover:text-pink-300`}
                    >
                      💬
                    </div>
                    {item.lastMessage?.text && (
                      <p className="ml-2 text-sm text-gray-400 truncate max-w-[100px] sm:max-w-[180px]">
                        {item.lastMessage.text}
                      </p>
                    )}
                  </button>

                  <span className="text-sm font-semibold text-pink-300">
                    {getStatusText(item)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

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

  const sortedHotSuggestions = useMemo(() => {
    if (!hotSuggestions) return [];
    return Object.values(hotSuggestions)
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
  }, [hotSuggestions, user.uid, userData.partnerId]);

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
        <div className="bg-gradient-to-br from-black/60 to-red-900/40 p-6 rounded-2xl border border-red-500/40 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-red-300 tracking-wider flex items-center">
              🔥 Sugestões Sensuais
            </h2>
            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
              Match Secreto
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-6">
            Escolham a mesma sugestão e criem um momento íntimo especial juntos 💕
          </p>

          <ul className="space-y-4">
            {sortedHotSuggestions.length > 0 ? (
              sortedHotSuggestions.map((activity) => {
                if (!activity || !activity.id || activity.matched) return null;
                const myStatus = activity.selections?.[user.uid];

                if (myStatus === "selected") {
                  return (
                    <li
                      key={activity.id}
                      onClick={() => handleSelectHotSuggestion(activity.id)}
                      className="group cursor-pointer relative overflow-hidden rounded-xl bg-gradient-to-r from-pink-900/60 to-red-900/60 border-2 border-pink-500/70 backdrop-blur-sm hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 to-red-600/10 animate-pulse" />
                      <div className="relative z-10 p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <span className="font-semibold text-pink-200 text-lg">
                              💫 {activity.name}
                              {activity.points > 0 && (
                                <span className="ml-2 inline-block bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs font-bold">
                                  +{activity.points} pts
                                </span>
                              )}
                            </span>
                            {activity.description && (
                              <p className="text-sm text-pink-300 mt-2 leading-relaxed">
                                {activity.description}
                              </p>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-pink-300 animate-pulse">
                            💕 Esperando...
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                }

                return (
                  <li
                    key={activity.id}
                    onClick={() => handleSelectHotSuggestion(activity.id)}
                    className="group cursor-pointer relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-900/70 to-gray-800/70 border border-gray-600/50 hover:border-pink-500/70 backdrop-blur-sm hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <span className="font-semibold text-gray-200 text-lg group-hover:text-pink-200 transition-colors">
                            🌟 {activity.name}
                            {activity.points > 0 && (
                              <span className="ml-2 inline-block bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs font-bold">
                                +{activity.points} pts
                              </span>
                            )}
                          </span>
                          {activity.description && (
                            <p className="text-sm text-gray-400 group-hover:text-pink-300 mt-2 leading-relaxed transition-colors">
                              {activity.description}
                            </p>
                          )}
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-gray-500 group-hover:border-pink-400 flex items-center justify-center transition-colors">
                          <div className="w-3 h-3 rounded-full bg-transparent group-hover:bg-pink-400 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl mb-2 block">💕</span>
                <p className="text-gray-400">Nenhuma sugestão sensual disponível hoje</p>
                <p className="text-xs text-gray-500 mt-1">Novas sugestões aparecerão em breve</p>
              </div>
            )}
          </ul>
        </div>

        {/* Interesses Secretos */}
        <div className="bg-gradient-to-br from-black/60 to-purple-900/40 p-6 rounded-2xl border border-purple-500/40 backdrop-blur-md">
          <h2 className="text-xl font-bold mb-4 text-purple-300 tracking-wider flex items-center">
            🎭 Desejos Secretos
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Compartilhem fantasias e criem experiências únicas juntos
          </p>
          <ul className="space-y-4">
            {availableHotItems.length > 0 ? (
              availableHotItems.map((activity) => (
                <HotListItem
                  key={activity.id}
                  activity={activity}
                  user={user}
                  props={{
                    mySelections,
                    handleSelectActivity,
                    handleAcceptChallenge,
                    handleDeclineChallenge,
                    handleResolveChallenge,
                  }}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl mb-2 block">✨</span>
                <p className="text-gray-400">Nenhum desejo secreto ativo</p>
                <p className="text-xs text-gray-500 mt-1">Criem novos desafios íntimos</p>
              </div>
            )}
          </ul>
        </div>

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