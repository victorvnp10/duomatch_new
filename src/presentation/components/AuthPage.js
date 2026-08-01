import React, { useState } from "react";
import { auth, db, setNewUserData, googleProvider } from "../../infrastructure/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { HeartIcon } from "./Icons";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState("masculino");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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
        if (!nickname.trim()) {
          setError("O apelido é obrigatório.");
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        const initialUserData = {
          uid: user.uid,
          nickname,
          gender,
          email,
          createdAt: serverTimestamp(),
          partnerId: null,
          coupleId: null,
        };

        await setDoc(doc(db, "users", user.uid), initialUserData);
        setNewUserData({ nickname, gender, email });
      }
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("Este e-mail já está em uso. Tente fazer login.");
      } else if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password"
      ) {
        setError("E-mail ou senha inválidos.");
      } else {
        setError("Ocorreu um erro. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * "Continuar com o Google": se a conta já tem documento em `users`,
   * o `useAuth` detecta o snapshot e o `App.js` navega sozinho — não
   * precisa de mais nada aqui. Se é a primeira vez dessa pessoa, o
   * documento já é criado aqui mesmo (o Google não fornece gênero, então
   * esse campo fica vazio) — criar o documento imediatamente, na mesma
   * função, evita uma corrida com o `onAuthStateChanged` do `useAuth`:
   * ele dispara assim que o popup resolve, e se não encontrasse nem o
   * documento nem o `newUserData` preenchido, deslogava a pessoa
   * sozinho. O `App.js` é quem trava o acesso ao resto do app até o
   * gênero ser escolhido (`CompleteGenderView`).
   */
  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
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
    } catch (err) {
      // Popup fechado pela própria pessoa não é um erro real.
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Não foi possível continuar com o Google. Tente novamente.");
        console.error("Erro no login com Google:", err);
      }
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Apelido"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className={inputBaseClasses}
              required
            />
          )}
              {!isLogin && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Gênero</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGender("masculino")}
                      className={`py-2 rounded-lg border transition-colors ${
                        gender === "masculino"
                          ? "border-yellow-400 bg-yellow-400/10 text-yellow-300"
                          : "border-gray-600 text-gray-400 hover:border-gray-500"
                      }`}
                    >
                      Masculino
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("feminino")}
                      className={`py-2 rounded-lg border transition-colors ${
                        gender === "feminino"
                          ? "border-yellow-400 bg-yellow-400/10 text-yellow-300"
                          : "border-gray-600 text-gray-400 hover:border-gray-500"
                      }`}
                    >
                      Feminino
                    </button>
                  </div>
                </div>
              )}
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputBaseClasses}
                required
              />
              {!isLogin && (
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
              {!isLogin && (
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
