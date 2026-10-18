const { HttpsError } = require('firebase-functions/v2/https');
const { FieldValue } = require('firebase-admin/firestore');

const safeId = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,200}$/.test(value);
const fail = (code, message) => { throw new HttpsError(code, message); };
// Device-local weeks: accept any currently inhabited UTC offset, not arbitrary past weeks.
const currentWeeks = now => new Set([-12, 14].map(offset => {
  const day = new Date(now.getTime() + offset * 3600000);
  day.setUTCDate(day.getUTCDate() - (day.getUTCDay() || 7) + 1);
  return day.toISOString().slice(0, 10);
}));

exports.createRecordWeeklyProgressHandler = db => async request => {
  const uid = request.auth?.uid;
  if (!uid) fail('unauthenticated', 'Entre para registrar o desafio.');
  const data = request.data;
  if (!data || typeof data !== 'object' || Array.isArray(data) ||
      Object.keys(data).some(k => !['coupleId', 'eventId', 'kind', 'payload'].includes(k))) {
    fail('invalid-argument', 'Evento inválido.');
  }
  const { coupleId, eventId, kind, payload } = data;
  if (!safeId(coupleId) || !safeId(eventId) || !safeId(uid) ||
      !['accept', 'claim', 'confirm', 'deny'].includes(kind) ||
      !payload || typeof payload !== 'object' || Array.isArray(payload) ||
      Object.keys(payload).some(k => !['weekKey', 'challengeId', 'targetUid'].includes(k))) {
    fail('invalid-argument', 'Evento inválido.');
  }
  const { weekKey, challengeId, targetUid } = payload;
  const confirming = kind === 'confirm' || kind === 'deny';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekKey) || !safeId(challengeId) ||
      (confirming && (!safeId(targetUid) || targetUid === uid)) ||
      (!confirming && targetUid !== undefined) ||
      eventId !== `${weekKey}_${kind}_${uid}${confirming ? `_${targetUid}` : ''}`) {
    fail('invalid-argument', 'Identidade do evento inválida.');
  }
  const coupleRef = db.doc(`duomatches/${coupleId}`);
  const markerRef = coupleRef.collection('weeklyEvents').doc(eventId);
  const sourceRef = coupleRef.collection('weeklyActions').doc(eventId);
  return db.runTransaction(async tx => {
    const coupleSnap = await tx.get(coupleRef);
    const couple = coupleSnap.data();
    if (!couple?.members?.includes(uid)) fail('permission-denied', 'Casal não autorizado.');
    if (confirming && !couple.members.includes(targetUid)) fail('permission-denied', 'Parceiro inválido.');
    const marker = await tx.get(markerRef);
    const old = couple.weeklyChallenge?.[weekKey] || {};
    if (marker.exists) {
      if (kind !== 'accept' && marker.data().challengeId !== challengeId) fail('invalid-argument', 'Evento já usado.');
      return { challengeData: old, duplicate: true };
    }
    if (!currentWeeks(new Date()).has(weekKey)) fail('invalid-argument', 'Semana inválida.');
    const effectiveChallengeId = kind === 'accept' ? old.challengeId || challengeId : challengeId;
    const catalogSnap = await tx.get(db.doc(`contentChallenges/${effectiveChallengeId}`));
    const challenge = catalogSnap.data();
    if (!challenge || challenge.active === false) fail('not-found', 'Desafio não encontrado.');
    if (old.challengeId && ((kind !== 'accept' && old.challengeId !== challengeId) || old.weekStartDate !== weekKey)) {
      fail('failed-precondition', 'O desafio não pertence a esta semana.');
    }
    const now = new Date().toISOString();
    let next = { ...old };
    let points = 0;
    const updates = {};
    if (kind === 'accept') {
      next = { ...old, challengeId: effectiveChallengeId, acceptedBy: [...new Set([...(old.acceptedBy || []), uid])],
        acceptedAt: old.acceptedAt || now, weekStartDate: weekKey,
        state: old.state || 'in_progress', confirmations: old.confirmations || {} };
      updates.recentChallengeIds = FieldValue.arrayUnion(effectiveChallengeId);
    } else {
      if (!old.challengeId || (kind === 'claim' && !old.acceptedBy?.includes(uid))) {
        fail('failed-precondition', 'Aceite o desafio antes de continuar.');
      }
      if (kind === 'claim') {
        if (!old.confirmations?.[uid]?.claimed) {
          next = { ...old, state: 'pending_confirmations', confirmations: { ...old.confirmations,
            [uid]: { claimed: true, claimedAt: now, status: 'pending_partner_confirmation' } } };
        }
      } else {
        const source = (await tx.get(sourceRef)).data();
        const previous = old.confirmations?.[targetUid];
        if (!old.acceptedBy.includes(targetUid) || !previous?.claimed ||
            !source || source.actorUid !== uid || source.targetUid !== targetUid ||
            source.kind !== kind || source.weekKey !== weekKey || source.challengeId !== challengeId) {
          fail('failed-precondition', 'Confirmação de origem ausente ou inválida.');
        }
        if (!Number.isSafeInteger(challenge.points) || challenge.points < 0) fail('failed-precondition', 'Pontos inválidos no catálogo.');
        const confirmation = { ...previous, status: kind === 'confirm' ? 'confirmed' : 'denied',
          confirmedBy: uid, confirmedAt: now };
        if (kind === 'confirm' && previous.pointsAwarded == null) {
          points = challenge.points;
          confirmation.pointsAwarded = points;
        }
        next = { ...old, confirmations: { ...old.confirmations, [targetUid]: confirmation } };
      }
    }
    if (points) {
      // Increment the server-owned leaf, never trust points supplied by a caller.
      const confirmation = next.confirmations[targetUid];
      for (const [key, value] of Object.entries(confirmation)) {
        updates[`weeklyChallenge.${weekKey}.confirmations.${targetUid}.${key}`] =
          key === 'pointsAwarded' ? FieldValue.increment(points) : value;
      }
    } else {
      updates[`weeklyChallenge.${weekKey}`] = next;
    }
    tx.update(coupleRef, updates);
    tx.create(markerRef, { actorUid: uid, kind, weekKey, challengeId: effectiveChallengeId, targetUid: targetUid || null,
      points, createdAt: FieldValue.serverTimestamp() });
    return { challengeData: next, duplicate: false };
  });
};
