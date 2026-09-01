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
 * a partir do módulo `shared/contentCatalog.js`; a leitura em produção vem
 * do Firestore, o que permite editar o conteúdo no banco sem novo build.
 *
 * - Seed por upsert: grava apenas os itens cujo `id` ainda não existe,
 *   então ampliar `contentCatalog.js` planta o novo conteúdo na próxima
 *   inicialização (idempotente e incremental).
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

// Grava no banco apenas os itens ainda ausentes (upsert por id),
// em lotes de ate 400 para respeitar o limite de 500 escritas do writeBatch.
const plantMissing = async (collectionName, items) => {
  const col = collection(db, collectionName);
  const snap = await getDocs(col);
  const existingIds = new Set(snap.docs.map((d) => d.id));
  const missing = items.filter((it) => !existingIds.has(it.id));
  if (!missing.length) return;

  for (let i = 0; i < missing.length; i += 400) {
    const batch = writeBatch(db);
    missing.slice(i, i + 400).forEach((item) => {
      batch.set(doc(col, item.id), item);
    });
    await batch.commit();
  }
};

export const ensureActivityCatalog = () =>
  plantMissing("contentActivities", ACTIVITY_CATALOG);

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

export const ensureChallengeCatalog = () =>
  plantMissing("contentChallenges", CHALLENGE_CATALOG);

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
