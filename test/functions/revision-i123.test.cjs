const assert = require('node:assert/strict');
const { test } = require('node:test');
const req = require('node:module').createRequire(require('node:path').resolve(__dirname, '../../functions/package.json'));
const { initializeApp } = req('firebase-admin/app');
const { getFirestore } = req('firebase-admin/firestore');
const { createRecordWeeklyProgressHandler } = require('../../functions/recordWeeklyProgress');
const { createWeeklyActionHandler } = require('../../functions/weeklyAction');

test('revision I1 I2 I3 real Firestore transactions', async t => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST);
  const db = getFirestore(initializeApp({ projectId: 'demo-revision-i123' }, 'revision-i123'));
  const day = new Date(); day.setUTCDate(day.getUTCDate() - (day.getUTCDay() || 7) + 1);
  const weekKey = day.toISOString().slice(0, 10);
  const fixture = async (suffix, week = weekKey) => {
    const ref = db.doc(`duomatches/revision-${suffix}-${Date.now()}`);
    await ref.set({ members: ['alice', 'bob'] });
    await db.doc('contentChallenges/revision').set({ points: 20, active: true });
    const call = createRecordWeeklyProgressHandler(db);
    const request = (kind, uid = 'alice') => ({ auth: { uid }, data: { coupleId: ref.id,
      eventId: `${week}_${kind}_${uid}${kind === 'confirm' ? '_alice' : ''}`, kind,
      payload: { weekKey: week, challengeId: 'revision', ...(kind === 'confirm' ? { targetUid: 'alice' } : {}) } } });
    if (week === weekKey) { await call(request('accept')); await call(request('claim')); }
    else await ref.update({ weeklyChallenge: { [week]: { challengeId: 'revision', weekStartDate: week,
      acceptedBy: ['alice'], confirmations: { alice: { claimed: true } } } } });
    const source = ref.collection('weeklyActions').doc(`${week}_confirm_bob_alice`);
    const persist = () => source.set({ weekKey: week, kind: 'confirm', actorUid: 'bob', targetUid: 'alice', challengeId: 'revision', awardPoints: 20 });
    const delivery = async () => ({ params: { coupleId: ref.id, eventId: source.id }, data: await source.get() });
    return { ref, source, persist, delivery, call, request };
  };
  try {
    await t.test('I1 permanent rejection has durable readable terminal marker and survives replay', async () => {
      const f = await fixture('rejected', '2000-01-03'); await f.persist();
      await createWeeklyActionHandler(db)(await f.delivery());
      const marker = f.ref.collection('weeklyEvents').doc(f.source.id);
      assert.equal((await marker.get()).data()?.status, 'rejected');
      assert.equal((await marker.get()).data().errorCode, 'invalid-argument');
      await createWeeklyActionHandler(db)(await f.delivery());
      assert.equal((await marker.get()).data().status, 'rejected');
    });
    await t.test('I1 failed durable rejection write escapes and later delivery creates terminal receipt', async () => {
      const f = await fixture('rejection-retry', '2000-01-03'); await f.persist();
      let attempts = 0;
      const failingDb = { doc: path => db.doc(path), runTransaction: body => {
        if (++attempts === 2) return Promise.reject(new Error('receipt unavailable'));
        return db.runTransaction(body);
      } };
      await assert.rejects(createWeeklyActionHandler(failingDb)(await f.delivery()), /receipt unavailable/);
      assert.equal((await f.ref.collection('weeklyEvents').doc(f.source.id).get()).exists, false);
      await createWeeklyActionHandler(db)(await f.delivery());
      assert.equal((await f.ref.collection('weeklyEvents').doc(f.source.id).get()).data().status, 'rejected');
    });
    await t.test('I2 replay recovers pre-trigger source after retry expiry preserving createTime and idempotence', async () => {
      const endpoint = require('../../functions/index').reconcilePendingWeeklyActions.__endpoint;
      assert.equal(endpoint.scheduleTrigger.schedule, 'every 30 minutes');
      assert.equal(endpoint.timeoutSeconds, 540);
      const f = await fixture('replay'); await f.persist();
      const created = (await f.source.get()).createTime;
      const { reconcileWeeklyActions } = require('../../functions/reconcileWeeklyActions');
      const OriginalDate = Date;
      global.Date = class extends OriginalDate { constructor(...args) { super(...(args.length ? args : [OriginalDate.now() + 8 * 86400000])); } };
      // Pre-trigger origins are covered by explicit administrative replay;
      // scheduled reconciliation now reads only the derived pending index.
      try { await reconcileWeeklyActions(db, { replay: true }); await reconcileWeeklyActions(db, { replay: true }); }
      finally { global.Date = OriginalDate; }
      assert.ok((await f.source.get()).createTime.isEqual(created));
      assert.equal((await f.ref.get()).data().weeklyChallenge[weekKey].confirmations.alice.pointsAwarded, 20);
      assert.equal((await f.ref.collection('weeklyEvents').get()).size, 3);
    });
    await t.test('I2 administrative CLI dry-run then apply twice preserves source and round', async () => {
      const f = await fixture('cli'); await f.persist();
      const round = f.ref.collection('rounds').doc('r'); await round.set({ scores: { alice: 20 } });
      const created = (await f.source.get()).createTime;
      const { spawnSync } = require('node:child_process');
      const cli = apply => {
        const result = spawnSync(process.execPath, ['functions/replayWeeklyActions.js', '--project', 'demo-revision-i123', '--couple', f.ref.id, ...(apply ? ['--apply'] : [])], { encoding: 'utf8', cwd: require('node:path').resolve(__dirname, '../..'), env: process.env });
        console.log(result.stdout, result.stderr);
        assert.equal(result.status, 0);
        return result.stdout;
      };
      assert.match(cli(false), /"pending":1/);
      assert.equal((await f.ref.get()).data().weeklyChallenge[weekKey].confirmations.alice.pointsAwarded, undefined);
      assert.match(cli(true), /"processed":1/);
      assert.match(cli(true), /"pending":0/);
      assert.ok((await f.source.get()).createTime.isEqual(created));
      assert.equal((await round.get()).data().scores.alice, 20);
      assert.equal((await f.ref.get()).data().weeklyChallenge[weekKey].confirmations.alice.pointsAwarded, 20);
    });
    await t.test('I2 CLI rejects missing scope and unknown arguments before touching Firestore', () => {
      const { spawnSync } = require('node:child_process');
      for (const args of [['--project', 'demo-revision-i123', '--couple'], ['--apply'], ['--project', 'demo-revision-i123', 'typo']]) {
        const result = spawnSync(process.execPath, ['functions/replayWeeklyActions.js', ...args], { encoding: 'utf8', cwd: require('node:path').resolve(__dirname, '../..'), env: process.env });
        assert.notEqual(result.status, 0, `must reject ${args.join(' ')}`);
      }
    });
    await t.test('I2 paginated reconciliation surfaces transient failure then recovers on next sweep', async () => {
      const f = await fixture('sweep'); await f.persist();
      const { reconcileWeeklyActions } = require('../../functions/reconcileWeeklyActions');
      const failingDb = { doc: path => db.doc(path), runTransaction: () => Promise.reject(new Error('simulated unavailable')) };
      await assert.rejects(reconcileWeeklyActions(failingDb, { coupleId: f.ref.id, pageSize: 1 }), /WEEKLY_RECONCILIATION_FAILED/);
      assert.equal((await f.ref.collection('weeklyEvents').doc(f.source.id).get()).exists, false);
      assert.equal((await reconcileWeeklyActions(db, { coupleId: f.ref.id, pageSize: 1 })).processed, 1);
      assert.equal((await reconcileWeeklyActions(db, { coupleId: f.ref.id, pageSize: 1 })).pending, 0);
    });
    await t.test('I3 bound legacy origin survives a later acceptance migration with a new catalog value', async () => {
      const f = await fixture('legacy');
      await f.ref.update({ [`weeklyChallenge.${weekKey}.awardPoints`]: req('firebase-admin/firestore').FieldValue.delete() });
      await f.persist();
      await db.doc('contentChallenges/revision').update({ points: 99 });
      await f.call(f.request('accept', 'bob'));
      assert.equal((await f.ref.get()).data().weeklyChallenge[weekKey].awardPoints, 99);
      await createWeeklyActionHandler(db)(await f.delivery());
      assert.equal((await f.ref.get()).data().weeklyChallenge[weekKey].confirmations.alice.pointsAwarded, 20);
    });
    await t.test('I3 accepted authoritative points survive catalog edit and removal before consumption', async () => {
      const f = await fixture('points');
      assert.equal((await f.ref.get()).data().weeklyChallenge[weekKey].awardPoints, 20);
      await f.persist();
      await db.doc('contentChallenges/revision').set({ points: 99, active: true });
      await db.doc('contentChallenges/revision').delete();
      await createWeeklyActionHandler(db)(await f.delivery());
      assert.equal((await f.ref.get()).data().weeklyChallenge[weekKey].confirmations.alice.pointsAwarded, 20);
      assert.equal((await f.ref.collection('weeklyEvents').doc(f.source.id).get()).data().points, 20);
    });
  } finally { await db.terminate(); }
});
