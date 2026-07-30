/**
 * Configuração do Firebase.
 *
 * ANTES: as chaves do projeto Firebase estavam escritas diretamente no
 * código-fonte (`src/firebase.js`), versionadas no Git. Ainda que as
 * chaves de configuração do Firebase Web não sejam segredos (a segurança
 * real vem das Regras de Segurança do Firestore/Storage), é uma prática
 * ruim: dificulta ter ambientes diferentes (dev/homologação/produção) e
 * expõe o projectId/appId publicamente em qualquer clone do repositório.
 *
 * AGORA: a configuração vem de variáveis de ambiente do Create React App
 * (que precisam começar com `REACT_APP_`). Veja `.env.example` na raiz
 * do projeto — copie para `.env` e preencha com as chaves do seu projeto
 * Firebase antes de rodar `npm start` ou `npm run build`.
 */

const requiredEnvVars = [
  "REACT_APP_FIREBASE_API_KEY",
  "REACT_APP_FIREBASE_AUTH_DOMAIN",
  "REACT_APP_FIREBASE_PROJECT_ID",
  "REACT_APP_FIREBASE_STORAGE_BUCKET",
  "REACT_APP_FIREBASE_MESSAGING_SENDER_ID",
  "REACT_APP_FIREBASE_APP_ID",
];

const missing = requiredEnvVars.filter((key) => !process.env[key]);
if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.error(
    `[Firebase] Variáveis de ambiente ausentes: ${missing.join(", ")}. ` +
      "Copie .env.example para .env e preencha os valores do seu projeto Firebase."
  );
}

export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};
