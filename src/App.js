import React from "react";
import { useAuth } from "./application/hooks/useAuth";

import AuthPage from "./presentation/components/AuthPage";
import LinkingPage from "./presentation/components/LinkingPage";
import PreviewApp from "./presentation/components/PreviewApp";
import DuoMatchApp from "./presentation/components/DuoMatchApp";
import OfflineBanner from "./presentation/pwa/OfflineBanner";
import InstallPrompt from "./presentation/pwa/InstallPrompt";
import LoadingScreen from "./presentation/components/LoadingScreen";

function App() {
  const { user, userData, loading } = useAuth();

  const renderContent = () => {
    if (loading) return <LoadingScreen />;
    if (!user) return <AuthPage />;
    if (!userData) return <LoadingScreen />;
    if (!userData.partnerId || !userData.coupleId) {
      // Quem já escolheu "vincular depois" no cadastro entra numa
      // pré-visualização completa do app (com tutorial e dados de
      // exemplo) em vez de ficar preso na tela de vinculação — mas
      // continua sem coupleId de verdade, então nada é gravado no
      // Firestore até a vinculação real acontecer.
      if (userData.onboardingSkipped) {
        return <PreviewApp user={user} userData={userData} />;
      }
      return <LinkingPage user={user} userData={userData} />;
    }
    return <DuoMatchApp user={user} userData={userData} />;
  };

  return (
    <>
      <OfflineBanner />
      {renderContent()}
      <InstallPrompt />
    </>
  );
}

export default App;
