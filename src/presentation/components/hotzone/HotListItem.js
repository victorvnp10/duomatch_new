import React from "react";
import CountdownTimer from "../CountdownTimer";

const HotListItem = ({ activity, user, props }) => {
  const {
    mySelections,
    handleSelectActivity,
    handleAcceptChallenge,
    handleDeclineChallenge,
    handleResolveChallenge,
  } = props;

  const myStatus = mySelections[activity.id]?.status;
  const isChallenge = activity.type?.startsWith("desafio");

  // Desafios NUNCA caem nos cartões selecionáveis abaixo: um clique neles
  // gravava selections.status = "confirmed" num DESAFIO, gerava falso
  // "MATCH HOT!" e movia desafios não resolvidos para as Memórias Íntimas.
  if (isChallenge) {
    const iAmCreator = activity.createdBy === user.uid;

    if (activity.challengeState === "pending_acceptance") {
      if (!iAmCreator) {
        return (
          <li className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-900/60 to-pink-900/60 border border-purple-500/50 backdrop-blur-sm hover:shadow-[0_0_30px_rgba(147,51,234,0.4)] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <p className="font-semibold text-purple-200 text-lg">
                    🎯 {activity.name}
                    {activity.points > 0 && (
                      <span className="ml-2 inline-block bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs font-bold">
                        +{activity.points} pts
                      </span>
                    )}
                  </p>
                  {activity.description && (
                    <p className="text-sm text-purple-300 mt-2 leading-relaxed">
                      {activity.description}
                    </p>
                  )}
                  {activity.expiresAt && (
                    <div className="mt-2">
                      <CountdownTimer expiryTimestamp={activity.expiresAt} />
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-purple-300 animate-pulse block">
                    💕 Novo Desafio!
                  </span>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => handleDeclineChallenge(activity.id)}
                  className="px-4 py-2 bg-red-600/80 hover:bg-red-500 text-white rounded-lg font-semibold text-sm transition-all hover:scale-105"
                >
                  ❌ Recusar
                </button>
                <button
                  onClick={() => handleAcceptChallenge(activity.id)}
                  className="px-4 py-2 bg-green-600/80 hover:bg-green-500 text-white rounded-lg font-semibold text-sm transition-all hover:scale-105"
                >
                  ✅ Aceitar
                </button>
              </div>
            </div>
          </li>
        );
      }
      // Criador aguardando o parceiro responder — cartão informativo
      return (
        <li className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-purple-500/30 backdrop-blur-sm transition-all duration-300">
          <div className="relative z-10 p-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <p className="font-semibold text-purple-200 text-lg">
                  🎯 {activity.name}
                  {activity.points > 0 && (
                    <span className="ml-2 inline-block bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs font-bold">
                      +{activity.points} pts
                    </span>
                  )}
                </p>
                {activity.description && (
                  <p className="text-sm text-purple-300 mt-2 leading-relaxed">
                    {activity.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-purple-300">
                  ⏳ Aguardando resposta...
                </span>
              </div>
            </div>
          </div>
        </li>
      );
    }

    if (activity.challengeState === "accepted") {
      // Desafio em andamento — resolução pelos botões, cartão não clicável
      return (
        <li className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-900/60 to-pink-900/60 border border-pink-500/50 backdrop-blur-sm transition-all duration-300">
          <div className="relative z-10 p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <p className="font-semibold text-pink-200 text-lg">
                  🎯 {activity.name}
                  {activity.points > 0 && (
                    <span className="ml-2 inline-block bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs font-bold">
                      +{activity.points} pts
                    </span>
                  )}
                </p>
                {activity.description && (
                  <p className="text-sm text-pink-300 mt-2 leading-relaxed">
                    {activity.description}
                  </p>
                )}
                {activity.expiresAt && (
                  <div className="mt-2">
                    <CountdownTimer expiryTimestamp={activity.expiresAt} />
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => handleResolveChallenge(activity, "not_completed")}
                className="px-4 py-2 bg-red-600/80 hover:bg-red-500 text-white rounded-lg font-semibold text-sm transition-all hover:scale-105"
              >
                ❌ Não cumprimos
              </button>
              <button
                onClick={() => handleResolveChallenge(activity, "completed")}
                className="px-4 py-2 bg-green-600/80 hover:bg-green-500 text-white rounded-lg font-semibold text-sm transition-all hover:scale-105"
              >
                ✅ Cumprimos!
              </button>
            </div>
          </div>
        </li>
      );
    }

    // declined / completed / not_completed / expired — apenas informativo
    return (
      <li className="relative overflow-hidden rounded-xl bg-gray-900/60 border border-gray-700/50 backdrop-blur-sm p-4 opacity-75">
        <p className="font-semibold text-gray-300 text-lg">🎯 {activity.name}</p>
      </li>
    );
  }

  if (myStatus === "confirmed") {
    return (
      <li
        onClick={() => handleSelectActivity(activity.id)}
        className="group cursor-pointer relative overflow-hidden rounded-xl bg-gradient-to-r from-pink-900/60 to-red-900/60 border-2 border-pink-500/70 hover:border-pink-400 backdrop-blur-sm hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10 p-4">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <span className="font-semibold text-pink-200 text-lg">
                💖 {activity.name}
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
            <div className="text-right">
              <span className="text-sm font-semibold text-pink-300 animate-pulse">
                💕 Aguardando match...
              </span>
            </div>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li
      onClick={() => handleSelectActivity(activity.id)}
      className="group cursor-pointer relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-900/70 to-gray-800/70 border border-gray-600/50 hover:border-pink-500/70 backdrop-blur-sm hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-pink-600/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10 p-4">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <span className="font-semibold text-gray-200 text-lg group-hover:text-pink-200 transition-colors">
              ✨ {activity.name}
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
};

export default HotListItem;
