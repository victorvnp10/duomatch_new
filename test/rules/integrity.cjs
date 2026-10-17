const fs = require('fs');
const path = require('path');
const NM = process.env.FIREBASE_TOOLS_NODE_MODULES || '/home/ubuntu/.hermes/tools/firebase-cli/node_modules';
const { initializeTestEnvironment, assertSucceeds, assertFails } = require(NM + '/@firebase/rules-unit-testing');
const { doc, setDoc, updateDoc, getDoc, increment, arrayUnion, deleteField, serverTimestamp, runTransaction, writeBatch } = require(NM + '/firebase/firestore');
const assert = require('node:assert/strict');

module.exports = async ({ env, seed, teste, host, port }) => {
  const before = await initializeTestEnvironment({ projectId: 'demo-duomatch-pre-integrity', firestore: { host, port, rules: fs.readFileSync(path.join(__dirname, 'firestore.pre-integrity.rules'), 'utf8') } });
  const base = { members: ['alice', 'bob'], memberNicknames: { alice: 'A', bob: 'B' }, createdBy: 'alice', invitedUserId: 'bob' };
  const date = '2026-10-12';
  const cycle = { ownerId: 'alice', periods: [{ startDate: '2026-09-01', periodLength: 5 }], cycleLengthOverride: null };
  const a = ['act-normal-1-maratona-de-um-filme-que', 'act-normal-2-recriar-uma-foto-antiga-', 'act-normal-3-passeio-sem-destino', 'act-normal-4-noite-de-detox-digital', 'act-normal-5-montar-uma-playlist-cola'];
  const weekly = { challengeId: 'week-walk', acceptedBy: ['alice'], acceptedAt: new Date(), weekStartDate: date, state: 'in_progress', confirmations: {} };
  let id = 0;
  const fresh = async (target, initial = {}, uid = 'alice') => {
    const key = `integrity-${++id}`;
    await seed(target, db => setDoc(doc(db, 'duomatches', key), { ...base, ...initial }));
    return doc(target.authenticatedContext(uid).firestore(), 'duomatches', key);
  };
  const attack = async (field, label, initial, patch, uid = 'alice') => {
    await teste(`INTEGRIDADE ANTES: ${field} ${label} PASSA`, async () => {
      const ref = await fresh(before, initial, uid);
      await assertSucceeds(updateDoc(ref, patch));
      assert((await getDoc(ref)).exists());
    });
    await teste(`INTEGRIDADE NOVAS: ${field} ${label} NEGADO`, async () => {
      const ref = await fresh(env, initial, uid);
      const previous = (await getDoc(ref)).data();
      await assertFails(updateDoc(ref, patch));
      assert.deepEqual((await getDoc(ref)).data(), previous);
    });
  };
  const legit = async (field, label, initial, fn, uid = 'alice') => teste(`INTEGRIDADE LEGITIMO: ${field} ${label} PERMITIDO`, async () => {
    const ref = await fresh(env, initial, uid);
    await assertSucceeds(fn(ref));
    assert((await getDoc(ref)).exists());
  });
  const group = Number(process.env.INTEGRITY_GROUP || 2);
  console.log('\n=== FASE 7: integridade — baseline local f5f29a9 versus regras novas ===');
  try {
    await attack('streak', 'salto para 999999', { streak: 4 }, { streak: 999999 });
    await attack('streak', 'tipo string', {}, { streak: 'infinito' });
    await attack('intimacyPoints', 'incremento 999999', { intimacyPoints: 3 }, { intimacyPoints: increment(999999) });
    await attack('intimacyPoints', 'redução', { intimacyPoints: 3 }, { intimacyPoints: 2 });
    await attack('messageCount', 'incremento 999999', { messageCount: 3 }, { messageCount: increment(999999) });
    await attack('messageCount', 'tipo string', {}, { messageCount: '999999' });
    await legit('streak', 'primeiro uso e incremento e reinicio', {}, async ref => {
      for (const value of [1, 2, 1]) {
        await runTransaction(ref.firestore, async tx => { await tx.get(ref); tx.update(ref, { streak: value, lastStreakUpdate: date, lastActivity: serverTimestamp() }); });
        assert.equal((await getDoc(ref)).data().streak, value);
      }
    });
    await legit('intimacyPoints', 'increment(1) ausente e existente com atividade atomica', {}, async ref => {
      const batch = writeBatch(ref.firestore);
      batch.set(doc(ref, 'activities', 'hot'), { intimacyPointsAwarded: true });
      batch.update(ref, { intimacyPoints: increment(1) });
      await batch.commit();
      await updateDoc(ref, { intimacyPoints: increment(1) });
      assert.equal((await getDoc(ref)).data().intimacyPoints, 2);
    });
    await legit('messageCount', 'post +1 e exclusao -1', {}, async ref => {
      const batch = writeBatch(ref.firestore);
      batch.set(doc(ref, 'activities', 'chat', 'comments', 'message'), { text: 'oi', authorId: 'alice', createdAt: serverTimestamp() });
      batch.update(ref, { messageCount: increment(1) });
      await batch.commit();
      await updateDoc(ref, { messageCount: increment(-1) });
      assert.equal((await getDoc(ref)).data().messageCount, 0);
    });
    // O cliente atual decrementa mesmo se o contador legado não existir.
    await legit('messageCount', 'exclusao legada sem contador (-1)', {}, ref => updateDoc(ref, { messageCount: increment(-1) }));
    if (group < 2) return;
    await attack('achievements', 'id forjado', { achievements: ['first_activity'] }, { achievements: arrayUnion('fake_badge') });
    await attack('achievements', 'substituicao removendo conquista anterior', { achievements: ['first_activity'] }, { achievements: ['first_match'] });
    await attack('recentActivityIds', 'id forjado', {}, { recentActivityIds: ['evil'] });
    await attack('recentActivityIds', '6 novos ids numa operacao', {}, { recentActivityIds: [...a, 'act-normal-6-cozinhar-o-prato-favorit'] });
    await attack('recentChallengeIds', 'id forjado', {}, { recentChallengeIds: ['evil'] });
    await attack('recentChallengeIds', '2 novos ids numa operacao', {}, { recentChallengeIds: ['week-walk', 'week-movie'] });
    const catalog = fs.readFileSync(path.join(__dirname, '../../src/domain/entities/Achievement.js'), 'utf8');
    const badges = [...catalog.matchAll(/id: "([^"]+)"/g)].map(m => m[1]);
    await legit('achievements', 'multiplas conquistas retroativas e arrayUnion idempotente', { achievements: ['first_activity'] }, async ref => {
      await updateDoc(ref, { achievements: arrayUnion(...badges) });
      await updateDoc(ref, { achievements: arrayUnion(...badges) });
      assert.equal((await getDoc(ref)).data().achievements.length, badges.length);
    });
    await legit('recentActivityIds', '5 sugestoes por geracao e historico preservado', {}, async ref => {
      await updateDoc(ref, { recentActivityIds: arrayUnion(...a) });
      await updateDoc(ref, { recentActivityIds: arrayUnion(...a) });
      assert.deepEqual((await getDoc(ref)).data().recentActivityIds, a);
    });
    await legit('recentChallengeIds', '1 desafio por aceite e historico preservado', {}, async ref => {
      await updateDoc(ref, { recentChallengeIds: arrayUnion('week-walk') });
      await updateDoc(ref, { recentChallengeIds: arrayUnion('week-movie') });
      assert.deepEqual((await getDoc(ref)).data().recentChallengeIds, ['week-walk', 'week-movie']);
    });
    if (group < 3) return;
    await attack('dailySignals', 'valor absurdo', {}, { dailySignals: { date, signals: { alice: 'evil' } } });
    await attack('dailySignals', 'falsificar sinal do parceiro', { dailySignals: { date, signals: { bob: 'resting' } } }, { 'dailySignals.signals.bob': 'willing' });
    await attack('cycleTracking', 'historico 13 periodos', {}, { cycleTracking: { ...cycle, periods: Array(13).fill(cycle.periods[0]) } });
    await attack('cycleTracking', 'duracao absurda', {}, { cycleTracking: { ...cycle, periods: [{ startDate: date, periodLength: 999999 }] } });
    await attack('cycleTracking', 'parceiro altera historico da owner', { cycleTracking: cycle }, { cycleTracking: { ...cycle, periods: [] } }, 'bob');
    await attack('weeklyChallenge', 'valor escalar absurdo', {}, { weeklyChallenge: 999999 });
    await attack('weeklyChallenge', 'substituicao apagando historico', { weeklyChallenge: { [date]: weekly } }, { weeklyChallenge: {} });
    await legit('dailySignals', 'inicializacao, atualizacao e reset de dia antigo', {}, async ref => {
      await updateDoc(ref, { dailySignals: { date, signals: { alice: 'willing' } } });
      await updateDoc(ref, { 'dailySignals.signals.alice': 'unsure' });
      await updateDoc(ref, { dailySignals: { date: '2026-10-13', signals: { alice: 'resting' } } });
      assert.equal((await getDoc(ref)).data().dailySignals.signals.alice, 'resting');
    });
    await legit('dailySignals', 'data futura preserva parceiro', { dailySignals: { date: '2099-01-01', signals: { bob: 'resting' } } }, async ref => {
      await updateDoc(ref, { 'dailySignals.signals.alice': 'willing' });
      assert.equal((await getDoc(ref)).data().dailySignals.signals.bob, 'resting');
    });
    await legit('cycleTracking', 'primeiro registro, correcao e exclusao', {}, async ref => {
      await updateDoc(ref, { cycleTracking: cycle });
      await updateDoc(ref, { cycleTracking: { ...cycle, periods: [{ startDate: date, periodLength: 2.5 }], cycleLengthOverride: 28 } });
      await updateDoc(ref, { cycleTracking: { ...cycle, periods: [] } });
      assert.equal((await getDoc(ref)).data().cycleTracking.periods.length, 0);
    });
    await legit('cycleTracking', 'migracao formato legado', { cycleTracking: { ownerId: 'alice', lastPeriodStart: date, periodLength: 5, cycleLength: 28 } }, ref => updateDoc(ref, { cycleTracking: cycle }));
    await legit('weeklyChallenge', 'aceite, reivindicacao, confirmacao, negacao e nova semana', {}, async ref => {
      await updateDoc(ref, { [`weeklyChallenge.${date}`]: weekly, recentChallengeIds: arrayUnion('week-walk') });
      const claimed = { ...weekly, state: 'pending_confirmations', confirmations: { alice: { claimed: true, claimedAt: new Date(), status: 'pending_partner_confirmation' } } };
      await updateDoc(ref, { [`weeklyChallenge.${date}`]: claimed });
      await updateDoc(ref, { [`weeklyChallenge.${date}`]: { ...claimed, confirmations: { alice: { ...claimed.confirmations.alice, status: 'confirmed', confirmedBy: 'bob', confirmedAt: new Date(), pointsAwarded: 20 } } } });
      await updateDoc(ref, { [`weeklyChallenge.${date}.confirmations.alice.status`]: 'denied' });
      await updateDoc(ref, { 'weeklyChallenge.2026-10-19': { ...weekly, weekStartDate: '2026-10-19' } });
      assert.equal(Object.keys((await getDoc(ref)).data().weeklyChallenge).length, 2);
    });
    await legit('outros campos', 'atualizacao nao relacionada preserva legado invalido', { intimacyPoints: 'legacy', weeklyChallenge: null }, ref => updateDoc(ref, { confirmationTime: '22:30' }));
    for (const field of ['streak', 'intimacyPoints', 'messageCount', 'achievements', 'recentActivityIds', 'recentChallengeIds', 'dailySignals', 'cycleTracking', 'weeklyChallenge']) {
      const values = { streak: 1, intimacyPoints: 1, messageCount: 1, achievements: ['first_activity'], recentActivityIds: a, recentChallengeIds: ['week-walk'], dailySignals: { date, signals: { alice: 'willing' } }, cycleTracking: cycle, weeklyChallenge: { [date]: weekly } };
      await teste(`INTEGRIDADE NOVAS: ${field} deleteField NEGADO`, async () => {
        const ref = await fresh(env, { [field]: values[field] });
        await assertFails(updateDoc(ref, { [field]: deleteField() }));
      });
    }
  } finally { await before.cleanup(); }
};
