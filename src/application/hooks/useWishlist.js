import { useState, useEffect } from "react";
import {
  db,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  increment,
  serverTimestamp,
  runTransaction,
} from "../../infrastructure/firebase";
import { getTodayDateString } from "../../shared/utils";
import { arrayUnion } from "firebase/firestore"; // 2. Adicione esta nova linha

/**
 * Hook personalizado para gerenciar a Lista de Desejos (Wishlist).
 * @param {object} user - Objeto do usuário da autenticação.
 * @param {object} userData - Dados do perfil do usuário do Firestore.
 * @param {object} coupleData - Dados do documento do casal, usado para notificações.
 * @param {Array} rounds - Lista de rodadas, usada para adicionar pontos ao confirmar um presente.
 */
export const useWishlist = (user, userData, coupleData, rounds) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistItemToEdit, setWishlistItemToEdit] = useState(null);
  const [wishlistItemToDelete, setWishlistItemToDelete] = useState(null);
  // O estado da notificação agora precisa guardar o ID do item
  const [wishlistNotification, setWishlistNotification] = useState({
    visible: false,
    itemName: null,
    itemId: null,
  });

  // Efeito para buscar os itens da wishlist (inalterado)
  useEffect(() => {
    if (!userData?.coupleId) return;
    const qWishlist = query(
      collection(db, `duomatches/${userData.coupleId}/wishlist`),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(qWishlist, (snapshot) => {
      const wishlistData = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setWishlistItems(wishlistData);
    });
    return () => unsubscribe();
  }, [userData?.coupleId]);

  // Efeito para exibir a notificação de novo item adicionado pelo parceiro
  useEffect(() => {
    // Garante que todos os dados necessários existem antes de continuar
    if (
      !coupleData?.lastWishlistUpdate ||
      !userData?.partnerId ||
      !wishlistItems.length
    ) {
      return;
    }

    const { addedBy, timestamp } = coupleData.lastWishlistUpdate;
    const addedByPartner = addedBy === userData.partnerId;

    if (addedByPartner) {
      // Encontra o item exato que disparou a atualização, comparando o timestamp
      const latestItem = wishlistItems.find(
        (item) =>
          item.createdBy === userData.partnerId &&
          item.createdAt?.isEqual(timestamp)
      );

      if (latestItem) {
        // VERIFICAÇÃO PRINCIPAL: O ID do item já está na lista de 'vistos' do usuário?
        const hasBeenSeen = userData.seenWishlistItems?.includes(latestItem.id);

        if (!hasBeenSeen) {
          setWishlistNotification({
            visible: true,
            itemName: latestItem.name,
            itemId: latestItem.id, // Guarda o ID para poder marcá-lo como visto
          });
        }
      }
    }
    // As dependências garantem que o efeito rode quando qualquer um desses dados for atualizado
  }, [coupleData, userData, wishlistItems]);

  // Função para marcar uma notificação como vista permanentemente
  const handleDismissWishlistNotification = async (itemId) => {
    if (!itemId) return;
    const userDocRef = doc(db, "users", user.uid);
    // Adiciona o ID do item a um campo 'seenWishlistItems' no documento do usuário
    // O arrayUnion previne duplicatas
    await updateDoc(userDocRef, {
      seenWishlistItems: arrayUnion(itemId),
    });
    // Esconde a notificação da tela
    setWishlistNotification({ visible: false, itemName: null, itemId: null });
  };

  // Função para adicionar um novo item à lista
  const handleAddItemToWishlist = async (itemData) => {
    // 0 é um valor legítimo (desejo sem pontos); negativo não.
    if (
      !itemData.name ||
      itemData.points == null ||
      !Number.isFinite(Number(itemData.points)) ||
      Number(itemData.points) < 0
    ) {
      alert("O nome do desejo é obrigatório e os pontos não podem ser negativos.");
      return;
    }
    const batch = writeBatch(db);
    const coupleId = userData.coupleId;
    const newWishlistItemRef = doc(
      collection(db, `duomatches/${coupleId}/wishlist`)
    );
    batch.set(newWishlistItemRef, {
      ...itemData,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      status: "active",
    });
    const coupleDocRef = doc(db, "duomatches", coupleId);
    batch.update(coupleDocRef, {
      lastWishlistUpdate: {
        itemName: itemData.name,
        addedBy: user.uid,
        timestamp: serverTimestamp(),
      },
    });
    try {
      await batch.commit();
    } catch (error) {
      console.error("Erro ao adicionar item na wishlist:", error);
      alert("Não foi possível adicionar o item. Tente novamente.");
    }
  };

  // Função para atualizar um item existente
  const handleUpdateWishlistItem = async (itemId, updatedData) => {
    const itemRef = doc(db, `duomatches/${userData.coupleId}/wishlist`, itemId);
    await updateDoc(itemRef, updatedData);
    setWishlistItemToEdit(null);
  };

  // Função para deletar um item
  const handleDeleteWishlistItem = async (itemId) => {
    if (!itemId) return;
    const itemRef = doc(db, `duomatches/${userData.coupleId}/wishlist`, itemId);
    await deleteDoc(itemRef);
    setWishlistItemToDelete(null);
  };

  // Função para marcar um item como "presenteado"
  const handleGiftWishlistItem = async (itemId) => {
    const itemRef = doc(db, `duomatches/${userData.coupleId}/wishlist`, itemId);
    // Guarda transacional: só presenteia se o item ainda estiver "active",
    // evitando sobrescrever giftedBy de um item já presenteado/confirmado.
    await runTransaction(db, async (transaction) => {
      const itemDoc = await transaction.get(itemRef);
      if (!itemDoc.exists()) return;
      if (itemDoc.data().status !== "active") return;
      transaction.update(itemRef, {
        status: "gifted",
        giftedBy: user.uid,
      });
    });
  };

  // Função para o destinatário confirmar o recebimento e adicionar pontos
  const handleConfirmGiftReceived = async (item) => {
    const today = getTodayDateString();
    const activeRound = rounds.find(
      (r) => today >= r.startDate && today <= r.endDate
    );

    if (!activeRound) {
      alert("Não há uma rodada ativa para registrar os pontos do presente!");
      return;
    }
    const itemRef = doc(
      db,
      `duomatches/${userData.coupleId}/wishlist`,
      item.id
    );
    const roundRef = doc(
      db,
      `duomatches/${userData.coupleId}/rounds`,
      activeRound.id
    );

    try {
      // Transação impede pontos duplicados por duplo clique ou confirmação
      // simultânea em dois dispositivos: só credita se status for "gifted".
      await runTransaction(db, async (transaction) => {
        const itemDoc = await transaction.get(itemRef);
        if (!itemDoc.exists()) return;

        const freshItem = itemDoc.data();
        if (freshItem.status !== "gifted") return;

        transaction.update(itemRef, { status: "confirmed" });

        if (freshItem.giftedBy && freshItem.points > 0) {
          transaction.update(roundRef, {
            [`scores.${freshItem.giftedBy}`]: increment(freshItem.points),
          });
        }
      });
      alert(`Presente "${item.name}" confirmado! Pontos adicionados à rodada.`);
    } catch (error) {
      console.error("Erro ao confirmar presente:", error);
      alert("Ocorreu um erro ao confirmar o presente. Tente novamente.");
    }
  };

  // Retorna os estados e as funções que o componente principal precisará.
  return {
    wishlistItems,
    wishlistItemToEdit,
    setWishlistItemToEdit,
    wishlistItemToDelete,
    setWishlistItemToDelete,
    wishlistNotification,
    setWishlistNotification,
    handleDismissWishlistNotification, // Exporta a nova função
    handleAddItemToWishlist,
    handleUpdateWishlistItem,
    handleDeleteWishlistItem,
    handleGiftWishlistItem,
    handleConfirmGiftReceived,
  };
};
