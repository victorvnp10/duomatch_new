// Firebase is a network boundary; exercise the real repository and catalog
// against an in-memory batch adapter, without changing production data.
describe('ContentRepository lazy seed', () => {
  let repository;
  let loadCatalog;
  let documents;
  let committedBatches;
  let failCommit;

  beforeEach(() => {
    jest.resetModules();
    documents = { contentActivities: new Map(), contentChallenges: new Map() };
    committedBatches = [];
    failCommit = false;
    loadCatalog = jest.fn();
    jest.doMock('../../seed/contentCatalog', () => {
      loadCatalog();
      return jest.requireActual('../../seed/contentCatalog');
    });
    jest.doMock('../index', () => ({
      db: {},
      collection: (_db, name) => name,
      doc: (collection, id) => ({ collection, id }),
      getDocs: async (collection) => ({
        docs: [...documents[collection]].map(([id, data]) => ({ id, data: () => data })),
      }),
      writeBatch: () => {
        const writes = [];
        return {
          set: (ref, data) => writes.push({ ref, data }),
          commit: async () => {
            if (failCommit) throw new Error('commit rejected');
            committedBatches.push(writes);
            writes.forEach(({ ref, data }) => documents[ref.collection].set(ref.id, data));
          },
        };
      },
      arrayUnion: (...ids) => ids,
      updateDoc: async () => {},
    }));
    repository = require('./ContentRepository');
  });

  test('does not evaluate the catalog until a seed operation is requested', async () => {
    expect(loadCatalog).not.toHaveBeenCalled();
    expect(repository.pickVaried([{ id: 'one' }], 1)).toEqual([{ id: 'one' }]);
    expect(loadCatalog).not.toHaveBeenCalled();
    await repository.ensureActivityCatalog();
    expect(loadCatalog).toHaveBeenCalledTimes(1);
  });

  test('seeds both real catalogs with unchanged data and batches of at most 400', async () => {
    await repository.ensureActivityCatalog();
    await repository.ensureChallengeCatalog();
    const { ACTIVITY_CATALOG, CHALLENGE_CATALOG } = jest.requireActual('../../seed/contentCatalog');
    expect([...documents.contentActivities.values()]).toEqual(ACTIVITY_CATALOG);
    expect([...documents.contentChallenges.values()]).toEqual(CHALLENGE_CATALOG);
    expect(ACTIVITY_CATALOG).toHaveLength(473);
    expect(CHALLENGE_CATALOG).toHaveLength(217);
    expect(committedBatches.map((batch) => batch.length)).toEqual([400, 73, 217]);
  });

  test('preserves incremental/idempotent seeding and session caching', async () => {
    const { ACTIVITY_CATALOG } = jest.requireActual('../../seed/contentCatalog');
    const custom = { ...ACTIVITY_CATALOG[0], title: 'server-owned edit' };
    documents.contentActivities.set(custom.id, custom);
    const activities = await repository.getActivityCatalog();
    expect(documents.contentActivities.get(custom.id)).toEqual(custom);
    expect(documents.contentActivities.size).toBe(473);
    expect(committedBatches.map((batch) => batch.length)).toEqual([400, 72]);
    await repository.ensureActivityCatalog();
    expect(committedBatches).toHaveLength(2);
    expect(await repository.getActivityCatalog()).toBe(activities);
  });

  test('continues to propagate seed failures to its caller', async () => {
    failCommit = true;
    await expect(repository.ensureChallengeCatalog()).rejects.toThrow('commit rejected');
    expect(documents.contentChallenges.size).toBe(0);
  });
});
