import React, { useState, useEffect } from "react";

/**
 * Melhoria de UX: com o cache offline do Firestore habilitado
 * (ver src/infrastructure/firebase/index.js), o app continua funcionando
 * sem internet — mas o usuário precisa saber que está nesse modo, para
 * não estranhar dados "parados" ou uma ação que parece não confirmar.
 */
export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 text-center text-sm font-medium py-2 px-4 transition-colors ${
        isOnline ? "bg-green-600 text-white" : "bg-yellow-600 text-white"
      }`}
      role="status"
    >
      {isOnline
        ? "Conexão restabelecida — sincronizando..."
        : "Você está offline. Suas ações serão sincronizadas quando a conexão voltar."}
    </div>
  );
}
