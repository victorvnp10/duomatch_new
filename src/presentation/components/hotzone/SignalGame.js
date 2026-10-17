import React from "react";
import DailyTipCard from "../DailyTipCard";
import { useMenstrualCycle } from "../../../application/hooks/useMenstrualCycle";
import { getTodayDateString } from "../../../shared/lib/dateUtils";

const SignalGame = ({ user, userData, coupleData, handleSetDailySignal, setView }) => {
  const todayStr = getTodayDateString();
  const partnerNickname = userData.partnerData?.nickname || "Seu amor";
  const dailySignalsData =
    coupleData?.dailySignals?.date === todayStr
      ? coupleData.dailySignals.signals
      : null;
  const mySignal = dailySignalsData?.[user.uid];
  const partnerSignal = dailySignalsData?.[userData.partnerId];

  // Dica do dia do ciclo — exibida acima das opções para ajudar na
  // decisão de qual sinal enviar hoje.
  // B2-41: só o PARCEIRO (não-owner) recebe o insight — a owner conhece o
  // próprio ciclo e vê a dica no CycleView. MainView já filtrava assim.
  const { isOwner: isCycleOwner, dailyInsight } = useMenstrualCycle({
    user,
    userData,
    coupleData,
  });

  const signals = [
    {
      id: "willing",
      icon: "😏",
      name: "Topo",
      text: "Pronto(a) pra esquentar o clima",
      color: "from-accent to-accent-dark",
      glow: "shadow-[0_0_20px_rgba(224,87,125,0.6)]"
    },
    {
      id: "unsure",
      icon: "🤔",
      name: "Sem certeza",
      text: "Ainda não sei como vou estar",
      color: "from-gold to-gold-dark",
      glow: "shadow-[0_0_20px_rgba(201,162,75,0.6)]"
    },
    {
      id: "resting",
      icon: "😴",
      name: "Não hoje",
      text: "Hoje é dia de descanso",
      color: "from-sage to-sage-light",
      glow: "shadow-[0_0_20px_rgba(124,152,133,0.6)]"
    },
  ];

  const confirmAndSetSignal = (signal) => {
    if (window.confirm(`Enviar o sinal "${signal.name}" para ${partnerNickname}?`)) {
      handleSetDailySignal(signal.id);
    }
  };

  // Estado 3: Sinais Revelados com interpretação
  if (mySignal && partnerSignal) {
    const mySignalData = signals.find((s) => s.id === mySignal) || {};
    const partnerSignalData = signals.find((s) => s.id === partnerSignal) || {};

    const getCompatibility = () => {
      if (mySignal === partnerSignal) return "💖 Sintonia Perfeita!";
      if ((mySignal === "willing" && partnerSignal === "unsure") ||
          (mySignal === "unsure" && partnerSignal === "willing")) return "💕 Um anima o outro";
      if ((mySignal === "willing" && partnerSignal === "resting") ||
          (mySignal === "resting" && partnerSignal === "willing")) return "🔥 Um quer, o outro descansa";
      if (mySignal === "resting" || partnerSignal === "resting") return "🌙 Noite Tranquila";
      return "✨ Encontrem o meio termo";
    };

    return (
      <div className="bg-gradient-to-br from-black/60 to-red-900/40 p-6 rounded-2xl border border-red-500/40 backdrop-blur-md">
        <h2 className="text-xl font-bold mb-4 text-center text-red-300 tracking-wider">
          💕 Sinais Revelados
        </h2>

        <div className="flex justify-center items-center gap-8 mb-4">
          <div className="flex flex-col items-center">
            <p className="font-semibold text-gray-200 mb-2">Você</p>
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${mySignalData.color} flex items-center justify-center text-4xl ${mySignalData.glow} transform hover:scale-110 transition-transform`}>
              {mySignalData.icon}
            </div>
            <p className="text-xs text-center text-gray-300 mt-2 max-w-20">{mySignalData.name}</p>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-2xl animate-pulse">💫</span>
            <p className="text-sm font-bold text-pink-400 mt-2">{getCompatibility()}</p>
          </div>

          <div className="flex flex-col items-center">
            <p className="font-semibold text-gray-200 mb-2">{partnerNickname}</p>
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${partnerSignalData.color} flex items-center justify-center text-4xl ${partnerSignalData.glow} transform hover:scale-110 transition-transform`}>
              {partnerSignalData.icon}
            </div>
            <p className="text-xs text-center text-gray-300 mt-2 max-w-20">{partnerSignalData.name}</p>
          </div>
        </div>

        <div className="text-center text-sm text-gray-400">
          Agora vocês sabem o que cada um está sentindo! 💕
        </div>
      </div>
    );
  }

  // Estado 2: Aguardando o parceiro
  if (mySignal) {
    const mySignalData = signals.find((s) => s.id === mySignal) || {};
    return (
      <div className="bg-gradient-to-br from-black/60 to-purple-900/40 p-6 rounded-2xl border border-purple-500/40 backdrop-blur-md">
        <h2 className="text-xl font-bold text-center text-purple-300 tracking-wider mb-4">
          ✨ Sinal Enviado com Sucesso
        </h2>
        <div className={`w-28 h-28 rounded-full mx-auto bg-gradient-to-br ${mySignalData.color} flex items-center justify-center text-6xl ${mySignalData.glow} animate-pulse`}>
          {mySignalData.icon}
        </div>
        <p className="text-center text-purple-300 font-semibold mt-4">{mySignalData.name}</p>
        <p className="text-center text-gray-300 mt-2 animate-pulse">
          Aguardando {partnerNickname} revelar seu sinal... 💭
        </p>
      </div>
    );
  }

  // Estado 1: Escolhendo o sinal
  return (
    <div className="bg-gradient-to-br from-black/60 to-pink-900/40 p-6 rounded-2xl border border-pink-500/40 backdrop-blur-md">
      {!isCycleOwner && dailyInsight && (
        <div className="mb-5">
          <DailyTipCard
            dailyInsight={dailyInsight}
            onOpenCycleView={setView ? () => setView("cycle") : undefined}
          />
        </div>
      )}

      <h2 className="text-xl font-bold mb-2 text-center text-pink-300 tracking-wider">
        🌟 Qual é o seu Estado de Espírito?
      </h2>
      <p className="text-sm text-gray-400 mb-6 text-center">
        Compartilhe como você está se sentindo hoje. Só será revelado quando seu amor também escolher.
      </p>

      <div className="grid grid-cols-1 gap-3">
        {signals.map((signal) => (
          <button
            key={signal.id}
            onClick={() => confirmAndSetSignal(signal)}
            className={`group relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${signal.color} hover:scale-105 transform transition-all duration-300 border-2 border-transparent hover:border-white/30`}
          >
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <span className="text-4xl mb-2 group-hover:animate-bounce">{signal.icon}</span>
              <span className="font-bold text-white text-sm mb-1">{signal.name}</span>
              <span className="text-xs text-white/80 leading-tight">{signal.text}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SignalGame;
