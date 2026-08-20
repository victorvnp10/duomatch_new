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
    // Nova versão do app já baixada: ativa imediatamente e recarrega,
    // para o casal nunca ficar preso numa versão desatualizada.
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  },
});
