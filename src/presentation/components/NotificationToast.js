
import React, { useEffect, useState } from "react";
import { StarIcon, TrophyIcon, FireIcon } from "./Icons";

export default function NotificationToast({ message, type = "success", onClose, duration = 4000 }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case "achievement": return <TrophyIcon className="h-6 w-6 text-yellow-400" />;
      case "points": return <StarIcon className="h-6 w-6 text-green-400" />;
      case "streak": return <FireIcon className="h-6 w-6 text-orange-400" />;
      default: return <StarIcon className="h-6 w-6 text-blue-400" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "achievement": return "from-yellow-500/20 to-orange-500/20 border-yellow-400/50";
      case "points": return "from-green-500/20 to-emerald-500/20 border-green-400/50";
      case "streak": return "from-orange-500/20 to-red-500/20 border-orange-400/50";
      default: return "from-blue-500/20 to-indigo-500/20 border-blue-400/50";
    }
  };

  return (
    <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
      isLeaving ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
    }`}>
      <div className={`bg-gradient-to-r ${getColors()} backdrop-blur-md rounded-full px-6 py-3 flex items-center shadow-lg border`}>
        {getIcon()}
        <span className="ml-3 text-white font-semibold">{message}</span>
      </div>
    </div>
  );
}
