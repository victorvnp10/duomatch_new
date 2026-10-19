const { defineSecret } = require('firebase-functions/params');
const { reconcileWeeklyActions } = require('./reconcileWeeklyActions');

const TELEGRAM_BOT_TOKEN = defineSecret('TELEGRAM_BOT_TOKEN');
const TELEGRAM_CHAT_ID = defineSecret('TELEGRAM_CHAT_ID');
const SILENCE_MS = 6 * 60 * 60 * 1000;

// Never log exceptions/response bodies: fetch errors can contain the secret URL.
function createTelegramSender({ token = TELEGRAM_BOT_TOKEN, chat = TELEGRAM_CHAT_ID,
  fetchImpl = globalThis.fetch, logger = console } = {}) {
  return async text => {
    try {
      const botToken = token.value();
      const chatId = chat.value();
      if (!botToken || !chatId) throw new Error('Missing Telegram configuration');
      const response = await fetchImpl(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text }), signal: AbortSignal.timeout(10000),
      });
      if (!response.ok || (await response.json()).ok !== true) throw new Error('Telegram rejected message');
      return true;
    } catch {
      logger.error('WEEKLY_ALERT_TELEGRAM_FAILED');
      return false;
    }
  };
}

function createReconciliationAlertHandler(db, { reconcile,
  send = createTelegramSender(), now = Date.now, logger = console } = {}) {
  const run = reconcile || (async () => {
    let startedAtBeginning = false;
    try {
      const checkpoint = (await db.doc('systemJobs/reconcileWeeklyActions').get()).data();
      startedAtBeginning = !checkpoint?.cursor;
    } catch {
      logger.error('WEEKLY_ALERT_CHECKPOINT_FAILED');
    }
    return { ...await reconcileWeeklyActions(db), startedAtBeginning };
  });
  // One incident per job, not per error message/count (which can change each run).
  async function notify(failed, result) {
    try {
      const ref = db.doc('systemJobs/reconcileAlert');
      const at = now();
      const claim = await db.runTransaction(async tx => {
        const state = (await tx.get(ref)).data() || {};
        if (failed) {
          const due = !state.active || state.lastFailureAlertAt == null || at - state.lastFailureAlertAt >= SILENCE_MS;
          // Reserve before sending: concurrent deliveries and Telegram outages
          // cannot spam. A failed send will be tried again after the interval.
          tx.set(ref, { active: true, lastFailureAt: at, cleanCycle: false,
            ...(due ? { lastFailureAlertAt: at } : {}) }, { merge: true });
          return due ? { kind: 'failure' } : null;
        }
        if (!state.active) return null;
        const cleanCycle = result.startedAtBeginning === true || state.cleanCycle === true;
        if (cleanCycle && !result.exhausted) tx.update(ref, { cleanCycle: true });
        return result.exhausted && cleanCycle
          ? { kind: 'recovery', lastFailureAt: state.lastFailureAt } : null;
      });
      if (!claim) return;
      const text = claim.kind === 'failure'
        ? 'DuoMatch: FALHA em reconcilePendingWeeklyActions. Consulte os logs do Cloud Functions; nova tentativa de alerta após 6 horas.'
        : 'DuoMatch: RECUPERADO — reconcilePendingWeeklyActions concluiu uma varredura sem falhas.';
      const delivered = await send(text);
      if (delivered === false) return;
      if (claim.kind === 'recovery') {
        await db.runTransaction(async tx => {
          const state = (await tx.get(ref)).data();
          if (state?.active && state.lastFailureAt === claim.lastFailureAt) {
            tx.update(ref, { active: false, recoveredAt: at });
          }
        });
      }
    } catch {
      // Neither a state-store outage nor an injected transport rejection may
      // change the reconciliation result. Deliberately omit sensitive errors.
      logger.error('WEEKLY_ALERT_FAILED');
    }
  }
  return async () => {
    let result;
    try {
      result = await run();
    } catch (error) {
      await notify(true);
      throw error;
    }
    // Busy invocations did no work. Track a whole clean cursor cycle before
    // recovering: an empty suffix alone could skip earlier failed entries.
    if (result && !result.busy) await notify(false, result);
    return result;
  };
}

module.exports = { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, SILENCE_MS,
  createTelegramSender, createReconciliationAlertHandler };
