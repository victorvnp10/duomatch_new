import {
  getStartOfWeek,
  calculateWeeklyProgress,
  getWeeklyChallenge,
  getChallengeState,
  selectWeeklyChallenge,
  findActiveRound,
} from "./WeeklyChallengeSchedule";

// Datas fixas de referência (2026-10-12 é uma segunda-feira).
// new Date(y, m, d) usa componentes LOCAIS — determinístico no fuso do teste.
const MONDAY = () => new Date(2026, 9, 12, 0, 0, 0, 0);
const WEDNESDAY = () => new Date(2026, 9, 14, 15, 30, 0, 0);
const SATURDAY = () => new Date(2026, 9, 17, 9, 0, 0, 0);
const SUNDAY = () => new Date(2026, 9, 18, 23, 0, 0, 0);

describe("WeeklyChallengeSchedule.getStartOfWeek", () => {
  it("returns the Monday of the week for a mid-week date", () => {
    const start = getStartOfWeek(WEDNESDAY());
    expect(start.getDay()).toBe(1);
    expect(start.getDate()).toBe(12);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
    expect(start.getMilliseconds()).toBe(0);
  });

  it("returns the same Monday when the date is already Monday", () => {
    expect(getStartOfWeek(MONDAY()).getDate()).toBe(12);
  });

  it("returns the PREVIOUS Monday for a Sunday (not the next week's Monday)", () => {
    const start = getStartOfWeek(SUNDAY());
    expect(start.getDay()).toBe(1);
    expect(start.getDate()).toBe(12);
  });

  it("does not mutate the input date", () => {
    const input = SATURDAY();
    const before = input.getTime();
    getStartOfWeek(input);
    expect(input.getTime()).toBe(before);
  });
});

describe("WeeklyChallengeSchedule.calculateWeeklyProgress", () => {
  it("treats Sunday as day 7 of the week", () => {
    const progress = calculateWeeklyProgress(SUNDAY());
    expect(progress.currentDay).toBe(7);
    expect(progress.totalDays).toBe(7);
    expect(progress.percentage).toBe(100);
    expect(progress.daysRemaining).toBe(0);
  });

  it("maps Wednesday to day 3 and computes percentage/days remaining", () => {
    const progress = calculateWeeklyProgress(WEDNESDAY());
    expect(progress.currentDay).toBe(3);
    expect(progress.percentage).toBe(43);
    expect(progress.daysRemaining).toBe(4);
  });

  it("exposes the week bounds (Monday 00:00 to Sunday 23:59:59.999)", () => {
    const progress = calculateWeeklyProgress(WEDNESDAY());
    expect(progress.startOfWeek.getDay()).toBe(1);
    expect(progress.startOfWeek.getDate()).toBe(12);
    expect(progress.endOfWeek.getDate()).toBe(18);
    expect(progress.endOfWeek.getHours()).toBe(23);
    expect(progress.endOfWeek.getMinutes()).toBe(59);
    expect(progress.endOfWeek.getSeconds()).toBe(59);
    expect(progress.endOfWeek.getMilliseconds()).toBe(999);
  });
});

describe("WeeklyChallengeSchedule.getWeeklyChallenge", () => {
  const catalog = [
    { id: "a", points: 10 },
    { id: "b", points: 20 },
    { id: "c", points: 30 },
  ];

  it("returns null when the catalog is empty or missing", () => {
    expect(getWeeklyChallenge({ catalog: [], now: WEDNESDAY() })).toBeNull();
    expect(getWeeklyChallenge({ catalog: null, now: WEDNESDAY() })).toBeNull();
  });

  it("returns a challenge from the catalog, stable for the same week", () => {
    const first = getWeeklyChallenge({ catalog, now: WEDNESDAY() });
    const second = getWeeklyChallenge({ catalog, now: SATURDAY() });
    expect(catalog).toContain(first);
    expect(second).toBe(first);
  });

  it("prefers challenges that were not recently used", () => {
    const recent = ["a", "c"];
    const picked = getWeeklyChallenge({ catalog, recentChallengeIds: recent, now: WEDNESDAY() });
    expect(picked.id).toBe("b");
  });

  it("falls back to the full pool when every challenge was used recently", () => {
    const recent = ["a", "b", "c"];
    const picked = getWeeklyChallenge({ catalog, recentChallengeIds: recent, now: WEDNESDAY() });
    expect(catalog).toContain(picked);
  });
});

describe("WeeklyChallengeSchedule.getChallengeState", () => {
  const weekKey = "2026-10-12";
  const userData = { uid: "user", partnerId: "partner" };

  it("returns null without a user uid", () => {
    expect(getChallengeState({ userData: {}, localChallengeData: {}, coupleData: {}, weekKey })).toBeNull();
  });

  it("returns null when there is no source data at all", () => {
    expect(getChallengeState({ userData, localChallengeData: null, coupleData: null, weekKey })).toBeNull();
  });

  it("reports not_accepted when the week has no persisted challenge", () => {
    const state = getChallengeState({ userData, localChallengeData: null, coupleData: { weeklyChallenge: {} }, weekKey });
    expect(state).toEqual({ state: "not_accepted", myAccepted: false, partnerAccepted: false, weekKey });
  });

  it("derives acceptances and confirmations for both partners", () => {
    const challengeData = {
      challengeId: "a",
      acceptedBy: ["user", "partner"],
      confirmations: { user: { claimed: true }, partner: { status: "confirmed" } },
      state: "pending_confirmations",
    };
    const state = getChallengeState({
      userData,
      localChallengeData: null,
      coupleData: { weeklyChallenge: { [weekKey]: challengeData } },
      weekKey,
    });
    expect(state.state).toBe("pending_confirmations");
    expect(state.myAccepted).toBe(true);
    expect(state.partnerAccepted).toBe(true);
    expect(state.myConfirmation).toEqual({ claimed: true });
    expect(state.partnerConfirmation).toEqual({ status: "confirmed" });
    expect(state.partnerUid).toBe("partner");
    expect(state.challengeData).toBe(challengeData);
  });

  it("prefers local (optimistic) data over the couple snapshot", () => {
    const state = getChallengeState({
      userData,
      localChallengeData: { [weekKey]: { acceptedBy: ["user"] } },
      coupleData: { weeklyChallenge: { [weekKey]: { acceptedBy: ["user", "partner"] } } },
      weekKey,
    });
    expect(state.myAccepted).toBe(true);
    expect(state.partnerAccepted).toBe(false);
  });
});

describe("WeeklyChallengeSchedule.selectWeeklyChallenge", () => {
  const catalog = [{ id: "a", points: 10 }, { id: "b", points: 20 }];
  const weeklyChallenge = { id: "local-pick" };

  it("prefers the persisted challenge id from the couple state", () => {
    const picked = selectWeeklyChallenge({
      catalog,
      challengeState: { challengeData: { challengeId: "b" } },
      weeklyChallenge,
    });
    expect(picked.id).toBe("b");
  });

  it("falls back to the locally computed weekly challenge", () => {
    const picked = selectWeeklyChallenge({ catalog, challengeState: null, weeklyChallenge });
    expect(picked).toBe(weeklyChallenge);
  });

  it("falls back when the persisted id is not in the catalog", () => {
    const picked = selectWeeklyChallenge({
      catalog,
      challengeState: { challengeData: { challengeId: "missing" } },
      weeklyChallenge,
    });
    expect(picked).toBe(weeklyChallenge);
  });
});

describe("WeeklyChallengeSchedule.findActiveRound", () => {
  const rounds = [
    { id: "r1", startDate: "2026-10-05", endDate: "2026-10-11" },
    { id: "r2", startDate: "2026-10-12", endDate: "2026-10-18" },
  ];

  it("returns null for an empty or missing list", () => {
    expect(findActiveRound([], "2026-10-14")).toBeNull();
    expect(findActiveRound(undefined, "2026-10-14")).toBeNull();
  });

  it("returns the round covering the given day (inclusive bounds)", () => {
    expect(findActiveRound(rounds, "2026-10-14").id).toBe("r2");
    expect(findActiveRound(rounds, "2026-10-12").id).toBe("r2");
    expect(findActiveRound(rounds, "2026-10-18").id).toBe("r2");
  });

  it("returns undefined when no round covers the day", () => {
    expect(findActiveRound(rounds, "2026-11-01")).toBeUndefined();
  });
});
