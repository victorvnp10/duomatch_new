/* eslint-disable testing-library/no-unnecessary-act -- ReactDOM harness; no Testing Library installed. */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import DuoMatchApp from './DuoMatchApp';
import { useCouple } from '../../application/hooks/useCouple';
import { useActivities } from '../../application/hooks/useActivities';
import { useRounds } from '../../application/hooks/useRounds';
import { useWishlist } from '../../application/hooks/useWishlist';
import { useRewards } from '../../application/hooks/useRewards';
import { useChat } from '../../application/hooks/useChat';
import { useSuggestions } from '../../application/hooks/useSuggestions';
import { useRoundRules } from '../../application/hooks/useRoundRules';
import { useNotificationCenter } from '../../application/hooks/useNotificationCenter';

jest.mock('../../application/hooks/useCouple');
jest.mock('../../application/hooks/useActivities');
jest.mock('../../application/hooks/useRounds');
jest.mock('../../application/hooks/useWishlist');
jest.mock('../../application/hooks/useRewards');
jest.mock('../../application/hooks/useChat');
jest.mock('../../application/hooks/useSuggestions');
jest.mock('../../application/hooks/useRoundRules');
jest.mock('../../application/hooks/useNotificationCenter');
jest.mock('../../infrastructure/firebase', () => ({ db: {}, auth: {} }));
jest.mock('./MainView', () => () => <div>Feed principal</div>);
jest.mock('./RoundsView', () => () => <div>Rodadas</div>);
jest.mock('./OnboardingView', () => ({ onFinish }) => <button onClick={onFinish}>Concluir tour</button>);
jest.mock('./NotificationManager', () => () => null);
jest.mock('../pwa/PwaNotificationBridge', () => () => null);
jest.mock('./BottomNavBar', () => ({ setView }) => <button onClick={() => setView('rounds')}>Ver rodadas</button>);

let container, root, couple;
const user = { uid: 'me', email: 'me@example.test' };
const userData = { coupleId: 'couple', partnerId: 'partner' };
const render = async () => { await act(async () => root.render(<DuoMatchApp user={user} userData={userData} />)); };
const click = async (text) => {
  const button = [...container.querySelectorAll('button')].find((b) => b.textContent === text);
  expect(button).toBeDefined();
  await act(async () => button.dispatchEvent(new MouseEvent('click', { bubbles: true })));
};
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  couple = { coupleData: { onboardingCompletedBy: [] }, handleCompleteOnboarding: jest.fn().mockResolvedValue() };
  useCouple.mockImplementation(() => couple);
  useActivities.mockReturnValue({ allActivities: [], mySelections: {}, partnerSelections: {}, matches: [] });
  useRounds.mockReturnValue({ rounds: [] });
  useWishlist.mockReturnValue({ wishlistItems: [] });
  useRewards.mockReturnValue({ rewards: [] });
  useChat.mockReturnValue({});
  useSuggestions.mockReturnValue({ suggestions: {} });
  useRoundRules.mockReturnValue({});
  useNotificationCenter.mockReturnValue({ notifications: [], count: 0 });
  jest.spyOn(window, 'alert').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => { act(() => root.unmount()); container.remove(); jest.restoreAllMocks(); });

test.each([
  ['casal', useCouple], ['atividades', useActivities], ['rodadas', useRounds],
  ['desejos', useWishlist], ['recompensas', useRewards], ['chat', useChat], ['regras', useRoundRules],
])('shows %s operationError independently of other hooks', async (name, hook) => {
  const value = hook();
  hook.mockReturnValue({ ...value, operationError: Object.assign(new Error(`Falha em ${name}.`), { cause: new Error('permission-denied') }) });
  couple.coupleData.onboardingCompletedBy = ['me'];
  await render();
  expect([...container.querySelectorAll('[role="alert"]')].map((p) => p.textContent)).toContain(`Falha em ${name}.`);
  expect(container.textContent).not.toContain('permission-denied');
  await click('Ver rodadas');
  expect(container.textContent).toContain(`Falha em ${name}.`);
});

test.each(['hot', 'daily'])('shows %s suggestions error even when the catalog is empty', async (type) => {
  couple.coupleData.onboardingCompletedBy = ['me'];
  useSuggestions.mockImplementation((_data, _add, kind) => ({ suggestions: {}, operationError: kind === type ? new Error(`Catálogo ${type} indisponível.`) : null }));
  await render();
  expect(container.querySelector('[role="alert"]').textContent).toBe(`Catálogo ${type} indisponível.`);
});

test('keeps simultaneous errors separate instead of overwriting them through handler spreads', async () => {
  couple.coupleData.onboardingCompletedBy = ['me'];
  couple.operationError = new Error('Falha casal.');
  useActivities.mockReturnValue({ ...useActivities(), operationError: new Error('Falha atividade.') });
  useRewards.mockReturnValue({ ...useRewards(), operationError: new Error('Falha recompensa.') });
  await render();
  expect([...container.querySelectorAll('[role="alert"]')].map((p) => p.textContent)).toEqual(['Falha casal.', 'Falha atividade.', 'Falha recompensa.']);
});

test('does not render operation alerts when hooks have no failure', async () => {
  couple.coupleData.onboardingCompletedBy = ['me'];
  await render();
  expect(container.querySelector('[role="alert"]')).toBeNull();
  expect(container.textContent).toContain('Feed principal');
});

test('onboarding waits for persistence before closing and navigating on success', async () => {
  let resolve;
  couple.handleCompleteOnboarding.mockReturnValue(new Promise((r) => { resolve = r; }));
  await render(); await click('Concluir tour');
  expect(container.textContent).toContain('Concluir tour');
  expect(container.textContent).toContain('Feed principal');
  await act(async () => resolve());
  expect(container.textContent).not.toContain('Concluir tour');
  expect(container.textContent).toContain('Rodadas');
});

test('onboarding catches rejection, informs visibly and keeps tour available for retry', async () => {
  // A tracked thenable lets the pre-fix test prove missing handling without creating
  // an unhandled rejection in Jest itself. Real Promise rejection is exercised on retry.
  let observed = false;
  const failure = new Error('Não foi possível salvar a conclusão da apresentação inicial. Tente novamente.');
  couple.handleCompleteOnboarding.mockReturnValueOnce({ then: (_resolve, reject) => { observed = true; reject(failure); } });
  await render(); await click('Concluir tour');
  expect(observed).toBe(true);
  expect(window.alert).toHaveBeenCalledWith(failure.message);
  expect(container.textContent).toContain('Concluir tour');
  couple.handleCompleteOnboarding.mockRejectedValueOnce(failure);
  await click('Concluir tour');
  expect(container.textContent).toContain('Concluir tour');
  couple.handleCompleteOnboarding.mockResolvedValueOnce();
  await click('Concluir tour');
  expect(container.textContent).not.toContain('Concluir tour');
  expect(container.textContent).toContain('Rodadas');
});
