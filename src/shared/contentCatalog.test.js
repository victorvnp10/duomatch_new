/**
 * Testes de integridade de src/shared/contentCatalog.js
 *
 * Este arquivo é a FONTE DE SEED do Firestore (contentActivities /
 * contentChallenges) — ver cabeçalho contentCatalog.js:1-8. Um id duplicado
 * ou categoria com typo quebraria o upsert/sorteio silenciosamente. Não
 * testamos os textos, e sim os invariantes estruturais do catálogo.
 *
 * Taxonomia de categorias de atividades: contentCatalog.js:10-4268.
 */
import { ACTIVITY_CATALOG, CHALLENGE_CATALOG } from "./contentCatalog";

const ACTIVITY_CATEGORIES = new Set([
  "Comida & Bebida",
  "Filmes & Séries",
  "Hobbies & Outros",
  "Hot",
  "Música",
  "Viagens & Passeios",
]);

describe("ACTIVITY_CATALOG (contentCatalog.js:10-4268)", () => {
  it("não está vazio", () => {
    expect(Array.isArray(ACTIVITY_CATALOG)).toBe(true);
    expect(ACTIVITY_CATALOG.length).toBeGreaterThan(0);
  });

  it("todo item tem id/nome/categoria/descrição e pontos numéricos não-negativos", () => {
    ACTIVITY_CATALOG.forEach((item) => {
      expect(typeof item.id).toBe("string");
      expect(item.id.length).toBeGreaterThan(0);
      expect(typeof item.name).toBe("string");
      expect(item.name.length).toBeGreaterThan(0);
      expect(typeof item.category).toBe("string");
      expect(item.category.length).toBeGreaterThan(0);
      expect(typeof item.description).toBe("string");
      expect(item.description.length).toBeGreaterThan(0);
      expect(typeof item.points).toBe("number");
      expect(item.points).toBeGreaterThanOrEqual(0);
      expect(item.active).toBe(true);
    });
  });

  it("não tem ids duplicados", () => {
    const ids = ACTIVITY_CATALOG.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("usa apenas categorias conhecidas (detecta typos na taxonomia)", () => {
    const unknown = [
      ...new Set(
        ACTIVITY_CATALOG.map((a) => a.category).filter(
          (c) => !ACTIVITY_CATEGORIES.has(c)
        )
      ),
    ];
    expect(unknown).toEqual([]);
  });

  it("contém todas as categorias documentadas", () => {
    const present = new Set(ACTIVITY_CATALOG.map((a) => a.category));
    ACTIVITY_CATEGORIES.forEach((c) => expect(present.has(c)).toBe(true));
  });
});

describe("CHALLENGE_CATALOG (contentCatalog.js:4270+)", () => {
  it("não está vazio", () => {
    expect(Array.isArray(CHALLENGE_CATALOG)).toBe(true);
    expect(CHALLENGE_CATALOG.length).toBeGreaterThan(0);
  });

  it("todo item tem id/título/descrição/tipo e pontos numéricos", () => {
    CHALLENGE_CATALOG.forEach((item) => {
      expect(typeof item.id).toBe("string");
      expect(item.id.length).toBeGreaterThan(0);
      expect(typeof item.title).toBe("string");
      expect(item.title.length).toBeGreaterThan(0);
      expect(typeof item.description).toBe("string");
      expect(item.description.length).toBeGreaterThan(0);
      expect(typeof item.type).toBe("string");
      expect(item.type.length).toBeGreaterThan(0);
      expect(typeof item.points).toBe("number");
      expect(item.points).toBeGreaterThanOrEqual(0);
      expect(item.active).toBe(true);
    });
  });

  it("não tem ids duplicados", () => {
    const ids = CHALLENGE_CATALOG.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("separação entre os catálogos", () => {
  it("nenhum id se repete entre atividades e desafios", () => {
    const activityIds = new Set(ACTIVITY_CATALOG.map((a) => a.id));
    const collisions = CHALLENGE_CATALOG.map((c) => c.id).filter((id) =>
      activityIds.has(id)
    );
    expect(collisions).toEqual([]);
  });
});
