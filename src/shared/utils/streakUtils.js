
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../infrastructure/firebase';
import { getTodayDateString, getDateString } from '../utils';

export const updateStreak = async (coupleId, userData, allActivities, dailySuggestions, hotSuggestions) => {
  if (!coupleId || !userData) return;

  const today = getTodayDateString();
  const yesterday = getDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));

  try {
    const coupleRef = doc(db, "duomatches", coupleId);

    // Transação garante idempotência: mesmo com múltiplas seleções no dia
    // (ou os dois parceiros interagindo em paralelo), o streak é atualizado
    // no máximo uma vez por dia.
    await runTransaction(db, async (transaction) => {
      const coupleSnap = await transaction.get(coupleRef);
      const currentCoupleData = coupleSnap.data() || {};

      // Já atualizado hoje — não incrementa de novo.
      if (currentCoupleData.lastStreakUpdate === today) return;

      // Verificar se houve atividade hoje
      const hasActivityToday = checkActivityForDate(today, userData.uid, allActivities, dailySuggestions, hotSuggestions);

      if (!hasActivityToday) return; // Não atualiza se não houve atividade hoje

      // Verificar se houve atividade ontem
      const hasActivityYesterday = checkActivityForDate(yesterday, userData.uid, allActivities, dailySuggestions, hotSuggestions);

      const currentStreak = currentCoupleData.streak || 0;
      const newStreak = hasActivityYesterday ? currentStreak + 1 : 1;

      transaction.update(coupleRef, {
        streak: newStreak,
        lastStreakUpdate: today,
        lastActivity: serverTimestamp()
      });
    });

  } catch (error) {
    console.error('Erro ao atualizar sequência:', error);
  }
};

const checkActivityForDate = (date, userId, allActivities, dailySuggestions, hotSuggestions) => {
  const todayStr = getTodayDateString();
  // Sugestões vivem em docs por dia (só temos o doc de HOJE em memória),
  // então só podem contar para a data de hoje.
  const canCheckSuggestions = date === todayStr;

  // 1. Atividades regulares completadas ou apenas marcadas
  const regularActivities = allActivities.filter(activity => {
    const activityDate = activity.selections?.[userId]?.date;
    return activityDate === date && activity.selections?.[userId]?.status;
  });

  // 2. Desafios diários aceitos (mesmo que não cumpridos)
  const dailyChallenges = allActivities.filter(activity => {
    if (!activity.type?.startsWith("desafio")) return false;
    const activityDate = activity.createdAt?.toDate ? getDateString(activity.createdAt.toDate()) : null;
    return activityDate === date && (
      activity.challengeState === "accepted" ||
      activity.challengeState === "completed" ||
      activity.challengeState === "not_completed"
    );
  });

  // 3. Desafios lançados (sem challengeState — para evitar duplicata com item 2)
  const challengesCreated = allActivities.filter(activity => {
    if (!activity.type?.startsWith("desafio")) return false;
    if (activity.challengeState) return false; // já contado acima
    const createdDate = activity.createdAt?.toDate ? getDateString(activity.createdAt.toDate()) : null;
    return createdDate === date && activity.createdBy === userId;
  });

  // 4. Sugestões especiais marcadas (selections[uid] é a string "selected")
  const specialSuggestions = canCheckSuggestions
    ? Object.values(dailySuggestions || {}).filter(activity => {
        return activity.selections?.[userId] === "selected";
      })
    : [];

  // 5. Sugestões picantes marcadas (selections[uid] é a string "selected")
  const hotSuggestionsMarked = canCheckSuggestions
    ? Object.values(hotSuggestions || {}).filter(activity => {
        return activity.selections?.[userId] === "selected";
      })
    : [];

  const totalActivities = regularActivities.length + dailyChallenges.length +
                         challengesCreated.length + specialSuggestions.length +
                         hotSuggestionsMarked.length;

  return totalActivities > 0;
};
