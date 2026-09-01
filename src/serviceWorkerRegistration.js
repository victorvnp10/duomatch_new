// Este arquivo segue o padrão oficial de registro de service worker do
// Create React App (template PWA). Veja:
// https://cra.link/PWA

const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    window.location.hostname === "[::1]" ||
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

export function register(config) {
  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener("load", () => {
      const swConfigJson = JSON.stringify({
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
        storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.REACT_APP_FIREBASE_APP_ID,
      });
      // Config do FCM via query no próprio URL do SW (o swSrc não tem acesso
      // às env REACT_APP_*): o SW lê `self.location.search` e inicializa o
      // firebase/messaging para o push "com app fechado" (ver service-worker.js).
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js?fb=${encodeURIComponent(
        swConfigJson
      )}`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log(
            "Este app está sendo servido por um service worker em modo desenvolvimento local."
          );
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      // Atualização ativa: checa imediatamente neste load e sempre que o app
      // voltar ao foco. Sem isso, um PWA instalado só checava na próxima
      // navegação e podia ficar dias servindo a versão antiga em cache.
      registration.update();
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") registration.update();
      });

      // Recarrega quando o SW novo efetivamente assume o controle. A forma
      // anterior (reload direto no onUpdate) corria contra a ativação do
      // `skipWaiting` e podia carregar o bundle antigo de novo.
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) return;

        installingWorker.addEventListener("statechange", () => {
          if (installingWorker.state !== "installed") return;

          if (!navigator.serviceWorker.controller) {
            // Primeira instalação (nenhuma versão antiga no controle).
            console.log("Conteúdo armazenado em cache para uso offline.");
            if (config && config.onSuccess) {
              config.onSuccess(registration);
            }
            return;
          }

          // Há uma versão antiga controlando a página: a nova ficou "waiting".
          // Ativa imediatamente — o listener de `controllerchange` acima recarrega.
          console.log("Nova versão disponível. Ativando e recarregando...");
          if (config && config.onUpdate) {
            config.onUpdate(registration);
          }
          const waitingWorker = registration.waiting || installingWorker;
          if (waitingWorker && waitingWorker.state === "installed") {
            waitingWorker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      };
    })
    .catch((error) => {
      console.error("Erro ao registrar o service worker:", error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, { headers: { "Service-Worker": "script" } })
    .then((response) => {
      const contentType = response.headers.get("content-type");
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf("javascript") === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log("Nenhuma conexão com a internet encontrada. App rodando em modo offline.");
    });
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
