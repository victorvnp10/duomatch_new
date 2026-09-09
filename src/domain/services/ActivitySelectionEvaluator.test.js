import {
  applyActivitySelection,
  toggleActivitySelection,
} from "./ActivitySelectionEvaluator";

describe("toggleActivitySelection", () => {
  it("marks an activity when there is no selection for today", () => {
    expect(
      toggleActivitySelection({
        selection: { status: "confirmed", date: "2026-09-07" },
        todayStr: "2026-09-08",
      })
    ).toEqual({ status: "confirmed", date: "2026-09-08" });
  });

  it("unmarks an activity selected today", () => {
    expect(
      toggleActivitySelection({
        selection: { status: "confirmed", date: "2026-09-08" },
        todayStr: "2026-09-08",
      })
    ).toEqual({ status: null, date: null });
  });

  it("marks legacy selected records instead of getting stuck in the toggle", () => {
    expect(
      toggleActivitySelection({
        selection: { status: "selected", date: "2026-09-08" },
        todayStr: "2026-09-08",
      })
    ).toEqual({ status: "confirmed", date: "2026-09-08" });
  });
});

describe("applyActivitySelection", () => {
  it("projects the confirmed selection into the activity list", () => {
    const activities = [
      { id: "activity-1", name: "Caminhar" },
      { id: "activity-2", name: "Cozinhar" },
    ];
    const selection = { status: "confirmed", date: "2026-09-08" };

    expect(
      applyActivitySelection({
        activities,
        activityId: "activity-1",
        userId: "userA",
        selection,
      })
    ).toEqual([
      {
        id: "activity-1",
        name: "Caminhar",
        selections: { userA: selection },
      },
      { id: "activity-2", name: "Cozinhar" },
    ]);
  });
});
