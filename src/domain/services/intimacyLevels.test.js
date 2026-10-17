import { POINTS_PER_LEVEL, getIntimacyLevel } from "./intimacyLevels";

// Comportamento derivado das cópias que viviam em hotzone/IntimacyMeter.js
// (pointsPerLevel = 4) e em HotZone.js (Math.floor(currentPoints / 4)).
describe("intimacyLevels — fonte única da regra de nível", () => {
  it("cada nível custa 4 pontos", () => {
    expect(POINTS_PER_LEVEL).toBe(4);
  });

  it("calcula o nível por divisão inteira dos pontos", () => {
    expect(getIntimacyLevel(0)).toBe(0);
    expect(getIntimacyLevel(3)).toBe(0);
    expect(getIntimacyLevel(4)).toBe(1);
    expect(getIntimacyLevel(7)).toBe(1);
    expect(getIntimacyLevel(8)).toBe(2);
    expect(getIntimacyLevel(100)).toBe(25);
  });

  it("trata pontos ausentes/inválidos como 0", () => {
    expect(getIntimacyLevel(undefined)).toBe(0);
    expect(getIntimacyLevel(null)).toBe(0);
    expect(getIntimacyLevel(0)).toBe(0);
  });
});
