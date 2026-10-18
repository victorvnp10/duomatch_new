const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createRequire } = require('node:module');
const req = createRequire(require('node:path').resolve(__dirname, '../../functions/package.json'));
const { initializeApp } = req('firebase-admin/app');
const { getFirestore } = req('firebase-admin/firestore');
const { createRecordWeeklyProgressHandler } = require('../../functions/recordWeeklyProgress');

// These tests exercise the real transaction handler against Firestore, not an API mock.
test('durable delivery, first persisted decision, retry and week rollover', async t => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, 'emulator required');
  const app = initializeApp({ projectId: 'demo-weekly-durability' }, 'durability');
  const db = getFirestore(app);
  const originalDate = Date;
  const now = new Date();
  const monday = new Date(now); monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() || 7) + 1);
  const weekKey = monday.toISOString().slice(0, 10);
  await db.doc('contentChallenges/durable').set({ points: 20, active: true });
  const fixture = async suffix => {
    const ref = db.doc(`duomatches/durable-${suffix}-${originalDate.now()}`);
    await ref.set({ members: ['alice', 'bob'], weeklyChallenge: { [weekKey]: {
      challengeId: 'durable', weekStartDate: weekKey, acceptedBy: ['alice', 'bob'],
      confirmations: { alice: { claimed: true, status: 'pending_partner_confirmation' } },
    } } });
    const source = kind => ref.collection('weeklyActions').doc(`${weekKey}_${kind}_bob_alice`);
    const persist = kind => source(kind).set({ kind, actorUid: 'bob', targetUid: 'alice', weekKey, challengeId: 'durable' });
    const event = kind => ({ auth: { uid: 'bob' }, data: { coupleId: ref.id,
      kind, eventId: source(kind).id, payload: { weekKey, challengeId: 'durable', targetUid: 'alice' } } });
    const state = async () => (await ref.get()).data().weeklyChallenge[weekKey].confirmations.alice;
    return { ref, source, persist, event, state };
  };
  try {
    await t.test('first persisted deny wins even if confirm is delivered first and deny replayed', async () => {
      const f = await fixture('conflict');
      await f.persist('deny'); await f.persist('confirm'); // legacy/Admin sources: reverse delivery
      const handler = createRecordWeeklyProgressHandler(db);
      await handler(f.event('confirm')); await handler(f.event('deny')); await handler(f.event('deny'));
      assert.equal((await f.state()).status, 'denied');
      assert.equal((await f.state()).pointsAwarded, undefined);
      assert.equal((await f.ref.collection('weeklyEvents').doc(f.source('confirm').id).get()).data().ignored, true);
    });
    await t.test('source committed now recovers after next week, but a retroactive source is rejected', async () => {
      const f = await fixture('rollover'); await f.persist('confirm');
      const { createWeeklyActionHandler } = require('../../functions/weeklyAction');
      const delivery = { params: { coupleId: f.ref.id, eventId: f.source('confirm').id }, data: await f.source('confirm').get() };
      global.Date = class extends originalDate { constructor(...args) { super(...(args.length ? args : [now.getTime() + 8 * 86400000])); } };
      try { await createWeeklyActionHandler(db)(delivery); }
      finally { global.Date = originalDate; }
      assert.equal((await f.state()).pointsAwarded, 20);
      const bad = await fixture('retro');
      const oldWeek = '2000-01-03';
      await bad.ref.update({ [`weeklyChallenge.${oldWeek}`]: (await bad.ref.get()).data().weeklyChallenge[weekKey] });
      const id = `${oldWeek}_confirm_bob_alice`;
      await bad.ref.collection('weeklyActions').doc(id).set({ kind: 'confirm', actorUid: 'bob', targetUid: 'alice', weekKey: oldWeek, challengeId: 'durable' });
      const e = bad.event('confirm'); e.data.eventId = id; e.data.payload.weekKey = oldWeek;
      await assert.rejects(createRecordWeeklyProgressHandler(db)(e), error => error.code === 'invalid-argument');
    });
    await t.test('exported trigger retries transient failures; replay shares callable marker', async () => {
      const { createWeeklyActionHandler, weeklyActionOptions } = require('../../functions/weeklyAction');
      assert.equal(weeklyActionOptions.retry, true);
      const exported = require('../../functions/index').consumeWeeklyAction;
      assert.equal(exported.__endpoint.eventTrigger.retry, true);
      assert.equal(exported.__endpoint.eventTrigger.eventFilterPathPatterns.document, weeklyActionOptions.document);
      assert.equal(exported.__endpoint.eventTrigger.eventType, 'google.cloud.firestore.document.v1.created');
      const f = await fixture('retry'); await f.persist('confirm');
      let attempts = 0;
      const failingDb = { doc: path => db.doc(path), runTransaction: body => {
        if (++attempts === 1) return Promise.reject(new Error('transient outage after source commit'));
        return db.runTransaction(body);
      } };
      const consume = createWeeklyActionHandler(failingDb);
      const event = { params: { coupleId: f.ref.id, eventId: f.source('confirm').id }, data: await f.source('confirm').get() };
      // Deterministic platform delivery driver: never calls the client or callable.
      await assert.rejects(consume(event), /transient outage/);
      if (weeklyActionOptions.retry) await consume(event);
      assert.equal((await f.state()).pointsAwarded, 20);
      await consume(event);
      assert.equal((await createRecordWeeklyProgressHandler(db)(f.event('confirm'))).duplicate, true);
      assert.equal((await f.state()).pointsAwarded, 20);
      assert.equal((await f.ref.collection('weeklyEvents').get()).size, 1);
      assert.equal(attempts, 3);
    });
  } finally { global.Date = originalDate; await db.terminate(); }
});
