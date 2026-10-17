import { getSortedSpecialSuggestions } from "./specialSuggestionsService";

// Comportamento derivado do useMemo `sortedSpecialSuggestions` de MainView.js.
describe("getSortedSpecialSuggestions", () => {
  const run = (dailySuggestions) =>
    getSortedSpecialSuggestions(dailySuggestions, {
      userId: "userA",
      partnerId: "userB",
    });

  const suggestion = (id, name, overrides = {}) => ({
    id,
    name,
    selections: {},
    ...overrides,
  });

  it("returns an empty list when there are no suggestions", () => {
    expect(run(null)).toEqual([]);
    expect(run(undefined)).toEqual([]);
  });

  it("drops entries without a name", () => {
    const map = {
      a: suggestion("a", "Cinema"),
      b: { id: "b", name: "" },
      c: null,
    };
    expect(run(map).map((s) => s.id)).toEqual(["a"]);
  });

  it("drops suggestions that already matched", () => {
    const map = {
      a: suggestion("a", "Cinema"),
      b: suggestion("b", "Praia", { matched: true }),
    };
    expect(run(map).map((s) => s.id)).toEqual(["a"]);
  });

  it("drops suggestions selected by both partners", () => {
    const map = {
      a: suggestion("a", "Cinema", {
        selections: { userA: "selected", userB: "selected" },
      }),
      b: suggestion("b", "Praia"),
    };
    expect(run(map).map((s) => s.id)).toEqual(["b"]);
  });

  it("keeps a suggestion selected by only one partner", () => {
    const map = {
      a: suggestion("a", "Cinema", {
        selections: { userA: "selected", userB: null },
      }),
    };
    expect(run(map).map((s) => s.id)).toEqual(["a"]);
  });

  it("sorts the remaining suggestions by name", () => {
    const map = {
      c: suggestion("z", "Zoo"),
      a: suggestion("a", "Cinema"),
      b: suggestion("m", "Praia"),
    };
    expect(run(map).map((s) => s.name)).toEqual(["Cinema", "Praia", "Zoo"]);
  });

  // Fonte única compartilhada por MainView (Sugestões Especiais) e HotZone
  // (Sugestões Picantes): o mesmo contrato serve os dois mapas. O teste abaixo
  // trava a propriedade de que a função é pura — não muta o mapa de entrada,
  // que é o objeto de estado vindo do Firestore em ambos os consumidores.
  it("não muta o mapa de entrada (pura)", () => {
    const map = {
      c: suggestion("z", "Zoo"),
      a: suggestion("a", "Cinema", {
        selections: { userA: "selected", userB: null },
      }),
      b: suggestion("b", "Praia", { matched: true }),
    };
    const snapshot = JSON.parse(JSON.stringify(map));
    run(map);
    expect(map).toEqual(snapshot);
    expect(Object.keys(map)).toEqual(["c", "a", "b"]);
  });
});
