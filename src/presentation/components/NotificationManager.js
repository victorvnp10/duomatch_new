import React, { useEffect } from "react"; // <-- MUDANÇA 1: Adiciona a importação do useEffect
// Importe os ícones que serão usados nas notificações.
import {
  ChatBubbleIcon,
  FireIcon,
  GiftIcon,
  TrophyIcon,
  StarIcon, // Ícone para a nova notificação
} from "./Icons";

export default function NotificationManager(props) {
  // Recebemos todas as props, mas só usaremos as de notificação.
  const {
    showMatchNotification,
    partnerNotification,
    setPartnerNotification,
    showHotSelectionNotification,
    setShowHotSelectionNotification,
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
      {/* Notificações existentes (inalteradas) */}
      {showMatchNotification && (
        <div className="fixed bottom-24 right-4 md:right-10 bg-white shadow-lg rounded-lg p-4 flex items-center animate-bounce border-l-4 border-green-500 z-50">
          <span className="text-2xl mr-3">🎉</span>
          <div>
            <h4 className="font-bold text-green-600">Vocês têm um match!</h4>
            <p className="text-sm text-gray-600">
              Novos interesses em comum foram adicionados.
            </p>
          </div>
        </div>
      )}

      {partnerNotification.visible && (
        <div className="fixed top-20 right-4 md:right-10 bg-blue-100 border-l-4 border-blue-500 shadow-lg rounded-lg p-4 flex items-start z-50">
          <span className="text-2xl mr-3 pt-1">😉</span>
          <div>
            <h4 className="font-bold text-blue-700">Seu par já escolheu!</h4>
            <p className="text-sm text-gray-700">
              Agora é a sua vez de confirmar as atividades.
            </p>
          </div>
          <button
            onClick={() =>
              setPartnerNotification((p) => ({ ...p, visible: false }))
            }
            className="ml-4 text-gray-500 font-bold text-lg"
          >
            &times;
          </button>
        </div>
      )}

      {showHotSelectionNotification && (
        <div className="fixed top-20 right-4 md:right-10 bg-red-100 border-l-4 border-red-500 shadow-lg rounded-lg p-4 flex items-start z-50 animate-bounce">
          <span className="text-2xl mr-3 pt-1">
            <FireIcon className="text-red-500" />
          </span>
          <div>
            <h4 className="font-bold text-red-700">
              O clima está esquentando...
            </h4>
            <p className="text-sm text-gray-700">
              Seu parceiro(a) marcou um interesse na Hot Zone! 🔥
            </p>
          </div>
          <button
            onClick={() => setShowHotSelectionNotification(false)}
            className="ml-4 text-gray-500 font-bold text-lg"
          >
            &times;
          </button>
        </div>
      )}

      {/* Bloco da Wishlist corrigido para usar a função correta */}
      {wishlistNotification.visible && (
        <div
          onClick={() => {
            setView("wishlist");
            handleDismissWishlistNotification(wishlistNotification.itemId);
          }}
          className="fixed bottom-24 right-4 md:right-10 bg-white border-l-4 border-purple-500 shadow-lg rounded-lg p-4 flex items-start z-50 cursor-pointer hover:shadow-xl"
        >
          <span className="text-2xl mr-3 pt-1">
            <GiftIcon />
          </span>
          <div className="flex-grow">
            <h4 className="font-bold text-gray-800">
              Novo item na Lista de Desejos!
            </h4>
            <p className="text-sm text-gray-600">
              Seu par adicionou: "{wishlistNotification.itemName}"
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismissWishlistNotification(wishlistNotification.itemId);
            }}
            className="ml-4 text-gray-500 hover:text-gray-800 font-bold text-lg"
            aria-label="Fechar notificação"
          >
            &times;
          </button>
        </div>
      )}

      {/* --- NOVO BLOCO PARA NOTIFICAÇÕES DE APROVAÇÃO DE RECOMPENSA --- */}
      {approvalNotifications.map((reward, index) => (
        <div
          key={reward.id}
          onClick={() => {
            setView("shop");
            dismissApprovalNotification(reward.id);
          }}
          className="fixed bottom-40 right-4 md:right-10 bg-white border-l-4 border-orange-500 shadow-lg rounded-lg p-4 flex items-start z-50 cursor-pointer hover:shadow-xl transition-transform"
          style={{ transform: `translateY(-${index * 110}px)` }} // Empilha as notificações se houver mais de uma
        >
          <span className="text-2xl mr-3 pt-1 text-orange-500">
            <StarIcon />
          </span>
          <div className="flex-grow">
            <h4 className="font-bold text-gray-800">Recompensa para Aprovar</h4>
            <p className="text-sm text-gray-600">
              Seu par sugeriu: "{reward.name}"
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              dismissApprovalNotification(reward.id);
            }}
            className="ml-4 text-gray-500 hover:text-gray-800 font-bold text-lg"
            aria-label="Fechar notificação"
          >
            &times;
          </button>
        </div>
      ))}

      {/* Outras notificações */}
      {purchaseNotification.visible && (
        <div
          onClick={() => {
            setView("shop");
            setPurchaseNotification((p) => ({ ...p, visible: false }));
          }}
          className="fixed bottom-56 right-4 md:right-10 bg-white border-l-4 border-yellow-500 shadow-lg rounded-lg p-4 flex items-start z-50 cursor-pointer hover:shadow-xl"
        >
          <span className="text-2xl mr-3 pt-1">
            <TrophyIcon />
          </span>
          <div className="flex-grow">
            <h4 className="font-bold text-gray-800">Recompensa Resgatada!</h4>
            <p className="text-sm text-gray-600">
              Seu par comprou: "{purchaseNotification.rewardName}"
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPurchaseNotification((p) => ({ ...p, visible: false }));
            }}
            className="ml-4 text-gray-500 hover:text-gray-800 font-bold text-lg"
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
          className="fixed bottom-72 right-4 md:right-10 bg-white border-l-4 border-green-500 shadow-lg rounded-lg p-4 flex items-start z-50 cursor-pointer hover:shadow-xl"
        >
          <span className="text-2xl mr-3 pt-1 text-green-500">
            <ChatBubbleIcon />
          </span>
          <div className="flex-grow">
            <h4 className="font-bold text-gray-800">
              Nova mensagem em "{chatNotification.activityName}"
            </h4>
            <p className="text-sm text-gray-600 truncate">
              {chatNotification.text}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setChatNotification({ visible: false });
            }}
            className="ml-4 text-gray-500 hover:text-gray-800 font-bold text-lg"
            aria-label="Fechar notificação"
          >
            &times;
          </button>
        </div>
      )}
    </>
  );
}
