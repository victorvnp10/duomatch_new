import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { Simulate } from 'react-dom/test-utils';
import * as firebase from '../../infrastructure/firebase';
import { getChallengeCatalog } from '../../infrastructure/firebase/repositories/ContentRepository';
import { useDailyChallenge } from './useDailyChallenge';
import { recordWeeklyProgress } from '../../infrastructure/firebase/repositories/weeklyProgressCallable';
import { useRoundRules } from './useRoundRules';
import SetPointsModal from '../../presentation/components/SetPointsModal';
import OnboardingView from '../../presentation/components/OnboardingView';
import { getDateString } from '../../shared/lib/dateUtils';
import { getStartOfWeek } from '../../domain/services/WeeklyChallengeSchedule';

jest.mock('../../infrastructure/firebase', () => ({
  db: {}, doc: jest.fn(), increment: jest.fn(), runTransaction: jest.fn(), onSnapshot: jest.fn(),
}));
jest.mock('firebase/firestore', () => jest.requireMock('../../infrastructure/firebase'));
jest.mock('../../infrastructure/firebase/repositories/weeklyProgressCallable', () => ({ recordWeeklyProgress: jest.fn() }));
jest.mock('../../infrastructure/firebase/repositories/ContentRepository', () => ({
  getChallengeCatalog: jest.fn(),
}));

let root, container;
const userData = { uid: 'me', partnerId: 'partner', coupleId: 'couple' };
const user = { uid: 'me' };
const weekKey = getDateString(getStartOfWeek(new Date()));
const render = async (element) => {
  const commitElement = async () => { root.render(element); };
  await act(commitElement);
};

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  root = createRoot(container);
  firebase.doc.mockReturnValue('round-ref');
  firebase.runTransaction.mockResolvedValue();
  firebase.onSnapshot.mockReturnValue(jest.fn());
  getChallengeCatalog.mockResolvedValue([{ id: 'challenge', points: 10 }]);
  jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
afterEach(() => {
  act(() => { root.unmount(); });
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

test('weekly optimistic acceptance survives local rerenders until a new server snapshot arrives', async () => {
  const serverEntry = { challengeId: 'challenge', acceptedBy: [] };
  const localEntry = { challengeId: 'challenge', acceptedBy: ['me'] };
  const server = { weeklyChallenge: { [weekKey]: serverEntry } };
  let value;
  function Probe({ coupleData }) {
    value = useDailyChallenge({ userData, coupleData, rounds: [] });
    return null;
  }
  recordWeeklyProgress.mockResolvedValue({ challengeData: localEntry });
  await render(<Probe coupleData={server} />);
  await act(async () => { await value.handleAcceptWeeklyChallenge(); });
  expect(value.challengeState.myAccepted).toBe(true);
  await render(<Probe coupleData={server} />);
  expect(value.challengeState.myAccepted).toBe(true);
  await render(<Probe coupleData={{ weeklyChallenge: { [weekKey]: serverEntry } }} />);
  expect(value.challengeState.myAccepted).toBe(false);
});

test('round evaluation only writes for semantic revisions and reads the latest activities', async () => {
  const round = { id: 'round', startDate: '2000-01-01', endDate: '2099-12-31', rules: {} };
  const updates = [];
  firebase.runTransaction.mockImplementation(async (_db, body) => body({
    get: async () => ({ exists: () => true, data: () => round }),
    update: (...args) => updates.push(args),
  }));
  function Probe({ rounds, activities = [] }) {
    useRoundRules({ user, userData, rounds, allActivities: activities });
    return null;
  }
  await render(<Probe rounds={[]} />);
  expect(firebase.runTransaction).not.toHaveBeenCalled();
  await render(<Probe rounds={[round]} />);
  expect(firebase.runTransaction).toHaveBeenCalledTimes(1);
  await render(<Probe rounds={[{ ...round, scores: { me: 5 } }]} />);
  expect(firebase.runTransaction).toHaveBeenCalledTimes(1);
  await render(<Probe rounds={[round]} activities={[{ id: 'walk', selections: { me: { status: 'confirmed' } } }]} />);
  expect(firebase.runTransaction).toHaveBeenCalledTimes(2);
  expect(updates).toEqual([]);
});

test('point editor keeps a draft for the same id and initializes from the newest activity on id change', async () => {
  const onSave = jest.fn();
  const props = { onSave, onClose: jest.fn() };
  await render(<SetPointsModal {...props} activity={{ id: 'a', points: 9 }} />);
  const input = container.querySelector('input');
  expect(input.value).toBe('9');
  act(() => { Simulate.change(input, { target: { value: '13' } }); });
  await render(<SetPointsModal {...props} activity={{ id: 'a', points: 21 }} />);
  expect(input.value).toBe('13');
  await render(<SetPointsModal {...props} activity={{ id: 'b', points: 7 }} />);
  expect(input.value).toBe('7');
  act(() => { Simulate.click([...container.querySelectorAll('button')][1]); });
  expect(onSave).toHaveBeenCalledWith('b', 7);
  await render(<SetPointsModal {...props} activity={null} />);
  expect(container.textContent).toBe('');
});

test('tour navigates once per step with the stable state setter used by both callers', async () => {
  const setView = jest.fn();
  const props = { onFinish: jest.fn(), setView };
  await render(<OnboardingView {...props} />);
  expect(setView).toHaveBeenCalledTimes(1);
  expect(setView).toHaveBeenLastCalledWith('main');
  await render(<OnboardingView {...props} />);
  expect(setView).toHaveBeenCalledTimes(1);
  const next = [...container.querySelectorAll('button')].find((b) => b.textContent === 'Próximo');
  act(() => { Simulate.click(next); });
  expect(setView).toHaveBeenCalledTimes(2);
});
