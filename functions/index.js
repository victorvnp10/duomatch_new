/**
 * Cloud Functions do DuoMatch — Web Push (FCM) para notificações
 * "com app fechado".
 *
 * O app (PWA) não consegue notificar com o cliente fechado: quem observa o
 * Firestore e inicia o envio é o servidor. Aqui ficam os gatilhos que
 * espelham EXATAMENTE os critérios da Central de Notificações do cliente
 * (`useNotificationCenter.js`) + o lembrete diário — mesmos títulos/mensagens
 * e mesmo `targetView`, para que a experiência seja idêntica (clique navega
 * para `/?view=<target>`).
 *
* DEPLOY (você, pelo Console/Cloud Shell):
 *   1. Firebase Console > Blaze (functions exige conta com billing, mesmo
 *      no tier gratuito) > ative Cloud Messaging para a Web (gera o par VAPID);
 *   2. A chave VAPID vai para o `.env` do app (REACT_APP_FIREBASE_VAPID_KEY);
 *   3. `git clone` deste repo e na sua máquina (ou Cloud Shell):
 *        cd functions && npm install
 *        npm i -g firebase-tools
 *        firebase login && firebase use conexaocasal-18136
 *        firebase deploy --only functions
 *
 * IMPORTANTE — região: a região dos triggers de Firestore TEM que ser a mesma
 * da localização do banco. NESTE projeto o Firestore está em
 * `southamerica-east1` (identificado pelo erro 403 do deploy: trigger apontava
 * para outra região) — por isso FIRESTORE_REGION abaixo já vem assim. O
 * `dailyReminder` (scheduler) fica separado em `us-central1` (qualquer região
 * funciona para Pub/Sub; já foi criado lá e movê-lo só adicionaria churn).
 */
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();
const db = getFirestore();
const messaging = getMessaging();

// Região do Firestore deste projeto (veja o aviso no cabeçalho acima).
const FIRESTORE_REGION = process.env.FIRESTORE_REGION || "southamerica-east1";
// Scheduler (lembrete diário) — Pub/Sub funciona em qualquer região.
const SCHEDULER_REGION = "us-central1";
const TIME_ZONE = "America/Sao_Paulo";

/** Data local (SP) no formato YYYY-MM-DD — mesmo padrão do app. */
function localDateStr(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Envia um push para TODOS os devices de um usuário, lendo o token em
 * `pushTokens/{uid}` (gravado pelo cliente em `pushSubscription.js`).
 * Tokens que o FCM rejeita como inválidos são removidos do doc.
 */
async function sendPushToUser(uid, { title, body, targetView, eventId }) {
  if (!uid) return;
  let snap;
  try {
    snap = await db.collection("pushTokens").doc(uid).get();
  } catch (err) {
    console.error("[push] Falha ao ler pushTokens de", uid, err);
    return;
  }
  if (!snap.exists) return;

  const data = snap.data();
  const tokens = Object.values(data.tokens || {}).filter(Boolean);
  if (tokens.length === 0) return;

  const payload = {
    notification: { title, body },
    data: {
      targetView,
      eventId,
      clickUrl: targetView ? `/?view=${targetView}` : "/",
    },
  };

  const results = await messaging.sendEach(
    tokens.map((token) => ({ ...payload, token }))
  );

  // Limpa tokens mortos (device desinstalado/perm. revogada).
  const dead = [];
  results.responses.forEach((r, i) => {
    if (
      r.error &&
      (r.error.code === "messaging/registration-token-not-registered" ||
        r.error.code === "messaging/invalid-registration-token")
    ) {
      dead.push(tokens[i]);
    }
  });
  if (dead.length > 0) {
    const remaining = {};
    Object.entries(data.tokens || {}).forEach(([key, value]) => {
      if (!dead.includes(value)) remaining[key] = value;
    });
    await db
      .collection("pushTokens")
      .doc(uid)
      .update({ tokens: remaining, updatedAt: FieldValue.serverTimestamp() });
  }
}

/** O parceiro marcou uma atividade e espera a confirmação do outro. */
exports.notifyPartnerMarkedActivity = onDocumentUpdated(
  {
    document: "duomatches/{coupleId}/activities/{activityId}",
    region: FIRESTORE_REGION,
  },
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();
    if (!after || !before) return;
    // Desafios são tratados no trigger de criação.
    if (String(after.type || "").startsWith("desafio")) return;

    const selections = after.selections || {};
    const members = Object.keys(selections);
    if (members.length < 2) return;

    for (const uid of members) {
      const partnerId = members.find((m) => m !== uid);
      const partnerStatus = selections[partnerId]?.status;
      const myStatus = selections[uid]?.status;
      if (partnerStatus !== "confirmed" || myStatus === "confirmed") continue;

      // Só notifica na TRANSIÇÃO (partner acabou de confirmar), senão cada
      // update do item (viu/leu/pontos) dispararia de novo.
      const wasConfirmedAlready =
        before.selections?.[partnerId]?.status === "confirmed";
      if (wasConfirmedAlready) continue;

      await sendPushToUser(uid, {
        title: "Seu par marcou uma atividade!",
        body: `"${after.name || "Atividade"}" está esperando sua confirmação.`,
        targetView: "main",
        eventId: `activity-${event.params.activityId}-${uid}`,
      });
    }
  }
);

/** O parceiro criou um desafio e ele ainda aguarda resposta. */
exports.notifyPartnerCreatedChallenge = onDocumentCreated(
  {
    document: "duomatches/{coupleId}/activities/{activityId}",
    region: FIRESTORE_REGION,
  },
  async (event) => {
    const data = event.data.data();
    if (!data) return;
    if (!String(data.type || "").startsWith("desafio")) return;

    const createdBy = data.createdBy;
    const coupleId = event.params.coupleId;
    if (!createdBy || !coupleId) return;

    // Desafio já expirado ao ser criado não notifica (mesmo critério do
    // cliente — B2-34).
    if (data.expiresAt?.toDate && data.expiresAt.toDate() <= new Date()) return;

    // Recém-criado: `selections` ainda é vazio — o destinatário é o OUTRO
    // membro do casal (lê o doc do casal).
    const coupleSnap = await db.doc(`duomatches/${coupleId}`).get();
    const members = (coupleSnap.exists && coupleSnap.data().members) || [];
    const partnerId = members.find((m) => m !== createdBy);
    if (!partnerId) return;

    await sendPushToUser(partnerId, {
      title: "Seu par lançou um desafio!",
      body: `"${data.name || "Desafio"}" está esperando sua resposta.`,
      targetView: "main",
      eventId: `challenge-${event.params.activityId}`,
    });
  }
);

/**
 * Lembrete diário: quem ainda não confirmou nenhuma sugestão do dia e tem
 * sugestões disponíveis recebe um push às 21h (horário de São Paulo).
 * Espelha o item 3 da Central de Notificações (remind_mark_activity).
 */
exports.dailyReminder = onSchedule(
  {
    schedule: "0 21 * * *",
    timeZone: TIME_ZONE,
    region: SCHEDULER_REGION,
  },
  async () => {
    const today = localDateStr();
    const couplesSnap = await db.collection("duomatches").get();

    for (const coupleSnap of couplesSnap.docs) {
      const members = (coupleSnap.data().members || []).slice(0, 2);
      if (members.length < 2) continue;

      const suggSnap = await db
        .collection("duomatches")
        .doc(coupleSnap.id)
        .collection("dailySuggestions")
        .doc(today)
        .get();
      if (!suggSnap.exists) continue;

      const suggestions = suggSnap.data().suggestions || {};
      if (Object.keys(suggestions).length === 0) continue;

      for (const uid of members) {
        const confirmedToday = Object.values(suggestions).some(
          (s) => s?.selections?.[uid]?.status === "confirmed"
        );
        if (confirmedToday) continue;

        await sendPushToUser(uid, {
          title: "Não esqueça de marcar uma atividade hoje!",
          body: "Escolha algo na lista de sugestões para manter a sequência de vocês.",
          targetView: "main",
          eventId: `reminder-${coupleSnap.id}-${today}-${uid}`,
        });
      }
    }
  }
);