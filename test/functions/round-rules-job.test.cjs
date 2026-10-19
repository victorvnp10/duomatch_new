const assert = require('node:assert/strict');
const { test } = require('node:test');

// Data fixa: a avaliação é por janela de dias, então o teste não pode depender
// do dia em que roda (foi exatamente isso que deixou a suíte de regras vermelha
// numa segunda-feira).
const TODAY = '2026-10-19';
const ROUND_START = '2026-10-13';
const ROUND_END = '2026-10-26';
const WINDOW_START = '2026-10-12'; // 7 dias antes de TODAY -> ciclo vencido

const nowMs = (dateStr) => new Date(`${dateStr}T15:00:00Z`).getTime();

test('evaluateRoundRules: aplica as metas no servidor, sem depender do cliente', async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, 'emulator required');
  process.env.GCLOUD_PROJECT = 'demo-duomatch-roundrules';
  process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });

  const { evaluateAllRounds, localDateStr, enumerateDays } = require('../../functions/evaluateRoundRules.js');
  const functionsRequire = require('node:module').createRequire(require('node:path').resolve(__dirname, '../../functions/package.json'));
  // Inicializa o app do Admin SDK (o index.js já faz isso no deploy).
  require('../../functions/index.js');
  const { getFirestore } = functionsRequire('firebase-admin/firestore');
  const db = getFirestore();

  // A data do job precisa ser a data LOCAL do casal, não UTC.
  assert.equal(localDateStr(new Date(nowMs(TODAY))), TODAY, 'job must use the local couple date');
  assert.deepEqual(enumerateDays('2026-10-17', '2026-10-19'), ['2026-10-17', '2026-10-18', '2026-10-19']);

  const seedRound = async (coupleId, extra = {}) => {
    const ref = db.doc(`duomatches/${coupleId}`);
    await ref.set({ members: ['alice', 'bob'], ...extra });
    await ref.collection('rounds').doc('r1').set({
      startDate: ROUND_START,
      endDate: ROUND_END,
      rules: { minActivities: { quantity: 5, days: 7, penalty: 10 } },
      rulesLastChecked: { activities: WINDOW_START, challenges: WINDOW_START },
      scores: { alice: 0, bob: 0 },
    });
    return ref;
  };

  // As pontuações vivem no documento da RODADA, não no do casal.
  const scoresOf = async (ref, roundId = 'r1') =>
    (await ref.collection('rounds').doc(roundId).get()).data().scores;

  // ---- caso 1: alice cumpriu (5 marcações na janela), bob não marcou nada ----
  const c1 = 'roundrules-met';
  const ref1 = await seedRound(c1);
  for (let i = 0; i < 5; i += 1) {
    await ref1.collection('activities').doc(`a${i}`).set({
      type: 'atividade',
      createdBy: 'alice',
      selections: { alice: { status: 'confirmed', date: '2026-10-15' } },
    });
  }
  const stats1 = await evaluateAllRounds(db, { now: nowMs(TODAY), logger: { error() {} } });
  assert.ok(stats1.applied >= 1, 'at least one round must be applied');
  const scores1 = await scoresOf(ref1);
  assert.equal(scores1.alice, 10, 'quem cumpre a meta ganha a penalidade como bônus');
  assert.equal(scores1.bob, -10, 'quem não cumpre perde a penalidade');
  assert.equal((await ref1.collection('rounds').doc('r1').get()).data().rulesLastChecked.activities, TODAY);

  // ---- caso 2: idempotência — rodar de novo no mesmo dia não dobra ----
  await evaluateAllRounds(db, { now: nowMs(TODAY), logger: { error() {} } });
  const scores1b = await scoresOf(ref1);
  assert.equal(scores1b.alice, 10, 'segunda execução no mesmo dia não pontua de novo');
  assert.equal(scores1b.bob, -10);

  // ---- caso 3: o cliente já avaliou hoje -> o servidor não repete ----
  const c3 = 'roundrules-client-already';
  const ref3 = await seedRound(c3);
  await ref3.collection('rounds').doc('r1').update({ rulesLastChecked: { activities: TODAY, challenges: TODAY } });
  await evaluateAllRounds(db, { now: nowMs(TODAY), logger: { error() {} } });
  const scores3 = await scoresOf(ref3);
  assert.equal(scores3.alice, 0, 'período já avaliado pelo cliente não é reaplicado');
  assert.equal(scores3.bob, 0);

  // ---- caso 4: marcação feita em SUGESTÃO conta (documento por dia) ----
  const c4 = 'roundrules-suggestion';
  const ref4 = await seedRound(c4);
  // O app grava UM documento por dia, com um MAPA de sugestões — não um
  // documento por sugestão.
  await ref4.collection('dailySuggestions').doc('2026-10-15').set({
    suggestions: Object.fromEntries(
      Array.from({ length: 5 }, (_, i) => [
        `s${i}`,
        { selections: { alice: 'selected' }, selectionDates: { alice: '2026-10-15' } },
      ])
    ),
  });
  await evaluateAllRounds(db, { now: nowMs(TODAY), logger: { error() {} } });
  const scores4 = await scoresOf(ref4);
  assert.equal(scores4.alice, 10, 'marcar sugestão conta para a meta, sem depender do parceiro');
  assert.equal(scores4.bob, -10);

  // ---- caso 5: rodada fora do período não é avaliada ----
  const c5 = 'roundrules-inactive';
  const ref5 = db.doc(`duomatches/${c5}`);
  await ref5.set({ members: ['alice', 'bob'] });
  await ref5.collection('rounds').doc('r1').set({
    startDate: '2026-01-01', endDate: '2026-01-31',
    rules: { minActivities: { quantity: 5, days: 7, penalty: 10 } },
    rulesLastChecked: { activities: '2026-01-01' }, scores: { alice: 0, bob: 0 },
  });
  await evaluateAllRounds(db, { now: nowMs(TODAY), logger: { error() {} } });
  const scores5 = await scoresOf(ref5);
  assert.equal(scores5.alice, 0, 'rodada encerrada não sofre penalidade fora do período');

  console.log('ROUND_RULES_JOB cases 1-5 ok');
});

test('evaluateRoundRules: falha vira alerta no Telegram, e não spam', async () => {
  const { createRoundRulesJobHandler, SILENCE_MS } = require('../../functions/evaluateRoundRules.js');

  const sent = [];
  let clock = 1_000_000;
  // Estado do alerta precisa PERSISTIR entre execuções: é ele que segura o
  // spam. Um mock sem memória não consegue provar a janela de silêncio.
  let state = {};
  const db = {
    doc: () => ({}),
    runTransaction: async (fn) => fn({
      get: async () => ({ data: () => state }),
      set: (_ref, value) => { state = { ...state, ...value }; },
      update: (_ref, value) => { state = { ...state, ...value }; },
    }),
  };

  // Varredura que sempre falha.
  const failing = createRoundRulesJobHandler(
    { ...db, collectionGroup: () => ({ get: async () => { throw new Error('boom'); } }) },
    { send: async (t) => { sent.push(t); return true; }, now: () => clock }
  );

  await assert.rejects(failing(), /boom/);
  assert.equal(sent.length, 1, 'a falha alerta uma vez');
  assert.match(sent[0], /FALHA em evaluateRoundRules/);

  // Segunda falha dentro da janela de silêncio: sem novo alerta.
  clock += SILENCE_MS - 1000;
  await assert.rejects(failing(), /boom/);
  assert.equal(sent.length, 1, 'falha persistente não vira mensagem a cada execução');

  // Falha depois do silêncio: alerta de novo.
  clock += 2000;
  await assert.rejects(failing(), /boom/);
  assert.equal(sent.length, 2, 'após a janela de silêncio, alerta novamente');

  console.log('ROUND_RULES_ALERT cases ok');
});
