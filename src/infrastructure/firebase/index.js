import { initializeApp } from "firebase/app";
import {
  getAuth,
  signOut,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
} from "firebase/auth";
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
  limit,
} from "firebase/firestore";

import { firebaseConfig } from "./config";

// Messaging (Web Push/FCM): usado pelo push "com app fechado". Importado
// de forma LAZY (a instância só é criada quando pushSubscription pedir),
// porque o módulo "firebase/messaging" depende de service worker/contexto
// seguro e não deve carregar em todo bootstrap do app.
import {
  getMessaging,
  getToken,
  isSupported as isMessagingSupported,
  onMessage,
} from "firebase/messaging";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/**
 * Provider do Google para "Continuar com o Google" no cadastro/login.
 * A conta precisa estar habilitada em Firebase Console > Authentication >
 * Sign-in method > Google, e o domínio de produção (ex.: www.duomatch.com.br)
 * precisa estar na lista de "Authorized domains" da mesma tela — sem
 * isso o redirect do Google recusa ou não retorna corretamente para o site.
 */
const googleProvider = new GoogleAuthProvider();

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

let messagingInstance = null;

/**
 * Instância lazy do Cloud Messaging (Web Push). Só cria quando chamada
 * (nunca no bootstrap), exigindo contexto seguro + service worker.
 */
export const getFirebaseMessaging = () => {
  if (!messagingInstance) {
    messagingInstance = getMessaging(app);
  }
  return messagingInstance;
};

export {
  auth,
  googleProvider,
  db,
  getToken,
  isMessagingSupported,
  onMessage,
  signOut,
  signInWithRedirect,
  getRedirectResult,
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
  limit,
};