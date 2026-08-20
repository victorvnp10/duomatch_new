import { useState, useEffect, useRef } from "react";
import {
  db,
  collection,
  query,
  orderBy,
  onSnapshot,
  writeBatch,
  doc,
  serverTimestamp,
  increment,
  updateDoc,
  deleteDoc,
} from "../../infrastructure/firebase";

/**
 * Hook para gerenciar o Chat de atividades.
 * @param {object} user - Objeto do usuário da autenticação.
 * @param {object} userData - Dados do perfil do usuário do Firestore.
 * @param {Array} allActivities - Lista de todas as atividades, para as notificações.
 */
export const useChat = (user, userData, allActivities) => {
  const [activeChatActivity, setActiveChatActivity] = useState(null);
  const [activeChatComments, setActiveChatComments] = useState([]);
  const [chatNotification, setChatNotification] = useState({
    visible: false,
    activityId: null,
    activityName: null,
    text: null,
  });
  const prevActivitiesRef = useRef();
  const markedAsReadRef = useRef(new Set());

  // Efeito para buscar os comentários do chat que está ativo.
  useEffect(() => {
    if (!activeChatActivity) {
      setActiveChatComments([]);
      markedAsReadRef.current.clear();
      return;
    }
    const commentsPath = `duomatches/${userData.coupleId}/activities/${activeChatActivity.id}/comments`;
    const q = query(collection(db, commentsPath), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setActiveChatComments(commentsData);

      // Marca como lidas as mensagens do parceiro que ainda não tinham
      // sido vistas — usando ref para evitar re-escrita em cada snapshot.
      const unreadFromPartner = commentsData.filter(
        (c) => c.authorId !== user.uid && !c.readAt && !markedAsReadRef.current.has(c.id)
      );
      if (unreadFromPartner.length > 0) {
        const batch = writeBatch(db);
        unreadFromPartner.forEach((c) => {
          markedAsReadRef.current.add(c.id);
          batch.update(doc(db, commentsPath, c.id), { readAt: serverTimestamp() });
        });
        batch
          .commit()
          .catch((err) => console.error("Erro ao marcar mensagens como lidas:", err));
      }
    });
    return () => unsubscribe();
  }, [activeChatActivity, userData.coupleId, user.uid]);

  // Efeito para verificar novas mensagens e disparar a notificação.
  useEffect(() => {
    const prevActivities = prevActivitiesRef.current;
    if (!prevActivities || !allActivities.length || !userData.partnerId) {
      prevActivitiesRef.current = allActivities;
      return;
    }
    allActivities.forEach((currentActivity) => {
      const lastMessage = currentActivity.lastMessage;
      if (!lastMessage) return;

      const prevActivity = prevActivities.find(
        (p) => p.id === currentActivity.id
      );
      const messageIsNew =
        prevActivity?.lastMessage?.timestamp?.toMillis() !==
        lastMessage.timestamp?.toMillis();
      const sentByPartner = lastMessage.senderId === userData.partnerId;
      const chatIsNotOpen = activeChatActivity?.id !== currentActivity.id;

      if (messageIsNew && sentByPartner && chatIsNotOpen) {
        setChatNotification({
          visible: true,
          activityId: currentActivity.id,
          activityName: currentActivity.name,
          text: lastMessage.text,
        });
        setTimeout(() => {
          setChatNotification((prev) => ({ ...prev, visible: false }));
        }, 8000);
      }
    });
    prevActivitiesRef.current = allActivities;
  }, [allActivities, userData.partnerId, activeChatActivity]);

  // Função para postar um novo comentário.
  const handlePostComment = async (activityId, commentText) => {
    if (!commentText.trim()) return;
    const batch = writeBatch(db);
    const commentsPath = `duomatches/${userData.coupleId}/activities/${activityId}/comments`;
    const newCommentRef = doc(collection(db, commentsPath));
    batch.set(newCommentRef, {
      text: commentText,
      authorId: user.uid,
      authorNickname: userData.nickname,
      createdAt: serverTimestamp(),
    });
    const activityRef = doc(
      db,
      `duomatches/${userData.coupleId}/activities`,
      activityId
    );
    batch.update(activityRef, {
      lastMessage: {
        text: commentText,
        senderId: user.uid,
        timestamp: serverTimestamp(),
      },
    });
    // Corrigido: este contador era lido em 3 lugares diferentes para a
    // conquista "Super Comunicativo", mas nunca era incrementado —
    // a conquista era inatingível. Agora é atualizado a cada mensagem.
    const coupleRef = doc(db, "duomatches", userData.coupleId);
    batch.update(coupleRef, {
      messageCount: increment(1),
    });
    try {
      await batch.commit();
    } catch (error) {
      console.error("Erro ao postar comentário:", error);
      alert("Ocorreu um erro ao enviar sua mensagem.");
    }
  };

  /**
   * Edita uma mensagem já enviada. Quem chama (ChatModal) já verifica se
   * a edição é permitida (mensagem própria, ainda não vista E/OU ainda
   * não respondida) — aqui é só a escrita em si.
   */
  const handleEditComment = async (activityId, commentId, newText) => {
    if (!newText.trim()) return;
    const commentsPath = `duomatches/${userData.coupleId}/activities/${activityId}/comments`;
    try {
      await updateDoc(doc(db, commentsPath, commentId), {
        text: newText.trim(),
        editedAt: serverTimestamp(),
      });
      // Se essa era a última mensagem, atualiza também o preview salvo
      // na atividade (usado nas notificações e nas listas de atividade).
      const latest = activeChatComments[activeChatComments.length - 1];
      if (latest?.id === commentId) {
        const activityRef = doc(
          db,
          `duomatches/${userData.coupleId}/activities`,
          activityId
        );
        await updateDoc(activityRef, { "lastMessage.text": newText.trim() });
      }
    } catch (error) {
      console.error("Erro ao editar mensagem:", error);
      alert("Não foi possível editar a mensagem.");
    }
  };

  /** Apaga uma mensagem já enviada, recalculando o preview da atividade. */
  const handleDeleteComment = async (activityId, commentId) => {
    const commentsPath = `duomatches/${userData.coupleId}/activities/${activityId}/comments`;
    try {
      await deleteDoc(doc(db, commentsPath, commentId));

      const wasLatest =
        activeChatComments[activeChatComments.length - 1]?.id === commentId;
      if (wasLatest) {
        const remaining = activeChatComments.filter((c) => c.id !== commentId);
        const newLast = remaining[remaining.length - 1];
        const activityRef = doc(
          db,
          `duomatches/${userData.coupleId}/activities`,
          activityId
        );
        await updateDoc(activityRef, {
          lastMessage: newLast
            ? {
                text: newLast.text,
                senderId: newLast.authorId,
                timestamp: newLast.createdAt,
              }
            : null,
        });
      }
    } catch (error) {
      console.error("Erro ao apagar mensagem:", error);
      alert("Não foi possível apagar a mensagem.");
    }
  };

  // Retorna os estados e a função para o componente principal.
  return {
    activeChatActivity,
    setActiveChatActivity,
    activeChatComments,
    chatNotification,
    setChatNotification,
    handlePostComment,
    handleEditComment,
    handleDeleteComment,
  };
};
