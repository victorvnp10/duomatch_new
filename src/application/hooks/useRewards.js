import { useState, useEffect, useCallback, useRef } from "react";
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
  runTransaction,
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
  const notifiedRewardsRef = useRef(new Set());

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
          !reward.notifiedForApproval &&
          !notifiedRewardsRef.current.has(reward.id)
        ) {
          newApprovalNotifications.push(reward);
          notifiedRewardsRef.current.add(reward.id);
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
        // B2-46: sem catch, falha de rede aqui vira unhandled rejection
        batch.commit().catch((error) =>
          console.error("Erro ao marcar notificações de aprovação:", error)
        );
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
    // B2-12: custo negativo/inválido INFLAVA pontos na compra (deduzia
    // valor negativo = adicionava). Valida antes de aprovar.
    const parsedCost = Number(finalCost);
    if (!Number.isInteger(parsedCost) || parsedCost < 0 || parsedCost > 100000) {
      alert("Custo inválido: informe um número inteiro entre 0 e 100000.");
      return;
    }
    const rewardRef = doc(
      db,
      `duomatches/${userData.coupleId}/rewards`,
      rewardId
    );
    try {
      // Transação com guarda: se o parceiro já aprovou (ou comprou) entre
      // abrir a tela e clicar em aprovar, não sobrescreve o estado.
      await runTransaction(db, async (transaction) => {
        const rewardDoc = await transaction.get(rewardRef);
        if (!rewardDoc.exists()) throw new Error("Recompensa não encontrada.");
        if (rewardDoc.data().status !== "pending_approval") {
          throw new Error(
            "Esta recompensa já foi processada por outra pessoa."
          );
        }
        transaction.update(rewardRef, {
          status: "approved",
          approvedBy: user.uid,
          cost: parsedCost,
        });
      });
    } catch (error) {
      console.error("Erro ao aprovar recompensa:", error);
      alert(error.message || "Não foi possível aprovar a recompensa.");
    }
  };

  // --- MUDANÇA 2: Lógica de compra com transaction para evitar compra dupla ---
  const handlePurchaseReward = async (reward) => {
    if (!userData?.coupleId) return;

    const todayStr = getTodayDateString();
    const activeRound = rounds.find(
      (r) => todayStr >= r.startDate && todayStr <= r.endDate
    );

    if (!activeRound) {
      alert("Não há uma rodada ativa. Não é possível comprar recompensas.");
      return;
    }

    if (
      window.confirm(
        `Tem certeza que deseja gastar ${reward.cost} pontos para comprar "${reward.name}"?`
      )
    ) {
      const rewardRef = doc(
        db,
        `duomatches/${userData.coupleId}/rewards`,
        reward.id
      );
      const roundRef = doc(
        db,
        `duomatches/${userData.coupleId}/rounds`,
        activeRound.id
      );

      try {
        await runTransaction(db, async (transaction) => {
          const rewardDoc = await transaction.get(rewardRef);
          if (!rewardDoc.exists()) throw new Error("Recompensa não encontrada.");

          const rewardData = rewardDoc.data();
          if (rewardData.status !== "approved") {
            throw new Error("Esta recompensa não está disponível para compra.");
          }

          const roundDoc = await transaction.get(roundRef);
          if (!roundDoc.exists()) throw new Error("Rodada ativa não encontrada.");

          const currentScore = roundDoc.data().scores?.[user.uid] || 0;
          if (currentScore < reward.cost) {
            throw new Error("Pontos insuficientes.");
          }

          transaction.update(rewardRef, {
            status: "purchased",
            purchasedBy: user.uid,
            purchasedAt: serverTimestamp(),
          });

          transaction.update(roundRef, {
            [`scores.${user.uid}`]: increment(-reward.cost),
          });
        });
        setPurchaseNotification({ visible: true, rewardName: reward.name });
      } catch (error) {
        // B2-35: erros da transação eram engolidos — usuário clicava,
        // nada acontecia e não havia feedback.
        console.error("Erro ao comprar recompensa:", error);
        alert(error.message || "Não foi possível concluir a compra.");
      }
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
