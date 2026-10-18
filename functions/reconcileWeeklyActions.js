const { FieldPath } = require('firebase-admin/firestore');
const { createWeeklyActionHandler } = require('./weeklyAction');

// Read-only pagination never updates/deletes/recreates an origin: createTime is
// the admission clock, even for pre-trigger sources and delivery beyond 24h.
async function reconcileWeeklyActions(db, { dryRun = false, coupleId, pageSize = 200 } = {}) {
  const consume = createWeeklyActionHandler(db);
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
      // Only canonical origins, never similarly named collections elsewhere.
      if (!couple || !/^duomatches\/[^/]+$/.test(couple.path)) continue;
      const marker = couple.collection('weeklyEvents').doc(source.id);
      if ((await marker.get()).exists) continue;
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
  console.log('WEEKLY_RECONCILIATION_SUMMARY', JSON.stringify(stats));
  if (stats.failed) throw new Error(`WEEKLY_RECONCILIATION_FAILED: ${stats.failed} pending actions; see logs`);
  return stats;
}
module.exports = { reconcileWeeklyActions };
