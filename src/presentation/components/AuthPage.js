import React, { useState } from "react";
import { auth, db, setNewUserData } from "../../infrastructure/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
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

  const inputBaseClasses =
    "w-full block px-4 py-2 border border-gray-600 rounded-lg shadow-sm bg-gray-800 text-white focus:ring-yellow-500 focus:border-yellow-500";

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-gray-800/50 border border-gray-700/50 rounded-2xl shadow-lg p-8 space-y-6 backdrop-blur-sm">
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
