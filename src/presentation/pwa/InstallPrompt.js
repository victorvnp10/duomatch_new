import React, { useState, useEffect } from "react";

const DISMISS_KEY = "duomatch:installPromptDismissedAt";
const DISMISS_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias

/**
 * Banner discreto de "Instalar app", acionado pelo evento nativo
 * `beforeinstallprompt`. Sem isso, a maioria dos usuários em Android/
 * desktop nunca descobre que o DuoMatch pode ser instalado como app.
 * Em iOS o Safari não dispara esse evento (limitação da própria Apple);
 * ali a instalação continua sendo manual via "Compartilhar > Adicionar
 * à Tela de Início".
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault();

      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
      if (Date.now() - dismissedAt < DISMISS_COOLDOWN_MS) return;

      setDeferredPrompt(event);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-40">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg p-4 flex items-center gap-3">
        <span className="text-2xl">💕</span>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">Instalar o DuoMatch</p>
          <p className="text-gray-400 text-xs">
            Acesse mais rápido, direto da tela inicial do seu celular.
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={handleInstall}
            className="text-xs font-semibold text-white bg-pink-500 hover:bg-pink-600 rounded-lg px-3 py-1.5 transition-colors"
          >
            Instalar
          </button>
          <button
            onClick={handleDismiss}
            className="text-xs text-gray-400 hover:text-gray-200"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}
