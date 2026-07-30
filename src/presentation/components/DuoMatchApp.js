import React, { useState, useMemo, useEffect } from "react";
import { db, doc } from "../../infrastructure/firebase";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { updateDoc } from "firebase/firestore";

// HOOKS
import { useCouple } from "../../application/hooks/useCouple";
import { useActivities } from "../../application/hooks/useActivities";
import { useRounds } from "../../application/hooks/useRounds";
import { useWishlist } from "../../application/hooks/useWishlist";
import { useRewards } from "../../application/hooks/useRewards";
import { useChat } from "../../application/hooks/useChat";
import { useSuggestions } from "../../application/hooks/useSuggestions";
import { useRoundRules } from "../../application/hooks/useRoundRules";
import { getAchievementById } from "../../domain/entities/Achievement";


// COMPONENTES
import AllActivitiesView from "./AllActivitiesView";
import RoundsView from "./RoundsView";
import ShopView from "./ShopView";
import WalletView from "./WalletView";
import WishlistView from "./WishlistView";
import HotZone from "./HotZone";
import MainView from "./MainView";
import ProfileView from "./ProfileView";
import AddItemModal from "./AddItemModal";
import AddRoundModal from "./AddRoundModal";
import EditActivityModal from "./EditActivityModal";
import EditRewardModal from "./EditRewardModal";
import EditWishlistItemModal from "./EditWishlistItemModal";
import ChatModal from "./ChatModal";
import BottomNavBar from "./BottomNavBar";
import NotificationManager from "./NotificationManager";
import MatchNotification from "./MatchNotification";
import AchievementAnimation from "./AchievementAnimation";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import OnboardingView from "./OnboardingView";
import LoadingScreen from "./LoadingScreen";
import { PlusIcon } from "./Icons";

export default function DuoMatchApp({ user, userData }) {
  const validViews = ["main", "wishlist", "wallet", "shop", "hot", "all", "rounds", "profile"];
  const initialView = new URLSearchParams(window.location.search).get("view");
  const [view, setView] = useState(
    validViews.includes(initialView) ? initialView : "main"
  );
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddRoundModalOpen, setIsAddRoundModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [showHotMatchNotification, setShowHotMatchNotification] = useState(false);
  const [hotMatchedActivityName, setHotMatchedActivityName] = useState("");
  const [achievementToShow, setAchievementToShow] = useState(null);

  const partnerNickname = useMemo(
    () =>
      userData?.partnerData ? userData.partnerData.nickname : "Parceiro(a)",
    [userData?.partnerData]
  );

  const {
    coupleData,
    handleUpdateCoupleData,
    handleUnlinkCouple,
    handleCompleteOnboarding,
    handleSetDailySignal,
  } = useCouple(user, userData);
  const { rounds, handleAddRound, handleUpdateRound, handleDeleteRound } =
    useRounds(userData);
  const {
    allActivities,
    mySelections,
    partnerSelections,
    matches,
    ...activityHandlers
  } = useActivities(user, userData, coupleData, rounds);

  useRoundRules({ user, userData, rounds, allActivities });


  const {
    suggestions: hotSuggestions,
    handleSelectSuggestion: handleSelectHotSuggestion,
  } = useSuggestions(userData, activityHandlers.handleAddActivity, "hot");
  const {
    suggestions: dailySuggestions,
    handleSelectSuggestion: handleSelectDailySuggestion,
  } = useSuggestions(userData, activityHandlers.handleAddActivity, "daily");

  const { wishlistItems, ...wishlistHandlers } = useWishlist(
    user,
    userData,
    coupleData,
    rounds
  );
  const { rewards, ...rewardHandlers } = useRewards(
    user,
    userData,
    coupleData,
    rounds
  );
  const { activeChatActivity: chatActivity, setActiveChatActivity: setChatActivity, ...chatHandlers } =
    useChat(user, userData, allActivities);

  const handleFinishOnboarding = () => {
    if (userData?.coupleId) {
      setIsTourOpen(false);
      handleCompleteOnboarding();
      setView("rounds");
    } else {
      console.error(
        "Não foi possível finalizar o onboarding: coupleId não encontrado."
      );
    }
  };

  const handleOpenTour = () => setIsTourOpen(true);
  const handleChangePassword = async (currentPassword, newPassword) => {
    try {
      const auth = getAuth();
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      alert("Senha alterada com sucesso!");
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      alert("Erro ao alterar senha: " + error.message);
    }
  };

  const handleUpdateProfile = async (updatedData) => {
    if (!user?.uid) {
      alert("Erro de autenticação. Por favor, faça login novamente.");
      return;
    }
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, updatedData);
      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      alert("Não foi possível atualizar o perfil. Tente novamente.");
    }
  };

  const propsForChildren = {
    user,
    userData,
    view,
    setView,
    partnerNickname,
    allActivities,
    mySelections,
    partnerSelections,
    matches,
    coupleData,
    rounds,
    wishlistItems,
    rewards,
    activeChatActivity: chatActivity,
    setActiveChatActivity: setChatActivity,
    setIsAddItemModalOpen,
    setIsAddRoundModalOpen,
    handleUpdateCoupleData,
    handleUnlinkCouple,
    handleAddRound,
    handleDeleteRound,
    handleUpdateRound,
    ...activityHandlers,
    ...wishlistHandlers,
    ...rewardHandlers,
    ...chatHandlers,
    dailySuggestions,
    handleSelectSuggestion: handleSelectDailySuggestion,
    hotSuggestions,
    handleSelectHotSuggestion,
    handleOpenTour,
    handleSetDailySignal,
    handleUpdateProfile,
    handleChangePassword,
  };

  const renderCurrentView = () => {
    switch (view) {
      case "wishlist":
        return <WishlistView {...propsForChildren} />;
      case "wallet":
        return <WalletView {...propsForChildren} />;
      case "shop":
        return <ShopView {...propsForChildren} />;
      case "hot":
        return <HotZone {...propsForChildren} />;
      case "all":
        return <AllActivitiesView {...propsForChildren} />;
      case "rounds":
        return <RoundsView {...propsForChildren} />;
      case "profile":
        return (
          <ProfileView
            {...propsForChildren}
            partnerData={userData.partnerData}
          />
        );
      default:
        return <MainView {...propsForChildren} />;
    }
  };

  useEffect(() => {
    const handleHotMatchEvent = (event) => {
      const { activityName } = event.detail;
      setHotMatchedActivityName(activityName);
      setShowHotMatchNotification(true);
    };

    window.addEventListener('hotActivityMatch', handleHotMatchEvent);

    // Tornar a função dispatchHotMatchEvent acessível globalmente
    window.dispatchHotMatchEvent = (activityName) => {
      const event = new CustomEvent('hotActivityMatch', { detail: { activityName } });
      window.dispatchEvent(event);
    };

    return () => {
      delete window.dispatchHotMatchEvent;
      window.removeEventListener('hotActivityMatch', handleHotMatchEvent);
    };
  }, []);

  // Sistema de eventos para animação de conquistas
  useEffect(() => {
    const handleAchievementUnlocked = (event) => {
      const { achievementId } = event.detail;
      const achievement = getAchievementById(achievementId);
      if (achievement) {
        setAchievementToShow(achievement);
      }
    };

    window.addEventListener('achievementUnlocked', handleAchievementUnlocked);

    return () => {
      window.removeEventListener('achievementUnlocked', handleAchievementUnlocked);
    };
  }, []);

  if (!coupleData) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative min-h-screen bg-gray-900">
      {isTourOpen && <OnboardingView onFinish={handleFinishOnboarding} />}
      <div className="pb-24 md:pb-0">{renderCurrentView()}
        {showHotMatchNotification && (
          <MatchNotification
            activityName={hotMatchedActivityName}
            onClose={() => setShowHotMatchNotification(false)}
            isHot={true}
          />
        )}

        {achievementToShow && (
          <AchievementAnimation
            achievement={achievementToShow}
            onClose={() => setAchievementToShow(null)}
          />
        )}
      </div>

      <BottomNavBar view={view} setView={setView} />

      {(view === "main" || view === "hot") && (
        <button
          onClick={() => setIsAddItemModalOpen(true)}
          className="md:hidden fixed bottom-24 right-4 bg-pink-500 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center z-20 hover:bg-pink-600 transition-all duration-300 transform hover:scale-110"
          aria-label="Adicionar Novo Item"
        >
          <PlusIcon />
        </button>
      )}

      {isAddItemModalOpen && (
        <AddItemModal
          isOpen={isAddItemModalOpen}
          onClose={() => setIsAddItemModalOpen(false)}
          user={user}
          rounds={rounds}
          allActivities={allActivities}
          handleAddActivity={activityHandlers.handleAddActivity}
        />
      )}
      <AddRoundModal
        isOpen={isAddRoundModalOpen}
        onClose={() => setIsAddRoundModalOpen(false)}
        onAddRound={handleAddRound}
      />

      {activityHandlers.activityToEdit && (
        <EditActivityModal
          activity={activityHandlers.activityToEdit}
          onClose={() => activityHandlers.setActivityToEdit(null)}
          onSave={activityHandlers.handleUpdateActivity}
        />
      )}
      {rewardHandlers.rewardToEdit && (
        <EditRewardModal
          reward={rewardHandlers.rewardToEdit}
          onClose={() => rewardHandlers.setRewardToEdit(null)}
          onSave={rewardHandlers.handleUpdateReward}
        />
      )}
      {wishlistHandlers.wishlistItemToEdit && (
        <EditWishlistItemModal
          item={wishlistHandlers.wishlistItemToEdit}
          onClose={() => wishlistHandlers.setWishlistItemToEdit(null)}
          onSave={wishlistHandlers.handleUpdateWishlistItem}
        />
      )}
      {chatActivity && (
        <ChatModal
          activity={chatActivity}
          user={user}
          comments={chatHandlers.activeChatComments}
          onClose={() => setChatActivity(null)}
          handlePostComment={chatHandlers.handlePostComment}
        />
      )}
      <DeleteConfirmationModal
        item={activityHandlers.activityToDelete}
        onClose={() => activityHandlers.setActivityToDelete(null)}
        onConfirm={() =>
          activityHandlers.handleDeleteActivity(
            activityHandlers.activityToDelete.id
          )
        }
        title="Excluir Atividade"
        message={`Tem certeza que deseja excluir "${activityHandlers.activityToDelete?.name}"?`}
      />
      <DeleteConfirmationModal
        item={rewardHandlers.rewardToDelete}
        onClose={() => rewardHandlers.setRewardToDelete(null)}
        onConfirm={() =>
          rewardHandlers.handleDeleteReward(rewardHandlers.rewardToDelete.id)
        }
        title="Excluir Recompensa"
        message={`Tem certeza que deseja excluir a recompensa "${rewardHandlers.rewardToDelete?.name}"?`}
      />
      <DeleteConfirmationModal
        item={wishlistHandlers.wishlistItemToDelete}
        onClose={() => wishlistHandlers.setWishlistItemToDelete(null)}
        onConfirm={() =>
          wishlistHandlers.handleDeleteWishlistItem(
            wishlistHandlers.wishlistItemToDelete.id
          )
        }
        title="Excluir Desejo"
        message={`Tem certeza que deseja excluir o item "${wishlistHandlers.wishlistItemToDelete?.name}"?`}
      />

      <NotificationManager {...propsForChildren} />
    </div>
  );
}