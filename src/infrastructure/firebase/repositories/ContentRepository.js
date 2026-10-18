import {
  app,
  db,
  collection,
  getDocs,
  doc,
  arrayUnion,
  updateDoc,
} from "../index";

/**
 * Catálogo global lido do Firestore, com cache por sessão.
 * A callable sincroniza os dados canônicos pelo Admin SDK; o cliente nunca
 * importa o seed nem escreve nas coleções globais. Falhas na sincronização
 * não impedem a leitura de conteúdo já disponível (inclusive cache offline).
 */

let activitiesCache = null;
let challengesCache = null;

const strip = (data) => ({ ...data, active: data.active !== false });

// ---------- Anti-repetição (helpers puros) ----------

/** Retorna `count` itens do pool evitando os ids já usados recentemente. */
export const pickVaried = (pool, count, recentIds = []) => {
  const recent = new Set(recentIds || []);
  const fresh = pool.filter((it) => !recent.has(it.id));
  const candidates = fresh.length >= count ? fresh : pool;
  const shuffled = [...candidates].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// ---------- CATÁLOGO DE ATIVIDADES ----------

// Coalesce the two catalogs and simultaneous hook mounts into one sync/session.
// Failed attempts are not cached, so a later request can recover.
let catalogSync = null;
const syncCatalog = () => {
  if (!catalogSync) {
    catalogSync = import("./contentCatalogCallable")
      .then(({ syncContentCatalog }) => syncContentCatalog(app))
      .catch((error) => {
        catalogSync = null;
        throw error;
      });
  }
  return catalogSync;
};

export const ensureActivityCatalog = syncCatalog;

const trySyncCatalog = async () => {
  try {
    await syncCatalog();
  } catch (error) {
    console.warn("Não foi possível sincronizar o catálogo; tentando a leitura existente.", error);
  }
};

/** Retorna o catálogo de atividades ativo (com cache de sessão). */
export const getActivityCatalog = async () => {
  if (activitiesCache) return activitiesCache;

  await trySyncCatalog();
  const snap = await getDocs(collection(db, "contentActivities"));
  activitiesCache = snap.docs
    .map((d) => strip(d.data()))
    .filter((d) => d.active);
  return activitiesCache;
};

/** Invalida o cache (usado em testes/recarga forçada). */
export const clearActivityCatalogCache = () => {
  activitiesCache = null;
};

// ---------- CATÁLOGO DE DESAFIOS ----------

export const ensureChallengeCatalog = syncCatalog;

/** Retorna o catálogo de desafios ativo (com cache de sessão). */
export const getChallengeCatalog = async () => {
  if (challengesCache) return challengesCache;

  await trySyncCatalog();
  const snap = await getDocs(collection(db, "contentChallenges"));
  challengesCache = snap.docs
    .map((d) => strip(d.data()))
    .filter((d) => d.active);
  return challengesCache;
};

export const clearChallengeCatalogCache = () => {
  challengesCache = null;
};

// ---------- Histórico de uso no doc do casal ----------

const coupleRef = (coupleId) => doc(db, "duomatches", coupleId);

/** Registra ids usados hoje no histórico do casal (cap automático). */
export const recordRecentActivityIds = async (coupleId, ids) => {
  if (!coupleId || !ids?.length) return;
  await updateDoc(coupleRef(coupleId), {
    recentActivityIds: arrayUnion(...ids),
  });
};

export const recordRecentChallengeIds = async (coupleId, ids) => {
  if (!coupleId || !ids?.length) return;
  await updateDoc(coupleRef(coupleId), {
    recentChallengeIds: arrayUnion(...ids),
  });
};
