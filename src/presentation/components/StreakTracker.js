
import React from "react";
import { FireIcon, StarIcon } from "./Icons";

export default function StreakTracker({ userData, coupleData }) {
  const currentStreak = coupleData?.streak || 0;
  const bestStreak = coupleData?.bestStreak || 0;
  
  const getStreakMessage = () => {
    if (currentStreak === 0) return "Comecem uma sequência!";
    if (currentStreak < 3) return "Continuem assim!";
    if (currentStreak < 7) return "Vocês estão pegando fogo! 🔥";
    if (currentStreak < 14) return "Sequência incrível!";
    return "Vocês são imparáveis! 🚀";
  };

  const getStreakColor = () => {
    if (currentStreak < 3) return "text-yellow-400";
    if (currentStreak < 7) return "text-orange-400";
    if (currentStreak < 14) return "text-red-400";
    return "text-purple-400";
  };

  return (
    <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/50 rounded-2xl p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <FireIcon className={`h-6 w-6 ${getStreakColor()}`} />
          <span className="ml-2 font-bold text-white">Sequência</span>
        </div>
        <div className="flex items-center">
          <StarIcon className="h-4 w-4 text-gray-400 mr-1" />
          <span className="text-sm text-gray-400">Recorde: {bestStreak}</span>
        </div>
      </div>
      
      <div className="text-center">
        <div className={`text-3xl font-bold ${getStreakColor()}`}>
          {currentStreak}
        </div>
        <div className="text-sm text-gray-300 mt-1">
          {getStreakMessage()}
        </div>
      </div>
      
      {/* Barra de progresso para próximo milestone */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Próximo marco</span>
          <span>{Math.ceil(currentStreak / 7) * 7}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400`}
            style={{ width: `${(currentStreak % 7) * 14.28}%` }}
          />
        </div>
      </div>
    </div>
  );
}
