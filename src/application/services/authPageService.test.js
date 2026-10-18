import {
  signInEmail, linkEmailAccount, registerEmailAccount, ensureGoogleUserDoc,
  readGoogleRedirect, openGooglePopup, startGoogleRedirect,
  getEmailSignInMethods, getGoogleCredential,
} from './authPageService';
import * as firebase from '../../infrastructure/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

jest.mock('../../infrastructure/firebase', () => ({
  auth: { id: 'auth' }, db: { id: 'db' }, googleProvider: { id: 'google' },
  setNewUserData: jest.fn(), getRedirectResult: jest.fn(), signInWithPopup: jest.fn(),
  signInWithRedirect: jest.fn(), fetchSignInMethodsForEmail: jest.fn(),
  linkWithCredential: jest.fn(), GoogleAuthProvider: { credentialFromError: jest.fn() },
}));
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(), signInWithEmailAndPassword: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(), getDoc: jest.fn(), setDoc: jest.fn(), serverTimestamp: jest.fn(),
}));

beforeEach(() => {
  jest.resetAllMocks();
  doc.mockReturnValue('users/u1');
  serverTimestamp.mockReturnValue('server-time');
});

test('email login forwards unmodified arguments and result', async () => {
  const result = { user: { uid: 'u1' } };
  signInWithEmailAndPassword.mockResolvedValue(result);
  expect(await signInEmail('a@b.c', 'secret')).toBe(result);
  expect(signInWithEmailAndPassword).toHaveBeenCalledWith(firebase.auth, 'a@b.c', 'secret');
});

test('links Google only after email login resolves, without waiting for a render', async () => {
  let resolveLogin;
  signInWithEmailAndPassword.mockReturnValue(new Promise(resolve => { resolveLogin = resolve; }));
  const pending = linkEmailAccount({ email: 'a@b.c', credential: 'google-credential' }, 'password');
  expect(firebase.linkWithCredential).not.toHaveBeenCalled();
  resolveLogin({ user: 'signed-in-user' });
  await pending;
  expect(signInWithEmailAndPassword).toHaveBeenCalledWith(firebase.auth, 'a@b.c', 'password');
  expect(firebase.linkWithCredential).toHaveBeenCalledWith('signed-in-user', 'google-credential');
});

test('failed login propagates the original error and never links', async () => {
  const error = { code: 'auth/wrong-password' };
  signInWithEmailAndPassword.mockRejectedValue(error);
  await expect(linkEmailAccount({ email: 'a@b.c' }, 'bad')).rejects.toBe(error);
  expect(firebase.linkWithCredential).not.toHaveBeenCalled();
});

test('registration writes the same initial profile before setting new-user fallback', async () => {
  let finishWrite;
  let markWriteStarted;
  const writeStarted = new Promise(resolve => { markWriteStarted = resolve; });
  createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'u1' } });
  setDoc.mockImplementation(() => {
    markWriteStarted();
    return new Promise(resolve => { finishWrite = resolve; });
  });
  const pending = registerEmailAccount('a@b.c', 'secret');
  await writeStarted;
  expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(firebase.auth, 'a@b.c', 'secret');
  expect(doc).toHaveBeenCalledWith(firebase.db, 'users', 'u1');
  expect(setDoc).toHaveBeenCalledWith('users/u1', {
    uid: 'u1', nickname: '', gender: null, email: 'a@b.c', createdAt: 'server-time',
    partnerId: null, coupleId: null,
  });
  expect(firebase.setNewUserData).not.toHaveBeenCalled();
  finishWrite();
  await pending;
  expect(firebase.setNewUserData).toHaveBeenCalledWith({ nickname: '', gender: null, email: 'a@b.c' });
});

test('registration write error propagates and leaves fallback untouched', async () => {
  const error = new Error('write failed');
  createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'u1' } });
  setDoc.mockRejectedValue(error);
  await expect(registerEmailAccount('a@b.c', 'secret')).rejects.toBe(error);
  expect(firebase.setNewUserData).not.toHaveBeenCalled();
});

test('Google lookup preserves an existing profile without writing', async () => {
  getDoc.mockResolvedValue({ exists: () => true });
  await ensureGoogleUserDoc({ uid: 'u1' });
  expect(doc).toHaveBeenCalledWith(firebase.db, 'users', 'u1');
  expect(getDoc).toHaveBeenCalledWith('users/u1');
  expect(setDoc).not.toHaveBeenCalled();
});

test.each(['Name', null])('Google creates only a missing document, displayName=%s', async displayName => {
  getDoc.mockResolvedValue({ exists: () => false });
  await ensureGoogleUserDoc({ uid: 'u1', email: 'a@b.c', displayName });
  expect(setDoc).toHaveBeenCalledWith('users/u1', {
    uid: 'u1', nickname: displayName || '', gender: null, email: 'a@b.c',
    createdAt: 'server-time', partnerId: null, coupleId: null,
  });
});

test('Google lookup errors propagate without a write', async () => {
  const error = new Error('read failed');
  getDoc.mockRejectedValue(error);
  await expect(ensureGoogleUserDoc({ uid: 'u1' })).rejects.toBe(error);
  expect(setDoc).not.toHaveBeenCalled();
});

test('Google gateways keep redirect and popup separate and return original results', async () => {
  firebase.getRedirectResult.mockResolvedValue(null);
  firebase.signInWithPopup.mockResolvedValue('popup-result');
  firebase.signInWithRedirect.mockResolvedValue('redirect-result');
  expect(await readGoogleRedirect()).toBe(null);
  expect(await openGooglePopup()).toBe('popup-result');
  expect(await startGoogleRedirect()).toBe('redirect-result');
  expect(firebase.getRedirectResult).toHaveBeenCalledWith(firebase.auth);
  expect(firebase.signInWithPopup).toHaveBeenCalledWith(firebase.auth, firebase.googleProvider);
  expect(firebase.signInWithRedirect).toHaveBeenCalledWith(firebase.auth, firebase.googleProvider);
  expect(getDoc).not.toHaveBeenCalled();
});

test('provider discovery and credential extraction keep original values', async () => {
  const methods = ['google.com'];
  firebase.fetchSignInMethodsForEmail.mockResolvedValue(methods);
  firebase.GoogleAuthProvider.credentialFromError.mockReturnValue('credential');
  expect(await getEmailSignInMethods('a@b.c')).toBe(methods);
  expect(firebase.fetchSignInMethodsForEmail).toHaveBeenCalledWith(firebase.auth, 'a@b.c');
  const error = { code: 'auth/account-exists-with-different-credential' };
  expect(getGoogleCredential(error)).toBe('credential');
  expect(firebase.GoogleAuthProvider.credentialFromError).toHaveBeenCalledWith(error);
});
