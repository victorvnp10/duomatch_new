import {
  filterAvailableActivities,
  selectDailyActivities,
} from "./activityFeedService";

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

// Comportamento derivado da lógica que vivia no useEffect de MainView.js.
describe("selectDailyActivities", () => {
  const TODAY = "2026-09-10";
  const onDate = (dateStr) => ({
    createdAt: { toDate: () => new Date(`${dateStr}T12:00:00`) },
  });
  const oldActivity = (id, overrides = {}) => ({
    id,
    createdAt: { toDate: () => new Date("2026-09-01T12:00:00") },
    ...overrides,
  });
  const todayActivity = (id, overrides = {}) => ({
    id,
    ...onDate(TODAY),
    ...overrides,
  });
  const ids = (list) => list.map((a) => a.id);

  it("keeps all older activities when there are five or fewer", () => {
    const list = [oldActivity("a"), oldActivity("b"), oldActivity("c")];
    expect(ids(selectDailyActivities(list, TODAY))).toEqual(["a", "b", "c"]);
  });

  it("places today's activities after older ones", () => {
    const list = [oldActivity("old"), todayActivity("new")];
    expect(ids(selectDailyActivities(list, TODAY))).toEqual(["old", "new"]);
  });

  it("treats activities without createdAt as older", () => {
    const list = [{ id: "no-date" }, todayActivity("new")];
    expect(ids(selectDailyActivities(list, TODAY))).toEqual(["no-date", "new"]);
  });

  it("limits older activities to five when there are more", () => {
    const list = Array.from({ length: 7 }, (_, i) => oldActivity(`act-${i}`));
    expect(selectDailyActivities(list, TODAY)).toHaveLength(5);
  });

  it("is deterministic regardless of the input order", () => {
    const list = Array.from({ length: 7 }, (_, i) => oldActivity(`act-${i}`));
    const forward = ids(selectDailyActivities(list, TODAY));
    const reversed = ids(selectDailyActivities([...list].reverse(), TODAY));
    expect(reversed).toEqual(forward);
  });

  it("dedupes repeated activities and keeps a pending challenge", () => {
    const list = [
      oldActivity("a"),
      todayActivity("b"),
      todayActivity("challenge", { type: "desafio" }),
    ];
    const result = selectDailyActivities(list, TODAY);
    expect(ids(result)).toEqual(["a", "b", "challenge"]);
    expect(new Set(ids(result)).size).toBe(result.length);
  });
});
