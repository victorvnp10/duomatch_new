import React from "react";
import AnimatedButton from "./AnimatedButton";

/**
 * Tela de erro de sincronização (B2-26): em vez de um LoadingScreen
 * infinito quando um `onSnapshot` do Firestore falha (sem retry
 * automático para erros permanentes), o app mostra o caminho de saída —
 * recarregar quando a conexão voltar ou sair da conta, se o problema
 * for de autenticação/permissão.
 */
export default function ErrorScreen({ title, message, onRetry, onLogout }) {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-full max-w-sm space-y-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10">
          <svg
            className="h-7 w-7 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">
            {title || "Algo deu errado"}
          </h1>
          <p className="text-sm text-gray-400 break-words">
            {message || "Não foi possível manter a conexão com o servidor."}
          </p>
        </div>
        <div className="space-y-2">
          <AnimatedButton onClick={onRetry} className="w-full">
            Tentar novamente
          </AnimatedButton>
          {onLogout && (
            <AnimatedButton variant="secondary" onClick={onLogout} className="w-full">
              Sair da conta
            </AnimatedButton>
          )}
        </div>
      </div>
    </div>
  );
}