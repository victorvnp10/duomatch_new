import {
  mergeWeeklyAcceptance,
  mergeWeeklyClaim,
} from "./WeeklyChallengeState";

describe("WeeklyChallengeState", () => {
  it("preserves the first challenge and the partner acceptance during a concurrent accept", () => {
    const existingData = {
      challengeId: "challenge-a",
      acceptedBy: ["partner"],
      acceptedAt: "first-acceptance",
      confirmations: { partner: { claimed: true } },
      state: "in_progress",
    };

    const merged = mergeWeeklyAcceptance({
      existingData,
      userId: "user",
      challenge: { id: "challenge-b" },
      weekStartDate: "2026-09-07",
      acceptedAt: "second-acceptance",
    });

    expect(merged).toEqual({
      ...existingData,
      acceptedBy: ["partner", "user"],
      weekStartDate: "2026-09-07",
    });
  });

  it("preserves server state and adds only the current user's claim", () => {
    const existingData = {
      challengeId: "challenge-a",
      acceptedBy: ["user", "partner"],
      confirmations: { partner: { claimed: true } },
      state: "in_progress",
    };

    const merged = mergeWeeklyClaim({
      existingData,
      userId: "user",
      claimedAt: "claim-time",
    });

    expect(merged).toEqual({
      ...existingData,
      confirmations: {
        partner: { claimed: true },
        user: {
          claimed: true,
          claimedAt: "claim-time",
          status: "pending_partner_confirmation",
        },
      },
      state: "pending_confirmations",
    });
  });

  it("rejects a claim from a user who has not accepted the challenge", () => {
    expect(
      mergeWeeklyClaim({
        existingData: {
          challengeId: "challenge-a",
          acceptedBy: ["partner"],
        },
        userId: "user",
        claimedAt: "claim-time",
      })
    ).toBeNull();
  });
});
