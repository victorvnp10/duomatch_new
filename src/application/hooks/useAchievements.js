import { useEffect } from "react";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../infrastructure/firebase";
import { buildAchievementStats } from "../../domain/services/AchievementStatsBuilder";
import { evaluateNewAchievements } from "../../domain/entities/Achievement";

/**
 * Hook de aplicação: avalia e persiste conquistas do casal.
 *
 * A decisão de negócio (quais conquistas existem e quando são
 * desbloqueadas) vive inteiramente em `src/domain/entities/Achievement.js`
 * e `src/domain/services/AchievementStatsBuilder.js` — este hook só
 * orquestra a leitura de dados já carregados e a gravação no Firestore.
 *
 * Correções em relação à versão anterior:
 *  - Removida a duplicação de lógica com `AchievementSystem.js` (agora
 *    ambos consomem o mesmo catálogo de domínio).
 *  - As conquistas "big_spender", "hot_streak" e "wish_granter" agora
 *    são de fato alcançáveis (antes só existiam visualmente na tela).
 *  - Removidos os `console.log` de depuração deixados em produção.
 */
export function useAchievements({
  userData,
  coupleData,
  allActivities = [],
  rewards = [],
  wishlistItems = [],
}) {
  useEffect(() => {
    if (!userData?.coupleId || !coupleData || !allActivities.length) return;

    const timeoutId = setTimeout(async () => {
      const currentAchievements = coupleData.achievements || [];

      const stats = buildAchievementStats({
        userId: userData.uid,
        partnerId: userData.partnerId,
        allActivities,
        coupleData,
        rewards,
        wishlistItems,
      });

      const newAchievements = evaluateNewAchievements(stats, currentAchievements);
      if (newAchievements.length === 0) return;

      try {
        const coupleRef = doc(db, "duomatches", userData.coupleId);
        await updateDoc(coupleRef, {
          achievements: arrayUnion(...newAchievements),
        });

        newAchievements.forEach((achievementId) => {
          window.dispatchEvent(
            new CustomEvent("achievementUnlocked", {
              detail: { achievementId, timestamp: Date.now() },
            })
          );
        });
      } catch (error) {
        console.error("Erro ao atualizar conquistas:", error);
      }
    }, 1000); // Debounce para evitar execuções em excesso

    return () => clearTimeout(timeoutId);
  }, [
    userData?.coupleId,
    userData?.uid,
    userData?.partnerId,
    coupleData,
    allActivities,
    rewards,
    wishlistItems,
  ]);
}
