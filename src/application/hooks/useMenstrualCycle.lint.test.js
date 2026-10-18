import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import * as firebase from '../../infrastructure/firebase';
import { useMenstrualCycle } from './useMenstrualCycle';

jest.mock('../../infrastructure/firebase', () => ({
  db: {}, doc: jest.fn(), runTransaction: jest.fn(),
}));

let root;
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  root = createRoot(document.createElement('div'));
  firebase.doc.mockReturnValue('couple-ref');
});
afterEach(() => { act(() => { root.unmount(); }); jest.clearAllMocks(); });

// Explicit baseline outputs from both original unparenthesized write paths.
const cases = [
  [undefined, null], [null, null], [false, null], [0, null], ['', null], [NaN, null],
  ['0', 28], ['invalid', 28], [-1, 28], [1, 15], [28, 28], [100, 60], [Infinity, 28],
];

describe.each(['handleLogPeriodStart', 'handleDeletePeriodEntry'])('%s override precedence', (method) => {
  test.each(cases)('override %p persists exactly %p', async (override, expected) => {
    const writes = [];
    const current = { ownerId: 'me', periods: [], cycleLengthOverride: override };
    firebase.runTransaction.mockImplementation(async (_db, body) => body({
      get: async () => ({ exists: () => true, data: () => ({ cycleTracking: current }) }),
      update: (ref, data) => writes.push({ ref, data }),
    }));
    let value;
    function Probe() {
      value = useMenstrualCycle({ user: { uid: 'me' }, userData: { coupleId: 'couple' }, coupleData: {} });
      return null;
    }
    const commitElement = async () => { root.render(<Probe />); };
    await act(commitElement);
    const arg = method === 'handleLogPeriodStart' ? { startDate: '2026-10-01', periodLength: 5 } : '2026-10-01';
    await act(async () => { await value[method](arg); });
    expect(writes).toHaveLength(1);
    expect(writes[0].data.cycleTracking.cycleLengthOverride).toBe(expected);
    expect(writes[0].data.cycleTracking.ownerId).toBe('me');
  });
});
