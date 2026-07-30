import { useState, useEffect, useCallback } from "react";
import {
  db,
  doc,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  writeBatch,
  increment,
  serverTimestamp,
  query,
  orderBy,
} from "../../infrastructure/firebase";
import { getTodayDateString } from "../../shared/utils"; // Importar a função de data

// --- MUDANÇA 1: Adicionar 'rounds' como um parâmetro para o hook ---
export const useRewards = (user, userData, coupleData, rounds) => {
  const [rewards, setRewards] = useState([]);
  const [rewardToEdit, setRewardToEdit] = useState(null);
  const [rewardToDelete, setRewardToDelete] = useState(null);
  const [purchaseNotification, setPurchaseNotification] = useState({
    visible: false,
    rewardName: "",
  });
  const [approvalNotifications, setApprovalNotifications] = useState([]);

  useEffect(() => {
    if (!userData?.coupleId) return;

    const rewardsPath = `duomatches/${userData.coupleId}/rewards`;
    const q = query(collection(db, rewardsPath), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rewardsData = [];
      const newApprovalNotifications = [];

      snapshot.forEach((docSnap) => {
        const reward = { id: docSnap.id, ...docSnap.data() };
        rewardsData.push(reward);

        if (
          reward.status === "pending_approval" &&
          reward.createdBy !== user.uid &&
          !reward.notifiedForApproval
        ) {
          newApprovalNotifications.push(reward);
        }
      });

      setRewards(rewardsData);

      if (newApprovalNotifications.length > 0) {
        setApprovalNotifications((prev) => [
          ...prev,
          ...newApprovalNotifications,
        ]);
        const batch = writeBatch(db);
        newApprovalNotifications.forEach((reward) => {
          const rewardRef = doc(db, rewardsPath, reward.id);
          batch.update(rewardRef, { notifiedForApproval: true });
        });
        batch.commit();
      }
    });

    return () => unsubscribe();
  }, [userData?.coupleId, user.uid]);

  const handleCreateReward = async (rewardData) => {
    if (!userData?.coupleId) return;
    try {
      await addDoc(collection(db, `duomatches/${userData.coupleId}/rewards`), {
        ...rewardData,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        status: "pending_approval",
        purchasedBy: null,
        approvedBy: null,
        notifiedForApproval: false,
      });
    } catch (error) {
      console.error("Erro ao criar recompensa:", error);
      alert("Não foi possível criar a recompensa. Tente novamente.");
    }
  };

  const handleApproveReward = async (rewardId, finalCost) => {
    if (!userData?.coupleId) return;
    const rewardRef = doc(
      db,
      `duomatches/${userData.coupleId}/rewards`,
      rewardId
    );
    await updateDoc(rewardRef, {
      status: "approved",
      approvedBy: user.uid,
      cost: finalCost,
    });
  };

  // --- MUDANÇA 2: Lógica de compra totalmente corrigida ---
  const handlePurchaseReward = async (reward) => {
    if (!userData?.coupleId) return;

    // 1. Encontrar a rodada ativa
    const todayStr = getTodayDateString();
    const activeRound = rounds.find(
      (r) => todayStr >= r.startDate && todayStr <= r.endDate
    );

    // Se não houver rodada ativa, não é possível comprar.
    if (!activeRound) {
      alert("Não há uma rodada ativa. Não é possível comprar recompensas.");
      return;
    }

    // 2. Pegar a pontuação do placar da rodada ativa (o lugar certo!)
    const myScore = activeRound.scores?.[user.uid] || 0;

    // 3. Comparar com o custo da recompensa
    if (myScore < reward.cost) {
      alert("Você não tem pontos suficientes para comprar esta recompensa.");
      return;
    }

    if (
      window.confirm(
        `Tem certeza que deseja gastar ${reward.cost} pontos para comprar "${reward.name}"?`
      )
    ) {
      const batch = writeBatch(db);
      const rewardRef = doc(
        db,
        `duomatches/${userData.coupleId}/rewards`,
        reward.id
      );
      // 4. Referenciar o documento da rodada para deduzir os pontos
      const roundRef = doc(
        db,
        `duomatches/${userData.coupleId}/rounds`,
        activeRound.id
      );

      batch.update(rewardRef, {
        status: "purchased",
        purchasedBy: user.uid,
        purchasedAt: serverTimestamp(),
      });

      // 5. Deduzir os pontos do placar da rodada (o lugar certo!)
      batch.update(roundRef, {
        [`scores.${user.uid}`]: increment(-reward.cost),
      });

      await batch.commit();
      setPurchaseNotification({ visible: true, rewardName: reward.name });
    }
  };

  const handleUpdateReward = async (rewardId, updatedData) => {
    if (!userData?.coupleId) return;
    const rewardRef = doc(
      db,
      `duomatches/${userData.coupleId}/rewards`,
      rewardId
    );
    await updateDoc(rewardRef, updatedData);
    setRewardToEdit(null);
  };

  const handleDeleteReward = async (rewardId) => {
    if (!userData?.coupleId || !rewardId) return;
    const rewardRef = doc(
      db,
      `duomatches/${userData.coupleId}/rewards`,
      rewardId
    );
    await deleteDoc(rewardRef);
    setRewardToDelete(null);
  };

  const dismissApprovalNotification = (rewardId) => {
    setApprovalNotifications((prev) => prev.filter((r) => r.id !== rewardId));
  };

  // Retorno do hook
  return {
    rewards,
    rewardToEdit,
    setRewardToEdit,
    rewardToDelete,
    setRewardToDelete,
    purchaseNotification,
    setPurchaseNotification,
    approvalNotifications,
    dismissApprovalNotification,
    handleCreateReward,
    handleApproveReward,
    handlePurchaseReward,
    handleUpdateReward,
    handleDeleteReward,
  };
};
