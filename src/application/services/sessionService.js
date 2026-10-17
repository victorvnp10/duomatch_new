import { signOut } from 'firebase/auth';
import { auth } from '../../infrastructure/firebase';

// Shared by preview and profile completion; preserve the SDK promise/errors.
export const endSession = () => signOut(auth);
