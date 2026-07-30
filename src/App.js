import React from "react";
import { useAuth } from "./application/hooks/useAuth";

import AuthPage from "./presentation/components/AuthPage";
import LinkingPage from "./presentation/components/LinkingPage";
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
