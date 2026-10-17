// 1. Adicione useEffect na importação do React
import React, { useState, useEffect } from "react";
import { reserveInviteCode, linkAccounts, skipLinking } from "../../application/services/linkingService";
import { endSession } from "../../application/services/sessionService";

function LinkingPage({ user, userData, onSkip, onBack }) {
  const [inviteCode, setInviteCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkingSuccess, setLinkingSuccess] = useState(false);
  const [skipping, setSkipping] = useState(false);

  // 2. Adicione este useEffect para lidar com o redirecionamento
  useEffect(() => {
    // Se a vinculação foi um sucesso...
    if (linkingSuccess) {
      // Cria um temporizador de 3 segundos
      const timer = setTimeout(() => {
        // Recarrega a página. Ao recarregar, o app vai verificar
        // os dados do usuário novamente e, como agora ele tem um
        // 'coupleId', será direcionado para a tela principal.
        window.location.reload();
      }, 3000); // 3000ms = 3 segundos

      // Limpa o temporizador se o componente for desmontado
      return () => clearTimeout(timer);
    }
  }, [linkingSuccess]); // O efeito roda sempre que 'linkingSuccess' mudar

  const generateCode = async () => {
    setLoading(true);
    setError("");
    try {
      const code = await reserveInviteCode(user.uid, userData.nickname);
      setGeneratedCode(code);
    } catch (err) {
      setError("Não foi possível gerar o código. Tente novamente.");
      console.error("Erro ao gerar código:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!inviteCode) {
      setError("Por favor, insira um código.");
      setLoading(false);
      return;
    }

    // B2-32c: split-brain — alguém que JÁ está vinculado tentando resgatar
    // um convite antigo/esquecido arrancaria a conta do casal atual para
    // criar/entrar num casal novo. Recusar antes de qualquer escrita.
    if (userData.partnerId) {
      setError(
        "Sua conta já está vinculada a um casal. Use o perfil para gerenciar a vinculação."
      );
      setLoading(false);
      return;
    }

    try {
      if (!await linkAccounts(user, userData, inviteCode)) {
        setError("Erro ao vincular contas. Tente novamente.");
        return;
      }

      // 5. Finaliza com sucesso
      setLinkingSuccess(true);
    } catch (err) {
      setError(
        err?.isValidation
          ? err.message
          : "Erro ao vincular contas. Verifique o código e tente novamente."
      );
      console.error("Erro no vínculo:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * "Vincular depois": deixa a pessoa prosseguir e conhecer o app mesmo
   * sem parceiro ainda. Só grava uma flag no próprio usuário — nada de
   * coupleId/rodada é criado aqui, então recursos que dependem de casal
   * (rodadas, desafios, etc.) continuam bloqueados até a vinculação real
   * acontecer, por construção.
   */
  const handleSkipLinking = async () => {
    setSkipping(true);
    setError("");
    try {
      await skipLinking(user.uid);
      if (onSkip) onSkip();
    } catch (err) {
      setError("Não foi possível continuar agora. Tente novamente.");
      console.error("Erro ao pular vinculação:", err);
    } finally {
      setSkipping(false);
    }
  };

  if (linkingSuccess) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-ink rounded-2xl shadow-xl p-8 text-center space-y-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-16 w-16 text-green-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <h2 className="text-2xl font-bold text-white">Casal Vinculado!</h2>
          <p className="text-gray-300">
            Agora vocês estão conectados. O aplicativo vai começar...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-ink rounded-2xl shadow-xl p-8 text-center space-y-6">
        <h2 className="text-2xl font-bold text-white">Vincular Contas</h2>
        <p className="text-gray-300">
          Olá, {userData.nickname}! Para começar, conecte-se com seu par.
        </p>

        <div className="space-y-4 p-4 border-t border-b border-gray-700">
          <p className="font-semibold text-white">Seu parceiro(a) já gerou um código?</p>
          <form
            onSubmit={handleLinkAccount}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              placeholder="Insira o código aqui"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="flex-grow px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors disabled:bg-pink-300"
            >
              Conectar
            </button>
          </form>
        </div>

        <div className="space-y-4 p-4">
          <p className="font-semibold text-white">
            Ou gere um novo código para seu parceiro(a):
          </p>
          {generatedCode ? (
            <div className="p-4 bg-pink-900/30 border-2 border-dashed border-pink-500 rounded-lg">
              <p className="text-gray-300">Compartilhe este código:</p>
              <p className="text-3xl font-bold text-pink-400 tracking-widest">
                {generatedCode}
              </p>
            </div>
          ) : (
            <button
              onClick={generateCode}
              disabled={loading}
              className="w-full bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-600"
            >
              Gerar Código de Convite
            </button>
          )}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {!onBack && (
          <div className="pt-4">
            <button
              onClick={handleSkipLinking}
              disabled={skipping}
              className="w-full text-sm font-semibold text-gray-400 hover:text-pink-400 transition-colors underline disabled:opacity-50"
            >
              {skipping ? "Só um instante..." : "Vincular depois — quero só conhecer o app"}
            </button>
          </div>
        )}

        {/* --- BOTÃO DE VOLTAR ADICIONADO AQUI --- */}
        <div className="pt-6 border-t border-gray-200 mt-6">
          {onBack ? (
            <button
              onClick={onBack}
              className="w-full text-sm text-center text-gray-500 hover:text-pink-600 transition-colors"
            >
              ← Voltar
            </button>
          ) : (
            <button
              onClick={() => endSession()} // Ação de deslogar
              className="w-full text-sm text-center text-gray-500 hover:text-pink-600 transition-colors"
            >
              Voltar e Sair
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LinkingPage;
