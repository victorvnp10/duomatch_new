import React from "react";
import { TrophyIcon } from "../Icons";

const WeeklyChallengeInfo = ({ categoryStyle, selectedChallenge, challengeState }) => (
  <>
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
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="text-xs text-gray-300 text-right"
          >
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
  </>
);

export default WeeklyChallengeInfo;
