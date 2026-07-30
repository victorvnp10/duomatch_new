import { useState, useEffect } from "react";
import {
  db,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc, // Importa a função de update
  doc,
  serverTimestamp,
} from "../../infrastructure/firebase";

export const useRounds = (userData) => {
  const [rounds, setRounds] = useState([]);

  useEffect(() => {
    if (!userData?.coupleId) return;
    const roundsPath = `duomatches/${userData.coupleId}/rounds`;
    const q = query(collection(db, roundsPath), orderBy("startDate", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roundsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRounds(roundsData);
    });
    return () => unsubscribe();
  }, [userData?.coupleId]);

  const handleAddRound = async (newRound) => {
    const roundsPath = `duomatches/${userData.coupleId}/rounds`;
    try {
      await addDoc(collection(db, roundsPath), {
        ...newRound,
        scores: {},
        rulesLastChecked: {
          activities: newRound.startDate,
          challenges: newRound.startDate,
        },
        createdAt: serverTimestamp(),
      });
      alert("Rodada adicionada com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar rodada:", error);
      alert("Ocorreu um erro ao criar a rodada.");
    }
  };

  // --- NOVA FUNÇÃO ADICIONADA ---
  const handleUpdateRound = async (roundId, updatedData) => {
    const roundRef = doc(db, `duomatches/${userData.coupleId}/rounds`, roundId);
    try {
      await updateDoc(roundRef, updatedData);
      alert("Rodada atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar rodada:", error);
      alert("Ocorreu um erro ao salvar as alterações.");
    }
  };

  const handleDeleteRound = async (roundId) => {
    if (window.confirm("Tem certeza que deseja excluir esta rodada?")) {
      const roundRef = doc(
        db,
        `duomatches/${userData.coupleId}/rounds`,
        roundId
      );
      await deleteDoc(roundRef);
    }
  };

  return {
    rounds,
    handleAddRound,
    handleUpdateRound, // Exporta a nova função
    handleDeleteRound,
  };
};
