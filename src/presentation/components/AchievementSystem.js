import React, { useState } from "react";
import { TrophyIcon } from "./Icons";
import { ACHIEVEMENT_CATALOG } from "../../domain/entities/Achievement";

/**
 * Painel de conquistas.
 *
 * ANTES: este componente recalculava, com sua própria cópia da lógica de
 * negócio, quais conquistas estavam "desbloqueadas" — em alguns casos
 * usando limiares ao vivo (ex.: `totalChallengesCompleted >= 1`) e, em
 * outros, o array persistido `achievements` vindo do Firestore. Isso
 * causava inconsistência: uma conquista podia aparecer como desbloqueada
 * na tela sem nunca ter sido de fato salva (ou vice-versa).
 *
 * AGORA: a única fonte de verdade sobre o que está desbloqueado é o
 * array `achievements` persistido no documento do casal — o mesmo que
 * `useAchievements.js` mantém atualizado. O catálogo de metadados
 * (título, descrição, ícone) vem do domínio único
 * (`src/domain/entities/Achievement.js`).
 */
export default function AchievementSystem({ achievements = [] }) {
  const [showAll, setShowAll] = useState(false);

  const allAchievements = ACHIEVEMENT_CATALOG.map((achievement) => ({
    ...achievement,
    unlocked: achievements.includes(achievement.id),
  }));

  const unlockedCount = allAchievements.filter((a) => a.unlocked).length;
  const recentlyUnlocked = allAchievements.filter((a) => a.unlocked).slice(-3);

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <TrophyIcon className="h-6 w-6 text-yellow-400" />
          <span className="ml-2 font-bold text-white">Conquistas</span>
        </div>
        <span className="text-sm text-gray-400">
          {unlockedCount}/{allAchievements.length}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-400 mb-1">
          <span>Progresso</span>
          <span>{Math.round((unlockedCount / allAchievements.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"
            style={{ width: `${(unlockedCount / allAchievements.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {(showAll ? allAchievements : recentlyUnlocked).map((achievement) => (
          <div
            key={achievement.id}
            className={`flex items-center p-2 rounded-lg ${
              achievement.unlocked
                ? "bg-yellow-900/30 border border-yellow-600/50"
                : "bg-gray-700/30 border border-gray-600/30"
            }`}
          >
            <span className={`text-2xl mr-3 ${achievement.unlocked ? "" : "grayscale opacity-50"}`}>
              {achievement.icon}
            </span>
            <div className="flex-1">
              <p className={`font-semibold text-sm ${achievement.unlocked ? "text-white" : "text-gray-500"}`}>
                {achievement.title}
              </p>
              <p className={`text-xs ${achievement.unlocked ? "text-gray-300" : "text-gray-600"}`}>
                {achievement.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowAll(!showAll)}
        className="w-full mt-3 text-sm text-gray-400 hover:text-white transition-colors"
      >
        {showAll ? "Ver Menos" : "Ver Todas"}
      </button>
    </div>
  );
}
