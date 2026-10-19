const assert = require('node:assert/strict');
const NM = process.env.FIREBASE_TOOLS_NODE_MODULES || '/home/ubuntu/.hermes/tools/firebase-cli/node_modules';
const { assertFails, initializeTestEnvironment, assertSucceeds } = require(NM + '/@firebase/rules-unit-testing');
const { doc, setDoc, getDoc, writeBatch, increment } = require(NM + '/firebase/firestore');
const fs = require('node:fs');
const path = require('node:path');

// Relógio FIXO para os casos que dependem da semana. A janela de fuso aceita de
// propósito a semana ANTERIOR nas primeiras 12h após a virada (para servir
// aparelhos em UTC-12, que ainda estão na semana passada). Um teste que calcula
// "a semana anterior" a partir do relógio REAL, portanto, passa na maior parte
// da semana e FALHA na manhã de segunda — foi o que aconteceu: a suíte ficou
// vermelha às 11h de uma segunda-feira, com o teste acusando corretamente uma
// consequência do desenho que a própria tabela de fronteiras abaixo já previa.
// Pinnar o relógio mantém o teste determinístico e ainda significativo: aqui a
// janela JÁ FECHOU (só a semana corrente é aceita), então a origem da semana
// anterior tem de ser recusada de fato.
const CLOCK_WINDOW_CLOSED = '2026-10-19T12:00:00Z';
const CURRENT_WEEK = '2026-10-19';
const PREVIOUS_WEEK = '2026-10-12';

const withFixedClock = async (iso, index, run) => {
  const [host, port] = process.env.FIRESTORE_EMULATOR_HOST.split(':');
  const rules = fs.readFileSync(path.resolve(__dirname, '../../firestore.rules'), 'utf8');
  const fixed = await initializeTestEnvironment({ projectId: `demo-revision-clock-${index}`, firestore: {
    host, port: Number(port), rules: rules.replaceAll('request.time', `timestamp.value(${new Date(iso).getTime()})`),
  } });
  try { return await run(fixed); } finally { await fixed.cleanup(); }
};

module.exports = async ({ env, seed, teste }) => {
  await teste('I1 stale source created after rollover cannot award round score', async () => {
    // A janela de fuso já fechou neste relógio: a semana anterior é recusada.
    await withFixedClock(CLOCK_WINDOW_CLOSED, 'stale', async fixed => {
      const id = 'revision-previous';
      await seed(fixed, async db => {
        await setDoc(doc(db, 'duomatches', id), { members: ['alice', 'bob'], weeklyChallenge: {
          [PREVIOUS_WEEK]: { challengeId: 'week-walk', awardPoints: 20, confirmations: { alice: { claimed: true } } },
        } });
        await setDoc(doc(db, 'duomatches', id, 'rounds', 'r'), { scores: { alice: 0 } });
      });
      const db = fixed.authenticatedContext('bob').firestore();
      const source = doc(db, 'duomatches', id, 'weeklyActions', `${PREVIOUS_WEEK}_confirm_bob_alice`);
      const round = doc(db, 'duomatches', id, 'rounds', 'r');
      const batch = writeBatch(db);
      batch.set(source, { weekKey: PREVIOUS_WEEK, kind: 'confirm', actorUid: 'bob', targetUid: 'alice', challengeId: 'week-walk', awardPoints: 20 });
      batch.update(round, { 'scores.alice': increment(20) });
      await assertFails(batch.commit());
      assert.equal((await getDoc(source)).exists(), false);
      assert.equal((await getDoc(round)).data().scores.alice, 0);
    });
  });

  await teste('I3 source cannot override authoritative accepted points', async () => {
    // Este caso não depende do relógio: usa a semana CORRENTE, que a janela
    // aceita em qualquer momento. A recusa vem do valor, não da data.
    const now = new Date(); now.setUTCDate(now.getUTCDate() - (now.getUTCDay() || 7) + 1);
    const weekKey = now.toISOString().slice(0, 10);
    const id = 'revision-points';
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
    batch.set(source, { weekKey, kind: 'confirm', actorUid: 'bob', targetUid: 'alice', challengeId: 'week-walk', awardPoints: 99 });
    batch.update(round, { 'scores.alice': increment(99) });
    await assertFails(batch.commit());
    assert.equal((await getDoc(source)).exists(), false);
    assert.equal((await getDoc(round)).data().scores.alice, 0);
  });

  // Deterministic server-clock boundaries: replace request.time only in an
  // isolated rules test environment, never in the deployed rules file.
  for (const [index, iso, allowed] of [
    [0, '2026-10-18T12:00:00Z', ['2026-10-12', '2026-10-19']],
    [1, '2026-10-19T00:00:00Z', ['2026-10-12', '2026-10-19']],
    [2, CLOCK_WINDOW_CLOSED, [CURRENT_WEEK]],
  ]) await teste(`I1 server week boundary ${iso} accepts only inhabited-offset weeks`, async () => {
    await withFixedClock(iso, index, async fixed => {
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
    });
  });
};
