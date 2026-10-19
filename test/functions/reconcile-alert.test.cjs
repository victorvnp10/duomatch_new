const assert = require('node:assert/strict');
const { test, before, after, beforeEach } = require('node:test');
const { createRequire } = require('node:module');
const req = createRequire(require('node:path').resolve(__dirname, '../../functions/package.json'));
const { initializeApp, deleteApp } = req('firebase-admin/app');
const { getFirestore } = req('firebase-admin/firestore');
let app, db, api;
const ref = () => db.doc('systemJobs/reconcileAlert');
const failure = new Error('WEEKLY_RECONCILIATION_FAILED: pending actions');
const ok = { exhausted: true, busy: false, failed: 0, startedAtBeginning: true };
const logs = [];
const logger = { error: (...args) => logs.push(args) };
let time, messages;
const handler = (run, send = async text => { messages.push(text); }) => api.createReconciliationAlertHandler(db, {
  reconcile: run, send, now: () => time, logger,
});
before(async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, 'emulator required');
  api = require('../../functions/alert');
  app = initializeApp({ projectId: 'demo-reconcile-alert' }, 'alert-tests');
  db = getFirestore(app);
});
after(async () => { if (db) await db.terminate(); if (app) await deleteApp(app); });
beforeEach(async () => { await ref().delete(); time = 100000000; messages = []; logs.length = 0; });

test('failure alerts and rethrows the identical original error', async () => {
  await assert.rejects(handler(async () => { throw failure; })(), e => e === failure);
  assert.equal(messages.length, 1);
  assert.match(messages[0], /FALHA.*reconcilePendingWeeklyActions/);
  assert.equal((await ref().get()).data().active, true);
});
test('persistent failure is silent before interval and alerts at exact boundary', async () => {
  const run = handler(async () => { throw failure; });
  await assert.rejects(run(), e => e === failure);
  time += api.SILENCE_MS - 1;
  await assert.rejects(run(), e => e === failure);
  assert.equal(messages.length, 1);
  time++;
  await assert.rejects(run(), e => e === failure);
  assert.equal(messages.length, 2);
});
test('recovery bypasses silence and is delivered once after full successful scan', async () => {
  await assert.rejects(handler(async () => { throw failure; })());
  assert.deepEqual(await handler(async () => ok)(), ok);
  assert.match(messages[1], /RECUPERADO/);
  assert.equal((await ref().get()).data().active, false);
  await handler(async () => ok)();
  assert.equal(messages.length, 2);
});
test('busy or partial scans cannot claim recovery; clean first run stays quiet', async () => {
  await handler(async () => ok)();
  assert.equal(messages.length, 0);
  await assert.rejects(handler(async () => { throw failure; })());
  await handler(async () => ({ ...ok, busy: true }))();
  await handler(async () => ({ ...ok, exhausted: false }))();
  assert.equal(messages.length, 1);
  assert.equal((await ref().get()).data().active, true);
});
test('a suffix scan after failure cannot recover until an entire clean cursor cycle completes', async () => {
  await assert.rejects(handler(async () => { throw failure; })());
  await handler(async () => ({ ...ok, startedAtBeginning: false }))();
  assert.equal(messages.length, 1);
  await handler(async () => ({ ...ok, startedAtBeginning: true, exhausted: false }))();
  await handler(async () => ({ ...ok, startedAtBeginning: false }))();
  assert.equal(messages.length, 2);
  assert.match(messages[1], /RECUPERADO/);
});
test('Telegram rejection never replaces original failure and is throttled', async () => {
  let calls = 0;
  const run = handler(async () => { throw failure; }, async () => { calls++; throw new Error('network'); });
  await assert.rejects(run(), e => e === failure);
  await assert.rejects(run(), e => e === failure);
  assert.equal(calls, 1);
  assert.equal(logs.length, 1);
});
test('Telegram recovery failure does not reject success and recovery retries next scan', async () => {
  await assert.rejects(handler(async () => { throw failure; })());
  assert.deepEqual(await handler(async () => ok, async () => { throw new Error('network'); })(), ok);
  assert.equal((await ref().get()).data().active, true);
  await handler(async () => ok)();
  assert.match(messages[1], /RECUPERADO/);
  assert.equal((await ref().get()).data().active, false);
});
test('alert state outage cannot replace failure or reject successful reconciliation', async () => {
  const brokenDb = { doc: () => { throw new Error('Firestore down'); } };
  const make = reconcile => api.createReconciliationAlertHandler(brokenDb, { reconcile, send: async () => {}, logger });
  await assert.rejects(make(async () => { throw failure; })(), e => e === failure);
  assert.deepEqual(await make(async () => ok)(), ok);
  assert.equal(logs.length, 2);
});
test('sender uses POST, bounds network time, accepts API success and sanitizes errors', async () => {
  let request;
  const send = api.createTelegramSender({ token: { value: () => 'test-only-token' }, chat: { value: () => 'test-only-chat' },
    fetchImpl: async (url, options) => { request = { url, options }; return { ok: true, json: async () => ({ ok: true }) }; }, logger });
  assert.equal(await send('hello'), true);
  assert.equal(request.options.method, 'POST');
  assert.deepEqual(JSON.parse(request.options.body), { chat_id: 'test-only-chat', text: 'hello' });
  assert.ok(request.options.signal instanceof AbortSignal);
  for (const fetchImpl of [async () => { throw new Error('sensitive URL'); },
    async () => ({ ok: false }), async () => ({ ok: true, json: async () => ({ ok: false }) })]) {
    assert.equal(await api.createTelegramSender({ token: { value: () => 'unused' }, chat: { value: () => 'unused' }, fetchImpl, logger })('hello'), false);
  }
  assert.equal(logs.length, 3);
  assert.ok(!JSON.stringify(logs).includes('sensitive'));
});
test('real reconciler failure and recovery use emulator state with injected transport only', async () => {
  const { pendingRef } = require('../../functions/weeklyActionPending');
  const pending = pendingRef(db, 'duomatches/alert-missing/weeklyActions/missing');
  await pending.set({ sourcePath: 'duomatches/alert-missing/weeklyActions/missing' });
  const run = api.createReconciliationAlertHandler(db, { send: async text => { messages.push(text); }, now: () => time, logger });
  try {
    await assert.rejects(run(), /WEEKLY_RECONCILIATION_FAILED/);
    assert.match(messages[0], /FALHA/);
    await pending.delete();
    await run();
    assert.equal(messages.length, 2);
    assert.match(messages[1], /RECUPERADO/);
    assert.equal((await ref().get()).data().active, false);
  } finally {
    await pending.delete();
    await db.doc('systemJobs/reconcileWeeklyActions').delete();
  }
});
test('deployed scheduled endpoint binds both secret parameters', () => {
  const fn = require('../../functions/index').reconcilePendingWeeklyActions;
  assert.deepEqual(fn.__endpoint.secretEnvironmentVariables.map(s => s.key).sort(), ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID']);
});
