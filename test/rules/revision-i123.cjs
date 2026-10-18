const assert = require('node:assert/strict');
const NM = process.env.FIREBASE_TOOLS_NODE_MODULES || '/home/ubuntu/.hermes/tools/firebase-cli/node_modules';
const { assertFails } = require(NM + '/@firebase/rules-unit-testing');
const { doc, setDoc, getDoc, writeBatch, increment } = require(NM + '/firebase/firestore');
module.exports = async ({ env, seed, teste }) => {
  for (const [label, week, points] of [
    ['I1 stale source created after rollover cannot award round score', 'previous', 20],
    ['I3 source cannot override authoritative accepted points', null, 99],
  ]) await teste(label, async () => {
    const now = new Date(); now.setUTCDate(now.getUTCDate() - (now.getUTCDay() || 7) + 1);
    if (week) now.setUTCDate(now.getUTCDate() - 7);
    const weekKey = now.toISOString().slice(0, 10);
    const id = `revision-${week || 'points'}`;
    await seed(env, async db => {
      await setDoc(doc(db, 'duomatches', id), { members: ['alice', 'bob'], weeklyChallenge: {
        [weekKey]: { challengeId: 'week-walk', awardPoints: 20, confirmations: { alice: { claimed: true } } },
      } });
      await setDoc(doc(db, 'duomatches', id, 'rounds', 'r'), { scores: { alice: 0 } });
    });
    const db = env.authenticatedContext('bob').firestore();
    const source = doc(db, 'duomatches', id, 'weeklyActions', `${weekKey}_confirm_bob_alice`);
    const round = doc(db, 'duomatches', id, 'rounds', 'r');
    const batch = writeBatch(db);
    batch.set(source, { weekKey, kind: 'confirm', actorUid: 'bob', targetUid: 'alice', challengeId: 'week-walk', awardPoints: points });
    batch.update(round, { 'scores.alice': increment(points) });
    await assertFails(batch.commit());
    assert.equal((await getDoc(source)).exists(), false);
    assert.equal((await getDoc(round)).data().scores.alice, 0);
  });
  // Deterministic server-clock boundaries: replace request.time only in an
  // isolated rules test environment, never in the deployed rules file.
  const { initializeTestEnvironment, assertSucceeds } = require(NM + '/@firebase/rules-unit-testing');
  const rules = require('node:fs').readFileSync(require('node:path').resolve(__dirname, '../../firestore.rules'), 'utf8');
  for (const [index, iso, allowed] of [
    [0, '2026-10-18T12:00:00Z', ['2026-10-12', '2026-10-19']],
    [1, '2026-10-19T00:00:00Z', ['2026-10-12', '2026-10-19']],
    [2, '2026-10-19T12:00:00Z', ['2026-10-19']],
  ]) await teste(`I1 server week boundary ${iso} accepts only inhabited-offset weeks`, async () => {
    const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(':');
    const fixed = await initializeTestEnvironment({ projectId: `demo-revision-clock-${index}`, firestore: {
      host, port: Number(port), rules: rules.replaceAll('request.time', `timestamp.value(${new Date(iso).getTime()})`),
    } });
    try {
      await fixed.clearFirestore();
      for (const weekKey of ['2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26']) {
        await seed(fixed, db => setDoc(doc(db, 'duomatches', 'boundary'), { members: ['alice', 'bob'], weeklyChallenge: {
          [weekKey]: { challengeId: 'week-walk', awardPoints: 20, confirmations: { alice: { claimed: true } } },
        } }));
        const db = fixed.authenticatedContext('bob').firestore();
        const source = doc(db, 'duomatches', 'boundary', 'weeklyActions', `${weekKey}_confirm_bob_alice`);
        const operation = setDoc(source, { weekKey, kind: 'confirm', actorUid: 'bob', targetUid: 'alice', challengeId: 'week-walk', awardPoints: 20 });
        await (allowed.includes(weekKey) ? assertSucceeds(operation) : assertFails(operation));
      }
    } finally { await fixed.cleanup(); }
  });
};
