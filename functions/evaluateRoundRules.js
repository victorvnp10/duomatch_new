const { FieldValue } = require('firebase-admin/firestore');
const { createTelegramSender } = require('./alert');
const { evaluateCyclicalRules } = require('./generated/roundRules.cjs');

const TIME_ZONE = 'America/Sao_Paulo';
const SILENCE_MS = 6 * 60 * 60 * 1000;
const MAX_WINDOW_DAYS = 62;

/**
 * Data local do casal, no formato YYYY-MM-DD.
 *
 * O app grava as marcações com a data LOCAL (`getTodayDateString`), não UTC.
 * O job precisa da MESMA convenção: em UTC, às 21h de Brasília o dia já virou,
 * e o gate de dias das regras dispararia um dia antes — penalizando quem ainda
 * está dentro do prazo.
 */
const localDateStr = (date = new Date()) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date);

/** Dias entre duas datas YYYY-MM-DD, inclusive nas pontas. Teto de segurança. */
function enumerateDays(startDate, endDate, limit = MAX_WINDOW_DAYS) {
  const days = [];
  const cursor = new Date(`${startDate}T12:00:00Z`);
  const last = new Date(`${endDate}T12:00:00Z`);
  while (cursor <= last && days.length < limit) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

/**
 * Sugestões (diárias e da hot zone) de todos os dias da janela.
 *
 * Elas vivem em um documento por dia — `duomatches/{coupleId}/dailySuggestions/
 * {YYYY-MM-DD}` e o equivalente `hotSuggestions` — e não na coleção
 * `activities`. A meta cíclica conta marcações dentro de uma janela de dias,
 * então ler só o documento de hoje subcontaria.
 */
async function loadWindowSuggestions(coupleRef, startDate, endDate) {
  const days = enumerateDays(startDate, endDate);
  // Cada leitura leva o DIA junto: o dia do documento é a data exata da
  // marcação (a sugestão mora em `dailySuggestions/{dia}` e o app só marca o
  // documento de hoje). Sem isso, marcação anterior à existência de
  // `selectionDates` fica fora da contagem — e o job penalizaria quem marcou.
  const requests = [];
  for (const day of days) {
    for (const name of ['dailySuggestions', 'hotSuggestions']) {
      requests.push({
        day,
        promise: coupleRef.collection(name).doc(day).get().catch(() => null),
      });
    }
  }
  const settled = await Promise.all(requests.map((r) => r.promise));
  const merged = {};
  settled.forEach((snap, index) => {
    if (!snap || !snap.exists) return;
    const day = requests[index].day;
    for (const [id, suggestion] of Object.entries(snap.data()?.suggestions || {})) {
      merged[id] = { ...suggestion, suggestionDay: day };
    }
  });
  return merged;
}

/**
 * Avalia as regras cíclicas de TODAS as rodadas ativas e aplica o placar.
 *
 * POR QUE NO SERVIDOR: a avaliação vivia apenas no cliente (`useRoundRules`),
 * disparada quando o app abre. O efeito prático era o oposto do pretendido —
 * a regra existe para forçar o participante a marcar atividades e lançar
 * desafios, mas quem sumia (e portanto não abria o app) nunca era avaliado, e
 * o período passava sem penalidade nem bônus. Aqui a varredura acontece
 * independentemente de alguém abrir o app.
 *
 * IDEMPOTÊNCIA: a aplicação é um compare-and-set dentro de transação. O plano é
 * recalculado sobre o documento FRESCO; se outro avaliador (o cliente, ou uma
 * execução anterior) já marcou o período em `rulesLastChecked`, o gate de dias
 * (`daysBetween(today, reference) >= rule.days`) não se cumpre de novo e o
 * plano sai vazio. Cliente e servidor podem rodar à vontade sem dobrar pontos.
 */
async function evaluateAllRounds(db, { now = Date.now(), logger = console } = {}) {
  const todayStr = localDateStr(new Date(now));
  const stats = { today: todayStr, rounds: 0, active: 0, evaluated: 0, applied: 0, skipped: 0, failed: 0 };

  const roundsSnap = await db.collectionGroup('rounds').get();
  stats.rounds = roundsSnap.size;

  for (const roundDoc of roundsSnap.docs) {
    const round = roundDoc.data();
    const rules = round.rules;
    if (!rules?.minActivities && !rules?.minChallenges) { stats.skipped++; continue; }

    // Só a rodada que contém o dia de hoje: avaliar rodada encerrada aplicaria
    // penalidade fora do período de jogo.
    if (!round.startDate || !round.endDate) { stats.skipped++; continue; }
    if (todayStr < round.startDate || todayStr > round.endDate) { stats.skipped++; continue; }
    stats.active++;

    const coupleRef = roundDoc.ref.parent.parent;
    if (!coupleRef) { stats.skipped++; continue; }

    try {
      const [coupleSnap, activitiesSnap] = await Promise.all([
        coupleRef.get(),
        coupleRef.collection('activities').get(),
      ]);
      const members = coupleSnap.data()?.members || [];
      if (members.length !== 2) { stats.skipped++; continue; }

      const allActivities = activitiesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const windowStart = round.rulesLastChecked?.activities || round.startDate;
      const suggestions = await loadWindowSuggestions(coupleRef, windowStart, todayStr);

      const evaluate = (activeRound) =>
        evaluateCyclicalRules({
          activeRound,
          allActivities,
          userId: members[0],
          partnerId: members[1],
          todayStr,
          suggestions,
        });

      if (!evaluate(round)) { stats.skipped++; continue; }
      stats.evaluated++;

      await db.runTransaction(async (tx) => {
        const fresh = await tx.get(roundDoc.ref);
        if (!fresh.exists) return;
        // Recalcula sobre o estado REAL: outro avaliador pode ter marcado o
        // período entre a leitura e a transação.
        const plan = evaluate({ ...round, ...fresh.data() });
        if (!plan) return;
        const update = {};
        for (const [uid, delta] of Object.entries(plan.scoreDeltas || {})) {
          if (delta) update[`scores.${uid}`] = FieldValue.increment(delta);
        }
        for (const [key, value] of Object.entries(plan.lastCheckedUpdates || {})) {
          update[`rulesLastChecked.${key}`] = value;
        }
        if (Object.keys(update).length) tx.update(roundDoc.ref, update);
      });
      stats.applied++;
    } catch (error) {
      // Uma rodada com dado corrompido não pode abortar a varredura das
      // outras. O erro sobe para o resumo no fim, que dispara o alerta.
      stats.failed++;
      logger.error('ROUND_RULES_EVALUATION_FAILED', roundDoc.ref.path, error?.message);
    }
  }

  console.log('ROUND_RULES_SUMMARY', JSON.stringify(stats));
  if (stats.failed) throw new Error(`ROUND_RULES_FAILED: ${stats.failed} rounds; see logs`);
  return stats;
}

/**
 * Envolve a varredura com aviso no Telegram em caso de falha persistente.
 *
 * O `createReconciliationAlertHandler` existente é acoplado ao job semanal
 * (mensagens, `startedAtBeginning`, `exhausted`) — reaproveitar o estado dele
 * faria os dois jobs cruzarem sinal. Aqui só o TRANSPORTE é compartilhado
 * (`createTelegramSender`); o estado tem documento próprio.
 */
function createRoundRulesJobHandler(db, { send = createTelegramSender(), now = Date.now, logger = console } = {}) {
  async function notify(failed) {
    try {
      const ref = db.doc('systemJobs/roundRulesAlert');
      const at = now();
      const claim = await db.runTransaction(async (tx) => {
        const state = (await tx.get(ref)).data() || {};
        if (failed) {
          const due = !state.active || state.lastFailureAlertAt == null || at - state.lastFailureAlertAt >= SILENCE_MS;
          tx.set(ref, { active: true, lastFailureAt: at, ...(due ? { lastFailureAlertAt: at } : {}) }, { merge: true });
          return due ? { kind: 'failure' } : null;
        }
        if (!state.active) return null;
        tx.update(ref, { active: false, recoveredAt: at });
        return { kind: 'recovery' };
      });
      if (!claim) return;
      const text = claim.kind === 'failure'
        ? 'DuoMatch: FALHA em evaluateRoundRules (regras da rodada). Consulte os logs do Cloud Functions; nova tentativa de alerta após 6 horas.'
        : 'DuoMatch: RECUPERADO — evaluateRoundRules concluiu uma varredura sem falhas.';
      await send(text);
    } catch {
      // Nem indisponibilidade do estado nem recusa do Telegram podem alterar o
      // resultado da varredura.
      logger.error('ROUND_RULES_ALERT_FAILED');
    }
  }

  return async () => {
    try {
      const result = await evaluateAllRounds(db, { now: now(), logger });
      await notify(false);
      return result;
    } catch (error) {
      await notify(true);
      throw error;
    }
  };
}

module.exports = { localDateStr, enumerateDays, loadWindowSuggestions, evaluateAllRounds, createRoundRulesJobHandler, TIME_ZONE, SILENCE_MS };
