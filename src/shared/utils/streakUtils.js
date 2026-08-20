
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../infrastructure/firebase';

export const updateStreak = async (coupleId, userData, allActivities, dailySuggestions, hotSuggestions) => {
  if (!coupleId || !userData) return;

  try {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // Verificar se houve atividade hoje
    const hasActivityToday = checkActivityForDate(today, userData.uid, allActivities, dailySuggestions, hotSuggestions);
    
    if (!hasActivityToday) return; // Não atualiza se não houve atividade hoje

    // Verificar se houve atividade ontem
    const hasActivityYesterday = checkActivityForDate(yesterday, userData.uid, allActivities, dailySuggestions, hotSuggestions);

    const coupleRef = doc(db, "duomatches", coupleId);
    
    if (hasActivityYesterday) {
      // Continua a sequência
      await updateDoc(coupleRef, {
        streak: userData.partnerData?.streak ? userData.partnerData.streak + 1 : 1,
        lastStreakUpdate: today,
        lastActivity: serverTimestamp()
      });
    } else {
      // Inicia nova sequência
      await updateDoc(coupleRef, {
        streak: 1,
        lastStreakUpdate: today,
        lastActivity: serverTimestamp()
      });
    }

  } catch (error) {
    console.error('Erro ao atualizar sequência:', error);
  }
};

const checkActivityForDate = (date, userId, allActivities, dailySuggestions, hotSuggestions) => {
  // 1. Atividades regulares completadas ou apenas marcadas
  const regularActivities = allActivities.filter(activity => {
    const activityDate = activity.selections?.[userId]?.date;
    return activityDate === date && activity.selections?.[userId]?.status;
  });

  // 2. Desafios diários aceitos (mesmo que não cumpridos)
  const dailyChallenges = allActivities.filter(activity => {
    if (!activity.type?.startsWith("desafio")) return false;
    const activityDate = activity.createdAt?.toDate()?.toISOString().slice(0, 10);
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
    const createdDate = activity.createdAt?.toDate()?.toISOString().slice(0, 10);
    return createdDate === date && activity.createdBy === userId;
  });

  // 4. Sugestões especiais marcadas
  const specialSuggestions = Object.values(dailySuggestions || {}).filter(activity => {
    const selectionDate = activity.selections?.[userId]?.date;
    return selectionDate === date && activity.selections?.[userId]?.status === "selected";
  });

  // 5. Sugestões picantes marcadas
  const hotSuggestionsMarked = Object.values(hotSuggestions || {}).filter(activity => {
    const selectionDate = activity.selections?.[userId]?.date;
    return selectionDate === date && activity.selections?.[userId]?.status === "selected";
  });

  const totalActivities = regularActivities.length + dailyChallenges.length +
                         challengesCreated.length + specialSuggestions.length +
                         hotSuggestionsMarked.length;

  return totalActivities > 0;
};
