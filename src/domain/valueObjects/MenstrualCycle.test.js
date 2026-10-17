/**
 * Testes de src/domain/valueObjects/MenstrualCycle.js
 *
 * Cálculo por método calendário (estimativas). Cobrimos o clamp de segurança
 * (B2-29), a derivação do ciclo em curso, fases, janela fértil e estatísticas
 * de regularidade. Comportamento derivado de MenstrualCycle.js:32-225.
 */
import {
  MIN_CYCLE_LENGTH,
  MAX_CYCLE_LENGTH,
  PHASES,
  clampCycleLength,
  isValidCycleLength,
  getCurrentCycleStartDate,
  getCurrentCycleDay,
  getOvulationDay,
  getFertileWindow,
  getPhaseForDay,
  computeCycleLengths,
  computeCycleStatistics,
  computeAveragePeriodLength,
  getLastPeriodStart,
  byStartDateAsc,
  summarizeCycle,
} from "./MenstrualCycle";

describe("clampCycleLength (MenstrualCycle.js:36-40)", () => {
  it("mantém valores dentro do intervalo", () => {
    expect(clampCycleLength(28)).toBe(28);
    expect(clampCycleLength(21)).toBe(21);
    expect(clampCycleLength(MIN_CYCLE_LENGTH)).toBe(MIN_CYCLE_LENGTH);
    expect(clampCycleLength(MAX_CYCLE_LENGTH)).toBe(MAX_CYCLE_LENGTH);
  });

  it("eleva valores abaixo do mínimo (typo de ciclo curto)", () => {
    expect(clampCycleLength(3)).toBe(MIN_CYCLE_LENGTH);
    expect(clampCycleLength(14)).toBe(MIN_CYCLE_LENGTH);
  });

  it("limita valores acima do máximo", () => {
    expect(clampCycleLength(100)).toBe(MAX_CYCLE_LENGTH);
  });

  it("devolve 28 para valores inválidos/zero/negativos", () => {
    expect(clampCycleLength(0)).toBe(28);
    expect(clampCycleLength(-5)).toBe(28);
    expect(clampCycleLength(NaN)).toBe(28);
    expect(clampCycleLength("abc")).toBe(28);
  });

  it("aceita string numérica", () => {
    expect(clampCycleLength("30")).toBe(30);
  });
});

describe("isValidCycleLength (MenstrualCycle.js:43-46)", () => {
  it("aceita o intervalo fisiológico [15, 60]", () => {
    expect(isValidCycleLength(15)).toBe(true);
    expect(isValidCycleLength(28)).toBe(true);
    expect(isValidCycleLength(60)).toBe(true);
  });

  it("rejeita fora do intervalo e valores não finitos", () => {
    expect(isValidCycleLength(14)).toBe(false);
    expect(isValidCycleLength(61)).toBe(false);
    expect(isValidCycleLength(NaN)).toBe(false);
    expect(isValidCycleLength("abc")).toBe(false);
  });
});

describe("getCurrentCycleStartDate (MenstrualCycle.js:73-80)", () => {
  it("não avança quando hoje é anterior ao início registrado", () => {
    expect(
      getCurrentCycleStartDate("2026-09-10", 28, "2026-09-01")
    ).toBe("2026-09-10");
  });

  it("devolve o próprio início no primeiro dia do ciclo", () => {
    expect(
      getCurrentCycleStartDate("2026-09-01", 28, "2026-09-01")
    ).toBe("2026-09-01");
  });

  it("avança ciclos completos até o ciclo que contém hoje", () => {
    // 28 dias depois = exatamente 1 ciclo completo.
    expect(
      getCurrentCycleStartDate("2026-09-01", 28, "2026-09-29")
    ).toBe("2026-09-29");
    // 34 dias depois = 1 ciclo completo + 6 dias → início ainda é 2026-09-29.
    expect(
      getCurrentCycleStartDate("2026-09-01", 28, "2026-10-05")
    ).toBe("2026-09-29");
  });
});

describe("getCurrentCycleDay (MenstrualCycle.js:83-88)", () => {
  it("devolve 1 quando hoje é anterior ao início", () => {
    expect(getCurrentCycleDay("2026-09-10", 28, "2026-09-01")).toBe(1);
  });

  it("conta o dia dentro do ciclo (1-indexado)", () => {
    expect(getCurrentCycleDay("2026-09-01", 28, "2026-09-01")).toBe(1);
    expect(getCurrentCycleDay("2026-09-01", 28, "2026-09-15")).toBe(15);
  });

  it("reinicia no dia 1 ao completar um ciclo", () => {
    expect(getCurrentCycleDay("2026-09-01", 28, "2026-09-29")).toBe(1);
  });
});

describe("getOvulationDay / getFertileWindow (MenstrualCycle.js:90-99)", () => {
  it("estima a ovulação como cycleLength - 14", () => {
    expect(getOvulationDay(28)).toBe(14);
    expect(getOvulationDay(30)).toBe(16);
  });

  it("aplica o clamp antes de calcular a ovulação", () => {
    // ciclo 3 → clamp 15 → ovulação 1.
    expect(getOvulationDay(3)).toBe(1);
  });

  it("a janela fértil vai da ovulação -5 a +1 (mínimo 1)", () => {
    expect(getFertileWindow(28)).toEqual({ start: 9, end: 15, ovulationDay: 14 });
    expect(getFertileWindow(30)).toEqual({ start: 11, end: 17, ovulationDay: 16 });
  });

  it("nunca deixa o início da janela abaixo de 1", () => {
    // ciclo 15 → ovulação 1 → start = max(1, 1-5) = 1.
    expect(getFertileWindow(15).start).toBe(1);
  });
});

describe("getPhaseForDay (MenstrualCycle.js:102-109)", () => {
  const cycleLength = 28;
  const periodLength = 5;

  it("classifica menstruação enquanto cycleDay <= periodLength", () => {
    expect(getPhaseForDay(1, cycleLength, periodLength)).toBe(PHASES.MENSTRUATION);
    expect(getPhaseForDay(5, cycleLength, periodLength)).toBe(PHASES.MENSTRUATION);
  });

  it("classifica folicular antes da janela fértil", () => {
    expect(getPhaseForDay(6, cycleLength, periodLength)).toBe(PHASES.FOLLICULAR);
    expect(getPhaseForDay(8, cycleLength, periodLength)).toBe(PHASES.FOLLICULAR);
  });

  it("classifica fértil dentro da janela [9, 15]", () => {
    expect(getPhaseForDay(9, cycleLength, periodLength)).toBe(PHASES.FERTILE);
    expect(getPhaseForDay(15, cycleLength, periodLength)).toBe(PHASES.FERTILE);
  });

  it("classifica lútea após a janela fértil", () => {
    expect(getPhaseForDay(16, cycleLength, periodLength)).toBe(PHASES.LUTEAL);
    expect(getPhaseForDay(28, cycleLength, periodLength)).toBe(PHASES.LUTEAL);
  });
});

describe("computeCycleLengths (MenstrualCycle.js:126-135)", () => {
  it("devolve [] com menos de 2 períodos", () => {
    expect(computeCycleLengths([])).toEqual([]);
    expect(computeCycleLengths([{ startDate: "2026-01-01" }])).toEqual([]);
  });

  it("calcula as durações entre inícios consecutivos, ordenando antes", () => {
    // Entrada fora de ordem — a função ordena internamente.
    const periods = [
      { startDate: "2026-02-25" },
      { startDate: "2026-01-01" },
      { startDate: "2026-01-21" },
    ];
    // 01-01→01-21 = 20 ; 01-21→02-25 = 35
    expect(computeCycleLengths(periods)).toEqual([20, 35]);
  });
});

describe("computeCycleStatistics (MenstrualCycle.js:141-173)", () => {
  it("sem histórico suficiente devolve hasEnoughData=false e o fallback", () => {
    expect(computeCycleStatistics([])).toEqual({
      cycleCount: 0,
      hasEnoughData: false,
      averageLength: 28,
      shortest: null,
      longest: null,
      variation: null,
      isRegular: null,
    });
  });

  it("um único período ainda não permite estatística", () => {
    const stats = computeCycleStatistics([{ startDate: "2026-01-01" }]);
    expect(stats.hasEnoughData).toBe(false);
    expect(stats.cycleCount).toBe(1);
  });

  it("respeita o fallback informado", () => {
    expect(computeCycleStatistics([], 30).averageLength).toBe(30);
  });

  it("calcula média/variação e marca ciclo regular (variação <= 8)", () => {
    const stats = computeCycleStatistics([
      { startDate: "2026-01-01" },
      { startDate: "2026-01-29" },
    ]);
    expect(stats).toEqual({
      cycleCount: 2,
      hasEnoughData: true,
      averageLength: 28,
      shortest: 28,
      longest: 28,
      variation: 0,
      isRegular: true,
    });
  });

  it("marca como irregular quando a variação passa de 8 dias", () => {
    // durações [20, 35] → variação 15.
    const stats = computeCycleStatistics([
      { startDate: "2026-01-01" },
      { startDate: "2026-01-21" },
      { startDate: "2026-02-25" },
    ]);
    expect(stats.shortest).toBe(20);
    expect(stats.longest).toBe(35);
    expect(stats.variation).toBe(15);
    expect(stats.isRegular).toBe(false);
  });
});

describe("computeAveragePeriodLength (MenstrualCycle.js:176-184)", () => {
  it("devolve o fallback (5) sem dados", () => {
    expect(computeAveragePeriodLength([])).toBe(5);
    expect(computeAveragePeriodLength(null)).toBe(5);
  });

  it("arredonda a média das durações de menstruação registradas", () => {
    // (5 + 6) / 2 = 5.5 → Math.round = 6.
    expect(
      computeAveragePeriodLength([{ periodLength: 5 }, { periodLength: 6 }])
    ).toBe(6);
  });

  it("ignora registros sem periodLength", () => {
    expect(
      computeAveragePeriodLength([{ periodLength: 5 }, { startDate: "x" }])
    ).toBe(5);
  });
});

describe("getLastPeriodStart (MenstrualCycle.js:187-195)", () => {
  it("devolve null sem períodos", () => {
    expect(getLastPeriodStart([])).toBeNull();
    expect(getLastPeriodStart(null)).toBeNull();
  });

  it("devolve o início mais recente (ordena antes)", () => {
    expect(
      getLastPeriodStart([
        { startDate: "2026-02-01" },
        { startDate: "2026-01-01" },
      ])
    ).toBe("2026-02-01");
  });
});

describe("byStartDateAsc (MenstrualCycle.js:186-195)", () => {
  it("devolve 0 quando as datas são iguais (comparador consistente)", () => {
    // O comparador antigo era `a.startDate < b.startDate ? -1 : 1`, que
    // devolvia 1 para (a, b) E para (b, a) quando as datas empatavam —
    // contradizendo o contrato de Array.prototype.sort (compare(a,b) > 0
    // deve implicar compare(b,a) < 0). A ordem relativa de datas iguais
    // ficava então definida pela implementação do sort, não pelo dado.
    const a = { startDate: "2026-01-01" };
    const b = { startDate: "2026-01-01" };

    expect(byStartDateAsc(a, b)).toBe(0);
    expect(byStartDateAsc(b, a)).toBe(0);
  });

  it("ordena por startDate ascendente", () => {
    const early = { id: "A", startDate: "2026-01-01" };
    const late = { id: "C", startDate: "2026-02-01" };

    expect(byStartDateAsc(early, late)).toBeLessThan(0);
    expect(byStartDateAsc(late, early)).toBeGreaterThan(0);
  });

  it("mantém determinística a ordem de registros com a mesma data", () => {
    const first = { id: "A", startDate: "2026-01-01" };
    const second = { id: "B", startDate: "2026-01-01" };
    const third = { id: "C", startDate: "2026-02-01" };

    // Com um comparador consistente, o sort é estável: o empate preserva a
    // ordem de inserção e o resultado é reprodutível.
    const once = [third, first, second].sort(byStartDateAsc).map((p) => p.id);
    const twice = [third, first, second].sort(byStartDateAsc).map((p) => p.id);

    expect(once).toEqual(["A", "B", "C"]);
    expect(twice).toEqual(once);
  });

  it("é o comparador usado por getLastPeriodStart", () => {
    // getLastPeriodStart com empate na data mais recente continua devolvendo
    // essa data, de forma reprodutível.
    const periods = [
      { startDate: "2026-01-01" },
      { startDate: "2026-02-01" },
      { startDate: "2026-02-01" },
    ];
    expect(getLastPeriodStart(periods)).toBe("2026-02-01");
    expect(getLastPeriodStart([...periods].reverse())).toBe("2026-02-01");
  });
});

describe("summarizeCycle (MenstrualCycle.js:196-225)", () => {
  it("monta o resumo completo do ciclo atual", () => {
    const summary = summarizeCycle({
      lastPeriodStart: "2026-09-01",
      cycleLength: 28,
      periodLength: 5,
      todayStr: "2026-09-15",
    });

    expect(summary).toEqual({
      cycleDay: 15,
      cycleLength: 28,
      periodLength: 5,
      phase: PHASES.FERTILE,
      fertileWindow: { start: 9, end: 15, ovulationDay: 14 },
      fertileWindowDates: { start: "2026-09-09", end: "2026-09-15" },
      nextPeriodDate: "2026-09-29",
      daysUntilFertileWindow: 0,
      daysUntilNextPeriod: 14,
    });
  });

  it("aplica o clamp no comprimento vindo de override/dados legados", () => {
    const summary = summarizeCycle({
      lastPeriodStart: "2026-09-01",
      cycleLength: 3, // inválido → clamp para 15
      periodLength: 5,
      todayStr: "2026-09-01",
    });
    expect(summary.cycleLength).toBe(15);
    expect(summary.cycleDay).toBe(1);
    expect(summary.nextPeriodDate).toBe("2026-09-16");
  });
});
