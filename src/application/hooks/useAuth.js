import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db, doc, getDoc, setDoc, onSnapshot, newUserData } from "../../infrastructure/firebase";

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
        setLoading(false);
        return;
      }

      setUser(currentUser);
      const userDocRef = doc(db, "users", currentUser.uid);

      unsubscribeUser = onSnapshot(userDocRef, async (userDocSnap) => {
        if (userDocSnap.exists()) {
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
        } else if (newUserData) {
          // Contingência: o documento ainda não existe (corrida rara com o
          // setDoc feito em AuthPage.js durante o cadastro).
          const initialData = {
            uid: currentUser.uid,
            nickname: newUserData.nickname,
            gender: newUserData.gender || "masculino",
            email: newUserData.email,
            partnerId: null,
            coupleId: null,
            score: 0,
          };
          await setDoc(userDocRef, initialData);
          setUserData(initialData);
          setLoading(false);
        } else {
          console.error(
            `Estado inconsistente para o usuário ${currentUser.uid}: autenticado mas sem dados de perfil. Efetuando logout.`
          );
          await signOut(auth);
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
