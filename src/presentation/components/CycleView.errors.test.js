/* eslint-disable testing-library/no-unnecessary-act -- ReactDOM harness; no Testing Library installed. */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import CycleView from './CycleView';
import { useMenstrualCycle } from '../../application/hooks/useMenstrualCycle';

// Sem este mock, importar o componente alcança o getAuth() real, que lança
// auth/invalid-api-key quando as REACT_APP_* não estão no ambiente (é o caso do CI).
jest.mock('../../infrastructure/firebase', () => ({ db: {}, auth: {} }));

jest.mock('../../application/hooks/useMenstrualCycle');
let container, root, value;
const render = async () => { await act(async () => root.render(<CycleView user={{ uid: 'me' }} userData={{}} coupleData={{}} setView={() => {}} />)); };
beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div'); root = createRoot(container);
  value = { isOwner: true, periods: [], cycleStats: { hasEnoughData: false }, handleLogPeriodStart: jest.fn().mockResolvedValue() };
  useMenstrualCycle.mockImplementation(() => value);
});
afterEach(() => act(() => root.unmount()));

test.each([
  'Não foi possível registrar o período. Tente novamente.',
  'Não foi possível remover o registro do período. Tente novamente.',
])('shows cycle operationError: %s', async (message) => {
  value.operationError = Object.assign(new Error(message), { cause: new Error('permission-denied') });
  await render();
  expect(container.querySelector('[role="alert"]')?.textContent).toBe(message);
  expect(container.textContent).toContain('Registrar início do período');
  expect(container.querySelector('button[type="submit"]').disabled).toBe(false);
  expect(container.textContent).not.toContain('permission-denied');
});

test('leaves the cycle form unchanged and without alerts when the hook has no error', async () => {
  await render();
  expect(container.querySelector('[role="alert"]')).toBeNull();
  expect(container.querySelector('button[type="submit"]').textContent).toBe('Salvar');
});
