// Exercise the real repository; only network boundaries are replaced.
describe('ContentRepository server catalog', () => {
  let repository;
  let sync;
  let getDocs;
  let documents;
  let warn;
  beforeEach(() => {
    jest.resetModules();
    documents = {
      contentActivities: [{ id: 'act-one', name: 'One', active: true }, { id: 'off', active: false }],
      contentChallenges: [{ id: 'week-one', title: 'One' }],
    };
    sync = jest.fn().mockResolvedValue({ data: { written: 0 } });
    getDocs = jest.fn(async (name) => ({ docs: documents[name].map(data => ({ data: () => data })) }));
    jest.doMock('firebase/functions', () => ({
      getFunctions: (_app, region) => {
        expect(region).toBe('southamerica-east1');
        return {};
      },
      httpsCallable: (_functions, name) => {
        expect(name).toBe('syncContentCatalog');
        return sync;
      },
    }));
    jest.doMock('../index', () => ({
      app: {}, db: {}, collection: (_db, name) => name,
      getDocs: (...args) => getDocs(...args),
      doc: (_db, name, id) => ({ name, id }),
      arrayUnion: (...ids) => ids, updateDoc: async () => {},
    }));
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    repository = require('./ContentRepository');
  });
  afterEach(() => jest.restoreAllMocks());
  test('does not call the server on import or pure selection', () => {
    expect(repository.pickVaried([{ id: 'one' }], 1)).toEqual([{ id: 'one' }]);
    expect(sync).not.toHaveBeenCalled();
  });
  test('syncs the server once for both catalogs and concurrent requests', async () => {
    await Promise.all([repository.ensureActivityCatalog(), repository.ensureChallengeCatalog(), repository.ensureActivityCatalog()]);
    expect(sync).toHaveBeenCalledTimes(1);
    expect(sync).toHaveBeenCalledWith();
  });
  test('reads active Firestore content and caches it for the session', async () => {
    const activities = await repository.getActivityCatalog();
    expect(activities).toEqual([documents.contentActivities[0]]);
    expect(await repository.getActivityCatalog()).toBe(activities);
    expect(await repository.getChallengeCatalog()).toEqual([{ ...documents.contentChallenges[0], active: true }]);
    expect(getDocs).toHaveBeenCalledTimes(2);
    expect(sync).toHaveBeenCalledTimes(1);
  });
  test('invalidates the read cache without resyncing unchanged server data', async () => {
    await repository.getActivityCatalog();
    repository.clearActivityCatalogCache();
    await repository.getActivityCatalog();
    expect(getDocs).toHaveBeenCalledTimes(2);
    expect(sync).toHaveBeenCalledTimes(1);
  });
  test('ensure propagates sync failure and retries next time', async () => {
    sync.mockRejectedValueOnce(new Error('offline'));
    await expect(repository.ensureChallengeCatalog()).rejects.toThrow('offline');
    await repository.ensureChallengeCatalog();
    expect(sync).toHaveBeenCalledTimes(2);
  });
  test('still reads the available catalog when callable is unavailable', async () => {
    sync.mockRejectedValue(new Error('offline'));
    expect(await repository.getActivityCatalog()).toEqual([documents.contentActivities[0]]);
    expect(await repository.getChallengeCatalog()).toEqual([{ ...documents.contentChallenges[0], active: true }]);
    expect(warn).toHaveBeenCalledTimes(2);
  });
  test('propagates a Firestore read failure to existing hook error handlers', async () => {
    getDocs.mockRejectedValue(new Error('read denied'));
    await expect(repository.getActivityCatalog()).rejects.toThrow('read denied');
    await expect(repository.getChallengeCatalog()).rejects.toThrow('read denied');
  });
});
