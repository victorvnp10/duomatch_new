import {
  isActivityCompletedByBoth,
  isChallengeCompleted,
} from "./ActivityCompletionEvaluator";

describe("isActivityCompletedByBoth", () => {
  it("does not treat a not-completed resolution as eligible for points", () => {
    const activity = {
      selections: {
        userA: { resolution: "completed" },
        userB: { resolution: "not_completed" },
      },
    };

    expect(
      isActivityCompletedByBoth({
        activity,
        userId: "userA",
        partnerId: "userB",
      })
    ).toBe(false);
  });

  it("is eligible only when both partners completed the activity", () => {
    const activity = {
      selections: {
        userA: { status: "confirmed", date: "2026-09-08", resolution: "completed" },
        userB: { status: "confirmed", date: "2026-09-08", resolution: "completed" },
      },
    };

    expect(
      isActivityCompletedByBoth({
        activity,
        userId: "userA",
        partnerId: "userB",
      })
    ).toBe(true);
  });

  it("does not score resolutions that do not belong to a confirmed match", () => {
    const activity = {
      selections: {
        userA: { resolution: "completed" },
        userB: { resolution: "completed" },
      },
    };

    expect(
      isActivityCompletedByBoth({
        activity,
        userId: "userA",
        partnerId: "userB",
      })
    ).toBe(false);
  });
});

describe("challenge completion scoring", () => {
  it("does not award completion points for a challenge that was not completed", () => {
    expect(isChallengeCompleted("not_completed")).toBe(false);
  });

  it("allows points only for a completed challenge", () => {
    expect(isChallengeCompleted("completed")).toBe(true);
  });
});
