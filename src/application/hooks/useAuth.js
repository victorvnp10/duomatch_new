import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db, doc, getDoc, setDoc, onSnapshot, newUserData, setNewUserData } from "../../infrastructure/firebase";

/**
 * Hook de aplicação: única fonte de verdade sobre o estado de autenticação
 * e o perfil do usuário logado (com os dados do parceiro embutidos).
 *
 * Correções em relação à lógica que existia solta em `App.js`:
 *
 *  1. VAZAMENTO DE LISTENERS: a versão anterior criava um novo listener
 *     `onSnapshot` do documento do usuário a cada disparo de
 *     `onAuthStateChanged`, mas só cancelava o listener de autenticação
 *     no cleanup do efeito — o listener do documento do usuário (e do
 *     parceiro) nunca era cancelado corretamente. Aqui, cada listener
 *     anterior é cancelado antes de criar um novo, e todos são
 *     cancelados na limpeza do efeito.
 *
 *  2. CAMPO `uid` AUSENTE: no caminho de contingência (usado apenas se o
 *     documento do Firestore ainda não existir no primeiro snapshot após
 *     o cadastro), o objeto inicial não incluía `uid`. Vários pontos do
 *     app (conquistas, desafio diário, sugestões) comparam
 *     `activity.selections?.[userData.uid]` — sem esse campo, essas
 *     comparações falhavam silenciosamente. Agora o campo é sempre
 *     incluído.
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUser = () => {};
    let unsubscribePartner = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      // Cancela listeners do ciclo anterior antes de abrir novos.
      unsubscribeUser();
      unsubscribePartner();

      if (!currentUser) {
        setUser(null);
        setUserData(null);
        // Limpa o estado global de cadastro — sem isso, o nickname/email
        // de um usuário anterior vazaria para o próximo login na mesma
        // sessão (SPA não recarrega a página no logout).
        setNewUserData(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);
      const userDocRef = doc(db, "users", currentUser.uid);

      unsubscribeUser = onSnapshot(userDocRef, async (userDocSnap) => {
        if (userDocSnap.exists()) {
          // Doc confirmado — o bridge de cadastro não é mais necessário.
          setNewUserData(null);
          const currentData = { uid: currentUser.uid, ...userDocSnap.data() };

          unsubscribePartner();
          if (currentData.partnerId) {
            const partnerDocRef = doc(db, "users", currentData.partnerId);
            unsubscribePartner = onSnapshot(partnerDocRef, (partnerDocSnap) => {
              if (partnerDocSnap.exists()) {
                currentData.partnerData = {
                  uid: currentData.partnerId,
                  ...partnerDocSnap.data(),
                };
              }
              setUserData({ ...currentData });
              setLoading(false);
            });
          } else {
            setUserData(currentData);
            setLoading(false);
          }
        } else {
          // Documento ainda não existe. Isso pode acontecer por mais de um
          // motivo: a corrida original que este código já tratava (setDoc
          // do cadastro por e-mail ainda não confirmado no primeiro
          // snapshot), mas também um caso mais sério visto com o login do
          // Google — em contas novas, o Google mostra uma tela de consentimento
          // extra (goo.gl/.../oauth) que deixa o popup mais lento; em vários
          // navegadores/hosts isso dispara falsamente um evento de "popup
          // fechado pelo usuário" no SDK do Firebase por causa da política
          // de COOP (Cross-Origin-Opener-Policy), mesmo com o login já
          // concluído de verdade. Nesse caso, a função em `AuthPage.js`
          // nunca chega a criar o documento, e o código antigo aqui
          // deslogava a pessoa — ela via a tela carregar e voltar pro
          // login, exatamente o bug relatado.
          //
          // A correção: criar um documento mínimo aqui sempre que faltar,
          // usando `newUserData` se disponível (mais completo) ou os
          // dados básicos do próprio `currentUser` como último recurso.
          // O pior cenário passa a ser cair no `CompleteProfileView` para
          // confirmar apelido/gênero/data de nascimento — que já é
          // obrigatório de qualquer forma — em vez de deslogar a pessoa.
          const initialData = {
            uid: currentUser.uid,
            nickname: newUserData?.nickname || currentUser.displayName || "",
            gender: newUserData?.gender ?? null,
            // Email SEMPRE do usuário autenticado — nunca do estado global
            // de cadastro, que pode ser de uma sessão anterior (outro usuário).
            email: currentUser.email || "",
            partnerId: null,
            coupleId: null,
            score: 0,
          };
          // merge: true — se o setDoc rico do AuthPage chegar em paralelo,
          // esta escrita não pode substituí-lo por completo.
          await setDoc(userDocRef, initialData, { merge: true });
          // NÃO sobrescrever userData aqui: o snapshot (latency compensation)
          // já entrega o doc real; setar o objeto mínimo reverteria o estado.
          setLoading(false);
        }
      });
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUser();
      unsubscribePartner();
    };
  }, []);

  return { user, userData, loading };
};
