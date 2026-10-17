import { filterAvailableActivities } from "./activityFeedService";

// Comportamento derivado do filtro original embutido em MainView.js.
describe("filterAvailableActivities", () => {
  // Predicado determinístico: a atividade com id "old" não é de hoje.
  const onlyToday = (activity) => activity.id !== "old";

  const baseActivity = (overrides = {}) => ({
    id: "a1",
    type: "atividade",
    category: "Casa",
    selections: {},
    ...overrides,
  });

  const run = (activities, extra = {}) =>
    filterAvailableActivities(activities, {
      matches: [],
      userId: "userA",
      partnerId: "userB",
      isForToday: onlyToday,
      ...extra,
    });

  it("keeps an ordinary activity that is due today and unmatched", () => {
    expect(run([baseActivity()]).map((a) => a.id)).toEqual(["a1"]);
  });

  it("drops activities that are not for today", () => {
    expect(run([baseActivity({ id: "old" })])).toEqual([]);
  });

  it("drops activities that already produced a match", () => {
    const activities = [baseActivity({ id: "a1" })];
    expect(run(activities, { matches: [{ id: "a1" }] })).toEqual([]);
  });

  it("drops Hot category activities from the feed", () => {
    expect(run([baseActivity({ category: "Hot" })])).toEqual([]);
  });

  it("keeps only pending challenges", () => {
    const pending = baseActivity({
      id: "c1",
      type: "desafio",
      challengeState: "pending_acceptance",
    });
    const accepted = baseActivity({
      id: "c2",
      type: "desafio",
      challengeState: "accepted",
    });
    expect(run([pending, accepted]).map((a) => a.id)).toEqual(["c1"]);
  });

  it("drops SYSTEM-created activities", () => {
    expect(run([baseActivity({ createdBy: "SYSTEM" })])).toEqual([]);
  });

  it("drops activities confirmed by both partners", () => {
    const both = baseActivity({
      selections: {
        userA: { status: "confirmed" },
        userB: { status: "confirmed" },
      },
    });
    expect(run([both])).toEqual([]);
  });

  it("keeps an activity confirmed by only one partner", () => {
    const one = baseActivity({
      selections: { userA: { status: "confirmed" }, userB: { status: null } },
    });
    expect(run([one]).map((a) => a.id)).toEqual(["a1"]);
  });
});
