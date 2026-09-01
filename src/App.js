import React from "react";
import { useAuth } from "./application/hooks/useAuth";
import { auth, signOut } from "./infrastructure/firebase";

import AuthPage from "./presentation/components/AuthPage";
import CompleteProfileView from "./presentation/components/CompleteProfileView";
import LinkingPage from "./presentation/components/LinkingPage";
import PreviewApp from "./presentation/components/PreviewApp";
import DuoMatchApp from "./presentation/components/DuoMatchApp";
import OfflineBanner from "./presentation/pwa/OfflineBanner";
import InstallPrompt from "./presentation/pwa/InstallPrompt";
import LoadingScreen from "./presentation/components/LoadingScreen";
import ErrorScreen from "./presentation/components/ErrorScreen";

function App() {
  const { user, userData, loading, error } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (logoutError) {
      console.error("Erro ao sair da conta:", logoutError);
    }
    window.location.reload();
  };

  const renderContent = () => {
    // B2-26: erro permanente num listener (perfil/parceiro) — sem isso o
    // usuário ficava preso num LoadingScreen infinito.
    if (error) {
      return (
        <ErrorScreen
          message="Não foi possível manter a conexão com o servidor. Verifique sua internet e tente novamente."
          onRetry={() => window.location.reload()}
          onLogout={handleLogout}
        />
      );
    }
    if (loading) return <LoadingScreen />;
    if (!user) return <AuthPage />;
    if (!userData) return <LoadingScreen />;
    // Quem se cadastra pelo Google não passa pela etapa de apelido,
    // gênero, data de nascimento e avatar do formulário de e-mail (o
    // Google só fornece nome, e-mail e foto) — trava aqui, antes de
    // qualquer outra coisa, até a pessoa completar o perfil.
    if (!userData.gender) {
      return <CompleteProfileView user={user} userData={userData} />;
    }
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
