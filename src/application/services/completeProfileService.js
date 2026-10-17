import { db } from '../../infrastructure/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export const completeUserProfile = async (userId, { nickname, gender, birthDate, selectedAvatar }) => {
  await updateDoc(doc(db, 'users', userId), {
    nickname: nickname.trim(),
    gender,
    birthDate,
    photoURL: selectedAvatar,
  });
};
