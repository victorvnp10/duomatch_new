import React, { useState, useRef, useMemo } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../infrastructure/firebase";
import { getTodayDateString } from "../../shared/utils";
import {
  DEMO_PARTNER_UID,
  buildPreviewPartnerData,
  buildPreviewCoupleData,
  buildPreviewRounds,
  buildPreviewActivities,
  buildPreviewWishlistItems,
  buildPreviewRewards,
} from "../../shared/previewData";

import LinkingPage from "./LinkingPage";
import MainView from "./MainView";
import HotZone from "./HotZone";
import RoundsView from "./RoundsView";
import WishlistView from "./WishlistView";
import ShopView from "./ShopView";
import WalletView from "./WalletView";
import AllActivitiesView from "./AllActivitiesView";
import ProfileView from "./ProfileView";
import BottomNavBar from "./BottomNavBar";
import OnboardingView from "./OnboardingView";
import AddItemModal from "./AddItemModal";
import AddRoundModal from "./AddRoundModal";
import { PlusIcon } from "./Icons";

/**
 * Experiência completa de pré-visualização para quem escolheu "Vincular
 * depois". Reaproveita as telas reais do app (MainView, HotZone, tour
 * guiado, etc.) com dados de exemplo mantidos em estado local — nada
 * disto é gravado no Firestore. Assim que a pessoa vincula o parceiro de
 * verdade (botão sempre visível), o `App.js` detecta o `coupleId` novo e
 * troca sozinho para o `DuoMatchApp` real.
 *
 * Ações que exigiriam um parceiro de verdade (comprar recompensa,
 * presentear um desejo, criar rodada de verdade) mostram um aviso amigável
 * em vez de tentar escrever no banco — `guard()` cobre essas.
 */
function PreviewApp({ user, userData }) {
  const [showLinking, setShowLinking] = useState(false);
  const [view, setView] = useState("main");
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddRoundModalOpen, setIsAddRoundModalOpen] = useState(false);
  const hasAutoOpenedTour = useRef(false);

  const previewPartnerData = useMemo(() => buildPreviewPartnerData(), []);
  const userDataWithPreviewPartner = useMemo(
    () => ({
      ...userData,
      partnerId: userData.partnerId || DEMO_PARTNER_UID,
      partnerData: userData.partnerData || previewPartnerData,
    }),
    [userData, previewPartnerData]
  );

  const [coupleData, setCoupleData] = useState(() => buildPreviewCoupleData());
  const [rounds, setRounds] = useState(() => buildPreviewRounds(user.uid));
  const [allActivities, setAllActivities] = useState(() =>
    buildPreviewActivities(user.uid)
  );
  const [mySelections, setMySelections] = useState({});
  const [wishlistItems] = useState(() => buildPreviewWishlistItems(user.uid));
  const [rewards] = useState(() => buildPreviewRewards());

  // Abre o tour automaticamente na primeira visita, igual ao app real.
  if (!hasAutoOpenedTour.current) {
    hasAutoOpenedTour.current = true;
    setTimeout(() => setIsTourOpen(true), 400);
  }

  const guard = (message) => () => {
    alert(
      message ||
        "Isso já vai funcionar de verdade assim que vocês vincularem as contas 💕"
    );
  };

  // --- Interações que funcionam de verdade, localmente (sem Firestore) ---

  const handleSelectActivity = async (activityId) => {
    const today = getTodayDateString();
    setMySelections((prev) => {
      const already = prev[activityId]?.status === "selected";
      if (already) {
        const { [activityId]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [activityId]: { status: "selected", date: today } };
    });
  };

  const handleAddActivity = async (newActivity) => {
    setAllActivities((prev) => [
      { ...newActivity, id: `demo-custom-${prev.length + 1}` },
      ...prev,
    ]);
    setIsAddItemModalOpen(false);
  };

  const handleAddRound = async (newRound) => {
    setRounds((prev) => [
      { ...newRound, id: `demo-round-${prev.length + 1}`, scores: {} },
      ...prev,
    ]);
    setIsAddRoundModalOpen(false);
  };

  const handleSetDailySignal = async (signalId) => {
    const today = getTodayDateString();
    setCoupleData((prev) => ({
      ...prev,
      dailySignals: {
        date: today,
        signals: {
          ...(prev.dailySignals?.date === today
            ? prev.dailySignals.signals
            : {}),
          [user.uid]: signalId,
        },
      },
    }));
  };

  const handleFinishOnboarding = () => {
    setIsTourOpen(false);
    setView("main");
  };

  if (showLinking) {
    return (
      <LinkingPage
        user={user}
        userData={userData}
        onBack={() => setShowLinking(false)}
      />
    );
  }

  const propsForChildren = {
    user,
    userData: userDataWithPreviewPartner,
    view,
    setView,
    partnerNickname: previewPartnerData.nickname,
    allActivities,
    mySelections,
    partnerSelections: {},
    matches: [],
    coupleData,
    rounds,
    wishlistItems,
    rewards,
    activeChatActivity: null,
    setActiveChatActivity: guard(),
    setIsAddItemModalOpen,
    setIsAddRoundModalOpen,
    handleUpdateCoupleData: async (updates) =>
      setCoupleData((prev) => ({ ...prev, ...updates })),
    handleUnlinkCouple: guard("Você ainda não tem parceiro vinculado."),
    handleAddRound,
    handleDeleteRound: guard(),
    handleUpdateRound: guard(),
    handleSelectActivity,
    handleAddActivity,
    handleUpdateActivity: guard(),
    handleDeleteActivity: guard(),
    activityToEdit: null,
    setActivityToEdit: () => {},
    activityToDelete: null,
    setActivityToDelete: () => {},
    handleResolveChallenge: guard(),
    handleSetActivityResolution: guard(),
    handleAcceptChallenge: guard(),
    handleDeclineChallenge: guard(),
    handleAddItemToWishlist: guard(),
    setWishlistItemToEdit: () => {},
    setWishlistItemToDelete: () => {},
    handleGiftWishlistItem: guard(),
    handleConfirmGiftReceived: guard(),
    handleCreateReward: guard(),
    handleApproveReward: guard(),
    handlePurchaseReward: guard(
      "Compras de recompensas valem pontos reais do casal — vincule seu parceiro(a) primeiro."
    ),
    setRewardToEdit: () => {},
    setRewardToDelete: () => {},
    handleMarkAsDelivered: guard(),
    dailySuggestions: [],
    handleSelectSuggestion: guard(),
    hotSuggestions: [],
    handleSelectHotSuggestion: guard(),
    handleOpenTour: () => setIsTourOpen(true),
    handleSetDailySignal,
    handleUpdateProfile: async () => {
      alert("No modo de demonstração as alterações de perfil não são salvas.");
    },
    handleChangePassword: async () => {
      alert("Vincule seu parceiro(a) para acessar essa configuração de verdade.");
    },
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
            partnerData={previewPartnerData}
          />
        );
      default:
        return <MainView {...propsForChildren} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-900">
      {/* Faixa fixa avisando que isso é uma demonstração, com atalho pra vincular a qualquer momento */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-gold-dark text-ink text-center text-xs font-bold py-1 px-2">
        MODO DEMONSTRAÇÃO — dados de exemplo •{" "}
        <button
          onClick={() => setShowLinking(true)}
          className="underline hover:text-white"
        >
          Vincular meu par agora
        </button>
        {" • "}
        <button onClick={() => signOut(auth)} className="underline hover:text-white">
          Sair
        </button>
      </div>
      <div className="pt-6">
        {isTourOpen && (
          <OnboardingView onFinish={handleFinishOnboarding} setView={setView} />
        )}
        <div className="pb-24 md:pb-0">{renderCurrentView()}</div>

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
            handleAddActivity={handleAddActivity}
          />
        )}
        <AddRoundModal
          isOpen={isAddRoundModalOpen}
          onClose={() => setIsAddRoundModalOpen(false)}
          onAddRound={handleAddRound}
        />
      </div>
    </div>
  );
}

export default PreviewApp;
