import React, { useState } from "react";

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

export default IntimateMemoriesSection;
