import React from "react";

const WeeklyChallengeActions = ({
  challengeState,
  isLoading,
  handleAcceptWeeklyChallenge,
  handleClaimCompletion,
  handleConfirmPartner,
  selectedChallenge,
}) => (
  <>
        {/* Botões de ação */}
        <div className="space-y-3">
          {/* Botão de aceitar desafio */}
          {!challengeState?.myAccepted && (
            <button
              onClick={handleAcceptWeeklyChallenge}
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-lg font-semibold text-sm transition-all transform hover:scale-105 bg-gradient-to-r from-accent to-accent-dark hover:from-accent-light hover:to-accent text-white disabled:opacity-50"
            >
              {isLoading ? 'Aceitando...' : 'Aceitar Desafio'}
            </button>
          )}

          {/* Botão de reivindicar conclusão - só aparece se EU aceitei */}
          {challengeState?.myAccepted && !challengeState?.myConfirmation && (
            <button
              onClick={handleClaimCompletion}
              disabled={isLoading}
              className="w-full px-4 py-2 rounded-lg font-semibold text-sm transition-all bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white disabled:opacity-50"
            >
              {isLoading ? 'Reivindicando...' : 'Reivindicar Conclusão'}
            </button>
          )}

          {/* Status da minha reivindicação */}
          {challengeState?.myConfirmation && (
            <div className="p-3 bg-blue-900/30 rounded-lg">
              <p className="text-blue-300 text-sm font-semibold mb-1">Minha reivindicação:</p>
              <p className="text-blue-300 text-sm">
                {challengeState.myConfirmation.status === 'pending_partner_confirmation' && 
                  '⏳ Aguardando confirmação do parceiro'}
                {challengeState.myConfirmation.status === 'confirmed' && 
                  `✅ Confirmado! +${challengeState.myConfirmation.pointsAwarded || selectedChallenge.points} pontos`}
                {challengeState.myConfirmation.status === 'denied' && 
                  '❌ Negado pelo parceiro. A primeira decisão é definitiva nesta semana.'}
              </p>
            </div>
          )}

          {/* Confirmação do parceiro - só aparece se o parceiro reivindicou */}
          {challengeState?.partnerConfirmation?.status === 'pending_partner_confirmation' && (
            <div className="p-3 bg-orange-900/30 rounded-lg space-y-2">
              <p className="text-orange-300 text-sm font-semibold">
                🤔 Seu parceiro reivindicou ter completado o desafio. Confirma?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleConfirmPartner(true)}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 rounded-md font-semibold text-sm bg-green-600 hover:bg-green-500 text-white disabled:opacity-50"
                >
                  ✅ Confirmar
                </button>
                <button
                  onClick={() => handleConfirmPartner(false)}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 rounded-md font-semibold text-sm bg-red-600 hover:bg-red-500 text-white disabled:opacity-50"
                >
                  ❌ Negar
                </button>
              </div>
            </div>
          )}

          {/* Status da reivindicação do parceiro */}
          {challengeState?.partnerConfirmation && challengeState.partnerConfirmation.status !== 'pending_partner_confirmation' && (
            <div className="p-3 bg-gray-900/30 rounded-lg">
              <p className="text-gray-300 text-sm font-semibold mb-1">Reivindicação do parceiro:</p>
              <p className="text-gray-300 text-sm">
                {challengeState.partnerConfirmation.status === 'rejected' &&
                  '❌ Não foi possível processar esta decisão. Contate o suporte; ela não será repetida automaticamente.'}
                {challengeState.partnerConfirmation.status === 'processing' &&
                  '⏳ Decisão registrada. Aguardando processamento automático.'}
                {challengeState.partnerConfirmation.status === 'confirmed' && 
                  `✅ Confirmado por você! Parceiro ganhou +${challengeState.partnerConfirmation.pointsAwarded || selectedChallenge.points} pontos`}
                {challengeState.partnerConfirmation.status === 'denied' && 
                  '❌ Negado por você'}
              </p>
            </div>
          )}
        </div>
  </>
);

export default WeeklyChallengeActions;
