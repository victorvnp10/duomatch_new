import { endSession } from './sessionService';
import { auth } from '../../infrastructure/firebase';
import { signOut } from 'firebase/auth';

jest.mock('../../infrastructure/firebase', () => ({ auth: { id: 'auth' } }));
jest.mock('firebase/auth', () => ({ signOut: jest.fn() }));
beforeEach(() => jest.resetAllMocks());

test('logout uses the configured auth exactly once and returns the original promise', async () => {
  const pending = Promise.resolve('signed-out');
  signOut.mockReturnValue(pending);
  expect(endSession()).toBe(pending);
  expect(signOut).toHaveBeenCalledTimes(1);
  expect(signOut).toHaveBeenCalledWith(auth);
  expect(await pending).toBe('signed-out');
});

test('logout rejection remains observable to the caller', async () => {
  const error = new Error('logout failed');
  signOut.mockRejectedValue(error);
  await expect(endSession()).rejects.toBe(error);
});

test('logout synchronous errors are not converted or swallowed', () => {
  const error = new Error('invalid auth');
  signOut.mockImplementation(() => { throw error; });
  expect(() => endSession()).toThrow(error);
});
