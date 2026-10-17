
import React from 'react';
import { useDailyChallenge } from '../../application/hooks/useDailyChallenge';
import { CATEGORY_STYLES, DEFAULT_CATEGORY_STYLE } from "./dailychallenge/categoryStyles";
import WeeklyChallengeHeader from "./dailychallenge/WeeklyChallengeHeader";
import WeeklyChallengeInfo from "./dailychallenge/WeeklyChallengeInfo";
import WeeklyChallengeActions from "./dailychallenge/WeeklyChallengeActions";

export const DailyChallenge = ({ userData, coupleData, rounds, onAcceptChallenge }) => {
  const {
    operationError,
    selectedChallenge,
    challengeState,
    calculateWeeklyProgress,
    activeRound,
    isLoading,
    handleAcceptWeeklyChallenge,
    handleClaimCompletion,
    handleConfirmPartner,
  } = useDailyChallenge({ userData, coupleData, rounds });

  const errorMessage = operationError && (
    <p role="alert" className="text-red-400 text-sm">{operationError.message}</p>
  );

  if (!userData || !selectedChallenge) {
    return errorMessage || null;
  }

  const categoryStyle = CATEGORY_STYLES[selectedChallenge.type] || DEFAULT_CATEGORY_STYLE;

  return (
    <div className={`bg-gradient-to-r ${categoryStyle.card} border rounded-2xl shadow-lg p-6 backdrop-blur-sm`}>
      {errorMessage}
      <WeeklyChallengeHeader
        categoryStyle={categoryStyle}
        calculateWeeklyProgress={calculateWeeklyProgress}
      />

      <div className="bg-black/20 rounded-lg p-4 mb-4">
        <WeeklyChallengeInfo
          categoryStyle={categoryStyle}
          selectedChallenge={selectedChallenge}
          challengeState={challengeState}
        />

        <WeeklyChallengeActions
          challengeState={challengeState}
          isLoading={isLoading}
          handleAcceptWeeklyChallenge={handleAcceptWeeklyChallenge}
          handleClaimCompletion={handleClaimCompletion}
          handleConfirmPartner={handleConfirmPartner}
          selectedChallenge={selectedChallenge}
        />
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
