import {
  auth, db, setNewUserData, googleProvider, GoogleAuthProvider,
  signInWithRedirect, signInWithPopup, getRedirectResult,
  fetchSignInMethodsForEmail, linkWithCredential,
} from '../../infrastructure/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

// UI state, cancellation and error messages stay in AuthPage. These operations
// deliberately do not catch errors: its existing branches receive the same error.
export const signInEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const linkEmailAccount = async (linkRequest, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, linkRequest.email, password);
  await linkWithCredential(userCredential.user, linkRequest.credential);
};

export const registerEmailAccount = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const initialUserData = {
    uid: user.uid,
    nickname: '',
    gender: null,
    email,
    createdAt: serverTimestamp(),
    partnerId: null,
    coupleId: null,
  };
  await setDoc(doc(db, 'users', user.uid), initialUserData);
  setNewUserData({ nickname: '', gender: null, email });
};

// Called at the original popup/redirect continuation, not inside the gateway:
// redirect cancellation must still be checked before any document access.
export const ensureGoogleUserDoc = async (googleUser) => {
  const userRef = doc(db, 'users', googleUser.uid);
  const existingDoc = await getDoc(userRef);
  if (!existingDoc.exists()) {
    await setDoc(userRef, {
      uid: googleUser.uid,
      nickname: googleUser.displayName || '',
      gender: null,
      email: googleUser.email,
      createdAt: serverTimestamp(),
      partnerId: null,
      coupleId: null,
    });
  }
};

export const readGoogleRedirect = () => getRedirectResult(auth);
export const openGooglePopup = () => signInWithPopup(auth, googleProvider);
export const startGoogleRedirect = () => signInWithRedirect(auth, googleProvider);
export const getEmailSignInMethods = (email) => fetchSignInMethodsForEmail(auth, email);
export const getGoogleCredential = (error) => GoogleAuthProvider.credentialFromError(error);
