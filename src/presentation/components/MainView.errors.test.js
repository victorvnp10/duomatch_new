/* eslint-disable testing-library/no-unnecessary-act -- ReactDOM harness; no Testing Library installed. */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import MainView from './MainView';
import { updateStreak } from '../../application/services/streakService';
import { useAchievements } from '../../application/hooks/useAchievements';
import { useMenstrualCycle } from '../../application/hooks/useMenstrualCycle';
import { useNotificationCenter } from '../../application/hooks/useNotificationCenter';
import { useMatchNotification } from '../../application/hooks/useMatchNotification';

jest.mock('../../application/services/streakService');
jest.mock('../../application/services/sessionService', () => ({ endSession: jest.fn() }));
jest.mock('../../application/hooks/useAchievements');
jest.mock('../../application/hooks/useMenstrualCycle');
jest.mock('../../application/hooks/useNotificationCenter');
jest.mock('../../application/hooks/useMatchNotification');
jest.mock('./DailyChallenge', () => () => null);
jest.mock('./AchievementSystem', () => () => null);
jest.mock('./MatchNotification', () => () => null);

let container, root, props;
const activity = { id: 'walk', name: 'Passear', category: 'Lazer', type: 'atividade', frequency: 'daily', selections: {} };
const nextSelection = { status: 'confirmed', date: '2026-10-17' };
const render = async () => { await act(async () => root.render(<MainView {...props} />)); };
const choose = async () => {
  const button = [...container.querySelectorAll('button')].find((b) => b.textContent.includes('Escolher esta atividade'));
  expect(button).toBeDefined();
  await act(async () => button.dispatchEvent(new MouseEvent('click', { bubbles: true })));
};
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  props = {
    user: { uid: 'me' }, userData: { uid: 'me', coupleId: 'couple', partnerId: 'partner', nickname: 'Eu' },
    coupleData: {}, partnerNickname: 'Par', rounds: [], matches: [], allActivities: [activity], mySelections: {}, partnerSelections: {}, rewards: [], wishlistItems: [],
    dailySuggestions: {}, hotSuggestions: {}, handleSelectActivity: jest.fn().mockResolvedValue({ nextSelection }), handleSelectSuggestion: jest.fn().mockResolvedValue(),
    setView: jest.fn(),
  };
  useAchievements.mockReturnValue({});
  useMenstrualCycle.mockReturnValue({});
  useNotificationCenter.mockReturnValue({ notifications: [], count: 0 });
  useMatchNotification.mockReturnValue({});
  updateStreak.mockResolvedValue();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => { act(() => root.unmount()); container.remove(); jest.restoreAllMocks(); });

test.each(['activity', 'suggestion'])('%s selection observes streak rejection and displays a safe failure without undoing selection', async (kind) => {
  if (kind === 'suggestion') { props.allActivities = []; props.dailySuggestions = { special: { id: 'special', name: 'Jantar', category: 'Lazer' } }; }
  let observed = false;
  updateStreak.mockReturnValueOnce({ then: (_resolve, reject) => { observed = true; reject(new Error('permission-denied')); } });
  await render(); await choose();
  expect(observed).toBe(true);
  expect(container.querySelector('[role="alert"]').textContent).toBe('Não foi possível atualizar a sequência de atividades do casal.');
  expect(container.textContent).not.toContain('permission-denied');
  // Real rejection must also be caught, not only thenable assimilation.
  updateStreak.mockRejectedValueOnce(new Error('permission-denied'));
  await choose();
  expect(container.querySelector('[role="alert"]')).not.toBeNull();
});

test('activity streak receives the committed selection projection and leaves original snapshot untouched', async () => {
  await render(); await choose();
  expect(updateStreak).toHaveBeenCalledWith('couple', { ...props.userData, coupleData: props.coupleData }, [{ ...activity, selections: { me: nextSelection } }], props.dailySuggestions, props.hotSuggestions);
  expect(activity.selections).toEqual({});
  expect(container.querySelector('[role="alert"]')).toBeNull();
});

test.each([undefined, { nextSelection: { status: 'unconfirmed' } }])('does not update streak for an unconfirmed selection result %p', async (result) => {
  props.handleSelectActivity.mockResolvedValue(result);
  await render(); await choose();
  expect(updateStreak).not.toHaveBeenCalled();
});

test('suggestion streak preserves the snapshot and suggestion catalogs used before', async () => {
  props.allActivities = []; props.dailySuggestions = { special: { id: 'special', name: 'Jantar', category: 'Lazer' } };
  await render(); await choose();
  expect(updateStreak).toHaveBeenCalledWith('couple', { ...props.userData, coupleData: props.coupleData }, props.allActivities, props.dailySuggestions, props.hotSuggestions);
});
