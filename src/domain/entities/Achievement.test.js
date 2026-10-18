/**
 * Testes de src/domain/entities/Achievement.js
 *
 * O catálogo é a ÚNICA fonte de verdade das conquistas (Achievement.js:37-128)
 * e `evaluateNewAchievements` (Achievement.js:143-147) decide quais são
 * recém-desbloqueadas. Comportamento derivado do próprio arquivo.
 */
import {
  ACHIEVEMENT_CATALOG,
  getAchievementById,
  evaluateNewAchievements,
} from "./Achievement";

describe("ACHIEVEMENT_CATALOG (Achievement.js:37-128)", () => {
  it("contém as 12 conquistas esperadas", () => {
    expect(ACHIEVEMENT_CATALOG).toHaveLength(12);
  });

  it("cada conquista tem id/título/descrição/ícone e um predicado isUnlocked", () => {
    ACHIEVEMENT_CATALOG.forEach((achievement) => {
      expect(typeof achievement.id).toBe("string");
      expect(achievement.id.length).toBeGreaterThan(0);
      expect(typeof achievement.title).toBe("string");
      expect(achievement.title.length).toBeGreaterThan(0);
      expect(typeof achievement.description).toBe("string");
      expect(achievement.description.length).toBeGreaterThan(0);
      expect(typeof achievement.icon).toBe("string");
      expect(achievement.icon.length).toBeGreaterThan(0);
      expect(typeof achievement.isUnlocked).toBe("function");
    });
  });

  it("não tem ids duplicados", () => {
    const ids = ACHIEVEMENT_CATALOG.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("inclui as conquistas antes 'fantasma' (big_spender, hot_streak, wish_granter)", () => {
    // Comentário do arquivo (Achievement.js:9-14): eram impossíveis de obter.
    const ids = ACHIEVEMENT_CATALOG.map((a) => a.id);
    expect(ids).toContain("big_spender");
    expect(ids).toContain("hot_streak");
    expect(ids).toContain("wish_granter");
  });
});

describe("getAchievementById (Achievement.js:130-131)", () => {
  it("devolve a conquista pelo id", () => {
    expect(getAchievementById("first_activity").title).toBe("Primeira Atividade");
  });

  it("devolve null para id inexistente", () => {
    expect(getAchievementById("nao-existe")).toBeNull();
  });
});

describe("evaluateNewAchievements (Achievement.js:143-147)", () => {
  it("estatísticas zeradas não desbloqueiam nada", () => {
    expect(
      evaluateNewAchievements({
        completedActivities: 0,
        matchedActivities: 0,
        completedHotActivities: 0,
        completedHotChallenges: 0,
        totalChallengesCompleted: 0,
        currentStreak: 0,
        messagesSent: 0,
        totalPointsSpent: 0,
        wishlistItemsGifted: 0,
      })
    ).toEqual([]);
  });

  it("primeira atividade concluída desbloqueia só 'first_activity'", () => {
    expect(evaluateNewAchievements({ completedActivities: 1 })).toEqual([
      "first_activity",
    ]);
  });

  it("match de sugestão desbloqueia 'first_match' (não 'first_activity')", () => {
    expect(evaluateNewAchievements({ matchedActivities: 1 })).toEqual([
      "first_match",
    ]);
  });

  it("gastar 100 pontos desbloqueia 'big_spender'", () => {
    expect(evaluateNewAchievements({ totalPointsSpent: 100 })).toEqual([
      "big_spender",
    ]);
  });

  it("5 atividades hot desbloqueiam 'first_hot_match' e 'hot_streak' na ordem do catálogo", () => {
    expect(evaluateNewAchievements({ completedHotActivities: 5 })).toEqual([
      "first_hot_match",
      "hot_streak",
    ]);
  });

  it("10 desafios desbloqueiam as três conquistas de desafio", () => {
    expect(evaluateNewAchievements({ totalChallengesCompleted: 10 })).toEqual([
      "first_challenge",
      "challenge_streak_5",
      "challenge_master",
    ]);
  });

  it("3 itens presenteados desbloqueiam 'wish_granter'", () => {
    expect(evaluateNewAchievements({ wishlistItemsGifted: 3 })).toEqual([
      "wish_granter",
    ]);
  });

  it("não re-desbloqueia conquistas já presentes em currentAchievements", () => {
    expect(
      evaluateNewAchievements(
        { completedActivities: 1, matchedActivities: 1 },
        ["first_activity"]
      )
    ).toEqual(["first_match"]);
  });

  it("currentAchievements vazio por padrão", () => {
    // Terceiro argumento omitido (Achievement.js:143).
    expect(evaluateNewAchievements({ currentStreak: 7 })).toEqual(["streak_7"]);
  });
});
