const assert = require('node:assert/strict');
const { test } = require('node:test');

test('recordWeeklyProgress real callable handler: sources, auth and idempotent increments', async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, 'emulator required');
  process.env.GCLOUD_PROJECT = 'demo-duomatch-weekly';
  // emulators:exec supplies FIREBASE_CONFIG; isolate Admin SDK fixtures too.
  process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });
  const { recordWeeklyProgress } = require('../../functions/index.js');
  assert.ok(recordWeeklyProgress, 'recordWeeklyProgress callable must exist');
  const functionsRequire = require('node:module').createRequire(require('node:path').resolve(__dirname, '../../functions/package.json'));
  const { getFirestore } = functionsRequire('firebase-admin/firestore');
  const db = getFirestore();
  const today = new Date();
  today.setUTCDate(today.getUTCDate() - (today.getUTCDay() || 7) + 1);
  const weekKey = today.toISOString().slice(0, 10);
  const coupleId = `weekly-${Date.now()}`;
  const ref = db.doc(`duomatches/${coupleId}`);
  await ref.set({ members: ['alice', 'bob'] });
  await db.doc('contentChallenges/week-walk').set({ id: 'week-walk', points: 20, active: true });
  const event = (kind, uid = 'alice', extra = {}) => ({ coupleId, kind,
    eventId: `${extra.weekKey || weekKey}_${kind}_${uid}${['confirm','deny'].includes(kind) ? '_alice' : ''}`,
    payload: { weekKey, challengeId: 'week-walk', ...extra } });
  const call = (data, uid = 'alice') => recordWeeklyProgress.run({ auth: { uid }, data });
  const rejects = code => e => e.code === code;
  await assert.rejects(recordWeeklyProgress.run({ data: event('accept') }), rejects('unauthenticated'));
  await assert.rejects(call(event('accept', 'stranger'), 'stranger'), rejects('permission-denied'));
  await assert.rejects(call(event('claim')), rejects('failed-precondition'));
  await assert.rejects(call(event('accept', 'alice', { challengeId: 'missing' })), rejects('not-found'));
  await assert.rejects(call(event('accept', 'alice', { weekKey: '2000-01-03' })), rejects('invalid-argument'));
  await call(event('accept'));
  await db.doc('contentChallenges/week-other').set({ id: 'week-other', points: 99, active: true });
  const staleAcceptance = await call(event('accept', 'bob', { challengeId: 'week-other' }), 'bob');
  assert.equal(staleAcceptance.challengeData.challengeId, 'week-walk', 'server choice survives a stale client selection');
  await call(event('accept', 'bob'), 'bob');
  await assert.rejects(call(event('confirm', 'bob', { targetUid: 'alice' }), 'bob'), rejects('failed-precondition'));
  await call(event('claim'));
  const confirmation = event('confirm', 'bob', { targetUid: 'alice' });
  await assert.rejects(call(confirmation, 'bob'), rejects('failed-precondition'));
  assert.equal((await ref.collection('weeklyEvents').doc(confirmation.eventId).get()).exists, false);
  assert.equal((await ref.get()).data().weeklyChallenge[weekKey].confirmations.alice.pointsAwarded, undefined);
  await assert.rejects(call({ ...confirmation, payload: { ...confirmation.payload, points: 999999 } }, 'bob'), rejects('invalid-argument'));
  console.log('FORGED_NO_SOURCE rejected failed-precondition');
  const source = ref.collection('weeklyActions').doc(confirmation.eventId);
  await source.set({ weekKey, kind: 'confirm', actorUid: 'bob', targetUid: 'alice', challengeId: 'week-walk' });
  const before = (await ref.get()).data().weeklyChallenge[weekKey].confirmations.alice.pointsAwarded || 0;
  await Promise.all([call(confirmation, 'bob'), call(confirmation, 'bob')]);
  const after = (await ref.get()).data().weeklyChallenge[weekKey].confirmations.alice.pointsAwarded;
  await call(confirmation, 'bob');
  const repeat = (await ref.get()).data().weeklyChallenge[weekKey].confirmations.alice.pointsAwarded;
  console.log('IDEMPOTENCE', JSON.stringify({ before, after, repeat }));
  assert.equal(before, 0); assert.equal(after, 20); assert.equal(repeat, 20);
  assert.equal((await ref.collection('weeklyEvents').doc(confirmation.eventId).get()).data().points, 20);
  await assert.rejects(call({ ...confirmation, eventId: 'another-id' }, 'bob'), rejects('invalid-argument'));
  const other = { ...confirmation, coupleId: `${coupleId}-other` };
  await db.doc(`duomatches/${other.coupleId}`).set({ members: ['alice', 'bob'], weeklyChallenge: (await ref.get()).data().weeklyChallenge });
  await assert.rejects(call(other, 'bob'), rejects('failed-precondition'));
  console.log('FORGED_OTHER_COUPLE_SOURCE rejected failed-precondition');
  await call(event('claim', 'bob'), 'bob');
  const denied = { coupleId, kind: 'deny', eventId: `${weekKey}_deny_alice_bob`,
    payload: { weekKey, challengeId: 'week-walk', targetUid: 'bob' } };
  await ref.collection('weeklyActions').doc(denied.eventId).set({
    weekKey, kind: 'deny', actorUid: 'alice', targetUid: 'bob', challengeId: 'week-walk',
  });
  await call(denied);
  assert.equal((await call(denied)).duplicate, true);
  const deniedState = (await ref.get()).data().weeklyChallenge[weekKey].confirmations;
  assert.equal(deniedState.bob.status, 'denied');
  assert.equal(deniedState.bob.pointsAwarded, undefined);
  assert.equal(deniedState.alice.pointsAwarded, 20);
  console.log('DENIAL_PRESERVES_POINTS', JSON.stringify({ bob: deniedState.bob.status, alice: deniedState.alice.pointsAwarded }));
  await db.terminate();
});
