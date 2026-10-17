import {
  db,
  doc,
  collection,
  updateDoc,
  serverTimestamp,
  writeBatch,
  runTransaction,
  Timestamp,
} from "../../infrastructure/firebase";

import { generateInviteCode, INVITE_CODE_TTL_MS } from "../../presentation/components/inviteCode";

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

  // B2-32a: reserva o código de forma ATÔMICA. Antes era `setDoc` sem
  // checagem — numa colisão (rara) o código de um usuário sobrescrevia o
  // convite ATIVO de outro. Agora: transação que aborta se o código já
  // existir (nada é escrito) e o laço regenera com outro código. Sem
  // janela de corrida entre "verificar" e "reservar".
  export const reserveInviteCode = async (creatorId, creatorNickname) => {
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateInviteCode();
      const coupleId = doc(collection(db, duomatchesPath)).id;
      // M-1: validade explícita gravada pelo CLIENTE (as regras passam a
      // exigi-la e a recusar convites vencidos). Publicar o app antes das
      // regras: sem este campo o create do convite é negado pelas regras novas.
      const expiresAt = Timestamp.fromDate(
        new Date(Date.now() + INVITE_CODE_TTL_MS)
      );
      try {
        await runTransaction(db, async (transaction) => {
          const inviteRef = doc(db, inviteCodesPath, code);
          const snap = await transaction.get(inviteRef);
          if (snap.exists()) throw new Error("CODE_COLLISION");
          transaction.set(inviteRef, {
            creatorId,
            creatorNickname,
            coupleId,
            createdAt: serverTimestamp(),
            expiresAt,
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


export const linkAccounts = async (user, userData, inviteCode) => {
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

        if (!inviteData.coupleId) {
          throw validationError(
            "Este cÃ³digo Ã© antigo. PeÃ§a um novo convite ao seu parceiro."
          );
        }

        // M-1: recusa no cliente antes de qualquer escrita. As regras também
        // recusam (defesa em profundidade); isto só evita um erro genérico.
        if (
          !inviteData.expiresAt ||
          typeof inviteData.expiresAt.toDate !== "function" ||
          inviteData.expiresAt.toDate().getTime() <= Date.now()
        ) {
          throw validationError("Código de convite inválido ou expirado.");
        }

        const coupleRef = doc(db, duomatchesPath, inviteData.coupleId);
        transaction.set(coupleRef, {
          members: [user.uid, inviteData.creatorId],
          memberNicknames: {
            [user.uid]: userData.nickname,
            [inviteData.creatorId]: inviteData.creatorNickname,
          },
          createdAt: serverTimestamp(),
          createdBy: user.uid,
          invitedUserId: inviteData.creatorId,
          // Prova de consentimento exigida pelas regras do Firestore: o convite
          // é o único artefato que ninguém consegue forjar, porque criar um
          // convite exige creatorId == auth.uid. Guardamos o código no documento
          // do casal para a regra conferir que o vínculo nasceu de um convite
          // real do parceiro (firestore.rules, hasInviteConsent).
          inviteCode,
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
        return false;
      }

  return true;
};

export const skipLinking = (userId) => updateDoc(doc(db, usersPath, userId), {
  onboardingSkipped: true,
});
