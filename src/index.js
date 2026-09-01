import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registra o service worker para habilitar o modo PWA (instalação,
// precache de assets e navegação offline). Usamos register() em vez do
// unregister() padrão do CRA porque o app foi otimizado para funcionar
// offline (ver src/service-worker.js e o cache persistente do Firestore
// em src/infrastructure/firebase/index.js).
serviceWorkerRegistration.register({
  onUpdate: (registration) => {
    // Nova versão do app já baixada: ativa imediatamente. O reload em si é
    // feito pelo serviceWorkerRegistration.js ao detectar o `controllerchange`
    // (garante que o bundle novo já esteja no controle antes de recarregar).
    const waitingWorker = registration.waiting || registration.installing;
    if (waitingWorker && waitingWorker.state === 'installed') {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  },
});
