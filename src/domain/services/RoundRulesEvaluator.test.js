import {
  countMarkedActivitiesInRound,
  countChallengesCreatedInRound,
  evaluateCyclicalRules,
  shouldEvaluateCyclicalRules,
  buildRoundRulesProgress,
  resolveRulePeriodStart,
  daysBetween,
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

  describe("resolveRulePeriodStart", () => {
    it("uses the last-checked date when present", () => {
      expect(resolveRulePeriodStart("2026-09-05", "2026-09-01")).toBe(
        "2026-09-05"
      );
    });

    it("falls back to the round start date when there is no last check", () => {
      expect(resolveRulePeriodStart(undefined, "2026-09-01")).toBe(
        "2026-09-01"
      );
    });
  });

  describe("daysBetween", () => {
    it("counts whole days between two YYYY-MM-DD dates", () => {
      expect(daysBetween("2026-09-08", "2026-09-01")).toBe(7);
    });

    it("returns 0 for the same day", () => {
      expect(daysBetween("2026-09-01", "2026-09-01")).toBe(0);
    });
  });

  describe("buildRoundRulesProgress", () => {
    // Comportamento derivado do useMemo `roundRulesProgress` que vivia em
    // MainView.js: mesma resolução de período, mesma contagem e mesma
    // contagem regressiva clampada em 0.
    const baseRound = {
      id: "round-1",
      startDate: "2026-09-01",
      endDate: "2026-09-30",
      rules: {
        minActivities: { days: 7, quantity: 2, penalty: 10 },
      },
      rulesLastChecked: { activities: "2026-09-01" },
    };

    const markedActivity = (id, date) => ({
      id,
      type: "atividade",
      selections: { userA: { status: "confirmed", date } },
    });

    it("returns an empty object when there is no active round", () => {
      expect(
        buildRoundRulesProgress({
          activeRound: null,
          allActivities: [],
          userId: "userA",
          partnerId: "userB",
          todayStr: "2026-09-04",
        })
      ).toEqual({});
    });

    it("returns an empty object when the round has no rules", () => {
      expect(
        buildRoundRulesProgress({
          activeRound: { startDate: "2026-09-01" },
          allActivities: [],
          userId: "userA",
          partnerId: "userB",
          todayStr: "2026-09-04",
        })
      ).toEqual({});
    });

    it("counts markings per side and shows remaining days in the period", () => {
      const activities = [
        markedActivity("a1", "2026-09-02"),
        markedActivity("a2", "2026-09-03"),
      ];
      activities[1].selections.userB = { status: "confirmed", date: "2026-09-03" };

      const progress = buildRoundRulesProgress({
        activeRound: baseRound,
        allActivities: activities,
        userId: "userA",
        partnerId: "userB",
        todayStr: "2026-09-04",
      });

      expect(progress.activitiesRule).toEqual({
        myProgress: { count: 2, target: 2 },
        partnerProgress: { count: 1, target: 2 },
        penalty: 10,
        daysRemaining: 4,
      });
    });

    it("clamps daysRemaining at 0 once the period is due", () => {
      const progress = buildRoundRulesProgress({
        activeRound: baseRound,
        allActivities: [],
        userId: "userA",
        partnerId: "userB",
        todayStr: "2026-09-20",
      });

      expect(progress.activitiesRule.daysRemaining).toBe(0);
    });

    it("falls back to the round start when rulesLastChecked is missing", () => {
      const roundWithoutLastCheck = {
        id: "round-2",
        startDate: "2026-09-01",
        endDate: "2026-09-30",
        rules: { minActivities: { days: 7, quantity: 1, penalty: 10 } },
      };

      const progress = buildRoundRulesProgress({
        activeRound: roundWithoutLastCheck,
        allActivities: [],
        userId: "userA",
        partnerId: "userB",
        todayStr: "2026-09-04",
      });

      // 2026-09-04 - 2026-09-01 = 3 dias decorridos -> faltam 4.
      expect(progress.activitiesRule.daysRemaining).toBe(4);
    });

    it("builds both rules when the round configures activities and challenges", () => {
      const roundWithBoth = {
        id: "round-3",
        startDate: "2026-09-01",
        endDate: "2026-09-30",
        rules: {
          minActivities: { days: 7, quantity: 1, penalty: 10 },
          minChallenges: { days: 7, quantity: 1, penalty: 5 },
        },
        rulesLastChecked: { activities: "2026-09-01", challenges: "2026-09-01" },
      };
      const challenge = {
        id: "c1",
        type: "desafio",
        createdBy: "userA",
        createdAt: "2026-09-03",
        challengeState: "pending_acceptance",
      };

      const progress = buildRoundRulesProgress({
        activeRound: roundWithBoth,
        allActivities: [challenge],
        userId: "userA",
        partnerId: "userB",
        todayStr: "2026-09-04",
      });

      expect(progress.challengesRule).toEqual({
        myProgress: { count: 1, target: 1 },
        partnerProgress: { count: 0, target: 1 },
        penalty: 5,
        daysRemaining: 4,
      });
    });

    it("agrees with the evaluator on when a period becomes due", () => {
      // Prova de que painel e avaliador compartilham a mesma decisão:
      // o avaliador só dispara quando daysRemaining chega a 0.
      const dayBeforeDue = "2026-09-07";
      const dueDay = "2026-09-08";

      const before = buildRoundRulesProgress({
        activeRound: baseRound,
        allActivities: [],
        userId: "userA",
        partnerId: "userB",
        todayStr: dayBeforeDue,
      });
      const onDue = buildRoundRulesProgress({
        activeRound: baseRound,
        allActivities: [],
        userId: "userA",
        partnerId: "userB",
        todayStr: dueDay,
      });

      expect(before.activitiesRule.daysRemaining).toBe(1);
      expect(onDue.activitiesRule.daysRemaining).toBe(0);

      expect(
        evaluateCyclicalRules({
          activeRound: baseRound,
          allActivities: [],
          userId: "userA",
          partnerId: "userB",
          todayStr: dayBeforeDue,
        })
      ).toBeNull();
      expect(
        evaluateCyclicalRules({
          activeRound: baseRound,
          allActivities: [],
          userId: "userA",
          partnerId: "userB",
          todayStr: dueDay,
        })
      ).not.toBeNull();
    });
  });
});
