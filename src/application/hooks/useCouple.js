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
  getDoc,
  runTransaction,
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
  // B2-26: erro permanente no listener do casal → UI de erro em vez de
  // LoadingScreen infinita (o DuoMatchApp renderiza quando `!coupleData`).
  const [error, setError] = useState(null);
  // NOVA FUNÇÃO: Para definir o sinal diário do usuário
  const handleSetDailySignal = async (signal) => {
    if (!userData?.coupleId || !user?.uid) return;

    const todayStr = getTodayDateString();
    const coupleDocRef = doc(db, "duomatches", userData.coupleId);

    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(coupleDocRef);
      if (!docSnap.exists()) return;

      const data = docSnap.data();
      const currentSignals = data.dailySignals;
      const storedDate = currentSignals?.date;

      // B2-19: só RESETA quando a data guardada é estritamente mais antiga
      // que hoje (ou não existe). Se a data for FUTURA (relógio do outro
      // cliente adiantado), resetar apagaria o sinal do parceiro — atualiza
      // apenas o sinal deste usuário sem tocar no restante.
      const isStaleDate = !storedDate || storedDate < todayStr;

      if (isStaleDate) {
        // Nova data — reseta o objeto inteiro
        transaction.update(coupleDocRef, {
          dailySignals: {
            date: todayStr,
            signals: { [user.uid]: signal },
          },
        });
      } else {
        // Mesmo dia — atualiza só o sinal do usuário atual
        transaction.update(coupleDocRef, {
          [`dailySignals.signals.${user.uid}`]: signal,
        });
      }
    });
  };

  // Adicione a nova função ao retorno do hook

  useEffect(() => {
    if (!userData?.coupleId) {
      setCoupleData(null);
      return;
    }

    const coupleDocRef = doc(db, "duomatches", userData.coupleId);
    const unsubscribe = onSnapshot(
      coupleDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setCoupleData({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.error("Documento do casal não encontrado!", userData.coupleId);
          setCoupleData(null);
        }
      },
      (snapshotError) => {
        console.error("Erro no listener do documento do casal:", snapshotError);
        setCoupleData(null);
        setError(snapshotError);
      }
    );

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
    try {
      // B2-20: só zera o documento do parceiro se ele AINDA pertence a este
      // casal — se ele já se desvinculou e re-vinculou com outra pessoa,
      // sobrescrever coupleId aqui o expulsaria do casal novo.
      const partnerSnap = await getDoc(doc(db, "users", partnerId));
      const partnerBelongsToThisCouple =
        partnerSnap.exists() && partnerSnap.data().coupleId === coupleId;

      // Coleta todas as referências a deletar antes de abrir batches
      const deleteRefs = [];
      const subcollections = [
        "activities",
        "rounds",
        "rewards",
        "wishlist",
        "dailySuggestions",
        "hotSuggestions",
      ];
      for (const sub of subcollections) {
        const subcollectionRef = collection(
          db,
          `duomatches/${coupleId}/${sub}`
        );
        const snapshot = await getDocs(subcollectionRef);
        snapshot.docs.forEach((docSnapshot) => deleteRefs.push(docSnapshot.ref));
      }

      // Deletar comments aninhados sob activities
      const activitiesRef = collection(db, `duomatches/${coupleId}/activities`);
      const activitiesSnapshot = await getDocs(activitiesRef);
      for (const actDoc of activitiesSnapshot.docs) {
        const commentsRef = collection(db, `duomatches/${coupleId}/activities/${actDoc.id}/comments`);
        const commentsSnapshot = await getDocs(commentsRef);
        commentsSnapshot.docs.forEach((commentDoc) => deleteRefs.push(commentDoc.ref));
      }

      // B2-10: um casal antigo pode ter centenas de docs (activities +
      // comments + sugestões diárias) — um único batch estoura o limite de
      // 500 operações do Firestore. Deleta em chunks de 450; o doc do casal
      // e a zeragem dos usuários vão no batch FINAL, depois que todo o
      // resto já foi apagado com sucesso.
      const CHUNK_SIZE = 450;
      for (let i = 0; i < deleteRefs.length; i += CHUNK_SIZE) {
        const chunk = deleteRefs.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);
        chunk.forEach((ref) => batch.delete(ref));
        await batch.commit();
      }

      const finalBatch = writeBatch(db);
      finalBatch.delete(doc(db, "duomatches", coupleId));
      // B2-21: limpa onboardingSkipped — sem isso o App.js roteava direto
      // para o PreviewApp em vez da tela de vincular após desvincular.
      finalBatch.update(doc(db, "users", user.uid), {
        partnerId: null,
        coupleId: null,
        onboardingSkipped: false,
      });
      if (partnerBelongsToThisCouple) {
        finalBatch.update(doc(db, "users", partnerId), {
          partnerId: null,
          coupleId: null,
        });
      }
      await finalBatch.commit();

      // B2-53: o signOut é uma etapa posterior independente — uma falha de
      // logout NÃO deve ser reportada como "erro grave ao desvincular"
      // (tudo já foi apagado com sucesso; tentar de novo seria inofensivo,
      // mas a mensagem assustava e levava a retries sobre estado destruído).
      try {
        await signOut(auth);
      } catch (logOutError) {
        console.error("Casal desvinculado, mas houve erro no logout:", logOutError);
      }
      alert("Casal desvinculado com sucesso. Você será desconectado.");
    } catch (error) {
      console.error("Erro ao desvincular casal:", error);
      alert("Ocorreu um erro grave ao tentar desvincular. Tente novamente.");
    }
  }, [user?.uid, userData]);

  return {
    coupleData,
    error,
    handleUpdateCoupleData,
    handleUnlinkCouple,
    handleCompleteOnboarding,
    handleSetDailySignal, // <-- ADICIONADO AQUI
  };
};
