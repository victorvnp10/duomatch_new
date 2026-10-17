import { seededHash } from "./seededHash";

// Valores derivados da implementação original embutida em MainView.js.
describe("seededHash", () => {
  it("returns 0 for an empty string", () => {
    expect(seededHash("")).toBe(0);
  });

  it("produces the expected deterministic hash for known inputs", () => {
    expect(seededHash("a1")).toBe(3056);
    expect(seededHash("a2")).toBe(3057);
    expect(seededHash("x")).toBe(120);
  });

  it("is stable for the same input", () => {
    expect(seededHash("activity-1")).toBe(seededHash("activity-1"));
  });

  it("distinguishes different inputs", () => {
    expect(seededHash("activity-1")).not.toBe(seededHash("activity-2"));
  });

  it("stays within the signed 32-bit integer range", () => {
    const value = seededHash("activity-1");
    expect(Number.isInteger(value)).toBe(true);
    expect(value).toBeGreaterThanOrEqual(-2147483648);
    expect(value).toBeLessThanOrEqual(2147483647);
  });
});
