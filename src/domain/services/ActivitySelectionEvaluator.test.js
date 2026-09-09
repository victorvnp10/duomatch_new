import { toggleActivitySelection } from "./ActivitySelectionEvaluator";

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
