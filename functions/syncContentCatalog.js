const { isDeepStrictEqual } = require('node:util');
const { HttpsError } = require('firebase-functions/v2/https');
const catalog = require('./generated/contentCatalog.json');

const entries = [
  ...catalog.activities.map(item => ({ collection: 'contentActivities', item })),
  ...catalog.challenges.map(item => ({ collection: 'contentChallenges', item })),
];
const knownIds = new Set(entries.map(({ item }) => item.id));

/** Only canonical server data can be written; callers can select ids, not payloads. */
function selectedEntries(data) {
  if (data == null) return entries;
  if (typeof data !== 'object' || Array.isArray(data) ||
      Object.keys(data).some(key => key !== 'ids')) {
    throw new HttpsError('invalid-argument', 'Use an optional object with an ids array.');
  }
  if (!Object.hasOwn(data, 'ids')) return entries;
  if (!Array.isArray(data.ids) || data.ids.length > entries.length ||
      data.ids.some(id => typeof id !== 'string' || !knownIds.has(id))) {
    throw new HttpsError('invalid-argument', 'ids must contain only known catalog ids.');
  }
  const ids = new Set(data.ids);
  return entries.filter(({ item }) => ids.has(item.id));
}

function createSyncContentCatalogHandler(db) {
  return async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in to sync the catalog.');
    const selected = selectedEntries(request.data);
    let written = 0;
    // Atomic read/compare/write per chunk, so simultaneous bootstraps retry
    // instead of needlessly overwriting the same documents. No timestamps added.
    for (let start = 0; start < selected.length; start += 400) {
      const chunk = selected.slice(start, start + 400);
      const refs = chunk.map(({ collection, item }) => db.collection(collection).doc(item.id));
      written += await db.runTransaction(async transaction => {
        const snapshots = await transaction.getAll(...refs);
        let changed = 0;
        snapshots.forEach((snapshot, index) => {
          if (!snapshot.exists || !isDeepStrictEqual(snapshot.data(), chunk[index].item)) {
            transaction.set(refs[index], chunk[index].item);
            changed++;
          }
        });
        return changed;
      });
    }
    return { scanned: selected.length, written, unchanged: selected.length - written };
  };
}

module.exports = { createSyncContentCatalogHandler };
