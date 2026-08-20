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
  Timestamp,
  serverTimestamp,
  query,
  orderBy,
  runTransaction, // <-- MUDANÇA 1: Importar a função de transação
} from "../../infrastructure/firebase";
import { getTodayDateString } from "../../shared/utils";

export const useActivities = (user, userData, coupleData, rounds) => {
  const [allActivities, setAllActivities] = useState([]);
  const [mySelections, setMySelections] = useState({});
  const [partnerSelections, setPartnerSelections] = useState({});
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [activityToEdit, setActivityToEdit] = useState(null);
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [partnerNotification, setPartnerNotification] = useState({
    visible: false,
    timestamp: null,
  });
  const [showHotSelectionNotification, setShowHotSelectionNotification] =
    useState(false);
  const [pointsMessage, setPointsMessage] = useState("");

  /**
   * Função central para verificar e atribuir pontos de ATIVIDADES NORMAIS e INTIMIDADE.
   * Agora utiliza TRANSAÇÕES para evitar pontuação dupla (race conditions).
   */
  const checkForPoints = useCallback(
    async (currentActivities) => {
      const today = getTodayDateString();
      const activeRound = rounds.find(
        (r) => today >= r.startDate && today <= r.endDate
      );
      if (!activeRound) return;

      // Atividades normais para pontuação de rodada
      const activitiesToProcess = currentActivities.filter((act) => {
        const myS = act.selections?.[user.uid];
        const partnerS = act.selections?.[userData.partnerId];
        return (
          !act.type?.startsWith("desafio") &&
          act.points > 0 &&
          myS?.resolution &&
          partnerS?.resolution &&
          !act.pointsAwarded
        );
      });

      // Atividades hot para pontos de intimidade (matches confirmados)
      const hotActivitiesToProcess = currentActivities.filter((act) => {
        const myS = act.selections?.[user.uid];
        const partnerS = act.selections?.[userData.partnerId];
        return (
          act.category === "Hot" &&
          !act.type?.startsWith("desafio") &&
          myS?.status === "confirmed" &&
          partnerS?.status === "confirmed" &&
          myS?.date === today &&
          partnerS?.date === today &&
          !act.intimacyPointsAwarded
        );
      });

      if (activitiesToProcess.length === 0 && hotActivitiesToProcess.length === 0) return;

      // Para cada atividade normal elegível, execute uma transação separada.
      for (const act of activitiesToProcess) {
        const activityRef = doc(
          db,
          `duomatches/${userData.coupleId}/activities`,
          act.id
        );
        const roundRef = doc(
          db,
          `duomatches/${userData.coupleId}/rounds`,
          activeRound.id
        );

        try {
          await runTransaction(db, async (transaction) => {
            const activityDoc = await transaction.get(activityRef);

            if (!activityDoc.exists()) {
              throw "A atividade não existe mais!";
            }

            const activityData = activityDoc.data();

            if (activityData.pointsAwarded) {
              return;
            }

            if (
              activityData.selections[user.uid].resolution === "completed" &&
              activityData.selections[userData.partnerId].resolution ===
                "completed"
            ) {
              transaction.update(roundRef, {
                [`scores.${user.uid}`]: increment(act.points),
                [`scores.${userData.partnerId}`]: increment(act.points),
              });
              setPointsMessage(
                `Pontos da atividade "${act.name}" foram adicionados!`
              );
            }

            transaction.update(activityRef, { pointsAwarded: true });
          });
        } catch (error) {
          console.error("Falha na transação de pontos: ", error);
        }
      }

      // Para cada atividade hot com match, incrementar pontos de intimidade
      for (const act of hotActivitiesToProcess) {
        const activityRef = doc(
          db,
          `duomatches/${userData.coupleId}/activities`,
          act.id
        );
        const coupleRef = doc(db, "duomatches", userData.coupleId);

        try {
          await runTransaction(db, async (transaction) => {
            const activityDoc = await transaction.get(activityRef);

            if (!activityDoc.exists()) {
              throw "A atividade hot não existe mais!";
            }

            const activityData = activityDoc.data();

            // Verificar se os pontos de intimidade já foram concedidos
            if (activityData.intimacyPointsAwarded) {
              return;
            }

            // Verificar se ambos confirmaram hoje
            const mySelection = activityData.selections[user.uid];
            const partnerSelection = activityData.selections[userData.partnerId];
            
            if (
              mySelection?.status === "confirmed" &&
              partnerSelection?.status === "confirmed" &&
              mySelection?.date === today &&
              partnerSelection?.date === today
            ) {
              // Incrementar pontos de intimidade
              transaction.update(coupleRef, {
                intimacyPoints: increment(1),
              });
            }

            // Marcar como processado para pontos de intimidade
            transaction.update(activityRef, { intimacyPointsAwarded: true });
          });
        } catch (error) {
          console.error("Falha na transação de pontos de intimidade: ", error);
        }
      }
    },
    [rounds, user.uid, userData.coupleId, userData.partnerId]
  );

  // O resto do arquivo permanece igual...

  // useEffect principal que busca e monitora as atividades em tempo real.
  useEffect(() => {
    if (!userData?.coupleId || !userData.partnerId) return;

    const activitiesPath = `duomatches/${userData.coupleId}/activities`;
    const q = query(
      collection(db, activitiesPath),
      orderBy("createdAt", "desc")
    );
    const today = getTodayDateString();

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const activitiesData = [];
      let mySels = {};
      let partnerSels = {};
      let currentMatches = [];

      querySnapshot.forEach((docSnap) => {
        const data = { id: docSnap.id, ...docSnap.data() };
        activitiesData.push(data);
        const myChoice = data.selections?.[user.uid];
        const partnerChoice = data.selections?.[userData.partnerId];

        mySels[data.id] =
          myChoice && myChoice.date === today
            ? myChoice
            : { status: "pending", date: null };
        partnerSels[data.id] =
          partnerChoice && partnerChoice.date === today
            ? partnerChoice
            : { status: "pending", date: null };

        // Matches serão filtrados no MainView para separar hoje vs jornada
      });

      checkForPoints(activitiesData);

      setAllActivities(activitiesData);
      setMySelections(mySels);
      setPartnerSelections(partnerSels);
    });

    return () => unsubscribe();
  }, [userData, user, checkForPoints]);

  const handleSetActivityResolution = async (activityId, resolution) => {
    const choiceText =
      resolution === "completed" ? "Concluído" : "Não Concluído";
    if (
      window.confirm(
        `Tem certeza que deseja marcar como "${choiceText}"? Esta ação não pode ser desfeita.`
      )
    ) {
      const activityRef = doc(
        db,
        `duomatches/${userData.coupleId}/activities`,
        activityId
      );
      try {
        await updateDoc(activityRef, {
          [`selections.${user.uid}.resolution`]: resolution,
        });
      } catch (error) {
        console.error("Erro ao definir a resolução da atividade:", error);
        alert("Ocorreu um erro ao salvar sua escolha. Tente novamente.");
      }
    }
  };

  const handleResolveChallenge = async (activity, resolution) => {
    if (!activity || activity.challengeState !== "accepted") return;

    const today = getTodayDateString();
    const activeRound = rounds.find(
      (r) => today >= r.startDate && today <= r.endDate
    );

    if (!activeRound) {
      alert(
        "Não é possível resolver o desafio pois não há uma rodada ativa para registrar os pontos."
      );
      return;
    }

    const challengedId = Object.keys(activity.selections).find(
      (id) => id !== activity.createdBy
    );
    const winnerId =
      resolution === "completed" ? challengedId : activity.createdBy;

    const batch = writeBatch(db);
    const activityRef = doc(
      db,
      `duomatches/${userData.coupleId}/activities`,
      activity.id
    );
    const roundRef = doc(
      db,
      `duomatches/${userData.coupleId}/rounds`,
      activeRound.id
    );

    batch.update(activityRef, { challengeState: resolution });

    if (winnerId && activity.points > 0) {
      batch.update(roundRef, {
        [`scores.${winnerId}`]: increment(activity.points),
      });
    }

    // Se for um desafio hot e foi completado, incrementa pontos de intimidade
    if (resolution === "completed" && (activity.category === "Hot" || activity.type === "desafio_hot")) {
      const coupleDocRef = doc(db, "duomatches", userData.coupleId);
      batch.update(coupleDocRef, {
        intimacyPoints: increment(1),
      });
    }

    try {
      await batch.commit();
      setPointsMessage(`Desafio "${activity.name}" finalizado!`);
    } catch (error) {
      console.error("Erro ao resolver desafio:", error);
      alert("Ocorreu um erro ao finalizar o desafio.");
    }
  };

  // --- Funções auxiliares (inalteradas) ---

  const handleSelectActivity = useCallback(
    async (activityId) => {
      const today = getTodayDateString();
      const activityRef = doc(
        db,
        `duomatches/${userData.coupleId}/activities`,
        activityId
      );

      // Verifica o estado atual para decidir se vai marcar ou desmarcar
      const myCurrentStatus = mySelections[activityId]?.status;
      const newStatus = myCurrentStatus === "confirmed" ? null : "confirmed";

      // Atualiza o Firestore com o novo estado
      await updateDoc(activityRef, {
        [`selections.${user.uid}`]: {
          status: newStatus,
          date: newStatus ? today : null,
        },
      });

      // Se a ação foi de MARCAR, verifica se resultou em um match
      if (newStatus === "confirmed") {
        const partnerIsConfirmed =
          partnerSelections[activityId]?.status === "confirmed" &&
          partnerSelections[activityId]?.date === today;

        if (partnerIsConfirmed) {
          // Encontrar o nome da atividade
          const activity = allActivities.find(act => act.id === activityId);
          const activityName = activity?.name || 'Atividade';
          
          // Disparar evento de match após delay
          setTimeout(() => {
            if (activity?.category === "Hot") {
              // Para atividades hot, usar o evento específico
              if (window.dispatchHotMatchEvent) {
                window.dispatchHotMatchEvent(activityName);
              }
              const hotMatchEvent = new CustomEvent('hotActivityMatch', { 
                detail: activityName 
              });
              window.dispatchEvent(hotMatchEvent);
            } else {
              // Para atividades normais
              const matchEvent = new CustomEvent('activityMatch', { 
                detail: activityName 
              });
              window.dispatchEvent(matchEvent);
            }
          }, 1500);
        }
      }
    },
    // As dependências são importantes para a função ter os dados mais recentes
    [
      user.uid,
      userData.coupleId,
      mySelections,
      partnerSelections,
      allActivities,
    ]
  );

  const handleUnconfirmActivity = async (activityId) => {
    await updateDoc(
      doc(db, `duomatches/${userData.coupleId}/activities`, activityId),
      {
        [`selections.${user.uid}`]: {
          status: "selected",
          date: getTodayDateString(),
        },
      }
    );
  };

  const handleAddActivity = async (dataToAdd) => {
    try {
      await addDoc(
        collection(db, `duomatches/${userData.coupleId}/activities`),
        dataToAdd
      );
    } catch (error) {
      console.error("Erro ao adicionar atividade:", error);
      alert("Ocorreu um erro ao salvar o item. Tente novamente.");
    }
  };

  const handleUpdateActivity = async (activityId, updatedData) => {
    await updateDoc(
      doc(db, `duomatches/${userData.coupleId}/activities`, activityId),
      updatedData
    );
    setActivityToEdit(null);
  };

  const handleDeleteActivity = async (activityId) => {
    if (!activityId) return;
    await deleteDoc(
      doc(db, `duomatches/${userData.coupleId}/activities`, activityId)
    );
    setActivityToDelete(null);
  };

  const handleAcceptChallenge = async (activityId) => {
    const activityRef = doc(
      db,
      `duomatches/${userData.coupleId}/activities`,
      activityId
    );
    await updateDoc(activityRef, {
      challengeState: "accepted",
      [`selections.${user.uid}`]: {
        status: "accepted",
        date: getTodayDateString(),
      },
    });
  };

  const handleDeclineChallenge = async (activityId) => {
    const activityRef = doc(
      db,
      `duomatches/${userData.coupleId}/activities`,
      activityId
    );
    await updateDoc(activityRef, {
      challengeState: "declined",
    });
  };

  return {
    allActivities,
    mySelections,
    partnerSelections,
    matches,
    activityToDelete,
    setActivityToDelete,
    activityToEdit,
    setActivityToEdit,
    timeRemaining,
    showMatchNotification,
    partnerNotification,
    setPartnerNotification,
    showHotSelectionNotification,
    setShowHotSelectionNotification,
    pointsMessage,
    setPointsMessage,
    handleSelectActivity,
    handleUnconfirmActivity,
    handleAddActivity,
    handleUpdateActivity,
    handleDeleteActivity,
    handleAcceptChallenge,
    handleDeclineChallenge,
    handleResolveChallenge,
    handleSetActivityResolution,
  };
};