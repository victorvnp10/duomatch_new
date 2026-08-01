import React, { useState, useMemo } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../../infrastructure/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { HeartIcon } from "./Icons";
import { Avatar, getAvatarOptionsForGender } from "./avatars/AvatarCatalog";

const MIN_AGE = 18;

function calculateAge(birthDateStr) {
  const birth = new Date(birthDateStr + "T00:00:00");
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Mostrada quando `userData.gender` ainda não foi preenchido — hoje isso
 * só acontece para quem se cadastrou pelo Google (que só fornece nome,
 * e-mail e foto — nada de apelido, gênero, data de nascimento ou
 * avatar). Trava o acesso ao resto do app até esses dados serem
 * completados; depois de salvos, o `useAuth` (via `onSnapshot`) atualiza
 * `userData` sozinho e o `App.js` segue pro próximo passo (vincular
 * parceiro ou app completo, com o tutorial de sempre).
 */
function CompleteProfileView({ user, userData }) {
  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState(userData.nickname || "");
  const [gender, setGender] = useState(null);
  const [birthDate, setBirthDate] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const avatarOptions = useMemo(
    () => getAvatarOptionsForGender(gender || "masculino"),
    [gender]
  );

  const handleContinue = () => {
    setError("");
    if (!nickname.trim()) {
      setError("Como você gostaria de ser chamado(a)?");
      return;
    }
    if (!gender) {
      setError("Escolha uma opção de gênero para continuar.");
      return;
    }
    if (!birthDate) {
      setError("Sua data de nascimento é obrigatória.");
      return;
    }
    if (calculateAge(birthDate) < MIN_AGE) {
      setError(`O DuoMatch é para maiores de ${MIN_AGE} anos.`);
      return;
    }
    setStep(2);
  };

  const handleFinish = async () => {
    setError("");
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        nickname: nickname.trim(),
        gender,
        birthDate,
        photoURL: selectedAvatar,
      });
    } catch (err) {
      setError("Não foi possível salvar. Tente novamente.");
      console.error("Erro ao concluir perfil:", err);
      setLoading(false);
    }
  };

  return (
    <div className="app-bg-glow min-h-screen text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 space-y-6 backdrop-blur-sm">
        <div className="text-center">
          <div className="flex justify-center items-center mb-4 text-accent">
            <HeartIcon />
            <h1 className="ml-2 text-2xl font-display font-bold text-white tracking-wide">
              DuoMatch
            </h1>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            {step === 1
              ? "Só mais um passo pra gente se conhecer melhor."
              : "Agora escolha como quer aparecer por aqui."}
          </p>
        </div>

        {/* Indicador de passos */}
        <div className="flex items-center justify-center gap-2">
          <div className={`h-1.5 w-10 rounded-full ${step >= 1 ? "bg-accent" : "bg-white/10"}`} />
          <div className={`h-1.5 w-10 rounded-full ${step >= 2 ? "bg-accent" : "bg-white/10"}`} />
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">
                Como gostaria de ser chamado(a)?
              </label>
              <input
                type="text"
                placeholder="Seu apelido"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full px-4 py-2.5 border border-white/10 rounded-lg bg-black/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-shadow"
              />
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-1">Gênero</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender("masculino")}
                  className={`py-2.5 rounded-lg border transition-colors font-semibold ${
                    gender === "masculino"
                      ? "border-accent bg-accent/15 text-accent-light"
                      : "border-white/10 text-gray-400 hover:border-white/30"
                  }`}
                >
                  Masculino
                </button>
                <button
                  type="button"
                  onClick={() => setGender("feminino")}
                  className={`py-2.5 rounded-lg border transition-colors font-semibold ${
                    gender === "feminino"
                      ? "border-accent bg-accent/15 text-accent-light"
                      : "border-white/10 text-gray-400 hover:border-white/30"
                  }`}
                >
                  Feminino
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">
                Data de nascimento
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                className="w-full px-4 py-2.5 border border-white/10 rounded-lg bg-black/20 text-white focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-shadow [color-scheme:dark]"
              />
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-accent to-accent-dark hover:from-accent-light hover:to-accent text-white py-3 rounded-xl font-bold tracking-wide transition-all"
            >
              Continuar
            </button>

            <button
              onClick={() => signOut(auth)}
              className="w-full text-sm text-center text-gray-500 hover:text-accent-light transition-colors"
            >
              Sair
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              <Avatar
                photoURL={selectedAvatar}
                nickname={nickname}
                size="h-24 w-24"
                className="shadow-lg mb-2"
              />
              <p className="text-sm text-gray-400">
                {selectedAvatar ? "Seu avatar" : "Sem avatar — mostra a inicial do apelido"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-h-72 overflow-y-auto p-1">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar.id || "none"}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`aspect-square p-1 rounded-2xl border-2 transition-all ${
                    selectedAvatar === avatar.id
                      ? "border-accent scale-105 shadow-lg shadow-accent/20"
                      : "border-transparent hover:border-white/20"
                  }`}
                  title={avatar.name}
                >
                  <Avatar photoURL={avatar.id} nickname={nickname} size="w-full h-full" />
                </button>
              ))}
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-white/10 text-gray-300 py-3 rounded-xl font-semibold hover:border-white/30 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-accent to-accent-dark hover:from-accent-light hover:to-accent text-white py-3 rounded-xl font-bold tracking-wide transition-all flex items-center justify-center disabled:opacity-60"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  "Concluir"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompleteProfileView;
