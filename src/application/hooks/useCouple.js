import { useState, useEffect, useCallback } from "react";
import {
  db,
  auth,
  doc,
  onSnapshot,
  updateDoc,
  writeBatch,
  collection,
  getDocs,
} from "../../infrastructure/firebase"; // Funções existentes do seu ficheiro central
import { signOut } from "firebase/auth";
import { arrayUnion } from "firebase/firestore";
import { getTodayDateString } from "../../shared/utils"; // <-- MUDANÇA: Importação direta da função em falta

/**
 * Hook para gerir os dados do documento do Casal e ações globais.
 * @param {object} user - Objeto do utilizador da autenticação.
 * @param {object} userData - Dados do perfil do utilizador do Firestore.
 */
export const useCouple = (user, userData) => {
  const [coupleData, setCoupleData] = useState(null);
  // NOVA FUNÇÃO: Para definir o sinal diário do usuário
  const handleSetDailySignal = async (signal) => {
    if (!userData?.coupleId || !user?.uid) return;

    const todayStr = getTodayDateString();
    const coupleDocRef = doc(db, "duomatches", userData.coupleId);

    // Estrutura de dados para o sinal do dia
    const newSignalData = {
      date: todayStr,
      signals: {
        [user.uid]: signal,
      },
    };

    // Se a data do sinal no banco for diferente da de hoje,
    // nós reiniciamos o objeto inteiro.
    if (coupleData?.dailySignals?.date !== todayStr) {
      await updateDoc(coupleDocRef, {
        dailySignals: newSignalData,
      });
    } else {
      // Se for o mesmo dia, apenas atualizamos o sinal do usuário atual.
      // Usamos a notação de ponto para atualizar apenas um campo do objeto.
      const updatePath = `dailySignals.signals.${user.uid}`;
      await updateDoc(coupleDocRef, {
        [updatePath]: signal,
      });
    }
  };

  // Adicione a nova função ao retorno do hook

  useEffect(() => {
    if (!userData?.coupleId) {
      setCoupleData(null);
      return;
    }

    const coupleDocRef = doc(db, "duomatches", userData.coupleId);
    const unsubscribe = onSnapshot(coupleDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setCoupleData({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.error("Documento do casal não encontrado!", userData.coupleId);
        setCoupleData(null);
      }
    });

    return () => unsubscribe();
  }, [userData?.coupleId]);

  const handleUpdateCoupleData = useCallback(
    async (data) => {
      if (!userData?.coupleId) {
        console.error("Não é possível atualizar: coupleId não encontrado.");
        return;
      }
      const coupleDocRef = doc(db, "duomatches", userData.coupleId);
      try {
        await updateDoc(coupleDocRef, data);
      } catch (error) {
        console.error("Erro ao atualizar os dados do casal:", error);
      }
    },
    [userData?.coupleId]
  );

  const handleCompleteOnboarding = useCallback(async () => {
    if (!userData?.coupleId || !user?.uid) {
      console.error("Não é possível completar o onboarding: IDs em falta.");
      return;
    }
    const coupleDocRef = doc(db, "duomatches", userData.coupleId);
    try {
      await updateDoc(coupleDocRef, {
        onboardingCompletedBy: arrayUnion(user.uid),
      });
    } catch (error) {
      console.error("Erro ao completar o onboarding:", error);
    }
  }, [user?.uid, userData?.coupleId]);

  const handleUnlinkCouple = useCallback(async () => {
    if (!userData?.coupleId || !userData?.partnerId) {
      alert("Erro: Informações do casal não encontradas.");
      return;
    }
    if (
      !window.confirm(
        "Tem certeza que deseja desvincular sua conta e apagar todos os dados do casal? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    const { coupleId, partnerId } = userData;
    const batch = writeBatch(db);
    try {
      const subcollections = [
        "activities",
        "rounds",
        "rewards",
        "wishlist",
        "dailySuggestions",
      ];
      for (const sub of subcollections) {
        const subcollectionRef = collection(
          db,
          `duomatches/${coupleId}/${sub}`
        );
        const snapshot = await getDocs(subcollectionRef);
        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      }

      batch.delete(doc(db, "duomatches", coupleId));
      batch.update(doc(db, "users", user.uid), {
        partnerId: null,
        coupleId: null,
      });
      batch.update(doc(db, "users", partnerId), {
        partnerId: null,
        coupleId: null,
      });

      await batch.commit();
      await signOut(auth);
      alert("Casal desvinculado com sucesso. Você será desconectado.");
    } catch (error) {
      console.error("Erro ao desvincular casal:", error);
      alert("Ocorreu um erro grave ao tentar desvincular. Tente novamente.");
    }
  }, [user?.uid, userData]);

  return {
    coupleData,
    handleUpdateCoupleData,
    handleUnlinkCouple,
    handleCompleteOnboarding,
    handleSetDailySignal, // <-- ADICIONADO AQUI
  };
};
