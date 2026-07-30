/**
 * Domínio: Conquistas (Achievements)
 *
 * Antes desta refatoração, o catálogo de conquistas e a lógica de
 * desbloqueio estavam duplicados em dois lugares:
 *   - src/hooks/useAchievements.js   (decidia o que salvar no Firestore)
 *   - src/components/AchievementSystem.js (decidia o que MOSTRAR na tela)
 *
 * Isso causava uma falha real: as conquistas "big_spender", "hot_streak" e
 * "wish_granter" apareciam na tela (com `unlocked` calculado ali mesmo ou
 * lido de `achievements.includes(...)`) mas NUNCA eram de fato concedidas,
 * porque nenhuma parte do código as adicionava ao array `achievements` do
 * casal. Eram conquistas "fantasma" — o usuário via a meta, mas era
 * impossível cumpri-la.
 *
 * Este arquivo é a ÚNICA fonte de verdade sobre:
 *   1. Quais conquistas existem (metadados: id, título, descrição, ícone).
 *   2. Qual é a condição de negócio para desbloquear cada uma.
 *
 * Tanto a camada de aplicação (hooks) quanto a de apresentação
 * (componentes) devem consumir este catálogo — nunca reimplementá-lo.
 */

/**
 * @typedef {Object} AchievementStats
 * @property {number} totalChallengesCompleted
 * @property {number} completedActivities
 * @property {number} completedHotActivities
 * @property {number} completedHotChallenges
 * @property {number} currentStreak
 * @property {number} messagesSent
 * @property {number} totalPointsSpent
 * @property {number} wishlistItemsGifted
 */

export const ACHIEVEMENT_CATALOG = [
  {
    id: "first_activity",
    title: "Primeira Atividade",
    description: "Completaram a primeira atividade juntos",
    icon: "🎯",
    isUnlocked: (stats) => stats.completedActivities >= 1,
  },
  {
    id: "first_match",
    title: "Primeiro Match",
    description: "Tiveram seu primeiro match em uma atividade",
    icon: "💫",
    isUnlocked: (stats) => stats.completedActivities >= 1,
  },
  {
    id: "first_hot_match",
    title: "Primeiro Match Hot",
    description: "Tiveram seu primeiro match em uma atividade hot",
    icon: "🔥",
    isUnlocked: (stats) => stats.completedHotActivities >= 1,
  },
  {
    id: "first_hot_challenge",
    title: "Primeiro Desafio Hot",
    description: "Completaram seu primeiro desafio hot",
    icon: "🌶️",
    isUnlocked: (stats) => stats.completedHotChallenges >= 1,
  },
  {
    id: "first_challenge",
    title: "Primeiro Desafio",
    description: "Completaram o primeiro desafio diário",
    icon: "🏆",
    isUnlocked: (stats) => stats.totalChallengesCompleted >= 1,
  },
  {
    id: "challenge_streak_5",
    title: "Desafiadores",
    description: "Completaram 5 desafios",
    icon: "🎖️",
    isUnlocked: (stats) => stats.totalChallengesCompleted >= 5,
  },
  {
    id: "challenge_master",
    title: "Mestres dos Desafios",
    description: "Completaram 10 desafios",
    icon: "👑",
    isUnlocked: (stats) => stats.totalChallengesCompleted >= 10,
  },
  {
    id: "streak_7",
    title: "Uma Semana Forte",
    description: "Mantiveram uma sequência de 7 dias",
    icon: "🔥",
    isUnlocked: (stats) => stats.currentStreak >= 7,
  },
  {
    id: "communicator",
    title: "Super Comunicativo",
    description: "Enviaram 50 mensagens no chat",
    icon: "💬",
    isUnlocked: (stats) => stats.messagesSent >= 50,
  },
  {
    id: "big_spender",
    title: "Grande Gastador",
    description: "Gastaram 100 pontos na loja",
    icon: "💰",
    // Corrigido: antes não havia NENHUMA lógica gravando esta conquista.
    isUnlocked: (stats) => stats.totalPointsSpent >= 100,
  },
  {
    id: "hot_streak",
    title: "Esquentando",
    description: "Completaram 5 atividades da Hot Zone",
    icon: "🌶️",
    // Corrigido: antes não havia NENHUMA lógica gravando esta conquista.
    isUnlocked: (stats) => stats.completedHotActivities >= 5,
  },
  {
    id: "wish_granter",
    title: "Realizador de Sonhos",
    description: "Compraram 3 itens da lista de desejos",
    icon: "⭐",
    // Corrigido: antes não havia NENHUMA lógica gravando esta conquista.
    isUnlocked: (stats) => stats.wishlistItemsGifted >= 3,
  },
];

export const getAchievementById = (id) =>
  ACHIEVEMENT_CATALOG.find((a) => a.id === id) || null;

/**
 * Regra de negócio central: dado o estado atual (estatísticas do casal) e
 * as conquistas já concedidas, retorna a lista de IDs de conquistas
 * recém-desbloqueadas nesta avaliação (sem side effects, sem Firestore,
 * 100% testável isoladamente).
 *
 * @param {AchievementStats} stats
 * @param {string[]} currentAchievements
 * @returns {string[]} IDs de novas conquistas desbloqueadas
 */
export const evaluateNewAchievements = (stats, currentAchievements = []) => {
  return ACHIEVEMENT_CATALOG.filter(
    (achievement) =>
      !currentAchievements.includes(achievement.id) && achievement.isUnlocked(stats)
  ).map((achievement) => achievement.id);
};
