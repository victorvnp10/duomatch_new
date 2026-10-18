const assert = require('node:assert/strict');
const { test } = require('node:test');
const req = require('node:module').createRequire(require('node:path').resolve(__dirname, '../../functions/package.json'));
const { initializeApp } = req('firebase-admin/app');
const { getFirestore } = req('firebase-admin/firestore');
const { reconcileWeeklyActions, LIMITS } = require('../../functions/reconcileWeeklyActions');
const { createWeeklyActionHandler } = require('../../functions/weeklyAction');
const { createRecordWeeklyProgressHandler } = require('../../functions/recordWeeklyProgress');
const queueId = path => Buffer.from(path).toString('base64url');

test('bounded resumable pending index against real Firestore', async t => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, 'emulator required');
  const db = getFirestore(initializeApp({ projectId: 'demo-bounded-reconcile' }, 'bounded'));
  const day = new Date(); day.setUTCDate(day.getUTCDate() - (day.getUTCDay() || 7) + 1);
  const weekKey = day.toISOString().slice(0, 10);
  const state = db.doc('systemJobs/reconcileWeeklyActions');
  const queue = db.collection('weeklyActionPending');
  const fixture = async name => {
    const ref = db.doc(`duomatches/${name}`);
    await ref.set({ members: ['alice', 'bob'], weeklyChallenge: { [weekKey]: {
      challengeId: 'bounded', weekStartDate: weekKey, awardPoints: 20, acceptedBy: ['alice'],
      confirmations: { alice: { claimed: true } },
    } } });
    const source = ref.collection('weeklyActions').doc(`${weekKey}_confirm_bob_alice`);
    await source.create({ kind: 'confirm', actorUid: 'bob', targetUid: 'alice', weekKey, challengeId: 'bounded', awardPoints: 20 });
    const pending = queue.doc(queueId(source.path));
    const seed = () => pending.set({ sourcePath: source.path });
    const event = { params: { coupleId: ref.id, eventId: source.id }, data: await source.get() };
    const request = { auth: { uid: 'bob' }, data: { coupleId: ref.id, eventId: source.id, kind: 'confirm', payload: { weekKey, challengeId: 'bounded', targetUid: 'alice' } } };
    return { ref, source, pending, seed, event, request };
  };
  const failCouple = path => new Proxy(db, { get(target, key) {
    if (key === 'runTransaction') return body => target.runTransaction(tx => body(new Proxy(tx, { get(transaction, method) {
      if (method === 'get') return ref => ref.path === path ? Promise.reject(new Error('injected business outage')) : transaction.get(ref);
      const value = transaction[method]; return typeof value === 'function' ? value.bind(transaction) : value;
    } })));
    const value = target[key]; return typeof value === 'function' ? value.bind(target) : value;
  } });
  const nextProcessCycle = () => {
    const { spawnSync } = require('node:child_process');
    const script = `const req=require('node:module').createRequire(require('node:path').resolve('functions/package.json'));
      const {initializeApp}=req('firebase-admin/app');
      const {getFirestore}=req('firebase-admin/firestore');
      const {reconcileWeeklyActions}=require('./functions/reconcileWeeklyActions');
      const db=getFirestore(initializeApp({projectId:'demo-bounded-reconcile'}));
      reconcileWeeklyActions(db,{pageSize:1,maxPages:1}).catch(e=>{console.error(e);process.exitCode=1}).finally(()=>db.terminate());`;
    const result = spawnSync(process.execPath, ['-e', script], { encoding: 'utf8', env: process.env,
      cwd: require('node:path').resolve(__dirname, '../..') });
    console.log('FRESH_PROCESS_CYCLE', result.stdout, result.stderr);
    assert.equal(result.status, 0);
    return JSON.parse(result.stdout.match(/WEEKLY_RECONCILIATION_SUMMARY (\{[^\n]+\})/)[1]);
  };
  const reset = async () => { await db.recursiveDelete(queue); await state.delete(); await db.recursiveDelete(db.collection('duomatches')); };
  try {
    await db.doc('contentChallenges/bounded').set({ active: true, points: 20 });
    await t.test('onCreate registers before processing; failure retains pending, terminal receipt removes it', async () => {
      await reset(); const f = await fixture('registration');
      await assert.rejects(createWeeklyActionHandler(failCouple(f.ref.path), { indexPending: true })(f.event), /injected business outage/);
      assert.equal((await f.pending.get()).data()?.sourcePath, f.source.path);
      await createWeeklyActionHandler(db, { indexPending: true })(f.event);
      assert.equal((await f.pending.get()).exists, false);
      await createWeeklyActionHandler(db, { indexPending: true })(f.event);
      assert.equal((await f.pending.get()).exists, false);
      assert.equal((await f.ref.get()).data().weeklyChallenge[weekKey].confirmations.alice.pointsAwarded, 20);
    });
    await t.test('cursor resumes after failed first page, bounds cycles, wraps without starving retained work', async () => {
      await reset();
      const fixtures = await Promise.all(['a', 'b', 'c'].map(fixture));
      fixtures.sort((a, b) => a.pending.id.localeCompare(b.pending.id, 'en', { sensitivity: 'variant' }));
      // Use Firestore order itself rather than locale ordering.
      for (const f of fixtures) await f.seed();
      const ordered = (await queue.orderBy('__name__').get()).docs;
      const [first, second, third] = ordered.map(d => fixtures.find(f => f.pending.id === d.id));
      await assert.rejects(reconcileWeeklyActions(failCouple(first.ref.path), { pageSize: 1, maxPages: 1 }), /WEEKLY_RECONCILIATION_FAILED/);
      assert.equal((await state.get()).data().cursor, first.pending.id);
      assert.equal((await queue.get()).size, 3);
      const next = nextProcessCycle();
      assert.equal(next.scanned, 1); assert.equal(next.processed, 1); assert.equal(next.pages, 1);
      assert.equal((await state.get()).data().cursor, second.pending.id);
      assert.equal((await first.pending.get()).exists, true, 'retained failed origin must not be retried before cursor wraps');
      assert.equal((await second.pending.get()).exists, false);
      assert.equal((await third.pending.get()).exists, true, 'ceiling leaves rest for next invocation');
      const last = nextProcessCycle();
      assert.equal(last.processed, 1); assert.equal((await state.get()).data().cursor, third.pending.id);
      const wrap = await reconcileWeeklyActions(db, { pageSize: 1, maxPages: 1 });
      assert.equal(wrap.scanned, 0); assert.equal((await state.get()).data().cursor, null);
      assert.equal((await reconcileWeeklyActions(db, { pageSize: 1, maxPages: 1 })).processed, 1);
      assert.equal((await queue.get()).size, 0);
      for (const f of fixtures) assert.equal((await f.ref.get()).data().weeklyChallenge[weekKey].confirmations.alice.pointsAwarded, 20);
      console.log('PROOF_CURSOR_LIMIT: persisted cursor advanced through exact ordered keys; failed work retained until wrap; one page per cycle; all points exactly 20');
    });
    await t.test('production default page ceiling leaves the excess entry for next cycle', async () => {
      await reset();
      const ceiling = LIMITS.pageSize * LIMITS.maxPages;
      const fixtures = await Promise.all(Array.from({ length: ceiling + 1 }, (_, i) => fixture(`ceiling-${String(i).padStart(3, '0')}`)));
      await Promise.all(fixtures.map(f => f.seed()));
      const cycle = await reconcileWeeklyActions(db);
      assert.equal(cycle.pages, LIMITS.maxPages); assert.equal(cycle.scanned, ceiling); assert.equal(cycle.processed, ceiling);
      assert.equal((await queue.get()).size, 1);
      const next = await reconcileWeeklyActions(db);
      assert.equal(next.scanned, 1); assert.equal(next.processed, 1); assert.equal((await queue.get()).size, 0);
      console.log('PROOF_DEFAULT_CEILING', JSON.stringify({ seeded: fixtures.length, firstCycle: cycle, nextCycle: next, remaining: (await queue.get()).size }));
      for (const f of fixtures) {
        assert.equal((await f.ref.collection('weeklyEvents').get()).size, 1);
        assert.equal((await f.ref.get()).data().weeklyChallenge[weekKey].confirmations.alice.pointsAwarded, 20);
      }
    });
    await t.test('SIGKILL after committed checkpoint resumes in a fresh process after lease expiry', async () => {
      await reset(); const a = await fixture('crash-a'); const b = await fixture('crash-b'); await a.seed(); await b.seed();
      const firstId = (await queue.orderBy('__name__').limit(1).get()).docs[0].id;
      const { spawnSync } = require('node:child_process');
      const script = `const req=require('node:module').createRequire(require('node:path').resolve('functions/package.json'));
        const {initializeApp}=req('firebase-admin/app'); const {getFirestore}=req('firebase-admin/firestore');
        const {reconcileWeeklyActions}=require('./functions/reconcileWeeklyActions');
        const db=getFirestore(initializeApp({projectId:'demo-bounded-reconcile'}));
        const run=db.runTransaction.bind(db);
        db.runTransaction=(...args)=>run(...args).then(async result=>{
          const state=(await db.doc('systemJobs/reconcileWeeklyActions').get()).data();
          if(state?.cursor) process.kill(process.pid,'SIGKILL');
          return result;
        });
        reconcileWeeklyActions(db,{pageSize:1,maxPages:2}).catch(e=>{console.error(e);process.exitCode=1}).finally(()=>db.terminate());`;
      const result = spawnSync(process.execPath, ['-e', script], { encoding: 'utf8', env: process.env,
        cwd: require('node:path').resolve(__dirname, '../..') });
      assert.equal(result.signal, 'SIGKILL');
      const checkpoint = (await state.get()).data();
      assert.equal(checkpoint.cursor, firstId); assert.ok(checkpoint.leaseUntil > Date.now());
      assert.equal((await queue.get()).size, 1);
      // Simulate expiration instead of sleeping for the lease's real lifetime.
      await state.update({ leaseUntil: 0 });
      assert.equal(nextProcessCycle().processed, 1);
      assert.equal((await queue.get()).size, 0);
      for (const f of [a, b]) {
        assert.equal((await f.ref.collection('weeklyEvents').get()).size, 1);
        assert.equal((await f.ref.get()).data().weeklyChallenge[weekKey].confirmations.alice.pointsAwarded, 20);
      }
      console.log('PROOF_HARD_CRASH: child killed with SIGKILL after persisted checkpoint; fresh process resumed remaining item; each origin has one receipt and 20 points');
    });
    await t.test('time budget yields before next source and resumes; dry-run never advances shared state', async () => {
      await reset(); const a = await fixture('time-a'); const b = await fixture('time-b'); await a.seed(); await b.seed();
      let clock = 0;
      const result = await reconcileWeeklyActions(db, { pageSize: 2, maxPages: 2, maxDurationMs: 10, now: () => (clock++ < 2 ? 0 : 11) });
      assert.equal(result.scanned, 1); assert.equal((await queue.get()).size, 1);
      const before = (await state.get()).data();
      const preview = await reconcileWeeklyActions(db, { dryRun: true });
      assert.equal(preview.scanned, 2); assert.deepEqual((await state.get()).data(), before);
      assert.equal((await reconcileWeeklyActions(db)).processed, 1);
    });
    await t.test('scheduler reads pending index only, even with large terminal history; concurrent paths award once', async () => {
      await reset(); const f = await fixture('race'); await f.seed();
      for (let i = 0; i < 30; i++) {
        const ref = db.doc(`duomatches/history/weeklyActions/old-${i}`);
        await ref.set({ weekKey: '2000-01-03' });
        await db.doc(`duomatches/history/weeklyEvents/old-${i}`).set({ status: 'rejected', points: 0 });
      }
      const creationTime = (await f.source.get()).createTime;
      await Promise.all([reconcileWeeklyActions(db), createWeeklyActionHandler(db, { indexPending: true })(f.event), createRecordWeeklyProgressHandler(db)(f.request)]);
      assert.equal((await f.ref.get()).data().weeklyChallenge[weekKey].confirmations.alice.pointsAwarded, 20);
      assert.equal((await f.ref.collection('weeklyEvents').get()).size, 1);
      assert.equal((await queue.get()).size, 0);
      assert.equal((await reconcileWeeklyActions(db)).scanned, 0);
      assert.ok((await f.source.get()).createTime.isEqual(creationTime));
      console.log('PROOF_RACE_HISTORY: trigger/callable/scanner concurrent, one marker, points=20, terminal historical origins not scanned');
    });
    await t.test('active lease excludes overlapping cycle and stale lease resumes checkpoint', async () => {
      await reset(); const f = await fixture('lease'); await f.seed();
      await state.set({ cursor: null, leaseOwner: 'other', leaseUntil: Date.now() + 60000 });
      assert.equal((await reconcileWeeklyActions(db)).busy, true);
      assert.equal((await f.pending.get()).exists, true);
      await state.update({ leaseUntil: 0 });
      assert.equal((await reconcileWeeklyActions(db)).processed, 1);
    });
  } finally { await db.terminate(); }
});
