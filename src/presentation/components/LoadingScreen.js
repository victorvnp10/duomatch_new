import React from "react";

/**
 * Tela de carregamento inicial (autenticação / primeiro carregamento do
 * perfil). Substitui o spinner genérico anterior por um esqueleto que
 * já sugere a silhueta da tela principal — reduz a sensação de espera.
 */
export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-4 animate-pulse">
        <div className="h-8 w-32 bg-gray-700 rounded-lg mx-auto" />
        <div className="h-24 w-full bg-gray-800 rounded-2xl" />
        <div className="h-24 w-full bg-gray-800 rounded-2xl" />
        <div className="h-12 w-full bg-gray-800 rounded-2xl" />
      </div>
    </div>
  );
}
