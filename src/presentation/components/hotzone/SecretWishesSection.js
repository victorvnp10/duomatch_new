import React from "react";
import HotListItem from "./HotListItem";

// --- SEÇÃO DE DESEJOS SECRETOS ---
const SecretWishesSection = ({
  availableHotItems,
  user,
  mySelections,
  handleSelectActivity,
  handleAcceptChallenge,
  handleDeclineChallenge,
  handleResolveChallenge,
}) => (
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
);

export default SecretWishesSection;
