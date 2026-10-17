import { changeAccountPassword, updateUserProfile } from './accountService';
import { db, doc } from '../../infrastructure/firebase';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { updateDoc } from 'firebase/firestore';

jest.mock('../../infrastructure/firebase', () => ({ db: { id: 'db' }, doc: jest.fn() }));
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(), EmailAuthProvider: { credential: jest.fn() },
  reauthenticateWithCredential: jest.fn(), updatePassword: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({ updateDoc: jest.fn() }));

beforeEach(() => {
  jest.resetAllMocks();
  getAuth.mockReturnValue({ currentUser: 'current-user' });
  EmailAuthProvider.credential.mockReturnValue('credential');
  doc.mockReturnValue('users/u1');
});

test('password update waits for reauthentication and uses exact credentials', async () => {
  let finishReauthentication;
  reauthenticateWithCredential.mockImplementation(() => new Promise(resolve => { finishReauthentication = resolve; }));
  const pending = changeAccountPassword('a@b.c', 'old', 'new');
  expect(getAuth).toHaveBeenCalledTimes(1);
  expect(EmailAuthProvider.credential).toHaveBeenCalledWith('a@b.c', 'old');
  expect(reauthenticateWithCredential).toHaveBeenCalledWith('current-user', 'credential');
  expect(updatePassword).not.toHaveBeenCalled();
  finishReauthentication();
  await pending;
  expect(updatePassword).toHaveBeenCalledWith('current-user', 'new');
});

test('password update reads currentUser again after reauthentication', async () => {
  const auth = { currentUser: 'before' };
  getAuth.mockReturnValue(auth);
  reauthenticateWithCredential.mockImplementation(async () => { auth.currentUser = 'after'; });
  await changeAccountPassword('a@b.c', 'old', 'new');
  expect(updatePassword).toHaveBeenCalledWith('after', 'new');
});

test('reauthentication error propagates without attempting password change', async () => {
  const error = new Error('bad password');
  reauthenticateWithCredential.mockRejectedValue(error);
  await expect(changeAccountPassword('a@b.c', 'old', 'new')).rejects.toBe(error);
  expect(updatePassword).not.toHaveBeenCalled();
});

test('password update error propagates unchanged', async () => {
  const error = new Error('weak password');
  updatePassword.mockRejectedValue(error);
  await expect(changeAccountPassword('a@b.c', 'old', 'new')).rejects.toBe(error);
});

test('profile update writes the exact object to the user document', async () => {
  const updates = { nickname: ' Name ', gender: 'feminino', extra: null };
  await updateUserProfile('u1', updates);
  expect(doc).toHaveBeenCalledWith(db, 'users', 'u1');
  expect(updateDoc).toHaveBeenCalledTimes(1);
  expect(updateDoc).toHaveBeenCalledWith('users/u1', updates);
  expect(updateDoc.mock.calls[0][1]).toBe(updates);
});

test('profile write errors propagate to the existing UI handler', async () => {
  const error = new Error('permission denied');
  updateDoc.mockRejectedValue(error);
  await expect(updateUserProfile('u1', {})).rejects.toBe(error);
});
