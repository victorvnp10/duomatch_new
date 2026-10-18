// Populate the immutable shared catalog once before workers start. Otherwise
// every brand-new browser tries to plant hundreds of identical seed documents
// concurrently; that tests bootstrap contention rather than the critical flows.
module.exports = async function globalSetup() {
  // Diagnostic-only reproduction of the existing empty-catalog bootstrap issue.
  if (process.env.E2E_COLD_CATALOG === '1') return;
  const { ACTIVITY_CATALOG, CHALLENGE_CATALOG } = await import('../src/infrastructure/seed/contentCatalog.js');
  const project = 'projects/demo-duomatch-e2e/databases/(default)/documents';
  function field(v) {
    if (v === null) return { nullValue: null };
    if (typeof v === 'boolean') return { booleanValue: v };
    if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    if (typeof v === 'string') return { stringValue: v };
    if (Array.isArray(v)) return { arrayValue: { values: v.map(field) } };
    return { mapValue: { fields: fields(v) } };
  }
  function fields(v) { return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, field(x)])); }
  const writes = [
    ...ACTIVITY_CATALOG.map(x => ({ update: { name: `${project}/contentActivities/${x.id}`, fields: fields(x) } })),
    ...CHALLENGE_CATALOG.map(x => ({ update: { name: `${project}/contentChallenges/${x.id}`, fields: fields(x) } })),
  ];
  for (let i = 0; i < writes.length; i += 400) {
    const r = await fetch('http://127.0.0.1:8180/v1/projects/demo-duomatch-e2e/databases/(default)/documents:commit', {
      method: 'POST', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
      body: JSON.stringify({ writes: writes.slice(i, i + 400) }),
    });
    if (!r.ok) throw new Error(`Catalog fixture failed: ${await r.text()}`);
  }
};
