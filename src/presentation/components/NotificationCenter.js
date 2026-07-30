import React, { useState, useRef, useEffect } from "react";
import { BellIcon } from "./Icons";

export default function NotificationCenter({ notifications, count, setView }) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleItemClick = (notification) => {
    setIsOpen(false);
    if (notification.targetView) setView(notification.targetView);
  };

  return (
    <div className="relative" ref={panelRef} data-tour-id="notification-bell">
      <button
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

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
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
        </div>
      )}
    </div>
  );
}
