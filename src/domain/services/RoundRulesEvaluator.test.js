import {
  countMarkedActivitiesInRound,
  evaluateCyclicalRules,
  shouldEvaluateCyclicalRules,
} from "./RoundRulesEvaluator";

describe("RoundRulesEvaluator", () => {
  const activeRound = {
    id: "round-1",
    startDate: "2026-09-01",
    endDate: "2026-09-30",
    rules: {
      minActivities: { days: 7, quantity: 1, penalty: 10 },
    },
    scores: {},
  };

  it("evaluates a period with no activities instead of skipping it", () => {
    const plan = evaluateCyclicalRules({
      activeRound,
      allActivities: [],
      userId: "userA",
      partnerId: "userB",
      todayStr: "2026-09-08",
    });

    expect(plan.scoreDeltas).toEqual({ userA: -10, userB: -10 });
    expect(plan.lastCheckedUpdates).toEqual({ activities: "2026-09-08" });
  });

  it("allows the application layer to evaluate even with an empty activity list", () => {
    expect(
      shouldEvaluateCyclicalRules({
        rounds: [activeRound],
        coupleId: "couple-1",
      })
    ).toBe(true);
  });

  it("does not evaluate before the configured period ends", () => {
    const plan = evaluateCyclicalRules({
      activeRound,
      allActivities: [],
      userId: "userA",
      partnerId: "userB",
      todayStr: "2026-09-07",
    });

    expect(plan).toBeNull();
  });

  it("counts an individual marking independently from activity completion", () => {
    const activity = {
      id: "activity-1",
      type: "atividade",
      selections: {
        userA: {
          status: "confirmed",
          date: "2026-09-03",
          resolution: "not_completed",
        },
        userB: { status: null, date: null },
      },
    };

    expect(
      countMarkedActivitiesInRound(
        [activity],
        "userA",
        activeRound,
        "2026-09-08",
        "2026-09-01"
      )
    ).toBe(1);
    expect(
      countMarkedActivitiesInRound(
        [activity],
        "userB",
        activeRound,
        "2026-09-08",
        "2026-09-01"
      )
    ).toBe(0);
  });
});
