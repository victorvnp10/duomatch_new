const { createRecordWeeklyProgressHandler } = require('./recordWeeklyProgress');

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
        console.error('Rejected weekly action', event.params, error.code);
        return;
      }
      throw error;
    }
  };
};

module.exports = { weeklyActionOptions, createWeeklyActionHandler };
