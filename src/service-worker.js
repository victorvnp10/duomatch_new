/* eslint-disable no-restricted-globals */

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
