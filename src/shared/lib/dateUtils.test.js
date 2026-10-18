/**
 * Testes de src/shared/lib/dateUtils.js
 *
 * Este módulo é a "porta" histórica de utilitários do app (ver cabeçalho de
 * src/shared/lib/dateUtils.js:1-22). Testamos:
 *  - getDateString: formatação de data no fuso LOCAL (nunca toISOString/UTC);
 *  - getTodayDateString: usa "agora";
 *  - os re-exports formatPeriodicity / isActivityForToday (que delegam para
 *    src/domain/valueObjects/Periodicity.js).
 *
 * Comportamento derivado do código real em src/shared/lib/dateUtils.js:6-23.
 */
import {
  getDateString,
  getTodayDateString,
  formatPeriodicity,
  isActivityForToday,
} from "./dateUtils";

describe("getDateString (src/shared/lib/dateUtils.js:10-15)", () => {
  it("formata usando os getters LOCAIS e faz zero-padding de mês e dia", () => {
    // Datas construídas no fuso local: independe do TZ do runner.
    expect(getDateString(new Date(2026, 8, 7))).toBe("2026-09-07"); // mês 8 = setembro
    expect(getDateString(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(getDateString(new Date(2026, 11, 31))).toBe("2026-12-31");
  });

  it("preserva o dia local mesmo perto da meia-noite (não usa UTC)", () => {
    // 23:30 local do dia 1 — se usasse toISOString (UTC) poderia virar dia 2.
    expect(getDateString(new Date(2026, 2, 1, 23, 30, 0))).toBe("2026-03-01");
  });
});

describe("getTodayDateString (src/shared/lib/dateUtils.js:6)", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("devolve a data local do 'agora' congelado", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 5, 15, 10, 30, 0)); // 15/jun/2026 local
    expect(getTodayDateString()).toBe("2026-06-15");
  });
});

describe("formatPeriodicity (re-export, src/shared/lib/dateUtils.js:21)", () => {
  it("delega para o domínio: devolve a descrição formatada", () => {
    expect(formatPeriodicity({ type: "diaria" })).toBe("(Diariamente)");
  });

  it("devolve string vazia quando não há periodicidade", () => {
    expect(formatPeriodicity(null)).toBe("");
  });
});

describe("isActivityForToday (re-export, src/shared/lib/dateUtils.js:22-23)", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("injeta a data de hoje ao delegar para o domínio", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 0, 1, 12, 0, 0)); // hoje = 2026-01-01

    // Atividade sem periodicidade é sempre válida (Periodicity.js:60-62).
    expect(isActivityForToday({ type: "atividade" })).toBe(true);

    // 'especifica' casa com a data de hoje injetada (Periodicity.js:69-70).
    expect(
      isActivityForToday({
        type: "atividade",
        periodicity: { type: "especifica", value: "2026-01-01" },
      })
    ).toBe(true);

    expect(
      isActivityForToday({
        type: "atividade",
        periodicity: { type: "especifica", value: "2026-01-02" },
      })
    ).toBe(false);
  });
});
