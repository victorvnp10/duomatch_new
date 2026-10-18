// Run with Firestore emulator only: this invokes the actual v2 callable handler.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const root = path.resolve(__dirname, '../..');

test('syncContentCatalog: real Admin SDK writes, idempotence and validation', async (t) => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, 'Firestore emulator is mandatory; never use production');
  process.env.GCLOUD_PROJECT = 'demo-duomatch-catalog';
  const modulePath = path.join(root, 'functions/syncContentCatalog.js');
  assert.ok(fs.existsSync(modulePath), 'syncContentCatalog implementation must exist');
  const { syncContentCatalog } = require('../../functions/index.js');
  const functionsRequire = require('node:module').createRequire(path.join(root, 'functions/package.json'));
  const { getFirestore } = functionsRequire('firebase-admin/firestore');
  const db = getFirestore();
  const source = await import('../../src/infrastructure/seed/contentCatalog.js');
  const catalog = require('../../functions/generated/contentCatalog.json');
  assert.deepEqual(catalog, { activities: source.ACTIVITY_CATALOG, challenges: source.CHALLENGE_CATALOG });
  const entries = [
    ...catalog.activities.map(item => ({ ref: db.doc(`contentActivities/${item.id}`), item })),
    ...catalog.challenges.map(item => ({ ref: db.doc(`contentChallenges/${item.id}`), item })),
  ];
  const base = `http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${process.env.GCLOUD_PROJECT}/databases/(default)/documents`;
  const cleared = await fetch(base, { method: 'DELETE' });
  assert.ok(cleared.ok, await cleared.text());
  const invoke = data => syncContentCatalog.run({ auth: { uid: 'catalog-user' }, data });
  const snapshots = () => db.getAll(...entries.map(e => e.ref));
  const times = snaps => snaps.map(s => s.updateTime.toString());
  const rejectCode = code => err => err.code === code;

  await t.test('requires authentication and validates ids before writes', async () => {
    await assert.rejects(syncContentCatalog.run({ data: {} }), rejectCode('unauthenticated'));
    for (const data of [{ ids: 'bad' }, { ids: ['unknown'] }, { ids: [null] }, { ids: ['../bad'] }, { extra: true }, []]) {
      await assert.rejects(invoke(data), rejectCode('invalid-argument'));
    }
    assert.ok((await snapshots()).every(s => !s.exists));
  });
  await t.test('first call writes every source document exactly', async () => {
    const result = await invoke();
    console.log('FIRST_SYNC', JSON.stringify(result));
    const snaps = await snapshots();
    assert.equal(snaps.filter(s => s.exists).length, entries.length, 'handler must actually persist the entire catalog');
    snaps.forEach((snap, i) => assert.deepEqual(snap.data(), entries[i].item));
    assert.equal(result.written, entries.length);
    assert.equal((await db.collection('contentActivities').get()).size, catalog.activities.length);
    assert.equal((await db.collection('contentChallenges').get()).size, catalog.challenges.length);
  });
  await t.test('second call does not rewrite: every updateTime is identical', async () => {
    const before = times(await snapshots());
    const result = await invoke({});
    console.log('SECOND_SYNC', JSON.stringify(result));
    assert.equal(result.written, 0);
    assert.deepEqual(times(await snapshots()), before);
    console.log('UNCHANGED_UPDATE_TIMES', before.length);
  });
  await t.test('subset repairs differing and missing documents, preserves all others', async () => {
    const a = entries[0], b = entries[1];
    await a.ref.set({ ...a.item, name: 'damaged test document' });
    await b.ref.delete();
    const unrelated = db.doc('contentActivities/non-catalog-document');
    await unrelated.set({ untouched: true });
    const before = await snapshots();
    const result = await invoke({ ids: [a.item.id, b.item.id, a.item.id] });
    assert.equal(result.scanned, 2);
    assert.equal(result.written, 2);
    const after = await snapshots();
    after.forEach((snap, i) => {
      assert.deepEqual(snap.data(), entries[i].item);
      if (i > 1) assert.equal(snap.updateTime.toString(), before[i].updateTime.toString());
    });
    assert.deepEqual((await unrelated.get()).data(), { untouched: true });
    assert.equal((await invoke({ ids: [] })).written, 0);
    console.log('SUBSET_REPAIR', JSON.stringify(result));
  });
  await t.test('concurrent syncs do not rewrite identical catalog documents', async () => {
    const a = entries[0];
    await a.ref.delete();
    const result = await Promise.all([invoke({ ids: [a.item.id] }), invoke({ ids: [a.item.id] })]);
    assert.equal(result.reduce((sum, r) => sum + r.written, 0), 1);
    assert.deepEqual((await a.ref.get()).data(), a.item);
    console.log('CONCURRENT_SYNC', JSON.stringify(result));
  });
  await db.terminate();
});
