/* eslint-disable testing-library/no-unnecessary-act -- ReactDOM test harness, not Testing Library. */
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import * as sdk from '../../infrastructure/firebase';
import { getChallengeCatalog } from '../../infrastructure/firebase/repositories/ContentRepository';
import { useDailyChallenge } from './useDailyChallenge';
import { getStartOfWeek } from '../../domain/services/WeeklyChallengeSchedule';
import { getDateString } from '../../shared/lib/dateUtils';

jest.mock('../../infrastructure/firebase', () => ({ db: {}, doc: jest.fn(), runTransaction: jest.fn(), increment: jest.fn(), onSnapshot: jest.fn() }));
jest.mock('firebase/firestore', () => jest.requireMock('../../infrastructure/firebase'));
jest.mock('../../infrastructure/firebase/repositories/ContentRepository', () => ({ getChallengeCatalog: jest.fn() }));
jest.mock('../../infrastructure/firebase/repositories/weeklyProgressCallable', () => ({ recordWeeklyProgress: jest.fn(() => { throw new Error('confirmation must not need callable'); }) }));

// Native Node load executes the SAME backend handler as the deployed trigger.
const nativeRequire = process.getBuiltinModule('module').createRequire(require('path').resolve(__dirname, '../../../functions/package.json'));
const { createWeeklyActionHandler, weeklyActionOptions } = nativeRequire('./weeklyAction');
const week = getDateString(getStartOfWeek(new Date()));
const userData = { uid: 'bob', partnerId: 'alice', coupleId: 'couple' };
const round = { id: 'round', startDate: '2000-01-01', endDate: '2099-12-31' };
let roots, store, sourceListeners, coupleListeners, deliveries, failOnce, tail, consume, attempts;
const path = 'duomatches/couple';
const clone = value => JSON.parse(JSON.stringify(value));
const reference = p => ({ path: p, id: p.split('/').pop(), collection: name => ({ doc: id => reference(`${p}/${name}/${id}`) }) });
const snap = ref => ({ id: ref.id, exists: !!store[ref.path], data: () => clone(store[ref.path]),
  createTime: { seconds: 0, nanoseconds: 0, toDate: () => new Date() } });
function assign(data, key, value) {
  const keys = key.split('.'); let target = data;
  keys.slice(0, -1).forEach(k => { target[k] ||= {}; target = target[k]; });
  const last = keys[keys.length - 1];
  target[last] = value?.operand !== undefined ? (target[last] || 0) + value.operand : clone(value);
}
function transaction(body, client) {
  const task = tail.then(async () => {
    const writes = [];
    const result = await body({
      get: async ref => client ? { exists: () => !!store[ref.path], data: () => clone(store[ref.path]) } : snap(ref),
      set: (ref, value) => writes.push(['set', ref, value]),
      create: (ref, value) => { if (store[ref.path]) throw new Error('duplicate marker'); writes.push(['set', ref, value]); },
      update: (ref, value) => writes.push(['update', ref, value]),
    });
    writes.forEach(([kind, ref, value]) => {
      if (kind === 'set') store[ref.path] = clone(value);
      else Object.entries(value).forEach(([key, v]) => assign(store[ref.path], key, v));
      if (ref.path.includes('/weeklyActions/')) {
        deliveries.push({ params: { coupleId: 'couple', eventId: ref.id }, data: snap(ref) });
        sourceListeners.filter(l => l.ref.path === ref.path).forEach(l => l.next({ exists: () => true, data: () => clone(value) }));
      }
      if (ref.path === path) coupleListeners.forEach(next => next(clone(store[path])));
    });
    return result;
  });
  tail = task.catch(() => {}); return task;
}
async function deliver() {
  while (deliveries.length) {
    const event = deliveries.shift();
    try { await consume(event); }
    catch (error) { if (weeklyActionOptions.retry) deliveries.push(event); else throw error; }
  }
}
function mount() {
  let value;
  const root = createRoot(document.createElement('div')); roots.push(root);
  function Probe() {
    const [coupleData, setCoupleData] = useState(clone(store[path]));
    React.useEffect(() => { coupleListeners.push(setCoupleData); return () => { coupleListeners = coupleListeners.filter(x => x !== setCoupleData); }; }, []);
    value = useDailyChallenge({ userData, coupleData, rounds: [round] }); return null;
  }
  act(() => root.render(<Probe />));
  return () => value;
}
const flush = async fn => { await act(async () => { await fn?.(); }); };
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  roots = []; sourceListeners = []; coupleListeners = []; deliveries = []; tail = Promise.resolve(); failOnce = true; attempts = 0;
  store = { [path]: { members: ['alice', 'bob'], weeklyChallenge: { [week]: {
    challengeId: 'challenge', weekStartDate: week, acceptedBy: ['alice', 'bob'],
    confirmations: { alice: { claimed: true, status: 'pending_partner_confirmation' } },
  } } }, [`${path}/rounds/round`]: { scores: { alice: 0 } }, 'contentChallenges/challenge': { points: 10, active: true } };
  sdk.doc.mockImplementation((...args) => reference(args.filter(x => typeof x === 'string').join('/')));
  sdk.increment.mockImplementation(operand => ({ operand }));
  sdk.runTransaction.mockImplementation((_db, body) => transaction(body, true));
  sdk.onSnapshot.mockImplementation((ref, next) => {
    const listener = { ref, next }; sourceListeners.push(listener);
    next({ exists: () => !!store[ref.path], data: () => clone(store[ref.path]) });
    return () => { sourceListeners = sourceListeners.filter(x => x !== listener); };
  });
  getChallengeCatalog.mockResolvedValue([{ id: 'challenge', points: 10 }]);
  consume = createWeeklyActionHandler({ doc: reference, runTransaction: body => {
    attempts++;
    if (failOnce) { failOnce = false; return Promise.reject(new Error('outage after client commit')); }
    return transaction(body, false);
  } });
});
afterEach(() => { roots.forEach(root => act(() => root.unmount())); jest.restoreAllMocks(); });

test('source + round commit, failed application, automatic retry: UI and both awards converge without another click', async () => {
  const read = mount(); await flush();
  await flush(() => read().handleConfirmPartner(true));
  expect(store[`${path}/rounds/round`].scores.alice).toBe(10);
  expect(read().isLoading).toBe(false);
  expect(read().challengeState.partnerConfirmation.status).toBe('processing');
  await flush(deliver); // platform delivery, no hook call and no callable
  expect(attempts).toBe(2);
  expect(read().challengeState.partnerConfirmation.pointsAwarded).toBe(10);
  expect(read().challengeState.partnerConfirmation.status).toBe('confirmed');
  await flush(() => read().handleConfirmPartner(true)); // repeat real client transaction
  await flush(deliver);
  expect(store[`${path}/rounds/round`].scores.alice).toBe(10);
  expect(read().challengeState.partnerConfirmation.pointsAwarded).toBe(10);
  expect(Object.keys(store).filter(p => p.includes('/weeklyEvents/'))).toHaveLength(1);
});

test('two tabs: deny, delivery failure, stale confirm, repeat deny always ends denied without any points', async () => {
  const tabA = mount(), tabB = mount(); await flush();
  await flush(() => tabA().handleConfirmPartner(false));
  const event = deliveries.shift();
  await expect(consume(event)).rejects.toThrow('outage');
  deliveries.push(event);
  await flush(() => tabB().handleConfirmPartner(true));
  await flush(() => tabA().handleConfirmPartner(false));
  await flush(deliver);
  expect(tabA().challengeState.partnerConfirmation.status).toBe('denied');
  expect(tabB().challengeState.partnerConfirmation.status).toBe('denied');
  expect(store[`${path}/rounds/round`].scores.alice).toBe(0);
  expect(tabA().challengeState.partnerConfirmation.pointsAwarded).toBeUndefined();
  expect(Object.keys(store).filter(p => p.includes('/weeklyActions/'))).toHaveLength(1);
});

test('reload between source commit and delivery reconstructs processing state then converges without user action', async () => {
  const first = mount(); await flush();
  await flush(() => first().handleConfirmPartner(true));
  act(() => roots.pop().unmount());
  const reloaded = mount(); await flush();
  expect(reloaded().isLoading).toBe(false);
  expect(reloaded().challengeState.partnerConfirmation.status).toBe('processing');
  await flush(deliver);
  expect(reloaded().challengeState.partnerConfirmation.status).toBe('confirmed');
  expect(reloaded().challengeState.partnerConfirmation.pointsAwarded).toBe(10);
  expect(store[`${path}/rounds/round`].scores.alice).toBe(10);
});
