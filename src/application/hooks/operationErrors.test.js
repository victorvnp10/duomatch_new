/* eslint-disable testing-library/no-unnecessary-act -- ReactDOM harness; no Testing Library dependency. */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import * as firebase from '../../infrastructure/firebase';
import { signOut } from 'firebase/auth';
import { getActivityCatalog, getChallengeCatalog } from '../../infrastructure/firebase/repositories/ContentRepository';
import { getTodayDateString, getDateString } from '../../shared/lib/dateUtils';
import { getStartOfWeek } from '../../domain/services/WeeklyChallengeSchedule';
import { useActivities } from './useActivities';
import { useAchievements } from './useAchievements';
import { useChat } from './useChat';
import { useCouple } from './useCouple';
import { useDailyChallenge } from './useDailyChallenge';
import { useMenstrualCycle } from './useMenstrualCycle';
import { useRewards } from './useRewards';
import { useRoundRules } from './useRoundRules';
import { useRounds } from './useRounds';
import { useSuggestions } from './useSuggestions';
import { useWishlist } from './useWishlist';
import { updateStreak } from '../services/streakService';

jest.mock('../../infrastructure/firebase', () => ({
  db: {}, auth: {},
  doc: jest.fn((...args) => args.filter((x) => typeof x === 'string').join('/')),
  collection: jest.fn((...args) => args.filter((x) => typeof x === 'string').join('/')),
  query: jest.fn((ref) => ref), orderBy: jest.fn(), limit: jest.fn(),
  increment: jest.fn((n) => n), serverTimestamp: jest.fn(() => 'timestamp'),
  arrayUnion: jest.fn((...args) => args),
  onSnapshot: jest.fn(), addDoc: jest.fn(), updateDoc: jest.fn(), deleteDoc: jest.fn(),
  runTransaction: jest.fn(), writeBatch: jest.fn(), getDocs: jest.fn(), getDoc: jest.fn(),
}));
jest.mock('firebase/firestore', () => jest.requireMock('../../infrastructure/firebase'));
jest.mock('firebase/auth', () => ({ signOut: jest.fn() }));
jest.mock('../../infrastructure/firebase/repositories/ContentRepository', () => ({
  getActivityCatalog: jest.fn(), getChallengeCatalog: jest.fn(), pickVaried: jest.fn(() => []),
}));

const user = { uid: 'me' };
const userData = { uid: 'me', coupleId: 'couple', partnerId: 'partner', gender: 'feminino' };
const rounds = [{ id: 'round', startDate: '2000-01-01', endDate: '2099-12-31' }];
const weeklyKey = getDateString(getStartOfWeek(new Date()));
const coupleData = { weeklyChallenge: { [weeklyKey]: { challengeId: 'challenge', acceptedBy: ['me', 'partner'] } } };
const failure = new Error('permission-denied: internal SDK details');
const snapshot = (data = {}) => ({ exists: () => true, data: () => data });
let roots;
let listeners;
let commit;

function mount(useHook) {
  let value;
  const root = createRoot(document.createElement('div'));
  roots.push(root);
  function Probe() { value = useHook(); return null; }
  act(() => root.render(<Probe />));
  return () => value;
}
const flush = async (fn = () => {}) => { await act(async () => { await fn(); }); };
const assertError = (value, context) => {
  expect(value.operationError).toBeInstanceOf(Error);
  expect(value.operationError.message).toBe(context);
  expect(value.operationError.cause).toBe(failure);
  expect(value.operationError.message).not.toContain('permission-denied');
};

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  roots = []; listeners = [];
  jest.clearAllMocks();
  // CRA resets jest.fn implementations between tests, including module factories.
  firebase.doc.mockImplementation((...args) => args.filter((x) => typeof x === 'string').join('/'));
  firebase.collection.mockImplementation((...args) => args.filter((x) => typeof x === 'string').join('/'));
  firebase.query.mockImplementation((ref) => ref);
  firebase.increment.mockImplementation((n) => n);
  firebase.serverTimestamp.mockReturnValue('timestamp');
  firebase.arrayUnion.mockImplementation((...args) => args);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(window, 'alert').mockImplementation(() => {});
  jest.spyOn(window, 'confirm').mockReturnValue(true);
  firebase.onSnapshot.mockImplementation((ref, next) => { listeners.push({ ref, next }); return jest.fn(); });
  firebase.addDoc.mockResolvedValue({ id: 'new' });
  firebase.updateDoc.mockResolvedValue();
  firebase.deleteDoc.mockResolvedValue();
  firebase.runTransaction.mockResolvedValue();
  firebase.getDoc.mockResolvedValue(snapshot({ coupleId: 'couple' }));
  firebase.getDocs.mockResolvedValue({ docs: [] });
  commit = jest.fn().mockResolvedValue();
  firebase.writeBatch.mockImplementation(() => ({ commit, update: jest.fn(), set: jest.fn(), delete: jest.fn() }));
  signOut.mockResolvedValue();
  getActivityCatalog.mockResolvedValue([]);
  getChallengeCatalog.mockResolvedValue([{ id: 'challenge', name: 'Challenge', points: 10 }]);
});
afterEach(() => {
  roots.forEach((root) => act(() => root.unmount()));
  jest.useRealTimers();
  jest.restoreAllMocks();
});

// Each row exercises a distinct production catch, not a mocked hook.
const handlers = [
  ['activity resolution', () => useActivities(user, userData, {}, rounds), 'handleSetActivityResolution', ['activity', 'completed'], 'updateDoc', 'Não foi possível salvar a resolução da atividade. Tente novamente.'],
  ['challenge resolution', () => useActivities(user, userData, {}, rounds), 'handleResolveChallenge', [{ id: 'activity', challengeState: 'accepted' }, 'completed'], 'runTransaction', 'Não foi possível finalizar o desafio. Tente novamente.'],
  ['activity creation', () => useActivities(user, userData, {}, rounds), 'handleAddActivity', [{ name: 'Walk' }], 'addDoc', 'Não foi possível adicionar a atividade. Tente novamente.'],
  ['chat posting', () => useChat(user, userData, []), 'handlePostComment', ['activity', 'Hello'], 'commit', 'Não foi possível enviar a mensagem. Tente novamente.'],
  ['chat editing', () => useChat(user, userData, []), 'handleEditComment', ['activity', 'comment', 'Edited'], 'updateDoc', 'Não foi possível salvar a edição da mensagem ou atualizar seu resumo.'],
  ['chat deletion', () => useChat(user, userData, []), 'handleDeleteComment', ['activity', 'comment'], 'deleteDoc', 'Não foi possível concluir a exclusão da mensagem e atualizar seu resumo.'],
  ['unlinking', () => useCouple(user, userData), 'handleUnlinkCouple', [], 'getDoc', 'Não foi possível concluir a desvinculação do casal. Alguns dados podem já ter sido removidos.'],
  ['weekly acceptance', () => useDailyChallenge({ userData, coupleData, rounds }), 'handleAcceptWeeklyChallenge', [], 'runTransaction', 'Não foi possível aceitar o desafio semanal. Tente novamente.'],
  ['weekly claim', () => useDailyChallenge({ userData, coupleData, rounds }), 'handleClaimCompletion', [], 'runTransaction', 'Não foi possível registrar a conclusão do desafio semanal. Tente novamente.'],
  ['weekly confirmation', () => useDailyChallenge({ userData, coupleData, rounds }), 'handleConfirmPartner', [true], 'runTransaction', 'Não foi possível confirmar o desafio do parceiro. Tente novamente.'],
  ['period logging', () => useMenstrualCycle({ user, userData, coupleData: {} }), 'handleLogPeriodStart', [{ startDate: '2026-10-01', periodLength: 5 }], 'runTransaction', 'Não foi possível registrar o período. Tente novamente.'],
  ['period deletion', () => useMenstrualCycle({ user, userData, coupleData: {} }), 'handleDeletePeriodEntry', ['2026-10-01'], 'runTransaction', 'Não foi possível remover o registro do período. Tente novamente.'],
  ['reward creation', () => useRewards(user, userData, {}, rounds), 'handleCreateReward', [{ name: 'Reward' }], 'addDoc', 'Não foi possível criar a recompensa. Tente novamente.'],
  ['reward approval', () => useRewards(user, userData, {}, rounds), 'handleApproveReward', ['reward', 10], 'runTransaction', 'Não foi possível aprovar a recompensa. Confira seu estado e tente novamente.'],
  ['reward purchase', () => useRewards(user, userData, {}, rounds), 'handlePurchaseReward', [{ id: 'reward', name: 'Reward', cost: 10 }], 'runTransaction', 'Não foi possível comprar a recompensa. Confira o saldo e a disponibilidade.'],
  ['round creation', () => useRounds(userData), 'handleAddRound', [{ startDate: '2026-10-01' }], 'addDoc', 'Não foi possível criar a rodada. Tente novamente.'],
  ['round update', () => useRounds(userData), 'handleUpdateRound', ['round', { name: 'Round' }], 'updateDoc', 'Não foi possível salvar as alterações da rodada. Tente novamente.'],
  ['suggestion selection', () => useSuggestions(userData, null, 'normal'), 'handleSelectSuggestion', ['suggestion'], 'runTransaction', 'Não foi possível registrar sua escolha de sugestão. Tente novamente.'],
  ['wishlist creation', () => useWishlist(user, userData, {}, rounds), 'handleAddItemToWishlist', [{ name: 'Gift', points: 10 }], 'commit', 'Não foi possível adicionar o desejo. Tente novamente.'],
  ['gift confirmation', () => useWishlist(user, userData, {}, rounds), 'handleConfirmGiftReceived', [{ id: 'gift', name: 'Gift' }], 'runTransaction', 'Não foi possível confirmar o recebimento do presente. Tente novamente.'],
];
test.each(handlers)('%s exposes contextual operationError instead of an unobservable resolved failure', async (_name, useHook, method, args, dependency, message) => {
  const read = mount(useHook);
  await flush();
  (dependency === 'commit' ? commit : firebase[dependency]).mockRejectedValueOnce(failure);
  await flush(() => read()[method](...args));
  assertError(read(), message);
  // eslint-disable-next-line jest/no-conditional-expect -- asserção dirigida pela tabela de casos: cada caso executa exatamente um ramo
  if (method === 'handlePurchaseReward') expect(read().purchaseNotification.visible).toBe(false);
  // eslint-disable-next-line jest/no-conditional-expect -- asserção dirigida pela tabela de casos: cada caso executa exatamente um ramo
  if (method === 'handleResolveChallenge') expect(read().pointsMessage).toBe('');
});

test.each([
  ['handleUpdateCoupleData', [{ name: 'Us' }], 'Não foi possível atualizar os dados do casal. Tente novamente.'],
  ['handleCompleteOnboarding', [], 'Não foi possível salvar a conclusão da apresentação inicial. Tente novamente.'],
])('%s rejects with context so a caller cannot continue assuming persistence', async (method, args, message) => {
  const read = mount(() => useCouple(user, userData));
  firebase.updateDoc.mockRejectedValueOnce(failure);
  await flush(async () => {
    await expect(read()[method](...args)).rejects.toMatchObject({ message, cause: failure });
  });
  assertError(read(), message);
  expect(read().error).toBeNull(); // Mutation failures must not replace the fatal loading/listener state.
});

test('streak update rejects with context rather than reporting successful completion', async () => {
  firebase.runTransaction.mockRejectedValueOnce(failure);
  await expect(updateStreak('couple', userData, [], {}, {})).rejects.toMatchObject({
    message: 'Não foi possível atualizar a sequência de atividades do casal.', cause: failure,
  });
});

test.each([
  ['normal points', { points: 10, selections: { me: { status: 'confirmed', resolution: 'completed', date: getTodayDateString() }, partner: { status: 'confirmed', resolution: 'completed', date: getTodayDateString() } } }, 'Não foi possível registrar os pontos da atividade. A pontuação pode estar desatualizada.'],
  ['intimacy points', { category: 'Hot', points: 0, selections: { me: { status: 'confirmed', date: getTodayDateString() }, partner: { status: 'confirmed', date: getTodayDateString() } } }, 'Não foi possível registrar os pontos de intimidade. A pontuação pode estar desatualizada.'],
])('%s failure from the activity listener is observable', async (_name, data, message) => {
  const read = mount(() => useActivities(user, userData, {}, rounds));
  firebase.runTransaction.mockRejectedValueOnce(failure);
  await flush(() => listeners[0].next({ forEach: (fn) => fn({ id: 'activity', data: () => data }) }));
  assertError(read(), message);
  expect(read().allActivities).toHaveLength(1); // Still render the successfully received snapshot.
});

test('cyclical rule evaluation exposes persistence failure without rejecting an effect', async () => {
  firebase.runTransaction.mockRejectedValueOnce(failure);
  const read = mount(() => useRoundRules({ user, userData, rounds, allActivities: [] }));
  await flush();
  assertError(read(), 'Não foi possível aplicar as regras da rodada. O placar pode estar desatualizado.');
  expect(firebase.runTransaction).toHaveBeenCalledTimes(1); // Error render must not create a retry loop.
});

test('achievement persistence failure is observable and does not emit an unlocked event', async () => {
  jest.useFakeTimers();
  const unlocked = jest.fn();
  window.addEventListener('achievementUnlocked', unlocked);
  try {
    firebase.updateDoc.mockRejectedValueOnce(failure);
    const props = { userData, coupleData: { streak: 100 }, allActivities: [{ id: 'activity' }] };
    const read = mount(() => useAchievements(props));
    await flush(() => jest.advanceTimersByTime(1000));
    assertError(read(), 'Não foi possível salvar as conquistas do casal.');
    expect(unlocked).not.toHaveBeenCalled();
    await flush(() => jest.advanceTimersByTime(3000));
    expect(firebase.updateDoc).toHaveBeenCalledTimes(1); // Error state alone must not schedule another write.
  } finally { window.removeEventListener('achievementUnlocked', unlocked); }
});

test.each([
  ['weekly catalog', () => useDailyChallenge({ userData, coupleData, rounds }), getChallengeCatalog, 'Não foi possível carregar o catálogo de desafios semanais.'],
  ['suggestion catalog', () => useSuggestions(userData, null, 'normal'), getActivityCatalog, 'Não foi possível carregar o catálogo de sugestões.'],
])('%s failure is not disguised as an empty catalog', async (_name, useHook, fetchCatalog, message) => {
  fetchCatalog.mockRejectedValueOnce(failure);
  const read = mount(useHook);
  await flush();
  assertError(read(), message);
});

test('failed read receipts expose degradation and allow retry on a later snapshot', async () => {
  const read = mount(() => useChat(user, userData, []));
  act(() => read().setActiveChatActivity({ id: 'activity' }));
  const emit = () => listeners[0].next({ docs: [{ id: 'comment', data: () => ({ authorId: 'partner' }) }] });
  commit.mockRejectedValueOnce(failure);
  await flush(emit);
  assertError(read(), 'Não foi possível marcar as mensagens como lidas.');
  await flush(emit);
  expect(commit).toHaveBeenCalledTimes(2);
});

test('failed approval receipt exposes degradation and allows retry on a later snapshot', async () => {
  const read = mount(() => useRewards(user, userData, {}, rounds));
  const emit = () => listeners[0].next({ forEach: (fn) => fn({ id: 'reward', data: () => ({ status: 'pending_approval', createdBy: 'partner' }) }) });
  commit.mockRejectedValueOnce(failure);
  await flush(emit);
  assertError(read(), 'Não foi possível registrar a leitura das notificações de aprovação.');
  await flush(emit);
  expect(commit).toHaveBeenCalledTimes(2);
  expect(read().approvalNotifications).toHaveLength(1);
});

test('failed message counter update remains observable while deletion and preview finish', async () => {
  const read = mount(() => useChat(user, userData, []));
  firebase.updateDoc.mockRejectedValueOnce(failure);
  await flush(() => read().handleDeleteComment('activity', 'comment'));
  assertError(read(), 'Mensagem excluída, mas não foi possível atualizar o contador de mensagens.');
  expect(firebase.updateDoc).toHaveBeenLastCalledWith('duomatches/couple/activities/activity', { lastMessage: null });
});

test('logout after unlink failure reports partial success, not a failed deletion or promised logout', async () => {
  const read = mount(() => useCouple(user, userData));
  signOut.mockRejectedValueOnce(failure);
  await flush(() => read().handleUnlinkCouple());
  assertError(read(), 'Casal desvinculado, mas sua sessão continua aberta. Saia da conta para concluir.');
  expect(window.alert).not.toHaveBeenCalledWith('Casal desvinculado com sucesso. Você será desconectado.');
});

test('operation errors stay available until explicitly dismissed without recreating listeners', async () => {
  const read = mount(() => useRounds(userData));
  firebase.addDoc.mockRejectedValueOnce(failure);
  await flush(() => read().handleAddRound({ startDate: '2026-10-01' }));
  assertError(read(), 'Não foi possível criar a rodada. Tente novamente.');
  const clear = read().clearOperationError;
  await flush(() => read().handleAddRound({ startDate: '2026-10-01' }));
  expect(read().operationError).not.toBeNull(); // A different success must not silently erase an unseen error.
  expect(read().clearOperationError).toBe(clear);
  act(() => read().clearOperationError());
  expect(read().operationError).toBeNull();
  expect(firebase.onSnapshot).toHaveBeenCalledTimes(1);
});


test('a transaction callback followed by a failed commit must not announce awarded points', async () => {
  const read = mount(() => useActivities(user, userData, {}, rounds));
  const data = { name: 'Walk', points: 10, selections: {
    me: { status: 'confirmed', date: getTodayDateString(), resolution: 'completed' },
    partner: { status: 'confirmed', date: getTodayDateString(), resolution: 'completed' },
  } };
  firebase.runTransaction.mockImplementationOnce(async (_db, callback) => {
    await callback({ get: async () => snapshot(data), update: jest.fn() });
    throw failure; // Network/permission rejection happens AFTER the transaction body.
  });
  await flush(() => listeners[0].next({ forEach: (fn) => fn({ id: 'activity', data: () => data }) }));
  assertError(read(), 'Não foi possível registrar os pontos da atividade. A pontuação pode estar desatualizada.');
  expect(read().pointsMessage).toBe('');
});

test('successful points commit retains the success message and leaves the error empty', async () => {
  const read = mount(() => useActivities(user, userData, {}, rounds));
  const data = { name: 'Walk', points: 10, selections: {
    me: { status: 'confirmed', date: getTodayDateString(), resolution: 'completed' },
    partner: { status: 'confirmed', date: getTodayDateString(), resolution: 'completed' },
  } };
  firebase.runTransaction.mockImplementationOnce(async (_db, callback) =>
    callback({ get: async () => snapshot(data), update: jest.fn() })
  );
  await flush(() => listeners[0].next({ forEach: (fn) => fn({ id: 'activity', data: () => data }) }));
  expect(read().pointsMessage).toBe('Pontos da atividade "Walk" foram adicionados!');
  expect(read().operationError).toBeNull();
});

test('successful unlink still signs out and announces success without an operationError', async () => {
  const read = mount(() => useCouple(user, userData));
  await flush(() => read().handleUnlinkCouple());
  expect(read().operationError).toBeNull();
  expect(signOut).toHaveBeenCalledTimes(1);
  expect(window.alert).toHaveBeenCalledWith('Casal desvinculado com sucesso. Você será desconectado.');
});

test.each([
  ['weekly', () => useDailyChallenge({ userData, coupleData, rounds }), getChallengeCatalog],
  ['suggestions', () => useSuggestions(userData, null, 'normal'), getActivityCatalog],
])('%s catalog rejection after unmount is cancelled rather than reported', async (_name, useHook, getCatalog) => {
  let reject;
  getCatalog.mockReturnValueOnce(new Promise((_resolve, rejectPromise) => { reject = rejectPromise; }));
  mount(useHook);
  act(() => roots.pop().unmount());
  await flush(() => reject(failure));
  expect(console.error).not.toHaveBeenCalled();
});
