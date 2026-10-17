/* eslint-disable testing-library/no-unnecessary-act -- ReactDOM harness; no Testing Library installed. */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import DailyChallenge from './DailyChallenge';
import { useDailyChallenge } from '../../application/hooks/useDailyChallenge';

// Sem este mock, importar o componente alcança o getAuth() real, que lança
// auth/invalid-api-key quando as REACT_APP_* não estão no ambiente (é o caso do CI).
jest.mock('../../infrastructure/firebase', () => ({ db: {}, auth: {} }));

jest.mock('../../application/hooks/useDailyChallenge');
let container, root, value;
const render = async () => { await act(async () => root.render(<DailyChallenge userData={{ uid: 'me' }} coupleData={{}} rounds={[]} />)); };
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div'); root = createRoot(container);
  value = { selectedChallenge: { id: 'challenge', title: 'Passear juntos', type: 'romantic', points: 10 }, challengeState: {}, calculateWeeklyProgress: { daysRemaining: 3, percentage: 50 } };
  useDailyChallenge.mockImplementation(() => value);
});
afterEach(() => act(() => root.unmount()));

test.each([true, false])('shows weekly challenge operationError, including absent catalog (selected=%s)', async (selected) => {
  if (!selected) value.selectedChallenge = null;
  value.operationError = Object.assign(new Error('Não foi possível carregar o catálogo de desafios semanais.'), { cause: new Error('permission-denied') });
  await render();
  expect(container.querySelector('[role="alert"]')?.textContent).toBe(value.operationError.message);
  expect(container.textContent).not.toContain('permission-denied');
  if (selected) expect(container.textContent).toContain('Passear juntos');
});

test('keeps the empty catalog hidden when there is no failure', async () => {
  value.selectedChallenge = null;
  await render();
  expect(container.textContent).toBe('');
});

test('does not block existing challenge actions when displaying an operation error', async () => {
  value.operationError = new Error('Não foi possível aceitar o desafio semanal. Tente novamente.');
  value.handleAcceptWeeklyChallenge = jest.fn();
  await render();
  const accept = [...container.querySelectorAll('button')].find((b) => b.textContent === 'Aceitar Desafio');
  expect(accept.disabled).toBe(false);
  await act(async () => accept.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  expect(value.handleAcceptWeeklyChallenge).toHaveBeenCalledTimes(1);
  expect(container.querySelector('[role="alert"]')?.textContent).toBe(value.operationError.message);
});
