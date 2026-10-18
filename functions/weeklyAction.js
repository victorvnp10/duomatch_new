const { createRecordWeeklyProgressHandler } = require('./recordWeeklyProgress');
const { FieldValue } = require('firebase-admin/firestore');

const weeklyActionOptions = {
  document: 'duomatches/{coupleId}/weeklyActions/{eventId}',
  region: 'southamerica-east1',
  retry: true,
  maxInstances: 3,
};

const createWeeklyActionHandler = db => {
  const record = createRecordWeeklyProgressHandler(db);
  return async event => {
    const source = event.data?.data();
    if (!source) return;
    try {
      return await record({ auth: { uid: source.actorUid }, data: {
        coupleId: event.params.coupleId, eventId: event.params.eventId, kind: source.kind,
        payload: { weekKey: source.weekKey, challengeId: source.challengeId, targetUid: source.targetUid },
      } });
    } catch (error) {
      // Invalid immutable sources cannot heal on redelivery. Infrastructure and
      // transaction failures MUST escape so Eventarc retries without a browser.
      if (['invalid-argument', 'permission-denied', 'failed-precondition', 'not-found', 'unauthenticated'].includes(error.code)) {
        const markerRef = db.doc(`duomatches/${event.params.coupleId}/weeklyEvents/${event.params.eventId}`);
        // Persist terminal failure before acknowledging delivery. A failed marker
        // write escapes too, so retries/reconciliation cannot silently lose it.
        await db.runTransaction(async tx => {
          const marker = await tx.get(markerRef);
          if (!marker.exists) tx.create(markerRef, {
            status: 'rejected', errorCode: error.code, actorUid: source.actorUid || null,
            kind: source.kind || null, weekKey: source.weekKey || null,
            challengeId: source.challengeId || null, targetUid: source.targetUid || null,
            points: 0, createdAt: FieldValue.serverTimestamp(),
          });
        });
        console.error('WEEKLY_ACTION_REJECTED', event.params, error.code);
        return { rejected: true, errorCode: error.code };
      }
      throw error;
    }
  };
};

module.exports = { weeklyActionOptions, createWeeklyActionHandler };
