/* eslint-disable no-restricted-globals */

// ── PUSH (FCM) — notificações "com app fechado" ─────────────────────────
// Este é o ÚNICO service worker do app (Workbox precache + FCM num só —
// dois SW disputando o escopo "/" se anulariam). As libs do FCM vêm por
// importScripts (CDN compat). Em vez de hardcodar a config do Firebase no
// arquivo, a PRÓPRIA URL do SW a carrega: `/service-worker.js?fb=<JSON>` —
// a página injeta via serviceWorkerRegistration.js (que tem acesso às env
// REACT_APP_*). Sem env no SW não há push, mas o precache segue normal.
importScripts(
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js"
);

const parseQueryConfig = () => {
  try {
    const params = new URLSearchParams(self.location.search);
    const raw = params.get("fb");
    return raw ? JSON.parse(decodeURIComponent(raw)) : null;
  } catch (e) {
    return null;
  }
};

const firebaseConfig = parseQueryConfig();
if (firebaseConfig && firebaseConfig.projectId) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Background: app fechado/segundo plano — monta e mostra a notificação.
  // (Foreground o app cuida via usePwaNotifications; FCM entrega ao onMessage
  // e aqui não dispara — sem notificação duplicada).
  messaging.onBackgroundMessage((payload) => {
    const data = payload?.data || {};
    const notification = payload?.notification || {};
    const targetView = data.targetView || "";
    self.registration.showNotification(
      notification.title || data.title || "DuoMatch",
      {
        body: notification.body || data.body || "",
        icon: "/logo192.png",
        badge: "/icons/maskable-192.png",
        tag: data.eventId ? `duomatch-${data.eventId}` : "duomatch-default",
        data: { targetView, clickUrl: targetView ? `/?view=${targetView}` : "/" },
        silent: false,
      }
    );
  });
}

// Clique na notificação do sistema: foca uma janela aberta do app e navega
// para a view alvo (`?view=` é lida no primeiro render de DuoMatchApp.js),
// ou abre uma nova janela se o app estiver fechado.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const clickUrl = event.notification?.data?.clickUrl || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if ("focus" in client) {
            client.focus();
            if (client.url !== clickUrl) client.navigate(clickUrl);
            return;
          }
        }
        return clients.openWindow(clickUrl);
      })
  );
});

// O react-scripts detecta automaticamente a presença deste arquivo e
// injeta, no momento do build, o manifesto de precache (todos os assets
// de `build/`, com hash de conteúdo) na constante `self.__WB_MANIFEST`
// abaixo — não é necessário nenhuma configuração adicional.

import { clientsClaim } from "workbox-core";
import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate, CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

clientsClaim();

// Precache de todos os assets gerados pelo build (JS, CSS, HTML), com
// cache-busting automático via hash de conteúdo.
precacheAndRoute(self.__WB_MANIFEST);

// Navegação (SPA): serve o index.html precacheado para qualquer rota de
// navegação — permite abrir o app offline em qualquer URL da aplicação.
const fileExtensionRegexp = /\/[^/?]+\.[^/]+$/;
registerRoute(
  ({ request, url }) => {
    if (request.mode !== "navigate") return false;
    if (url.pathname.startsWith("/_")) return false;
    if (url.pathname.match(fileExtensionRegexp)) return false;
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + "/index.html")
);

// Imagens (ícones, avatares): cache-first com expiração.
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "duomatch-images",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

// Fontes de CDNs externos (Google Fonts etc.), se usadas no futuro.
registerRoute(
  ({ url }) =>
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com",
  new StaleWhileRevalidate({
    cacheName: "duomatch-fonts",
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
);

// IMPORTANTE: propositalmente NÃO há um handler "pega tudo" aqui.
// Requisições do SDK do Firestore/Firebase Auth (streaming/long-polling
// para *.googleapis.com) NÃO passam por nenhuma rota acima e seguem
// direto para a rede, sem o service worker interceptar. Isso evita
// corromper o streaming em tempo real do Firestore — que já tem seu
// próprio cache offline via IndexedDB (persistentLocalCache, configurado
// em src/infrastructure/firebase/index.js).

// Permite que a página force a ativação imediata de uma nova versão
// (usado por serviceWorkerRegistration.js ao detectar atualização).
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
