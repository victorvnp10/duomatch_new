/**
 * Testes de src/domain/services/AchievementStatsBuilder.js
 *
 * Função pura que monta as estatísticas do casal a partir de dados já
 * carregados (AchievementStatsBuilder.js:11-87). Sem Firestore, sem React.
 *
 * Regras derivadas do código:
 *  - isConfirmedByBoth: AMBOS com status "confirmed" (sem checar data aqui —
 *    diferente de ActivityCompletionEvaluator).
 *  - isCompletedChallenge: type "desafio*" E (challengeState "completed" OU
 *    confirmado por QUALQUER um dos dois) — caminho legado.
 *  - matchedActivities: createdBy === "SYSTEM" e confirmado por ambos.
 *  - totalPointsSpent: soma de rewards com status "purchased".
 */
import { buildAchievementStats } from "./AchievementStatsBuilder";

const U = "user";
const P = "partner";

const bothConfirmed = { [U]: { status: "confirmed" }, [P]: { status: "confirmed" } };
const onlyMe = { [U]: { status: "confirmed" } };

describe("buildAchievementStats — defaults (AchievementStatsBuilder.js:11-18)", () => {
  it("sem dados devolve tudo zerado", () => {
    expect(buildAchievementStats({ userId: U, partnerId: P })).toEqual({
      totalChallengesCompleted: 0,
      completedActivities: 0,
      completedHotActivities: 0,
      completedHotChallenges: 0,
      matchedActivities: 0,
      currentStreak: 0,
      messagesSent: 0,
      totalPointsSpent: 0,
      wishlistItemsGifted: 0,
    });
  });
});

describe("completedActivities (AchievementStatsBuilder.js:25-29,44-46)", () => {
  it("conta atividade confirmada por AMBOS", () => {
    const stats = buildAchievementStats({
      userId: U,
      partnerId: P,
      allActivities: [{ id: "a1", type: "atividade", selections: bothConfirmed }],
    });
    expect(stats.completedActivities).toBe(1);
  });

  it("NÃO conta atividade confirmada por apenas um", () => {
    const stats = buildAchievementStats({
      userId: U,
      partnerId: P,
      allActivities: [{ id: "a1", type: "atividade", selections: onlyMe }],
    });
    expect(stats.completedActivities).toBe(0);
  });
});

describe("matchedActivities (AchievementStatsBuilder.js:56-62)", () => {
  it("conta atividade criada pelo SYSTEM e confirmada por ambos", () => {
    const stats = buildAchievementStats({
      userId: U,
      partnerId: P,
      allActivities: [
        {
          id: "a1",
          type: "atividade",
          createdBy: "SYSTEM",
          selections: bothConfirmed,
        },
      ],
    });
    expect(stats.matchedActivities).toBe(1);
    expect(stats.completedActivities).toBe(1);
  });

  it("não conta atividade criada por um usuário (mesmo confirmada por ambos)", () => {
    const stats = buildAchievementStats({
      userId: U,
      partnerId: P,
      allActivities: [
        { id: "a1", type: "atividade", createdBy: U, selections: bothConfirmed },
      ],
    });
    expect(stats.matchedActivities).toBe(0);
    expect(stats.completedActivities).toBe(1);
  });
});

describe("atividades hot (AchievementStatsBuilder.js:32,48-50)", () => {
  it("conta atividade hot confirmada por ambos", () => {
    const stats = buildAchievementStats({
      userId: U,
      partnerId: P,
      allActivities: [
        { id: "a1", type: "atividade", category: "Hot", selections: bothConfirmed },
      ],
    });
    expect(stats.completedHotActivities).toBe(1);
  });

  it("atividade não-hot não entra em completedHotActivities", () => {
    const stats = buildAchievementStats({
      userId: U,
      partnerId: P,
      allActivities: [
        { id: "a1", type: "atividade", category: "Viagens", selections: bothConfirmed },
      ],
    });
    expect(stats.completedHotActivities).toBe(0);
  });
});

describe("desafios (AchievementStatsBuilder.js:31,38-42,52-54)", () => {
  it("conta desafio com challengeState 'completed'", () => {
    const stats = buildAchievementStats({
      userId: U,
      partnerId: P,
      allActivities: [{ id: "c1", type: "desafio", challengeState: "completed" }],
    });
    expect(stats.totalChallengesCompleted).toBe(1);
    expect(stats.completedActivities).toBe(0); // não tem selections confirmadas
  });

  it("conta desafio legado confirmado por apenas UM dos dois (isConfirmedByEither)", () => {
    const stats = buildAchievementStats({
      userId: U,
      partnerId: P,
      allActivities: [{ id: "c1", type: "desafio", selections: onlyMe }],
    });
    expect(stats.totalChallengesCompleted).toBe(1);
  });

  it("desafio hot concluído entra em completedHotChallenges", () => {
    const stats = buildAchievementStats({
      userId: U,
      partnerId: P,
      allActivities: [
        { id: "c1", type: "desafio", category: "Hot", challengeState: "completed" },
      ],
    });
    expect(stats.completedHotChallenges).toBe(1);
    expect(stats.totalChallengesCompleted).toBe(1);
  });
});

describe("recompensas / pontos gastos (AchievementStatsBuilder.js:67-69)", () => {
  it("soma o custo apenas das recompensas 'purchased'", () => {
    const stats = buildAchievementStats({
      userId: U,
      partnerId: P,
      rewards: [
        { id: "r1", status: "purchased", cost: 40 },
        { id: "r2", status: "purchased", cost: 60 },
        { id: "r3", status: "pending_approval", cost: 999 },
      ],
    });
    expect(stats.totalPointsSpent).toBe(100);
  });

  it("trata cost ausente como 0", () => {
    const stats = buildAchievementStats({
      userId: U,
      partnerId: P,
      rewards: [{ id: "r1", status: "purchased" }],
    });
    expect(stats.totalPointsSpent).toBe(0);
  });
});

describe("wishlist e dados do casal (AchievementStatsBuilder.js:72-85)", () => {
  it("conta itens com status 'confirmed'", () => {
    const stats = buildAchievementStats({
      userId: U,
      partnerId: P,
      wishlistItems: [
        { id: "w1", status: "confirmed" },
        { id: "w2", status: "active" },
        { id: "w3", status: "confirmed" },
      ],
    });
    expect(stats.wishlistItemsGifted).toBe(2);
  });

  it("lê streak e messageCount de coupleData", () => {
    const stats = buildAchievementStats({
      userId: U,
      partnerId: P,
      coupleData: { streak: 9, messageCount: 42 },
    });
    expect(stats.currentStreak).toBe(9);
    expect(stats.messagesSent).toBe(42);
  });
});
