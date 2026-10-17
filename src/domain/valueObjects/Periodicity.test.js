/**
 * Testes de src/domain/valueObjects/Periodicity.js
 *
 * Value Object puro que responde duas perguntas de negócio:
 *   1. como exibir a periodicidade (formatPeriodicity);
 *   2. se a atividade vale para hoje (isActivityForToday).
 *
 * Comportamento derivado de Periodicity.js:23-91.
 */
import { formatPeriodicity, isActivityForToday } from "./Periodicity";

describe("formatPeriodicity (Periodicity.js:23-48)", () => {
  it("devolve string vazia para null/undefined e para tipo 'none'", () => {
    expect(formatPeriodicity(null)).toBe("");
    expect(formatPeriodicity(undefined)).toBe("");
    expect(formatPeriodicity({ type: "none" })).toBe("");
  });

  it("formata 'diaria'", () => {
    expect(formatPeriodicity({ type: "diaria", value: null })).toBe(
      "(Diariamente)"
    );
  });

  it("formata 'especifica' como DD/MM/AAAA a partir de YYYY-MM-DD", () => {
    // Periodicity.js:30-33: value.split('-') = [ano, mês, dia].
    expect(formatPeriodicity({ type: "especifica", value: "2026-09-07" })).toBe(
      "(Em 07/09/2026)"
    );
  });

  it("formata 'semanal' com o nome do dia (WEEKDAY_LABELS)", () => {
    // Periodicity.js:12-20 e :34-35: índice 0=Domingo ... 6=Sábado, com a
    // concordância correta do artigo — "Domingo" e "Sábado" são masculinos
    // ("Todo"), os "-feira" são femininos ("Toda").
    expect(formatPeriodicity({ type: "semanal", value: 0 })).toBe(
      "(Todo Domingo)"
    );
    expect(formatPeriodicity({ type: "semanal", value: 3 })).toBe(
      "(Toda Quarta-feira)"
    );
    expect(formatPeriodicity({ type: "semanal", value: 6 })).toBe("(Todo Sábado)");
  });

  it("formata 'mensal'", () => {
    expect(formatPeriodicity({ type: "mensal", value: 15 })).toBe("(Todo dia 15)");
  });

  it("formata 'anual' como DD/MM a partir de YYYY-MM-DD", () => {
    // Periodicity.js:38-41: descarta o ano.
    expect(formatPeriodicity({ type: "anual", value: "2026-12-25" })).toBe(
      "(Anual em 25/12)"
    );
  });

  it("devolve string vazia para tipo desconhecido", () => {
    expect(formatPeriodicity({ type: "trimestral", value: 1 })).toBe("");
  });

  it("engole o erro e devolve string vazia quando value não é string", () => {
    // Periodicity.js:45-47: value.split lança se value for undefined → catch.
    expect(formatPeriodicity({ type: "especifica", value: undefined })).toBe("");
  });

  it("devolve string vazia para 'semanal' com valor fora da faixa 0-6", () => {
    // Periodicity.js:34-35: o índice era usado sem validação, e um valor
    // corrompido virava o texto "(Toda undefined)" na UI. Agora o índice é
    // validado e um valor inválido cai no mesmo "" dos outros tipos
    // desconhecidos (nenhum texto novo é inventado).
    expect(formatPeriodicity({ type: "semanal", value: 7 })).toBe("");
    expect(formatPeriodicity({ type: "semanal", value: 99 })).toBe("");
    expect(formatPeriodicity({ type: "semanal", value: -1 })).toBe("");
    expect(formatPeriodicity({ type: "semanal", value: 1.5 })).toBe("");
    expect(formatPeriodicity({ type: "semanal", value: "abc" })).toBe("");
    expect(formatPeriodicity({ type: "semanal", value: undefined })).toBe("");
  });

  it("aceita o índice como número ou string numérica dentro da faixa", () => {
    expect(formatPeriodicity({ type: "semanal", value: "3" })).toBe(
      "(Toda Quarta-feira)"
    );
  });
});

describe("isActivityForToday (Periodicity.js:55-91)", () => {
  it("desafios usam validade por expiresAt (não periodicidade)", () => {
    // Periodicity.js:56-58.
    const future = { toDate: () => new Date(Date.now() + 60_000) };
    const past = { toDate: () => new Date(Date.now() - 60_000) };

    expect(
      isActivityForToday({ type: "desafio", expiresAt: future }, "2026-01-01")
    ).toBe(true);
    expect(
      isActivityForToday({ type: "desafio", expiresAt: past }, "2026-01-01")
    ).toBe(false);
    // Sem expiresAt a expressão é curto-circuitada (falsy).
    expect(
      isActivityForToday({ type: "desafio" }, "2026-01-01")
    ).toBeFalsy();
  });

  it("atividade sem periodicidade é sempre válida", () => {
    expect(isActivityForToday({ type: "atividade" }, "2026-01-01")).toBe(true);
    expect(
      isActivityForToday(
        { type: "atividade", periodicity: { type: "none" } },
        "2026-01-01"
      )
    ).toBe(true);
  });

  it("'diaria' é sempre válida", () => {
    expect(
      isActivityForToday(
        { type: "atividade", periodicity: { type: "diaria" } },
        "2026-01-01"
      )
    ).toBe(true);
  });

  it("'especifica' compara a string de data", () => {
    const activity = {
      type: "atividade",
      periodicity: { type: "especifica", value: "2026-01-01" },
    };
    expect(isActivityForToday(activity, "2026-01-01")).toBe(true);
    expect(isActivityForToday(activity, "2026-01-02")).toBe(false);
  });

  it("'semanal' usa getUTCDay da data informada", () => {
    // 2026-01-01 é quinta-feira → getUTCDay() = 4 (verificado).
    const thursday = {
      type: "atividade",
      periodicity: { type: "semanal", value: "4" },
    };
    const friday = {
      type: "atividade",
      periodicity: { type: "semanal", value: "5" },
    };
    expect(isActivityForToday(thursday, "2026-01-01")).toBe(true);
    expect(isActivityForToday(friday, "2026-01-01")).toBe(false);
  });

  it("'mensal' compara o dia do mês", () => {
    const day15 = {
      type: "atividade",
      periodicity: { type: "mensal", value: "15" },
    };
    expect(isActivityForToday(day15, "2026-01-15")).toBe(true);
    expect(isActivityForToday(day15, "2026-01-16")).toBe(false);
  });

  it("'anual' compara mês e dia (ignora o ano)", () => {
    const xmas = {
      type: "atividade",
      periodicity: { type: "anual", value: "2026-12-25" },
    };
    expect(isActivityForToday(xmas, "2026-12-25")).toBe(true);
    expect(isActivityForToday(xmas, "2026-12-24")).toBe(false);
  });

  it("tipo desconhecido é inválido (default false)", () => {
    expect(
      isActivityForToday(
        { type: "atividade", periodicity: { type: "trimestral", value: 1 } },
        "2026-01-01"
      )
    ).toBe(false);
  });
});
