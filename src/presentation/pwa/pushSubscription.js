/**
 * Assinatura Web Push (FCM) — notificações "com app fechado".
 *
 * Pipeline: a página pede permissão (NotificationCenter) → registra o
 * service worker do app (Workbox, que também carrega o handler de push em
 * background — ver src/service-worker.js) → obtém um token FCM via VAPID
 * key → persiste em `pushTokens/{uid}` no Firestore. As Cloud Functions
 * (functions/) leem esse token e disparam o push quando o evento acontece.
 *
 * `pushTokens/{uid}` = `{ uid, tokens: { [deviceId]: token }, updatedAt }`.
 * O deviceId é estável por navegador (localStorage), então reinstalar o app
 * atualiza o token do MESMO device em vez de acumular entradas; devices
 * antigos/stale são ignorados pelas functions (FCM responde "unregistered").
 */
import {
  db,
  doc,
  setDoc,
  serverTimestamp,
  getFirebaseMessaging,
  getToken,
  isMessagingSupported,
  onMessage,
} from "../../infrastructure/firebase";
import {
  getNotificationPermission,
  showSystemNotification,
  isSystemNotificationsSupported,
} from "./systemNotifications";

const DEVICE_KEY = "duomatch_push_device";

// Handler de FOREGROUND (app aberto): com a página viva, o FCM entrega a
// mensagem ao onMessage (o service worker só exibe com o app fechado). Sem
// isso, "par marcou atividade" não gerava ALERTA quando o app estava aberto.
let foregroundHandlerReady = false;
const registerForegroundPush = () => {
  if (foregroundHandlerReady) return;
  foregroundHandlerReady = true;
  try {
    onMessage(getFirebaseMessaging(), (payload) => {
      const { notification, data = {} } = payload;
      // Com o app em foco, o usePwaNotifications já exibe toast/sino —
      // só mostra notificação do sistema se o app estiver em background.
      // Sem esse guard, a notificação aparece em cima do app aberto.
      const inBackground = typeof document !== "undefined" && !document.hasFocus();
      if (!inBackground) return;
      if (!isSystemNotificationsSupported()) return;
      if (getNotificationPermission() !== "granted") return;
      showSystemNotification(data.eventId || `push-fg-${Date.now()}`, {
        title: notification?.title || data.title || "DuoMatch",
        body: notification?.body || data.body || "",
      });
    });
  } catch (error) {
    console.warn("[push] Falha ao registrar handler de foreground:", error);
  }
};

const getOrCreateDeviceId = () => {
  try {
    let id = window.localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch (e) {
    return `dev-${Date.now()}`;
  }
};

/** Ambiente (HTTPS + service worker + módulo messaging suportado). */
export const isPushSupported = async () => {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator)) return false;
  try {
    return await isMessagingSupported();
  } catch (e) {
    return false;
  }
};

/** Push configurado? (envs preenchidas — sem isso o push é no-op.) */
export const hasPushEnvironment = () =>
  Boolean(process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID) &&
  Boolean(process.env.REACT_APP_FIREBASE_VAPID_KEY);

/**
 * Registra o push do usuário atual. Idempotente: se o token já existe para
 * este device, sobrescreve o mesmo doc com merge. Retorna o token ou null
 * (permissão negada, sem suporte, sem env, ou erro tratado).
 */
export async function ensurePushSubscription({ userId }) {
  if (!userId || !hasPushEnvironment()) return null;
  if (getNotificationPermission() !== "granted") return null;
  if (!(await isPushSupported())) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    const messaging = getFirebaseMessaging();
    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (!token) return null;

    const deviceId = getOrCreateDeviceId();
    // IMPORTANTE: usar { tokens: { [deviceId]: token } } com merge:true,
    // NÃO `tokens.${deviceId}` como chave top-level. No Firestore, a notação
    // de ponto numa chave literal (não de update path) grava um campo cujo
    // NOME contém o ponto — a Cloud Function lê `data.tokens` e encontra o
    // mapa correto só com a estrutura aninhada.
    await setDoc(
      doc(db, "pushTokens", userId),
      {
        uid: userId,
        updatedAt: serverTimestamp(),
        tokens: { [deviceId]: token },
      },
      { merge: true }
    );

    // Alerta em primeiro plano (app aberto recebe onMessage, não o SW).
    registerForegroundPush();

    return token;
  } catch (err) {
    // Sem contexto seguro, SW não pronto, VAPID inválido etc. — push é
    // opcional; nunca deve derrubar o app.
    console.warn("[push] Não foi possível registrar o Web Push:", err);
    return null;
  }
}