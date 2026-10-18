/**
 * Testes de src/domain/services/CycleInsightService.js
 *
 * Traduz o resumo do ciclo numa mensagem curta para o parceiro. O texto
 * varia por dia do mês (pickByDay), então as asserções fixam o TOM (que é
 * determinístico por ramo) e verificam que o título/ícone pertencem ao
 * conjunto de variações do ramo correto — falharia se a lista de variações
 * ou o roteamento por fase mudasse.
 *
 * Comportamento derivado de CycleInsightService.js:141-208.
 */
import { getDailyInsight, getPhaseLabel } from "./CycleInsightService";
import { PHASES } from "../valueObjects/MenstrualCycle";

// Listas de variações copiadas de CycleInsightService.js:34-135.
const MENSTRUATION_ENDING_SOON = [
  "Os dias difíceis estão acabando",
  "Os dias difíceis estão quase no fim",
  "A fase mais pesada já está passando",
  "Falta pouco para os dias difíceis acabarem",
  "O desconforto está chegando ao fim",
  "Amanhã já deve estar mais leve",
];
const MENSTRUATION_CAUTION = [
  "Cuidado, hoje não é um bom dia",
  "Hoje pede mais cuidado e paciência",
  "Um dia para ir com calma",
  "Hoje é dia de cuidado redobrado",
  "Vá com carinho hoje",
  "Hoje merece mais atenção e gentileza",
];
const FERTILE_START = [
  "Hoje começa o seu período de sorte!",
  "Hoje é o primeiro dia de sorte!",
  "A fase de sorte começou hoje!",
  "Hoje dá a largada no período de sorte!",
  "Começou! Hoje inicia a fase de sorte",
];
const FERTILE_OVULATION = [
  "Ótimo dia para um match mais quente!",
  "Dia perfeito para esquentar as coisas!",
  "Hoje pede um match mais intenso!",
  "Ótimo momento para um encontro mais quente!",
  "Dia ótimo para aproveitarem ao máximo!",
];

// Resumo base: ciclo 28, período 5 → janela fértil {start:9,end:15,ovulationDay:14}.
const baseSummary = (overrides = {}) => ({
  phase: PHASES.FOLLICULAR,
  cycleDay: 7,
  periodLength: 5,
  fertileWindow: { start: 9, end: 15, ovulationDay: 14 },
  daysUntilFertileWindow: 2,
  daysUntilNextPeriod: 20,
  ...overrides,
});

describe("getDailyInsight — fase de menstruação (CycleInsightService.js:147-153)", () => {
  it("perto do fim do período usa tom 'neutral'", () => {
    // periodLength 5 - cycleDay 5 = 0 <= 1.
    const insight = getDailyInsight(
      baseSummary({ phase: PHASES.MENSTRUATION, cycleDay: 5, periodLength: 5 })
    );
    expect(insight.tone).toBe("neutral");
    expect(MENSTRUATION_ENDING_SOON).toContain(insight.title);
  });

  it("no meio do período usa tom 'caution'", () => {
    const insight = getDailyInsight(
      baseSummary({ phase: PHASES.MENSTRUATION, cycleDay: 3, periodLength: 5 })
    );
    expect(insight.tone).toBe("caution");
    expect(MENSTRUATION_CAUTION).toContain(insight.title);
  });
});

describe("getDailyInsight — fase folicular (CycleInsightService.js:155-164)", () => {
  it("um dia para a janela fértil → tom 'good'", () => {
    const insight = getDailyInsight(
      baseSummary({ phase: PHASES.FOLLICULAR, daysUntilFertileWindow: 1 })
    );
    expect(insight.tone).toBe("good");
  });

  it("poucos dias (<=3) → tom 'good'", () => {
    const insight = getDailyInsight(
      baseSummary({ phase: PHASES.FOLLICULAR, daysUntilFertileWindow: 3 })
    );
    expect(insight.tone).toBe("good");
  });

  it("fase tranquila (>3) → tom 'neutral'", () => {
    const insight = getDailyInsight(
      baseSummary({ phase: PHASES.FOLLICULAR, daysUntilFertileWindow: 8 })
    );
    expect(insight.tone).toBe("neutral");
  });
});

describe("getDailyInsight — janela fértil (CycleInsightService.js:166-179)", () => {
  it("primeiro dia da janela → tom 'great' com variações de início", () => {
    const insight = getDailyInsight(
      baseSummary({ phase: PHASES.FERTILE, cycleDay: 9 })
    );
    expect(insight.tone).toBe("great");
    expect(FERTILE_START).toContain(insight.title);
  });

  it("dia da ovulação (ou véspera) → variações de ovulação", () => {
    const onOvulation = getDailyInsight(
      baseSummary({ phase: PHASES.FERTILE, cycleDay: 14 })
    );
    expect(onOvulation.tone).toBe("great");
    expect(FERTILE_OVULATION).toContain(onOvulation.title);

    const dayBefore = getDailyInsight(
      baseSummary({ phase: PHASES.FERTILE, cycleDay: 13 })
    );
    expect(FERTILE_OVULATION).toContain(dayBefore.title);
  });

  it("último dia da janela → tom 'great'", () => {
    const insight = getDailyInsight(
      baseSummary({ phase: PHASES.FERTILE, cycleDay: 15 })
    );
    expect(insight.tone).toBe("great");
  });
});

describe("getDailyInsight — fase lútea (CycleInsightService.js:181-191)", () => {
  it("logo após a janela fértil (<=3 dias) → tom 'neutral'", () => {
    const insight = getDailyInsight(
      baseSummary({ phase: PHASES.LUTEAL, cycleDay: 17, daysUntilNextPeriod: 10 })
    );
    expect(insight.tone).toBe("neutral");
  });

  it("perto da próxima menstruação (<=2 dias) → tom 'caution'", () => {
    const insight = getDailyInsight(
      baseSummary({ phase: PHASES.LUTEAL, cycleDay: 25, daysUntilNextPeriod: 2 })
    );
    expect(insight.tone).toBe("caution");
  });
});

describe("getDailyInsight — forma da mensagem", () => {
  it("sempre devolve icon e title não-vazios", () => {
    const insight = getDailyInsight(baseSummary({ phase: PHASES.FOLLICULAR }));
    expect(typeof insight.icon).toBe("string");
    expect(insight.icon.length).toBeGreaterThan(0);
    expect(typeof insight.title).toBe("string");
    expect(insight.title.length).toBeGreaterThan(0);
  });
});

describe("getDailyInsight — dia do mês injetável (CycleInsightService.js:22-30)", () => {
  it("escolhe a variação pelo dia do mês informado, não pelo relógio", () => {
    // pickByDay usava `new Date().getDate()` (relógio real), o que tornava a
    // "dica do dia" não-determinística e dependente do fuso. Com o dia
    // parametrizado, o mesmo resumo em dias diferentes dá títulos diferentes
    // de forma reprodutível: variants[day % variants.length].
    const day1 = getDailyInsight(
      baseSummary({ phase: PHASES.FERTILE, cycleDay: 9 }),
      1
    );
    const day3 = getDailyInsight(
      baseSummary({ phase: PHASES.FERTILE, cycleDay: 9 }),
      3
    );

    expect(day1.title).toBe(FERTILE_START[1]);
    expect(day3.title).toBe(FERTILE_START[3]);
    expect(day1.title).not.toBe(day3.title);
  });

  it("aplica o dia injetado também nas variações com contagem de dias", () => {
    // FERTILE_DAYS_LEFT[2] = (n) => ["✨", `Faltam ${n} dias de fase especial`];
    // cycleDay 10 na janela [9, 15] → daysLeft = 5.
    const insight = getDailyInsight(
      baseSummary({ phase: PHASES.FERTILE, cycleDay: 10 }),
      2
    );
    expect(insight.title).toBe("Faltam 5 dias de fase especial");
  });

  it("sem o dia informado mantém o comportamento atual (dia corrente)", () => {
    // Retrocompatível: quem chama com um argumento só continua recebendo a
    // variação do dia de hoje.
    const today = new Date().getDate();
    const insight = getDailyInsight(
      baseSummary({ phase: PHASES.FERTILE, cycleDay: 9 })
    );
    expect(insight.title).toBe(FERTILE_START[today % FERTILE_START.length]);
  });
});

describe("getPhaseLabel (CycleInsightService.js:196-208)", () => {
  it("mapeia cada fase para o rótulo em português", () => {
    expect(getPhaseLabel(PHASES.MENSTRUATION)).toBe("Menstruação");
    expect(getPhaseLabel(PHASES.FOLLICULAR)).toBe("Fase folicular");
    expect(getPhaseLabel(PHASES.FERTILE)).toBe("Janela fértil");
    expect(getPhaseLabel(PHASES.LUTEAL)).toBe("Fase lútea");
  });

  it("fase desconhecida cai no default 'Fase lútea'", () => {
    expect(getPhaseLabel("inexistente")).toBe("Fase lútea");
  });
});
