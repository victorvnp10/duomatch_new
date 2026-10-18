/**
 * Guarda de sincronia da allowlist do catálogo global (ACHADO A-1).
 *
 * As regras só aceitam `create` em contentActivities/contentChallenges para
 * `docId`s que existam em src/infrastructure/seed/contentCatalog.js. Se alguém
 * ampliar o catálogo e esquecer de regenerar o bloco em firestore.rules, o seed
 * do novo conteúdo passaria a ser NEGADO — falha silenciosa. Este teste quebra
 * o CI nesse caso.
 *
 * Rode: node test/rules/catalog-allowlist.test.cjs
 * (não precisa de emulador)
 */

const fs = require("fs");
const path = require("path");
const url = require("url");

const RULES_PATH = path.join(__dirname, "..", "..", "firestore.rules");
const CATALOG_PATH = path.join(
  __dirname,
  "..",
  "..",
  "src",
  "infrastructure",
  "seed",
  "contentCatalog.js"
);

/** Extrai os ids literais de uma função `isCatalogXId` do arquivo de regras. */
function extractIds(rules, fnName) {
  const re = new RegExp('function\\s+' + fnName + '\\s*\\([^)]*\\)\\s*\\{[^}]*?"([^"]+)"\\.split');
  const m = rules.match(re);
  if (!m) throw new Error(`função ${fnName} não encontrada em firestore.rules`);
  return m[1].split(',').sort();
}

async function main() {
  const rules = fs.readFileSync(RULES_PATH, "utf8");
  const mod = await import(url.pathToFileURL(CATALOG_PATH).href);

  const expectedActivities = mod.ACTIVITY_CATALOG.map((a) => a.id).sort();
  const expectedChallenges = mod.CHALLENGE_CATALOG.map((c) => c.id).sort();

  const actualActivities = extractIds(rules, "catalogActivityIds");
  const actualChallenges = extractIds(rules, "isCatalogChallengeId");

  let falhou = 0;
  const cmp = (nome, expected, actual) => {
    if (JSON.stringify(expected) === JSON.stringify(actual)) {
      console.log(`  [OK]    ${nome}: ${actual.length} ids sincronizados`);
      return;
    }
    falhou++;
    const faltando = expected.filter((id) => !actual.includes(id));
    const sobrando = actual.filter((id) => !expected.includes(id));
    console.error(`  [FALHA] ${nome} dessincronizado`);
    if (faltando.length) console.error(`          faltando no rules: ${faltando.join(", ")}`);
    if (sobrando.length) console.error(`          sobrando no rules: ${sobrando.join(", ")}`);
  };

  console.log("=== Allowlist do catálogo x contentCatalog.js ===");
  cmp("contentActivities", expectedActivities, actualActivities);
  cmp("contentChallenges", expectedChallenges, actualChallenges);

  if (falhou) {
    console.error(
      "\nRode `node test/rules/gen-catalog-allowlist.cjs` e commite firestore.rules."
    );
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("ERRO FATAL:", err);
  process.exitCode = 2;
});
