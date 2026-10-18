import { db, doc } from '../../infrastructure/firebase';
import {
  getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword,
} from 'firebase/auth';
import { updateDoc } from 'firebase/firestore';

// Keep reauthentication and password update in the same promise even if the
// presentation unmounts. Errors are handled by the caller, exactly as before.
export const changeAccountPassword = async (email, currentPassword, newPassword) => {
  const auth = getAuth();
  const credential = EmailAuthProvider.credential(email, currentPassword);
  await reauthenticateWithCredential(auth.currentUser, credential);
  await updatePassword(auth.currentUser, newPassword);
};

export const updateUserProfile = async (userId, updatedData) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, updatedData);
};
