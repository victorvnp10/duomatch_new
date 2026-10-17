/**
 * Frozen reference extracted from git show at fixture.baseCommit BEFORE splitting.
 * Never regenerate from the current catalog to make a failing test pass.
 * Run: node --test test/catalog-equivalence.test.cjs
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const reference = require('./fixtures/catalog-base.json');

const load = (file) => import(pathToFileURL(path.join(__dirname, '..', 'src', 'infrastructure', 'seed', file)).href);

test('legacy catalog preserves every base id, count, position and field', async () => {
  const catalog = await load('contentCatalog.js');
  for (const name of ['ACTIVITY_CATALOG', 'CHALLENGE_CATALOG']) {
    const expected = reference[name];
    const items = catalog[name];
    assert.equal(items.length, expected.count, `${name}: count`);
    assert.deepEqual(items.map((item) => item.id), expected.ids, `${name}: ordered ids`);
    assert.equal(new Set(items.map((item) => item.id)).size, items.length, `${name}: unique ids`);
    assert.equal(createHash('sha256').update(JSON.stringify(items)).digest('hex'), expected.sha256, `${name}: all fields`);
  }
});

test('seed index exports the exact same arrays as the legacy entry point', async () => {
  const legacy = await load('contentCatalog.js');
  const catalog = await load('index.js');
  assert.strictEqual(catalog.ACTIVITY_CATALOG, legacy.ACTIVITY_CATALOG);
  assert.strictEqual(catalog.CHALLENGE_CATALOG, legacy.CHALLENGE_CATALOG);
});
