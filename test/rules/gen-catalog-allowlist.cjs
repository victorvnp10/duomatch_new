/**
 * Gera o bloco de allowlist de ids do catálogo global dentro de firestore.rules.
 *
 * Contexto (ACHADO A-1): o catálogo `contentActivities` / `contentChallenges` é
 * semeado PELO CLIENTE (ContentRepository.plantMissing). Como não há backend,
 * a única forma de o Firestore distinguir um seed legítimo de uma injeção é
 * exigir que o `docId` pertença ao conjunto de ids que o app realmente publica
 * — ou seja, os ids de `src/infrastructure/seed/contentCatalog.js`.
 *
 * Este script reescreve as funções `isCatalogActivityId` / `isCatalogChallengeId`
 * entre os marcadores CATALOG-ALLOWLIST:START / END. Rode-o sempre que o
 * catálogo mudar:
 *
 *   node test/rules/gen-catalog-allowlist.cjs
 *
 * A sincronia é verificada por test/rules/catalog-allowlist.test.cjs.
 */

const fs = require("fs");
const path = require("path");
const url = require("url");

const START = "    // CATALOG-ALLOWLIST:START";
const END = "    // CATALOG-ALLOWLIST:END";

async function loadCatalog() {
  const modPath = path.join(
    __dirname,
    "..",
    "..",
    "src",
    "infrastructure",
    "seed",
    "contentCatalog.js"
  );
  const mod = await import(url.pathToFileURL(modPath).href);
  return { activities: mod.ACTIVITY_CATALOG, challenges: mod.CHALLENGE_CATALOG };
}

const renderIds = (ids) =>
  ids
    .slice()
    .sort()
    .map((id) => `        "${id}"`)
    .join(",\n");

function renderBlock(activities, challenges) {
  return [
    START,
    "    // Allowlist de ids do catálogo global. GERADO AUTOMATICAMENTE de",
    "    // src/infrastructure/seed/contentCatalog.js — NÃO editar à mão.",
    "    // Regenerar: node test/rules/gen-catalog-allowlist.cjs",
    "    // Sincronia verificada por test/rules/catalog-allowlist.test.cjs.",
    "    function catalogActivityIds() {",
    `      return "${activities.map(a => a.id).sort().join(',')}".split(',');`,
    "    }",
    "",
    "    function isCatalogActivityId(docId) {",
    "      return docId in catalogActivityIds();",
    "    }",
    "",
    "    function isCatalogChallengeId(docId) {",
    `      return docId in "${challenges.map(c => c.id).sort().join(',')}".split(',');`,
    "    }",
    END,
  ].join("\n");
}

async function main() {
  const rulesPath = path.join(__dirname, "..", "..", "firestore.rules");
  const rules = fs.readFileSync(rulesPath, "utf8");
  const { activities, challenges } = await loadCatalog();
  const block = renderBlock(activities, challenges);

  const re = new RegExp(
    escapeRe(START) + "[\\s\\S]*?" + escapeRe(END)
  );
  if (!re.test(rules)) {
    throw new Error(
      "Marcadores " + START + " / " + END + " não encontrados em firestore.rules"
    );
  }
  fs.writeFileSync(rulesPath, rules.replace(re, block), "utf8");
  console.log(
    `OK: allowlist regravada (${activities.length} atividades, ${challenges.length} desafios)`
  );
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
