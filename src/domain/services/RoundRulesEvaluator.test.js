import {
  countMarkedActivitiesInRound,
  countChallengesCreatedInRound,
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

  it("counts a legacy selected status as an individual marking", () => {
    const activity = {
      id: "legacy-activity-1",
      type: "atividade",
      selections: {
        userA: {
          status: "selected",
          date: "2026-09-03",
        },
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
  });

  it("counts challenges launched regardless of acceptance or completion", () => {
    const challenges = [
      {
        id: "challenge-pending",
        type: "desafio",
        createdBy: "userA",
        createdAt: "2026-09-03",
        challengeState: "pending_acceptance",
      },
      {
        id: "challenge-declined",
        type: "desafio_hot",
        createdBy: "userA",
        createdAt: "2026-09-04",
        challengeState: "declined",
      },
      {
        id: "challenge-partner",
        type: "desafio",
        createdBy: "userB",
        createdAt: "2026-09-05",
        challengeState: "accepted",
      },
    ];

    expect(
      countChallengesCreatedInRound(
        challenges,
        "userA",
        activeRound,
        "2026-09-01",
        "2026-09-08"
      )
    ).toBe(2);
  });

  it("awards both individual goals when each partner meets them", () => {
    const roundWithGoals = {
      ...activeRound,
      rules: {
        minActivities: { days: 10, quantity: 5, penalty: 10 },
        minChallenges: { days: 10, quantity: 1, penalty: 10 },
      },
      rulesLastChecked: {
        activities: "2026-09-01",
        challenges: "2026-09-01",
      },
    };
    const activities = Array.from({ length: 5 }, (_, index) => ({
      id: `activity-${index}`,
      type: "atividade",
      selections: {
        userA: {
          status: "confirmed",
          date: `2026-09-0${index + 2}`,
          resolution: "not_completed",
        },
      },
    }));
    activities.push({
      id: "challenge-1",
      type: "desafio",
      createdBy: "userA",
      createdAt: "2026-09-03",
      challengeState: "pending_acceptance",
    });

    const plan = evaluateCyclicalRules({
      activeRound: roundWithGoals,
      allActivities: activities,
      userId: "userA",
      partnerId: "userB",
      todayStr: "2026-09-11",
    });

    expect(plan.scoreDeltas).toEqual({ userA: 20, userB: -20 });
    expect(plan.lastCheckedUpdates).toEqual({
      activities: "2026-09-11",
      challenges: "2026-09-11",
    });
  });
});
