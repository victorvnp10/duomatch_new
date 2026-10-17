import { getTodayMatches } from "./matchSectionsService";

// Comportamento derivado do useMemo `todayMatches` de MainView.js.
describe("getTodayMatches", () => {
  const TODAY = "2026-09-10";
  const NOW = new Date("2026-09-10T12:00:00");
  const ids = (list) => list.map((a) => a.id);

  const run = (activities) =>
    getTodayMatches(activities, {
      userId: "userA",
      partnerId: "userB",
      todayStr: TODAY,
      now: NOW,
    });

  const normalMatch = (id, overrides = {}) => ({
    id,
    type: "atividade",
    selections: {
      userA: { date: TODAY, status: "confirmed" },
      userB: { date: TODAY, status: "confirmed" },
    },
    ...overrides,
  });

  it("includes a normal activity confirmed by both partners today", () => {
    expect(ids(run([normalMatch("a1")]))).toEqual(["a1"]);
  });

  it("excludes a match where only one partner confirmed", () => {
    const activity = normalMatch("a1", {
      selections: {
        userA: { date: TODAY, status: "confirmed" },
        userB: { date: TODAY, status: null },
      },
    });
    expect(run([activity])).toEqual([]);
  });

  it("excludes a match whose selection date is not today", () => {
    const activity = normalMatch("a1", {
      selections: {
        userA: { date: "2026-09-09", status: "confirmed" },
        userB: { date: "2026-09-09", status: "confirmed" },
      },
    });
    expect(run([activity])).toEqual([]);
  });

  it("does not treat an accepted challenge as a normal match", () => {
    const activity = normalMatch("c1", {
      type: "desafio",
      challengeState: "pending_acceptance",
    });
    expect(run([activity])).toEqual([]);
  });

  it("includes an accepted challenge that has not expired", () => {
    const challenge = {
      id: "c1",
      type: "desafio",
      challengeState: "accepted",
      expiresAt: { toDate: () => new Date("2026-09-11T12:00:00") },
    };
    expect(ids(run([challenge]))).toEqual(["c1"]);
  });

  it("excludes an accepted challenge that already expired", () => {
    const challenge = {
      id: "c1",
      type: "desafio",
      challengeState: "accepted",
      expiresAt: { toDate: () => new Date("2026-09-09T12:00:00") },
    };
    expect(run([challenge])).toEqual([]);
  });

  it("excludes a challenge that is not accepted", () => {
    const challenge = {
      id: "c1",
      type: "desafio",
      challengeState: "pending_acceptance",
      expiresAt: { toDate: () => new Date("2026-09-11T12:00:00") },
    };
    expect(run([challenge])).toEqual([]);
  });
});
