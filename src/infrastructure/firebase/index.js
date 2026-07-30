import { initializeApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  Timestamp,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  onSnapshot,
  updateDoc,
  deleteDoc,
  writeBatch,
  increment,
  orderBy,
  getDocs,
  runTransaction,
  arrayUnion,
} from "firebase/firestore";

import { firebaseConfig } from "./config";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/**
 * Cache local persistente do Firestore (IndexedDB).
 *
 * Isto é o que torna o app utilizável como PWA offline: leituras já
 * feitas (atividades, rodadas, recompensas, wishlist, chat) continuam
 * disponíveis sem conexão, e escritas feitas offline são sincronizadas
 * automaticamente quando a conexão volta. `persistentMultipleTabManager`
 * permite que o app funcione corretamente mesmo com várias abas abertas
 * ao mesmo tempo.
 */
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

// Estado global para o apelido do novo usuário durante o cadastro.
export let newUserData = null;
export const setNewUserData = (data) => {
  newUserData = data;
};

export {
  auth,
  db,
  signOut,
  Timestamp,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  onSnapshot,
  updateDoc,
  deleteDoc,
  writeBatch,
  increment,
  orderBy,
  getDocs,
  runTransaction,
  arrayUnion,
};
