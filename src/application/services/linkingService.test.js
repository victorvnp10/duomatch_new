import { reserveInviteCode, linkAccounts, skipLinking } from './linkingService';
import { db, doc, collection, updateDoc, serverTimestamp, writeBatch, runTransaction, Timestamp } from '../../infrastructure/firebase';
import { generateInviteCode, INVITE_CODE_TTL_MS } from '../../presentation/components/inviteCode';

jest.mock('../../infrastructure/firebase', () => ({ db: {}, doc: jest.fn(), collection: jest.fn(), updateDoc: jest.fn(), serverTimestamp: jest.fn(), writeBatch: jest.fn(), runTransaction: jest.fn(), Timestamp: { fromDate: jest.fn() } }));
jest.mock('../../presentation/components/inviteCode', () => ({ generateInviteCode: jest.fn(), INVITE_CODE_TTL_MS: 86400000 }));
const user = { uid: 'me' };
const userData = { nickname: 'Mine' };
let transaction, seed, cleanup, invite, events;
beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(Date, 'now').mockReturnValue(1000);
  jest.spyOn(console, 'error').mockImplementation(() => {});
  events = [];
  invite = { creatorId: 'partner', creatorNickname: 'Partner', coupleId: 'couple', expiresAt: { toDate: () => new Date(2000) } };
  collection.mockImplementation((_, path) => path);
  doc.mockImplementation((...args) => ({ id: args.length === 1 ? 'auto' : args[2], path: args.length === 1 ? args[0] + '/auto' : args[1] + '/' + args[2] }));
  serverTimestamp.mockReturnValue('SERVER');
  Timestamp.fromDate.mockImplementation(date => date);
  generateInviteCode.mockReturnValue('CODE');
  transaction = {
    get: jest.fn(async ref => { events.push(['get', ref.path]); return { exists: () => true, data: () => invite }; }),
    set: jest.fn((ref, data) => events.push(['set', ref.path, data])),
    update: jest.fn((ref, data) => events.push(['update', ref.path, data])),
    delete: jest.fn(ref => events.push(['delete', ref.path])),
  };
  runTransaction.mockImplementation((_, callback) => callback(transaction));
  seed = { set: jest.fn(), commit: jest.fn(async () => { events.push(['seed']); }) };
  cleanup = { delete: jest.fn(), update: jest.fn(), commit: jest.fn().mockResolvedValue() };
  writeBatch.mockReturnValueOnce(seed).mockReturnValueOnce(cleanup);
});
afterEach(() => jest.restoreAllMocks());

test('link preserves exact ordered atomic payloads and seeds after transaction', async () => {
  expect(await linkAccounts(user, userData, 'CODE')).toBe(true);
  expect(runTransaction).toHaveBeenCalledWith(db, expect.any(Function));
  expect(events).toEqual([
    ['get', 'inviteCodes/CODE'],
    ['set', 'duomatches/couple', { members: ['me', 'partner'], memberNicknames: { me: 'Mine', partner: 'Partner' }, createdAt: 'SERVER', createdBy: 'me', invitedUserId: 'partner', inviteCode: 'CODE', confirmationTime: '22:00' }],
    ['update', 'users/me', { partnerId: 'partner', coupleId: 'couple' }],
    ['update', 'users/partner', { partnerId: 'me', coupleId: 'couple' }],
    ['delete', 'inviteCodes/CODE'], ['seed'],
  ]);
  expect(seed.set).toHaveBeenCalledTimes(12);
  expect(seed.set.mock.calls[0]).toEqual([{ id: 'auto', path: 'duomatches/couple/activities/auto' }, { name: 'Cozinhar uma refeição nova juntos', category: 'Comida & Bebida', type: 'atividade', description: 'Escolham uma receita que nunca tentaram e preparem o jantar em equipe. O trabalho em conjunto pode ser delicioso!', periodicity: null, createdAt: 'SERVER', createdBy: 'SYSTEM', completionStatus: null, points: 0, selections: {} }]);
});

test('seeds wait for transaction resolution', async () => {
  let release;
  runTransaction.mockReturnValue(new Promise(resolve => { release = resolve; }));
  const pending = linkAccounts(user, userData, 'CODE');
  expect(writeBatch).not.toHaveBeenCalled();
  release({ coupleId: 'couple', partnerId: 'partner' });
  await expect(pending).resolves.toBe(true);
});

test.each(['missing', 'self', 'old', 'expired', 'malformed'])('validation %s prevents every write', async kind => {
  if (kind === 'missing') transaction.get.mockResolvedValue({ exists: () => false });
  if (kind === 'self') invite.creatorId = 'me';
  if (kind === 'old') delete invite.coupleId;
  if (kind === 'expired') invite.expiresAt.toDate = () => new Date(1000);
  if (kind === 'malformed') invite.expiresAt = {};
  await expect(linkAccounts(user, userData, 'CODE')).rejects.toMatchObject({ isValidation: true });
  expect(transaction.set).not.toHaveBeenCalled();
  expect(writeBatch).not.toHaveBeenCalled();
});

test('transaction rejection propagates identical error without seed or rollback', async () => {
  const error = new Error('denied');
  runTransaction.mockRejectedValue(error);
  await expect(linkAccounts(user, userData, 'CODE')).rejects.toBe(error);
  expect(writeBatch).not.toHaveBeenCalled();
});

test.each([false, true])('seed rejection compensates in original order; cleanup failure=%s', async failCleanup => {
  const error = new Error('seed');
  seed.commit.mockRejectedValue(error);
  const cleanupError = new Error('cleanup');
  if (failCleanup) cleanup.commit.mockRejectedValue(cleanupError);
  await expect(linkAccounts(user, userData, 'CODE')).resolves.toBe(false);
  expect(cleanup.delete.mock.calls).toEqual([[{ id: 'couple', path: 'duomatches/couple' }]]);
  expect(cleanup.update.mock.calls).toEqual([
    [{ id: 'me', path: 'users/me' }, { partnerId: null, coupleId: null }],
    [{ id: 'partner', path: 'users/partner' }, { partnerId: null, coupleId: null }],
  ]);
  expect(cleanup.delete.mock.invocationCallOrder[0]).toBeLessThan(cleanup.update.mock.invocationCallOrder[0]);
  expect(cleanup.update.mock.invocationCallOrder[1]).toBeLessThan(cleanup.commit.mock.invocationCallOrder[0]);
  expect(console.error).toHaveBeenCalledWith('Erro ao criar atividades iniciais:', error);
  expect(console.error.mock.calls).toEqual(failCleanup
    ? [['Erro ao criar atividades iniciais:', error], ['Erro no rollback compensatório do vínculo:', cleanupError]]
    : [['Erro ao criar atividades iniciais:', error]]);
});

test('reservation retries collision and stores exact expiry and payload', async () => {
  transaction.get.mockResolvedValueOnce({ exists: () => true }).mockResolvedValueOnce({ exists: () => false });
  expect(await reserveInviteCode('me', 'Mine')).toBe('CODE');
  expect(runTransaction).toHaveBeenCalledTimes(2);
  expect(Timestamp.fromDate).toHaveBeenCalledWith(new Date(1000 + INVITE_CODE_TTL_MS));
  expect(transaction.set).toHaveBeenCalledWith({ id: 'CODE', path: 'inviteCodes/CODE' }, { creatorId: 'me', creatorNickname: 'Mine', coupleId: 'auto', createdAt: 'SERVER', expiresAt: new Date(86401000) });
});
test('reservation stops after five collisions', async () => {
  await expect(reserveInviteCode('me', 'Mine')).rejects.toThrow('Não foi possível gerar um código livre.');
  expect(runTransaction).toHaveBeenCalledTimes(5);
});
test('reservation propagates original non-collision error', async () => {
  const error = new Error('denied');
  runTransaction.mockRejectedValue(error);
  await expect(reserveInviteCode('me', 'Mine')).rejects.toBe(error);
  expect(runTransaction).toHaveBeenCalledTimes(1);
});
test('skip returns original promise, exact payload and rejection identity', async () => {
  const error = new Error('skip');
  const pending = Promise.reject(error);
  updateDoc.mockReturnValue(pending);
  expect(skipLinking('me')).toBe(pending);
  expect(updateDoc).toHaveBeenCalledWith({ id: 'me', path: 'users/me' }, { onboardingSkipped: true });
  await expect(pending).rejects.toBe(error);
});
