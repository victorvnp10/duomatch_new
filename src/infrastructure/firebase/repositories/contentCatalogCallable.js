import { getFunctions, httpsCallable } from "firebase/functions";

// Loaded only when a catalog is requested; Firebase Auth supplies the ID token.
export const syncContentCatalog = (app) => {
  const functions = getFunctions(app, "southamerica-east1");
  return httpsCallable(functions, "syncContentCatalog", { timeout: 120000 })();
};
