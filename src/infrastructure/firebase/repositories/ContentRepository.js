import {
  db,
  collection,
  getDocs,
  writeBatch,
  doc,
  arrayUnion,
  updateDoc,
} from "../index";
import {
  ACTIVITY_CATALOG,
  CHALLENGE_CATALOG,
} from "../../../shared/contentCatalog";

/**
 * ContentRepository — catálogo global de conteúdo (atividades e desafios).
 *
 * Fonte de verdade em produção: coleções raiz do Firestore
 * (`contentActivities` / `contentChallenges`). Como o app é um PWA sem
 * backend, este repositório é responsável por "plantar" (seed) o catálogo
 * uma única vez a partir do módulo `shared/contentCatalog.js` quando as
 * coleções estão vazias; a partir daí, as leituras vêm do Firestore, o que
 * permite ampliar/editar o conteúdo no banco sem precisar de novo build.
 *
 * - Seed idempotente: só grava se a coleção estiver vazia.
 * - Cache em memória por sessão (o catálogo global muda raramente).
 * - Helpers puros de variedade/anti-repetição são exportados para uso da
 *   camada de aplicação (useSuggestions / DailyChallenge).
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

/** Garante que `contentActivities` esteja populada (seed idempotente). */
export const ensureActivityCatalog = async () => {
  const col = collection(db, "contentActivities");
  const existing = await getDocs(col);
  if (!existing.empty) return;

  const batch = writeBatch(db);
  for (const item of ACTIVITY_CATALOG) {
    batch.set(doc(col, item.id), item);
  }
  await batch.commit();
};

/** Retorna o catálogo de atividades ativo (com cache de sessão). */
export const getActivityCatalog = async () => {
  if (activitiesCache) return activitiesCache;

  await ensureActivityCatalog();
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

/** Garante que `contentChallenges` esteja populada (seed idempotente). */
export const ensureChallengeCatalog = async () => {
  const col = collection(db, "contentChallenges");
  const existing = await getDocs(col);
  if (!existing.empty) return;

  const batch = writeBatch(db);
  for (const item of CHALLENGE_CATALOG) {
    batch.set(doc(col, item.id), item);
  }
  await batch.commit();
};

/** Retorna o catálogo de desafios ativo (com cache de sessão). */
export const getChallengeCatalog = async () => {
  if (challengesCache) return challengesCache;

  await ensureChallengeCatalog();
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
