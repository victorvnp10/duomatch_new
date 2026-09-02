import React, { useState, useEffect } from "react";
import {
  auth,
  db,
  setNewUserData,
  googleProvider,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  fetchSignInMethodsForEmail,
  linkWithCredential,
} from "../../infrastructure/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { HeartIcon } from "./Icons";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Login unificado: quando o Google encontra uma conta de e-mail/senha com
  // o mesmo e-mail (`auth/account-exists-with-different-credential`), guarda
  // aqui o e-mail + credential do Google até o usuário digitar a senha para
  // vincular os dois providers na MESMA conta (sem duplicar UID).
  const [linkRequest, setLinkRequest] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Fluxo de VINCULAÇÃO Google ⇄ e-mail/senha. O `linkRequest` só existe
    // quando o redirect do Google voltou com account-exists. O componente
    // pode desmontar logo após o `signInWithEmailAndPassword` (o
    // onAuthStateChanged navega sozinho) — por isso o link roda na mesma
    // promise, sem depender de re-render.
    if (linkRequest) {
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          linkRequest.email,
          password
        );
        await linkWithCredential(userCredential.user, linkRequest.credential);
      } catch (err) {
        if (
          err.code === "auth/invalid-credential" ||
          err.code === "auth/invalid-login-credentials" ||
          err.code === "auth/user-not-found" ||
          err.code === "auth/wrong-password"
        ) {
          setError("E-mail ou senha inválidos.");
        } else if (err.code === "auth/too-many-requests") {
          setError(
            "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente."
          );
        } else {
          setError("Não foi possível vincular a conta. Tente novamente.");
          console.error("Erro ao vincular Google + e-mail:", err);
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (email !== confirmEmail) {
          setError("Os e-mails não coincidem.");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("As senhas não coincidem.");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("A senha deve ter no mínimo 6 caracteres.");
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Nickname, gênero, data de nascimento e avatar ficam para a
        // etapa seguinte (CompleteProfileView, a mesma usada por quem
        // entra pelo Google) — aqui só criamos a conta em si.
        const initialUserData = {
          uid: user.uid,
          nickname: "",
          gender: null,
          email,
          createdAt: serverTimestamp(),
          partnerId: null,
          coupleId: null,
        };

        await setDoc(doc(db, "users", user.uid), initialUserData);
        setNewUserData({ nickname: "", gender: null, email });
      }
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        // Login unificado: quem já tem conta criada pelo Google não pode
        // ganhar uma segunda conta só porque escolheu "Registrar" com o
        // mesmo e-mail. Descobrir o provider do e-mail para orientar.
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          const isGoogleOnly =
            methods.length === 1 && methods.includes("google.com");
          setError(
            isGoogleOnly
              ? "Esta conta já existe com o Google. Use \"Continuar com o Google\" para entrar."
              : "Este e-mail já está em uso. Tente fazer login."
          );
        } catch {
          setError("Este e-mail já está em uso. Tente fazer login.");
        }
      } else if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/invalid-login-credentials" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        // Login unificado: e-mail existe só no Google? Nada de senha que
        // valida — orientar o login pelo Google em vez de parecer erro.
        try {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          const isGoogleOnly =
            methods.length === 1 && methods.includes("google.com");
          setError(
            isGoogleOnly
              ? "Esta conta foi criada com o Google. Clique em \"Continuar com o Google\" para entrar."
              : "E-mail ou senha inválidos."
          );
        } catch {
          setError("E-mail ou senha inválidos.");
        }
      } else if (err.code === "auth/invalid-email") {
        setError("E-mail inválido.");
      } else if (err.code === "auth/too-many-requests") {
        setError(
          "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente."
        );
      } else if (err.code === "auth/network-request-failed") {
        setError("Falha de conexão. Verifique sua internet e tente de novo.");
      } else if (
        err.code === "auth/operation-not-allowed" ||
        err.code === "auth/configuration-not-found"
      ) {
        setError(
          "Login por e-mail/senha não está habilitado neste projeto Firebase."
        );
      } else {
        setError("Ocorreu um erro. Tente novamente.");
        // eslint-disable-next-line no-console
        console.error("Erro no login por e-mail:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cria o documento do usuário em `users` se ainda não existir. Usado tanto
   * pelo fluxo de Google quanto pelo de e-mail. Para o Google, criar o doc
   * imediatamente evita a corrida com o `onAuthStateChanged` do `useAuth`,
   * que de outro modo deslogaria a pessoa se não encontrasse nem o doc nem o
   * `newUserData` preenchido.
   */
  const ensureGoogleUserDoc = async (googleUser) => {
    const userRef = doc(db, "users", googleUser.uid);
    const existingDoc = await getDoc(userRef);
    if (!existingDoc.exists()) {
      await setDoc(userRef, {
        uid: googleUser.uid,
        nickname: googleUser.displayName || "",
        gender: null,
        email: googleUser.email,
        createdAt: serverTimestamp(),
        partnerId: null,
        coupleId: null,
      });
    }
  };

  /**
   * Processa o retorno do Google Auth via REDIRECT. O fluxo anterior usava
   * `signInWithPopup`, que é quebrado em produção quando a Vercel envia a
   * header `Cross-Origin-Opener-Policy`: o SDK do Firebase consulta
   * `popupWindow.closed` e o navegador bloqueia essa leitura cross-origin,
   * abortando o login como `auth/popup-closed-by-user` — sintoma de "não
   * sai da tela de login". O redirect evita o popup e essa interação.
   */
  useEffect(() => {
    let cancelled = false;
    getRedirectResult(auth)
      .then(async (result) => {
        // PENDÊNCIA ATIVA (CLAUDE.md §8) — "bate e volta" do login Google: o
        // redirect volta do Google mas o app não finaliza. O flag abaixo
        // sobrevive à navegação de ida-e-volta (sessionStorage é por aba) e
        // permite distinguir "voltou do Google sem finalizar" de acesso direto.
        const redirectedFromGoogle = sessionStorage.getItem(
          "duomatch_google_redirect_started"
        );
        sessionStorage.removeItem("duomatch_google_redirect_started");

        if (!result) {
          if (cancelled) return;
          if (redirectedFromGoogle) {
            console.warn(
              "getRedirectResult: voltou do Google sem redirect pendente. URL:",
              window.location.href
            );
            setError(
              "O Google confirmou o login, mas a confirmação não chegou ao app. Tente novamente ou use e-mail/senha."
            );
          }
          return; // nenhum redirect pendente (acesso direto)
        }
        if (cancelled) return;
        const googleUser = result.user;
        await ensureGoogleUserDoc(googleUser);
      })
      .catch((err) => {
        if (cancelled) return;
        sessionStorage.removeItem("duomatch_google_redirect_started");
        // Login unificado: já existe conta de e-mail/senha com o mesmo e-mail.
        // O Firebase se recusa a criar um segundo usuário e devolve a
        // credential do Google suspensa — pedimos a senha e vinculamos o
        // Google à conta existente (mesmo UID, dois providers).
        if (err.code === "auth/account-exists-with-different-credential") {
          const email = err.customData?.email;
          const credential = GoogleAuthProvider.credentialFromError(err);
          if (email && credential) {
            setLinkRequest({ email, credential });
            setError(
              `Já existe uma conta com este e-mail (${email}). Digite a senha dessa conta para vinculá-la ao Google.`
            );
            return;
          }
        }
        // PENDÊNCIA ATIVA (§8) — antes este erro era mudo: a pessoa voltava
        // para a tela de login sem nenhuma mensagem ("bate e volta"). Agora o
        // erro REAL aparece na tela para o diagnóstico ficar imediato.
        console.error("Erro ao processar login do Google:", err);
        setError(
          `O login pelo Google falhou (${err.code}). Detalhes: ${
            err.message || "veja o console do navegador"
          }`
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    // PENDÊNCIA ATIVA (§8): marca em sessionStorage que iniciamos um redirect
    // do Google — o flag sobrevive à ida-e-volta e o getRedirectResult usa
    // para detectar o "bate e volta" (voltou sem resultado) vs. acesso direto.
    sessionStorage.setItem("duomatch_google_redirect_started", "1");
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      sessionStorage.removeItem("duomatch_google_redirect_started");
      setError(
        `Não foi possível continuar com o Google (${err.code}). Tente novamente.`
      );
      console.error("Erro no login com Google:", err);
    } finally {
      setLoading(false);
    }
  };

  const inputBaseClasses =
    "w-full block px-4 py-2 border border-gray-600 rounded-lg shadow-sm bg-gray-800 text-white focus:ring-yellow-500 focus:border-yellow-500";

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
      <div className="w-full max-w-md bg-gray-800/50 border border-gray-700/50 rounded-3xl shadow-glow-accent p-8 space-y-6 backdrop-blur-sm relative">
        <div className="text-center">
          <div className="flex justify-center items-center mb-4 text-yellow-400">
            <HeartIcon />
            <h1 className="ml-2 text-3xl font-bold text-white tracking-wider">
              DuoMatch
            </h1>
          </div>
          <p className="text-gray-400">
            {isLogin
              ? "Faça login para continuar a sua jornada"
              : "Crie sua conta para começar uma nova história"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 py-2.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-60 font-semibold"
        >
          <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.5 6 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.5 6 29.5 4 24 4c-7.6 0-14.2 4.3-17.7 10.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.4 26.7 36 24 36c-5.3 0-9.6-3.1-11.3-7.6l-6.5 5C9.7 39.6 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C40.9 36 44 30.5 44 24c0-1.3-.1-2.4-.4-3.5z"/>
          </svg>
          Continuar com o Google
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-xs text-gray-500 uppercase">ou</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        <div className="flex justify-center bg-gray-900/50 border border-gray-700 rounded-lg p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`w-1/2 py-2 rounded-md transition-colors font-semibold ${
              isLogin
                ? "bg-yellow-400 text-gray-900 shadow-md"
                : "text-gray-400 hover:bg-gray-700/50"
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`w-1/2 py-2 rounded-md transition-colors font-semibold ${
              !isLogin
                ? "bg-yellow-400 text-gray-900 shadow-md"
                : "text-gray-400 hover:bg-gray-700/50"
            }`}
          >
            Registrar
          </button>
        </div>

        {linkRequest && (
          <div className="bg-yellow-900/30 border border-yellow-600/40 text-yellow-200 text-sm p-3 rounded-lg">
            Já existe uma conta com o e-mail {linkRequest.email}. Digite a
            senha dessa conta para{" "}
            <span className="font-semibold">vincular</span> o Google a ela —
            assim você continua a mesma conta por qualquer um dos dois caminhos.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
                placeholder="E-mail"
                value={linkRequest ? linkRequest.email : email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputBaseClasses}
                required
                disabled={!!linkRequest}
              />
              {!isLogin && !linkRequest && (
                <input
                  type="email"
                  placeholder="Confirme o e-mail"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  className={inputBaseClasses}
                  required
                />
              )}
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputBaseClasses}
                required
              />
              {!isLogin && !linkRequest && (
                <input
                  type="password"
                  placeholder="Confirme a senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputBaseClasses}
                  required
                />
              )}

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 text-gray-900 py-2.5 rounded-lg hover:bg-yellow-300 transition-colors disabled:bg-yellow-600 flex items-center justify-center font-bold tracking-wide"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                ) : linkRequest ? (
                  "Vincular e entrar"
                ) : isLogin ? (
                  "Entrar"
                ) : (
                  "Registrar"
                )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;
