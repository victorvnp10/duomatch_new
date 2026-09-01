// 1. Adicione useEffect na importação do React
import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import {
  auth,
  db,
  doc,
  collection,
  updateDoc,
  serverTimestamp,
  writeBatch,
  runTransaction,
} from "../../infrastructure/firebase";

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

  const inviteCodesPath = "inviteCodes";
  const duomatchesPath = "duomatches";
  const usersPath = "users";

  // B2-43: erros de validação como "código inválido" ou "seu próprio
  // código" eram engolidos pelo catch genérico e viravam uma mensagem
  // inútil ("Verifique o código..." também era vago, mas não explicava
  // o motivo real). Marcar o erro permite usar a mensagem específica no
  // catch sem vazar mensagens técnicas de falhas do Firebase.
  const validationError = (message) => {
    const err = new Error(message);
    err.isValidation = true;
    return err;
  };

  const generateRandomCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();

  // B2-32a: reserva o código de forma ATÔMICA. Antes era `setDoc` sem
  // checagem — numa colisão (rara) o código de um usuário sobrescrevia o
  // convite ATIVO de outro. Agora: transação que aborta se o código já
  // existir (nada é escrito) e o laço regenera com outro código. Sem
  // janela de corrida entre "verificar" e "reservar".
  const reserveInviteCode = async (creatorId, creatorNickname) => {
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateRandomCode();
      try {
        await runTransaction(db, async (transaction) => {
          const inviteRef = doc(db, inviteCodesPath, code);
          const snap = await transaction.get(inviteRef);
          if (snap.exists()) throw new Error("CODE_COLLISION");
          transaction.set(inviteRef, {
            creatorId,
            creatorNickname,
            createdAt: serverTimestamp(),
          });
        });
        return code;
      } catch (err) {
        // Colisão com convite ativo → tenta outro código.
        if (err?.message === "CODE_COLLISION") continue;
        throw err;
      }
    }
    throw new Error("Não foi possível gerar um código livre.");
  };

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
      const inviteRef = doc(db, inviteCodesPath, inviteCode);

      // B2-32b FASE 1: casal + vínculo dos dois usuários + consumo do
      // convite numa ÚNICA transação. Antes eram 3 etapas separadas
      // (getDoc → addDoc do casal → batch de users), e uma falha no meio
      // deixava um casal órfão ou usuários vinculados sem seeds. Agora,
      // ou tudo acontece, ou nada.
      const { coupleId, partnerId } = await runTransaction(db, async (transaction) => {
        const inviteSnap = await transaction.get(inviteRef);
        if (!inviteSnap.exists()) {
          throw validationError("Código de convite inválido ou expirado.");
        }
        const inviteData = inviteSnap.data();
        if (inviteData.creatorId === user.uid) {
          throw validationError("Você não pode usar seu próprio código.");
        }

        const coupleRef = doc(collection(db, duomatchesPath));
        transaction.set(coupleRef, {
          members: [user.uid, inviteData.creatorId],
          memberNicknames: {
            [user.uid]: userData.nickname,
            [inviteData.creatorId]: inviteData.creatorNickname,
          },
          createdAt: serverTimestamp(),
          confirmationTime: "22:00",
        });

        transaction.update(doc(db, usersPath, user.uid), {
          partnerId: inviteData.creatorId,
          coupleId: coupleRef.id,
        });
        transaction.update(doc(db, usersPath, inviteData.creatorId), {
          partnerId: user.uid,
          coupleId: coupleRef.id,
        });
        transaction.delete(inviteRef);

        return { coupleId: coupleRef.id, partnerId: inviteData.creatorId };
      });

      const activitiesBatch = writeBatch(db);
      const activitiesPath = `duomatches/${coupleId}/activities`;
      const defaultActivities = [
        {
          name: "Cozinhar uma refeição nova juntos",
          category: "Comida & Bebida",
          type: "atividade",
          description:
            "Escolham uma receita que nunca tentaram e preparem o jantar em equipe. O trabalho em conjunto pode ser delicioso!",
        },
        {
          name: "Noite de Queijos e Vinho",
          category: "Comida & Bebida",
          type: "atividade",
          description:
            "Montem uma tábua com diferentes tipos de queijos, pães e frutas. Pesquisem e escolham um vinho que harmonize com a seleção.",
        },
        {
          name: "Observar as Estrelas",
          category: "Hobbies & Outros",
          type: "atividade",
          description:
            "Em uma noite de céu limpo, peguem uma manta, uma garrafa de vinho, e usem um app de astronomia para identificar planetas e constelações.",
        },
        {
          name: "Recriar o primeiro encontro",
          category: "Viagens & Passeios",
          type: "atividade",
          description:
            "Voltem ao local ou recriem a situação do seu primeiro encontro para um momento de nostalgia e romance.",
        },
        {
          name: "Recriar um Prato de Restaurante",
          category: "Comida & Bebida",
          type: "atividade",
          description:
            "Escolham aquele prato inesquecível do restaurante favorito de vocês e tentem recriá-lo em casa, trabalhando em equipe na cozinha.",
        },
        {
          name: "Noite de jogos",
          category: "Hobbies & Outros",
          type: "atividade",
          description:
            "Seja um jogo de tabuleiro, cartas ou videogame. Um pouco de competição amigável faz bem!",
        },
        {
          name: "Momento de 1h sem celular",
          category: "Hobbies & Outros",
          type: "atividade",
          description:
            "Guardem os celulares e dediquem uma hora para conversar, olhar nos olhos e se reconectar de verdade.",
        },
        {
          name: "Noite de cinema em casa",
          category: "Filmes & Séries",
          type: "atividade",
          description:
            "Preparem a pipoca, escolham um filme que os dois queiram ver e transformem a sala em um cinema particular.",
        },
        {
          name: "Fazer uma caminhada",
          category: "Hobbies & Outros",
          type: "atividade",
          description:
            "Uma atividade simples e saudável para conversar, aproveitar o ar livre e movimentar o corpo.",
        },
        {
          name: "Assistir ao pôr do sol",
          category: "Hobbies & Outros",
          type: "atividade",
          description:
            "Encontrem um lugar com uma bela vista e apenas apreciem o momento e a companhia um do outro.",
        },
        {
          name: "Planejar a próxima viagem",
          category: "Viagens & Passeios",
          type: "atividade",
          description:
            "Mesmo que seja apenas um sonho. Pesquisem destinos, criem um roteiro e sonhem juntos com a próxima aventura.",
        },
        {
          name: "Ter um Dia de 'Sim'",
          category: "Hobbies & Outros",
          type: "atividade",
          description:
            "Um parceiro deve dizer 'sim' a todos os pedidos (razoáveis!) do outro durante um dia inteiro, trocando de papel na próxima vez.",
        },
      ];

      defaultActivities.forEach((activity) => {
        const newActivityRef = doc(collection(db, activitiesPath));
        activitiesBatch.set(newActivityRef, {
          ...activity,
          periodicity: null,
          createdAt: serverTimestamp(),
          createdBy: "SYSTEM", // <-- CORREÇÃO: Atribuído ao sistema
          completionStatus: null,
          points: 0,
          selections: {},
        });
      });
      // B2-32b FASE 2: seeds padrão num batch separado (best effort). Se
      // falhar, rollback compensatório remove o casal recém-criado e
      // desvincula os dois usuários — nada de "vinculados sem atividades".
      try {
        await activitiesBatch.commit();
      } catch (seedError) {
        console.error("Erro ao criar atividades iniciais:", seedError);
        try {
          const cleanup = writeBatch(db);
          cleanup.delete(doc(db, duomatchesPath, coupleId));
          cleanup.update(doc(db, usersPath, user.uid), {
            partnerId: null,
            coupleId: null,
          });
          cleanup.update(doc(db, usersPath, partnerId), {
            partnerId: null,
            coupleId: null,
          });
          await cleanup.commit();
        } catch (cleanupError) {
          console.error("Erro no rollback compensatório do vínculo:", cleanupError);
        }
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
      await updateDoc(doc(db, usersPath, user.uid), {
        onboardingSkipped: true,
      });
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
              onClick={() => signOut(auth)} // Ação de deslogar
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
