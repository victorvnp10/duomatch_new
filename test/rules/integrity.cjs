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
  const group = Number(process.env.INTEGRITY_GROUP || 3);
  console.log('\n=== FASE 7: integridade — baseline local f5f29a9 versus regras novas ===');
  try {
    // Server-owned catalog membership is checked with exists(), not an id list.
    const { ACTIVITY_CATALOG, CHALLENGE_CATALOG } = await import('../../src/infrastructure/seed/contentCatalog.js');
    await seed(env, async db => {
      const batch = writeBatch(db);
      ACTIVITY_CATALOG.filter(item => a.includes(item.id) || item.id === 'act-normal-6-cozinhar-o-prato-favorit')
        .forEach(item => batch.set(doc(db, 'contentActivities', item.id), item));
      CHALLENGE_CATALOG.filter(item => ['week-walk', 'week-movie'].includes(item.id))
        .forEach(item => batch.set(doc(db, 'contentChallenges', item.id), item));
      await batch.commit();
    });
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
    await legit('recentActivityIds', 'novo id publicado só no servidor dispensa allowlist', {}, async ref => {
      await seed(env, db => setDoc(doc(db, 'contentActivities', 'server-only-activity'), { id: 'server-only-activity' }));
      await updateDoc(ref, { recentActivityIds: arrayUnion('server-only-activity') });
      assert.deepEqual((await getDoc(ref)).data().recentActivityIds, ['server-only-activity']);
    });
    await legit('recentChallengeIds', 'novo id publicado só no servidor dispensa allowlist', {}, async ref => {
      await seed(env, db => setDoc(doc(db, 'contentChallenges', 'server-only-challenge'), { id: 'server-only-challenge' }));
      await updateDoc(ref, { recentChallengeIds: arrayUnion('server-only-challenge') });
      assert.deepEqual((await getDoc(ref)).data().recentChallengeIds, ['server-only-challenge']);
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
    await teste('WEEKLY SERVER: aceite/reivindicacao/confirmacao/negacao/nova semana diretos NEGADOS', async () => {
      const ref = await fresh(env, { weeklyChallenge: { [date]: weekly } });
      for (const patch of [
        { [`weeklyChallenge.${date}`]: { ...weekly, acceptedBy: ['alice', 'bob'] }, recentChallengeIds: arrayUnion('week-walk') },
        { [`weeklyChallenge.${date}.state`]: 'pending_confirmations' },
        { [`weeklyChallenge.${date}.confirmations.alice`]: { claimed: true, status: 'confirmed', pointsAwarded: 20 } },
        { [`weeklyChallenge.${date}.confirmations.alice.status`]: 'denied' },
        { 'weeklyChallenge.2026-10-19': { ...weekly, weekStartDate: '2026-10-19' } },
      ]) await assertFails(updateDoc(ref, patch));
      assert.deepEqual((await getDoc(ref)).data().weeklyChallenge[date].acceptedBy, ['alice']);
    });
    for (const field of ['streak', 'intimacyPoints', 'messageCount']) {
      await legit(field, 'inicializacao de campo legado null', { [field]: null }, ref => updateDoc(ref, { [field]: field === 'streak' ? 1 : increment(1) }));
    }
    for (const [field, value] of [['achievements', 'first_activity'], ['recentActivityIds', a[0]], ['recentChallengeIds', 'week-walk']]) {
      await legit(field, 'arrayUnion sobre campo legado null', { [field]: null }, ref => updateDoc(ref, { [field]: arrayUnion(value) }));
    }
    await legit('dailySignals', 'segundo parceiro adiciona sinal sem apagar primeiro', { dailySignals: { date, signals: { alice: 'willing' } } }, async ref => {
      await updateDoc(ref, { 'dailySignals.signals.bob': 'unsure' });
      assert.deepEqual((await getDoc(ref)).data().dailySignals.signals, { alice: 'willing', bob: 'unsure' });
    }, 'bob');
    await legit('cycleTracking', 'limite real de 12 entradas', {}, ref => updateDoc(ref, { cycleTracking: { ...cycle, periods: Array.from({ length: 12 }, (_, i) => ({ startDate: `2025-${String(i + 1).padStart(2, '0')}-01`, periodLength: 5 })) } }));
    await teste('WEEKLY SERVER: pontos internos forjados NEGADOS', async () => {
      const ref = await fresh(env, { weeklyChallenge: { [date]: weekly } });
      await assertFails(updateDoc(ref, { [`weeklyChallenge.${date}.confirmations.alice`]: { status: 'confirmed', pointsAwarded: 999999 } }));
      assert.equal((await getDoc(ref)).data().weeklyChallenge[date].confirmations.alice, undefined);
    });
    await teste('WEEKLY SERVER: marcadores nao podem ser criados, alterados ou apagados pelo membro', async () => {
      const ref = await fresh(env);
      const marker = doc(ref, 'weeklyEvents', 'event');
      await assertFails(setDoc(marker, { points: 999999 }));
      await seed(env, db => setDoc(doc(db, marker.path), { points: 20 }));
      await assertSucceeds(getDoc(marker));
      await assertFails(updateDoc(marker, { points: 999999 }));
      await assertFails(require(NM + '/firebase/firestore').deleteDoc(marker));
    });
    await teste('WEEKLY SERVER: origem exige claim e autor correto; imutavel; scores de rodada permitidos', async () => {
      const initial = { ...weekly, confirmations: { alice: { claimed: true, status: 'pending_partner_confirmation' } } };
      const ref = await fresh(env, { weeklyChallenge: { [date]: initial } }, 'bob');
      const action = { weekKey: date, kind: 'confirm', actorUid: 'bob', targetUid: 'alice', challengeId: 'week-walk' };
      const source = doc(ref, 'weeklyActions', `${date}_confirm_bob_alice`);
      const round = doc(ref, 'rounds', 'active');
      await seed(env, db => setDoc(doc(db, round.path), { scores: { alice: 0 } }));
      const batch = writeBatch(ref.firestore);
      batch.set(source, action); batch.update(round, { 'scores.alice': increment(20) });
      await assertSucceeds(batch.commit());
      assert.equal((await getDoc(round)).data().scores.alice, 20);
      await assertFails(updateDoc(source, { kind: 'deny' }));
      await assertFails(require(NM + '/firebase/firestore').deleteDoc(source));
      await assertFails(setDoc(doc(ref, 'weeklyActions', `${date}_confirm_alice_bob`), { ...action, actorUid: 'alice', targetUid: 'bob' }));
      const noClaim = await fresh(env, { weeklyChallenge: { [date]: weekly } }, 'bob');
      await assertFails(setDoc(doc(noClaim, 'weeklyActions', `${date}_confirm_bob_alice`), action));
    });
    // Opposite sources cannot coexist even in one atomic batch. The round
    // write stays atomic and rolls back with a rejected stale confirmation.
    await teste('WEEKLY ORDER: deny first rejects late confirm and its round award', async () => {
      const initial = { ...weekly, confirmations: { alice: { claimed: true, status: 'pending_partner_confirmation' } } };
      const ref = await fresh(env, { weeklyChallenge: { [date]: initial } }, 'bob');
      const action = { weekKey: date, actorUid: 'bob', targetUid: 'alice', challengeId: 'week-walk' };
      await setDoc(doc(ref, 'weeklyActions', `${date}_deny_bob_alice`), { ...action, kind: 'deny' });
      const round = doc(ref, 'rounds', 'active');
      await seed(env, db => setDoc(doc(db, round.path), { scores: { alice: 0 } }));
      const batch = writeBatch(ref.firestore);
      batch.set(doc(ref, 'weeklyActions', `${date}_confirm_bob_alice`), { ...action, kind: 'confirm' });
      batch.update(round, { 'scores.alice': increment(20) });
      await assertFails(batch.commit());
      assert.equal((await getDoc(round)).data().scores.alice, 0);
    });
    await teste('WEEKLY ORDER: confirm first rejects late deny', async () => {
      const initial = { ...weekly, confirmations: { alice: { claimed: true } } };
      const ref = await fresh(env, { weeklyChallenge: { [date]: initial } }, 'bob');
      const action = { weekKey: date, actorUid: 'bob', targetUid: 'alice', challengeId: 'week-walk' };
      await setDoc(doc(ref, 'weeklyActions', `${date}_confirm_bob_alice`), { ...action, kind: 'confirm' });
      await assertFails(setDoc(doc(ref, 'weeklyActions', `${date}_deny_bob_alice`), { ...action, kind: 'deny' }));
    });
    await teste('WEEKLY ORDER: opposing sources in one batch are both rejected', async () => {
      const initial = { ...weekly, confirmations: { alice: { claimed: true } } };
      const ref = await fresh(env, { weeklyChallenge: { [date]: initial } }, 'bob');
      const batch = writeBatch(ref.firestore);
      for (const kind of ['confirm', 'deny']) batch.set(doc(ref, 'weeklyActions', `${date}_${kind}_bob_alice`), {
        weekKey: date, kind, actorUid: 'bob', targetUid: 'alice', challengeId: 'week-walk',
      });
      await assertFails(batch.commit());
      assert.equal((await getDoc(doc(ref, 'weeklyActions', `${date}_confirm_bob_alice`))).exists(), false);
      assert.equal((await getDoc(doc(ref, 'weeklyActions', `${date}_deny_bob_alice`))).exists(), false);
    });
    await teste('WEEKLY ORDER: two independent clients racing opposite origins get one winner', async () => {
      const initial = { ...weekly, confirmations: { alice: { claimed: true } } };
      const ref = await fresh(env, { weeklyChallenge: { [date]: initial } }, 'bob');
      const other = env.authenticatedContext('bob').firestore();
      const result = await Promise.allSettled(['confirm', 'deny'].map((kind, index) =>
        setDoc(doc(index ? other : ref.firestore, ref.path, 'weeklyActions', `${date}_${kind}_bob_alice`), {
          weekKey: date, kind, actorUid: 'bob', targetUid: 'alice', challengeId: 'week-walk',
        })));
      // Contending blind writes may both abort (the emulator's existsAfter
      // dependency locks); neither outcome may persist opposing decisions.
      assert.ok(result.filter(x => x.status === 'fulfilled').length <= 1);
      const confirmRef = doc(ref, 'weeklyActions', `${date}_confirm_bob_alice`);
      const denyRef = doc(ref, 'weeklyActions', `${date}_deny_bob_alice`);
      const persisted = [(await getDoc(confirmRef)).exists(), (await getDoc(denyRef)).exists()];
      assert.ok(persisted.filter(Boolean).length <= 1);
      if (!persisted.some(Boolean)) await assertSucceeds(setDoc(confirmRef, {
        weekKey: date, kind: 'confirm', actorUid: 'bob', targetUid: 'alice', challengeId: 'week-walk',
      }));
      assert.equal([(await getDoc(confirmRef)).exists(), (await getDoc(denyRef)).exists()].filter(Boolean).length, 1);
    });
    // Mesmo um convite real não deve habilitar o bypass dos validadores via create.
    for (const field of ['streak', 'intimacyPoints', 'messageCount', 'achievements', 'recentActivityIds', 'recentChallengeIds', 'dailySignals', 'cycleTracking', 'weeklyChallenge']) {
      for (const [target, label, expectation] of [[before, 'ANTES PASSA', assertSucceeds], [env, 'NOVAS NEGADO', assertFails]]) {
        await teste(`INTEGRIDADE CREATE: ${field} pre-inflado ${label}`, async () => {
          const key = `create-${++id}`;
          const code = `invite-${id}`;
          await seed(target, db => setDoc(doc(db, 'inviteCodes', code), { creatorId: 'bob', coupleId: key, expiresAt: new Date(Date.now() + 3600000) }));
          const ref = doc(target.authenticatedContext('alice').firestore(), 'duomatches', key);
          await expectation(setDoc(ref, { ...base, inviteCode: code, [field]: 999999 }));
        });
      }
    }
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
