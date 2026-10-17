import { completeUserProfile } from './completeProfileService';
import { db } from '../../infrastructure/firebase';
import { doc, updateDoc } from 'firebase/firestore';

jest.mock('../../infrastructure/firebase', () => ({ db: { id: 'db' } }));
jest.mock('firebase/firestore', () => ({ doc: jest.fn(), updateDoc: jest.fn() }));
beforeEach(() => {
  jest.resetAllMocks();
  doc.mockReturnValue('users/u1');
});

test('completion trims only nickname and writes exactly the original four fields', async () => {
  await completeUserProfile('u1', {
    nickname: '  Name  ', gender: 'feminino', birthDate: '2000-02-03', selectedAvatar: 'avatar-1',
  });
  expect(doc).toHaveBeenCalledWith(db, 'users', 'u1');
  expect(updateDoc).toHaveBeenCalledTimes(1);
  expect(updateDoc).toHaveBeenCalledWith('users/u1', {
    nickname: 'Name', gender: 'feminino', birthDate: '2000-02-03', photoURL: 'avatar-1',
  });
});

test('completion keeps empty avatar and other values unchanged', async () => {
  await completeUserProfile('u2', {
    nickname: ' Name ', gender: null, birthDate: '', selectedAvatar: '',
  });
  expect(doc).toHaveBeenCalledWith(db, 'users', 'u2');
  expect(updateDoc).toHaveBeenCalledWith('users/u1', {
    nickname: 'Name', gender: null, birthDate: '', photoURL: '',
  });
});

test('completion write failure reaches the existing UI catch unchanged', async () => {
  const error = new Error('permission denied');
  updateDoc.mockRejectedValue(error);
  await expect(completeUserProfile('u1', { nickname: 'Name' })).rejects.toBe(error);
});
