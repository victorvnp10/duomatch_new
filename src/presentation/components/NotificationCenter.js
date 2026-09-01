import React, { useState, useRef, useEffect, useCallback } from "react";
import { BellIcon } from "./Icons";
import {
  isSystemNotificationsSupported,
  getNotificationPermission,
  requestNotificationPermission,
} from "../pwa/systemNotifications";

const PANEL_WIDTH = 320;
const VIEWPORT_MARGIN = 8;

export default function NotificationCenter({ notifications, count, setView }) {
  const [isOpen, setIsOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState(null);
  const [permission, setPermission] = useState(() =>
    getNotificationPermission()
  );
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const notificationsSupported = isSystemNotificationsSupported();

  const handleEnableNotifications = async () => {
    setPermission(await requestNotificationPermission());
  };

  // Calcula a posição do painel a partir da posição real do botão na tela
  // (não do container pai), e trava dentro da viewport com uma margem —
  // assim o painel nunca abre cortado nas laterais, não importa onde o
  // sino esteja no header nem o quanto o layout mude no futuro.
  const computePosition = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    const width = Math.min(PANEL_WIDTH, viewportWidth - VIEWPORT_MARGIN * 2);
    const maxLeft = viewportWidth - width - VIEWPORT_MARGIN;
    const desiredLeft = rect.right - width; // alinha a borda direita do painel com a do botão
    const left = Math.min(Math.max(desiredLeft, VIEWPORT_MARGIN), Math.max(maxLeft, VIEWPORT_MARGIN));

    setPanelStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left,
      width,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    computePosition();

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", computePosition);
    window.addEventListener("orientationchange", computePosition);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", computePosition);
      window.removeEventListener("orientationchange", computePosition);
    };
  }, [isOpen, computePosition]);

  const handleItemClick = (notification) => {
    setIsOpen(false);
    if (notification.targetView) setView(notification.targetView);
  };

  return (
    <div ref={containerRef} data-tour-id="notification-bell">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 text-gray-300 hover:text-white"
        aria-label="Notificações"
      >
        <BellIcon className="h-6 w-6" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[1rem] px-1 flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {isOpen && panelStyle && (
        <div
          style={panelStyle}
          className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
        >
          <div className="p-3 border-b border-gray-700">
            <h3 className="font-bold text-white">Notificações</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400 p-4 text-center">
                Tudo em dia por aqui! 🎉
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleItemClick(notification)}
                  className="w-full text-left flex items-start gap-3 p-3 hover:bg-gray-700/50 border-b border-gray-700/50 last:border-b-0 transition-colors"
                >
                  <span className="text-xl">{notification.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-400">{notification.message}</p>
                  </div>
                </button>
              ))
            )}
          </div>
          <div className="p-3 border-t border-gray-700 bg-gray-900/60">
            {notificationsSupported && permission === "default" && (
              <button
                onClick={handleEnableNotifications}
                className="w-full text-center text-xs font-semibold text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                🔔 Ativar notificações do sistema
              </button>
            )}
            {notificationsSupported && permission === "granted" && (
              <p className="text-center text-xs text-gray-400">
                🔔 Notificações do sistema ativadas
              </p>
            )}
            {notificationsSupported && permission === "denied" && (
              <p className="text-center text-xs text-yellow-500/90">
                Notificações bloqueadas no navegador — libere nas
                configurações do site.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
