import React, { useEffect } from "react"; // <-- MUDANÇA 1: Adiciona a importação do useEffect
// Importe os ícones que serão usados nas notificações.
import {
  ChatBubbleIcon,
  GiftIcon,
  TrophyIcon,
  StarIcon, // Ícone para a nova notificação
} from "./Icons";

export default function NotificationManager(props) {
  // Recebemos todas as props, mas só usaremos as de notificação.
  const {
    wishlistNotification,
    handleDismissWishlistNotification, // Função correta para a wishlist
    purchaseNotification,
    setPurchaseNotification,
    chatNotification,
    setChatNotification,
    allActivities,
    setActiveChatActivity,
    setView,
    approvalNotifications, // <-- NOVA PROP RECEBIDA
    dismissApprovalNotification, // <-- NOVA PROP RECEBIDA
    pointsMessage, // <-- MUDANÇA 2: Recebe as novas props
    setPointsMessage, // <-- Recebe as novas props
  } = props;
  useEffect(() => {
    if (pointsMessage) {
      const timer = setTimeout(() => {
        setPointsMessage(""); // Limpa a mensagem após 4 segundos
      }, 4000);
      return () => clearTimeout(timer); // Limpa o timer se o componente for desmontado
    }
  }, [pointsMessage, setPointsMessage]);

  return (
    <>
      {/* --- MUDANÇA 4: INSERIR O JSX DA NOVA NOTIFICAÇÃO AQUI --- */}
      {pointsMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-green-500 text-white shadow-lg rounded-full px-6 py-2 flex items-center z-50 animate-pulse">
          <span className="text-lg mr-2">⭐</span>
          <p className="font-semibold">{pointsMessage}</p>
        </div>
      )}
      {/* B2-39: `showMatchNotification`, `partnerNotification` e
          `showHotSelectionNotification` eram toasts que NINGUÉM ativava
          (estados nunca setados em useActivities.js). O match 1:1 já tem
          UI viva: evento `activityMatch` em MainView/HotZone; o hot match
          via `dispatchHotMatchEvent` em DuoMatchApp; e o "par já escolheu"
          cobre-se pela Central de Notificações. Blocos removidos. */}

      {wishlistNotification.visible && (
        <div
          onClick={() => {
            setView("wishlist");
            handleDismissWishlistNotification(wishlistNotification.itemId);
          }}
          className="fixed bottom-24 right-4 md:right-10 bg-ink border-l-4 border-purple-500 shadow-lg rounded-lg p-4 flex items-start z-50 cursor-pointer hover:shadow-xl"
        >
          <span className="text-2xl mr-3 pt-1">
            <GiftIcon />
          </span>
          <div className="flex-grow">
            <h4 className="font-bold text-white">
              Novo item na Lista de Desejos!
            </h4>
            <p className="text-sm text-gray-300">
              Seu par adicionou: "{wishlistNotification.itemName}"
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismissWishlistNotification(wishlistNotification.itemId);
            }}
            className="ml-4 text-gray-400 hover:text-white font-bold text-lg"
            aria-label="Fechar notificação"
          >
            &times;
          </button>
        </div>
      )}

      {approvalNotifications.map((reward, index) => (
        <div
          key={reward.id}
          onClick={() => {
            setView("shop");
            dismissApprovalNotification(reward.id);
          }}
          className="fixed bottom-40 right-4 md:right-10 bg-ink border-l-4 border-orange-500 shadow-lg rounded-lg p-4 flex items-start z-50 cursor-pointer hover:shadow-xl transition-transform"
          style={{ transform: `translateY(-${index * 110}px)` }}
        >
          <span className="text-2xl mr-3 pt-1 text-orange-400">
            <StarIcon />
          </span>
          <div className="flex-grow">
            <h4 className="font-bold text-white">Recompensa para Aprovar</h4>
            <p className="text-sm text-gray-300">
              Seu par sugeriu: "{reward.name}"
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              dismissApprovalNotification(reward.id);
            }}
            className="ml-4 text-gray-400 hover:text-white font-bold text-lg"
            aria-label="Fechar notificação"
          >
            &times;
          </button>
        </div>
      ))}

      {purchaseNotification.visible && (
        <div
          onClick={() => {
            setView("shop");
            setPurchaseNotification((p) => ({ ...p, visible: false }));
          }}
          className="fixed bottom-56 right-4 md:right-10 bg-ink border-l-4 border-yellow-500 shadow-lg rounded-lg p-4 flex items-start z-50 cursor-pointer hover:shadow-xl"
        >
          <span className="text-2xl mr-3 pt-1">
            <TrophyIcon />
          </span>
          <div className="flex-grow">
            <h4 className="font-bold text-white">Recompensa Resgatada!</h4>
            <p className="text-sm text-gray-300">
              Seu par comprou: "{purchaseNotification.rewardName}"
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPurchaseNotification((p) => ({ ...p, visible: false }));
            }}
            className="ml-4 text-gray-400 hover:text-white font-bold text-lg"
            aria-label="Fechar notificação"
          >
            &times;
          </button>
        </div>
      )}

      {chatNotification.visible && (
        <div
          onClick={() => {
            const act = allActivities.find(
              (a) => a.id === chatNotification.activityId
            );
            if (act) setActiveChatActivity(act);
            setChatNotification({ visible: false });
          }}
          className="fixed bottom-72 right-4 md:right-10 bg-ink border-l-4 border-green-500 shadow-lg rounded-lg p-4 flex items-start z-50 cursor-pointer hover:shadow-xl"
        >
          <span className="text-2xl mr-3 pt-1 text-green-400">
            <ChatBubbleIcon />
          </span>
          <div className="flex-grow">
            <h4 className="font-bold text-white">
              Nova mensagem em "{chatNotification.activityName}"
            </h4>
            <p className="text-sm text-gray-300 truncate">
              {chatNotification.text}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setChatNotification({ visible: false });
            }}
            className="ml-4 text-gray-400 hover:text-white font-bold text-lg"
            aria-label="Fechar notificação"
          >
            &times;
          </button>
        </div>
      )}
    </>
  );
}
