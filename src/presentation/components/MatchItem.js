import React from "react";
import { categoryIcons, ChatBubbleIcon, ChallengeIcon } from "./Icons";
import CountdownTimer from "./CountdownTimer";

export default function MatchItem({
  match,
  user,
  userData,
  partnerNickname,
  handleResolveChallenge,
  handleSetActivityResolution,
  setActiveChatActivity,
}) {
  const isChallenge = match.type?.startsWith("desafio");
  const iAmCreator = match.createdBy === user.uid;

  const borderColor = isChallenge ? "border-pink-500" : "border-green-500";
  const icon = isChallenge ? (
    <ChallengeIcon />
  ) : (
    categoryIcons[match.category]
  );
  const iconColor = isChallenge ? "text-pink-400" : "text-green-400";
  const pointsColor = isChallenge ? "text-pink-400" : "text-yellow-400";

  const myResolution = match.selections?.[user.uid]?.resolution;
  const partnerResolution =
    match.selections?.[userData.partnerId]?.resolution;

  const getStatusIcon = (resolution) => {
    if (resolution === "completed") return "✅";
    if (resolution === "not_completed") return "❌";
    return "⏳";
  };

  return (
    <li
      className={`bg-gray-800/50 border-l-4 ${borderColor} rounded-lg p-4 shadow-lg backdrop-blur-sm`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center flex-grow min-w-0">
          <span className={`mr-3 text-2xl ${iconColor}`}>{icon}</span>
          <div className="flex-grow min-w-0">
            <p className="font-semibold text-white truncate" title={match.name}>
              {match.name}{" "}
              {match.points > 0 && (
                <span className={`font-bold ${pointsColor}`}>
                  ({match.points} pts)
                </span>
              )}
            </p>
            {match.description && (
              <p className="text-xs text-gray-400 italic">
                {match.description}
              </p>
            )}
            {/* >>> MUDANÇA (CORREÇÃO DE ERRO) <<< */}
            {match.expiresAt && typeof match.expiresAt.toDate === 'function' && (
              <CountdownTimer expiryTimestamp={match.expiresAt} />
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
              {partnerNickname}:{" "}
              <span className="font-mono">
                {getStatusIcon(partnerResolution)}
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-700/50 flex justify-between items-center">
        <button
          onClick={() => setActiveChatActivity(match)}
          className="p-2 rounded-full flex items-center group transition-colors duration-200 hover:bg-gray-700/50"
          aria-label="Abrir chat"
        >
          <div
            className={`${
              match.lastMessage ? "text-yellow-400" : "text-gray-400"
            } group-hover:text-yellow-300`}
          >
            <ChatBubbleIcon />
          </div>
          {match.lastMessage?.text && (
            <p className="ml-2 text-sm text-gray-400 truncate max-w-[100px] sm:max-w-[180px]">
              {match.lastMessage.text}
            </p>
          )}
        </button>

        <div className="flex gap-2 items-center">
          {isChallenge ? (
            <>
              {match.challengeState === "accepted" &&
                (iAmCreator ? (
                  <>
                    <button
                      onClick={() =>
                        handleResolveChallenge(match, "not_completed")
                      }
                      className="text-xs font-bold text-white bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Não Cumpriu
                    </button>
                    <button
                      onClick={() => handleResolveChallenge(match, "completed")}
                      className="text-xs font-bold text-white bg-green-600 hover:bg-green-500 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Cumpriu!
                    </button>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-gray-300 animate-pulse">
                    Desafio ativo!
                  </span>
                ))}
              {["completed", "not_completed"].includes(match.challengeState) && (
                <span className="text-sm font-semibold text-gray-400">
                  {match.challengeState === "completed"
                    ? "✅ Cumprido"
                    : "❌ Não Cumprido"}
                </span>
              )}
            </>
          ) : (
            <>
              {myResolution ? (
                <span className="text-xs text-gray-500 font-semibold">
                  Sua escolha foi registrada.
                </span>
              ) : (
                <>
                  <button
                    onClick={() =>
                      handleSetActivityResolution(match.id, "not_completed")
                    }
                    className="text-xs font-bold py-1 px-3 rounded-md transition-colors bg-red-600 text-white hover:bg-red-500"
                  >
                    Não Concluído
                  </button>
                  <button
                    onClick={() =>
                      handleSetActivityResolution(match.id, "completed")
                    }
                    className="text-xs font-bold py-1 px-3 rounded-md transition-colors bg-green-600 text-white hover:bg-green-500"
                  >
                    Concluído
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </li>
  );
}
