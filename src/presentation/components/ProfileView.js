import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeftIcon, UserCircleIcon } from "./Icons"; // Ícones para o cabeçalho
import { Avatar, getAvatarOptionsForGender } from "./avatars/AvatarCatalog";

// Componente da tela de Perfil/Configurações
export default function ProfileView(props) {
  const {
    setView,
    userData,
    handleUpdateProfile,
    handleChangePassword,
    handleUnlinkCouple,
  } = props;

  // Estados para os campos do formulário
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState("masculino");
  const [selectedAvatar, setSelectedAvatar] = useState("");

  // Estados para a mudança de senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Popula o formulário com os dados atuais do usuário quando o componente carrega
  useEffect(() => {
    if (userData) {
      setNickname(userData.nickname || "");
      setGender(userData.gender || "masculino");
      // Se não há avatar ou é uma URL antiga, definir um avatar padrão baseado no gênero
      const currentAvatar = userData.photoURL;
      if (!currentAvatar || currentAvatar.startsWith('http')) {
        const defaultAvatar = userData.gender === "feminino" ? "fem-1" : "masc-1";
        setSelectedAvatar(defaultAvatar);
      } else {
        setSelectedAvatar(currentAvatar);
      }
    }
  }, [userData]);

  // Garante que o avatar salvo do usuário sempre apareça como uma opção.
  const avatarOptions = useMemo(() => {
    const baseOptions = getAvatarOptionsForGender(gender);
    const currentSavedAvatar = userData?.photoURL;

    // Se o avatar atual é uma URL (sistema antigo), não incluir nas opções
    if (currentSavedAvatar && currentSavedAvatar.startsWith('http')) {
      return baseOptions;
    }

    // Se o avatar atual é um emoji salvo antes desta atualização (não é
    // um id do catálogo novo), mantém como primeira opção selecionável.
    if (currentSavedAvatar && !baseOptions.find((avatar) => avatar.id === currentSavedAvatar)) {
      return [
        { id: currentSavedAvatar, name: "Atual", legacyEmoji: currentSavedAvatar },
        ...baseOptions,
      ];
    }

    return baseOptions;
  }, [gender, userData?.photoURL]);

  // Função para salvar as alterações do perfil (apelido, gênero, avatar)
  const handleSaveChanges = (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      alert("O apelido não pode ficar em branco.");
      return;
    }
    const updatedData = {
      nickname: nickname,
      gender: gender,
      photoURL: selectedAvatar,
    };
    handleUpdateProfile(updatedData);
  };

  // Função para lidar com a alteração de senha
  const handleSavePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("As novas senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      alert("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    handleChangePassword(currentPassword, newPassword);
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans">
      {/* HEADER */}
      <header className="bg-gray-900/70 backdrop-blur-md p-4 sticky top-0 z-20 border-b border-gray-700/50">
        <div className="max-w-4xl mx-auto flex items-center">
          <button
            onClick={() => setView("main")}
            className="p-2 rounded-full text-gray-300 hover:bg-gray-700/50 hover:text-white mr-2 transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div className="flex items-center text-yellow-400">
            <UserCircleIcon />
            <h1 className="ml-2 text-xl font-bold tracking-wider text-white">
              Meu Perfil
            </h1>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-8 pb-24">
        {/* CARD DE SELEÇÃO DE AVATAR */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl shadow-lg p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-gray-200 tracking-wide mb-4">
            Seu Avatar
          </h2>
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {avatarOptions.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => setSelectedAvatar(avatar.id)}
                className={`w-24 h-24 p-1 rounded-2xl border-3 transition-all duration-300 hover:scale-105 ${
                  selectedAvatar === avatar.id
                    ? "border-yellow-400 scale-110 shadow-lg shadow-yellow-400/20"
                    : "border-transparent hover:border-gray-500/50"
                }`}
                title={avatar.name}
              >
                {avatar.legacyEmoji ? (
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-plum-light to-ink-lighter flex items-center justify-center text-4xl shadow-inner">
                    {avatar.legacyEmoji}
                  </div>
                ) : (
                  <Avatar photoURL={avatar.id} size="w-full h-full" className="shadow-inner" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CARD DE ACESSO AO CICLO */}
        <button
          data-tour-id="cycle-card"
          onClick={() => setView("cycle")}
          className="w-full bg-gray-800/50 border border-gray-700/50 rounded-3xl shadow-lg p-6 backdrop-blur-sm text-left hover:border-accent/50 transition-colors flex items-center justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold text-gray-200 tracking-wide">
              Ciclo
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Acompanhe o ciclo ou veja o insight diário do casal
            </p>
          </div>
          <span className="text-2xl">🩷</span>
        </button>

        {/* CARD DE DADOS PESSOAIS */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl shadow-lg p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-gray-200 tracking-wide mb-4">
            Dados Pessoais
          </h2>
          <form onSubmit={handleSaveChanges} className="space-y-4">
            <div>
              <label
                htmlFor="nickname"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Apelido
              </label>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full block px-4 py-2 border border-gray-600 rounded-lg shadow-sm bg-gray-800 text-white focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gênero
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setGender("masculino")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors w-full ${
                    gender === "masculino"
                      ? "bg-yellow-400 text-gray-900"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  Masculino
                </button>
                <button
                  type="button"
                  onClick={() => setGender("feminino")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors w-full ${
                    gender === "feminino"
                      ? "bg-yellow-400 text-gray-900"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  Feminino
                </button>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg hover:bg-yellow-300 font-semibold transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>

        {/* CARD DE ALTERAR SENHA */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl shadow-lg p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-gray-200 tracking-wide mb-4">
            Alterar Senha
          </h2>
          <form onSubmit={handleSavePassword} className="space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Senha Atual
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full block px-4 py-2 border border-gray-600 rounded-lg shadow-sm bg-gray-800 text-white focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Nova Senha
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full block px-4 py-2 border border-gray-600 rounded-lg shadow-sm bg-gray-800 text-white focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full block px-4 py-2 border border-gray-600 rounded-lg shadow-sm bg-gray-800 text-white focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg hover:bg-yellow-300 font-semibold transition-colors"
              >
                Alterar Senha
              </button>
            </div>
          </form>
        </div>

        {/* CARD ZONA DE PERIGO */}
        <div className="bg-red-900/20 border border-red-500/50 rounded-2xl shadow-lg p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-red-300 tracking-wide mb-2">
            Zona de Perigo
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            A ação abaixo é irreversível e apagará todos os dados compartilhados
            com seu parceiro(a).
          </p>
          <button
            onClick={handleUnlinkCouple}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-500 transition-colors font-semibold"
          >
            Desvincular Casal
          </button>
        </div>
      </main>
    </div>
  );
}