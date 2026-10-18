import { getRoundCountdownInfo } from "./roundCountdownService";

// Comportamento derivado da função original embutida em MainView.js.
describe("getRoundCountdownInfo", () => {
  const baseClasses = "text-center text-sm mt-4";

  it("returns a null text when there is no active round", () => {
    expect(getRoundCountdownInfo(null, "2026-09-10")).toEqual({
      text: null,
      className: baseClasses,
    });
  });

  it("warns the round ends today on the inclusive end date", () => {
    const activeRound = { endDate: "2026-09-10" };
    expect(getRoundCountdownInfo(activeRound, "2026-09-10")).toEqual({
      text: "A rodada acaba hoje!",
      className: `${baseClasses} text-yellow-400 font-bold`,
    });
  });

  it("uses the singular when a single day remains", () => {
    const activeRound = { endDate: "2026-09-11" };
    expect(getRoundCountdownInfo(activeRound, "2026-09-10")).toEqual({
      text: "Falta 1 dia para acabar a rodada.",
      className: `${baseClasses} text-gray-400 italic`,
    });
  });

  it("uses the plural with the exact number of remaining days", () => {
    const activeRound = { endDate: "2026-09-15" };
    expect(getRoundCountdownInfo(activeRound, "2026-09-10")).toEqual({
      text: "Faltam 5 dias para acabar a rodada.",
      className: `${baseClasses} text-gray-400 italic`,
    });
  });

  it("treats a past end date as ending today", () => {
    const activeRound = { endDate: "2026-09-08" };
    expect(getRoundCountdownInfo(activeRound, "2026-09-10").text).toBe(
      "A rodada acaba hoje!"
    );
  });
});
