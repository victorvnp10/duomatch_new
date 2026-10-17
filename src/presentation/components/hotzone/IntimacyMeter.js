import React from "react";

// --- COMPONENTE DE NÍVEL DE INTIMIDADE ---
const IntimacyMeter = ({ user, userData, coupleData }) => {
  const currentPoints = coupleData?.intimacyPoints || 0;

  // Cada nível requer 4 pontos (matches hot)
  const pointsPerLevel = 4;
  const currentLevel = Math.floor(currentPoints / pointsPerLevel);
  const pointsInCurrentLevel = currentPoints % pointsPerLevel;
  const progressPercentage = (pointsInCurrentLevel / pointsPerLevel) * 100;

  const getLevelName = (level) => {
    if (level >= 4) return "🔥 Ardente";
    if (level >= 3) return "💋 Apaixonados";
    if (level >= 2) return "😘 Carinhosos";
    if (level >= 1) return "💕 Conectados";
    return "💖 Começando";
  };

  const pointsToNextLevel = pointsPerLevel - pointsInCurrentLevel;

  return (
    <div className="bg-gradient-to-r from-red-900/40 to-pink-900/40 p-4 rounded-xl border border-red-500/30 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-red-300">Nível de Intimidade</h3>
        <div className="text-right">
          <span className="text-xs text-pink-400">{getLevelName(currentLevel)}</span>
          <div className="text-xs text-gray-400">Nível {currentLevel}</div>
        </div>
      </div>
      <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="flex justify-between items-center mt-1">
        <p className="text-xs text-gray-400">
          {currentPoints} pontos totais
        </p>
        <p className="text-xs text-pink-400">
          {pointsToNextLevel === pointsPerLevel ? `${pointsPerLevel} matches para próximo nível` : `${pointsToNextLevel} matches restantes`}
        </p>
      </div>
    </div>
  );
};

export default IntimacyMeter;
