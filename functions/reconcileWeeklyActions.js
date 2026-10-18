const { randomUUID } = require('node:crypto');
const { FieldPath } = require('firebase-admin/firestore');
const { createWeeklyActionHandler } = require('./weeklyAction');
const { pendingRef } = require('./weeklyActionPending');

const LIMITS = Object.freeze({ pageSize: 20, maxPages: 5, maxDurationMs: 120000, leaseMs: 600000 });

const summary = stats => {
  console.log('WEEKLY_RECONCILIATION_SUMMARY', JSON.stringify(stats));
  if (stats.failed) throw new Error(`WEEKLY_RECONCILIATION_FAILED: ${stats.failed} pending actions; see logs`);
  return stats;
};

// Explicit administrative replay is deliberately exhaustive and read-only on
// origins. It also covers pre-trigger sources missing from the derived index.
async function replayOrigins(db, { dryRun, coupleId, pageSize = 200 }) {
  const consume = createWeeklyActionHandler(db, { indexPending: true });
  const stats = { scanned: 0, pending: 0, processed: 0, rejected: 0, failed: 0 };
  const collection = coupleId ? db.doc(`duomatches/${coupleId}`).collection('weeklyActions') : db.collectionGroup('weeklyActions');
  let cursor;
  for (;;) {
    let query = collection.orderBy(FieldPath.documentId()).limit(pageSize);
    if (cursor) query = query.startAfter(cursor);
    const page = await query.get();
    if (page.empty) break;
    for (const source of page.docs) {
      stats.scanned++;
      const couple = source.ref.parent.parent;
      if (!couple || !/^duomatches\/[^/]+$/.test(couple.path)) continue;
      const marker = couple.collection('weeklyEvents').doc(source.id);
      if ((await marker.get()).exists) {
        if (!dryRun) await pendingRef(db, source.ref.path).delete();
        continue;
      }
      stats.pending++;
      if (dryRun) continue;
      try {
        const result = await consume({ data: source, params: { coupleId: couple.id, eventId: source.id } });
        if (result?.rejected) stats.rejected++;
        else stats.processed++;
      } catch (error) {
        stats.failed++;
        console.error('WEEKLY_RECONCILIATION_FAILED', source.ref.path, error);
      }
    }
    cursor = page.docs[page.docs.length - 1];
  }
  return summary(stats);
}

async function reconcileWeeklyActions(db, options = {}) {
  if (options.replay || options.coupleId || options.dryRun) return replayOrigins(db, options);
  const { pageSize = LIMITS.pageSize, maxPages = LIMITS.maxPages,
    maxDurationMs = LIMITS.maxDurationMs, now = Date.now } = options;
  for (const [key, value] of Object.entries({ pageSize, maxPages, maxDurationMs })) {
    if (!Number.isSafeInteger(value) || value < 1 || value > LIMITS[key]) throw new Error(`Invalid ${key}: must be within 1..${LIMITS[key]}`);
  }
  const started = now();
  const deadline = started + maxDurationMs;
  const stateRef = db.doc('systemJobs/reconcileWeeklyActions');
  const owner = randomUUID();
  const lease = await db.runTransaction(async tx => {
    const state = (await tx.get(stateRef)).data() || {};
    if (state.leaseUntil > started) return null;
    tx.set(stateRef, { leaseOwner: owner, leaseUntil: started + LIMITS.leaseMs }, { merge: true });
    return { cursor: state.cursor || null };
  });
  const stats = { scanned: 0, pending: 0, processed: 0, rejected: 0, failed: 0, pages: 0, busy: !lease, exhausted: false };
  if (!lease) return summary(stats);
  let cursor = lease.cursor;
  const checkpoint = next => db.runTransaction(async tx => {
    const state = (await tx.get(stateRef)).data();
    if (state?.leaseOwner !== owner) throw new Error('WEEKLY_RECONCILIATION_FAILED: lease lost');
    tx.update(stateRef, { cursor: next });
  });
  const consume = createWeeklyActionHandler(db, { indexPending: true });
  try {
    cycle: while (stats.pages < maxPages) {
      let query = db.collection('weeklyActionPending').orderBy(FieldPath.documentId()).limit(pageSize);
      if (cursor) query = query.startAfter(cursor);
      const page = await query.get();
      stats.pages++;
      if (page.empty) {
        await checkpoint(null); // Wrap next invocation, never loop over failures in this one.
        stats.exhausted = true;
        break;
      }
      for (const entry of page.docs) {
        // Soft deadline: finish one in-flight unit, checkpoint, then yield.
        if (now() >= deadline) break cycle;
        stats.scanned++;
        try {
          const path = entry.data().sourcePath;
          const match = typeof path === 'string' && /^duomatches\/([^/]+)\/weeklyActions\/([^/]+)$/.exec(path);
          if (!match || pendingRef(db, path).id !== entry.id) throw new Error('Invalid pending source path/identity');
          const marker = await db.doc(`duomatches/${match[1]}/weeklyEvents/${match[2]}`).get();
          if (marker.exists) {
            await entry.ref.delete(); // Receipt is the only terminal authority.
          } else {
            const source = await db.doc(path).get();
            if (!source.exists) throw new Error('Pending immutable source missing');
            stats.pending++;
            const result = await consume({ data: source, params: { coupleId: match[1], eventId: match[2] } });
            if (result?.rejected) stats.rejected++;
            else stats.processed++;
          }
        } catch (error) {
          stats.failed++;
          console.error('WEEKLY_RECONCILIATION_FAILED', entry.ref.path, error);
        }
        // Failed work remains indexed, but cannot starve keys after it. On a
        // crash before checkpoint it may be read again; the receipt deduplicates.
        await checkpoint(entry.id);
        cursor = entry.id;
      }
      if (now() >= deadline) break;
    }
  } finally {
    await db.runTransaction(async tx => {
      const state = (await tx.get(stateRef)).data();
      if (state?.leaseOwner === owner) tx.update(stateRef, { leaseOwner: null, leaseUntil: 0 });
    });
  }
  return summary(stats);
}
module.exports = { reconcileWeeklyActions, LIMITS };
