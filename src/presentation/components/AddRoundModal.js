import React, { useState, useEffect } from "react";

export default function AddRoundModal({ isOpen, onClose, onAddRound }) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minActivitiesQty, setMinActivitiesQty] = useState(5);
  const [minActivitiesDays, setMinActivitiesDays] = useState(7);
  const [minActivitiesPenalty, setMinActivitiesPenalty] = useState(10);
  const [minChallengesQty, setMinChallengesQty] = useState(1);
  const [minChallengesDays, setMinChallengesDays] = useState(7);
  const [minChallengesPenalty, setMinChallengesPenalty] = useState(10);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setStartDate("");
      setEndDate("");
      setMinActivitiesQty(5);
      setMinActivitiesDays(7);
      setMinActivitiesPenalty(10);
      setMinChallengesQty(1);
      setMinChallengesDays(7);
      setMinChallengesPenalty(10);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) {
      alert("Nome e datas da rodada são obrigatórios.");
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      alert("A data de início deve ser anterior à data de término.");
      return;
    }
    const newRound = {
      name,
      startDate,
      endDate,
      rules: {
        minActivities: {
          quantity: Number(minActivitiesQty),
          days: Number(minActivitiesDays),
          penalty: Number(minActivitiesPenalty),
        },
        minChallenges: {
          quantity: Number(minChallengesQty),
          days: Number(minChallengesDays),
          penalty: Number(minChallengesPenalty),
        },
      },
    };
    onAddRound(newRound);
    onClose();
  };

  const inputBaseClasses =
    "w-full block px-4 py-2 border border-gray-600 rounded-lg shadow-sm bg-gray-800 text-white focus:ring-yellow-500 focus:border-yellow-500";
  const labelBaseClasses = "block text-sm font-medium text-gray-300 mb-1";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white tracking-wide">
            Criar Nova Rodada
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto pr-2 space-y-4 flex-grow"
        >
          <div>
            <label htmlFor="roundName" className={labelBaseClasses}>
              Nome da Rodada
            </label>
            <input
              type="text"
              id="roundName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputBaseClasses}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className={labelBaseClasses}>
                Data de Início
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className={inputBaseClasses}
              />
            </div>
            <div>
              <label htmlFor="endDate" className={labelBaseClasses}>
                Data de Término
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className={inputBaseClasses}
              />
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-lg font-medium text-gray-200">
              Regras da Rodada
            </h3>

            <div className="mt-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="font-semibold text-gray-300">
                Mínimo de Atividades
              </p>
              <div className="grid grid-cols-3 gap-3 mt-2 text-sm">
                <div>
                  <label className="text-xs text-gray-400">Quantidade</label>
                  <input
                    type="number"
                    min="0"
                    value={minActivitiesQty}
                    onChange={(e) => setMinActivitiesQty(e.target.value)}
                    className={`${inputBaseClasses} mt-1`}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">A cada (dias)</label>
                  <input
                    type="number"
                    min="0"
                    value={minActivitiesDays}
                    onChange={(e) => setMinActivitiesDays(e.target.value)}
                    className={`${inputBaseClasses} mt-1`}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">
                    Penalidade (pts)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minActivitiesPenalty}
                    onChange={(e) => setMinActivitiesPenalty(e.target.value)}
                    className={`${inputBaseClasses} mt-1`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="font-semibold text-gray-300">
                Mínimo de Desafios Lançados
              </p>
              <div className="grid grid-cols-3 gap-3 mt-2 text-sm">
                <div>
                  <label className="text-xs text-gray-400">Quantidade</label>
                  <input
                    type="number"
                    min="0"
                    value={minChallengesQty}
                    onChange={(e) => setMinChallengesQty(e.target.value)}
                    className={`${inputBaseClasses} mt-1`}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">A cada (dias)</label>
                  <input
                    type="number"
                    min="0"
                    value={minChallengesDays}
                    onChange={(e) => setMinChallengesDays(e.target.value)}
                    className={`${inputBaseClasses} mt-1`}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400">
                    Penalidade (pts)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minChallengesPenalty}
                    onChange={(e) => setMinChallengesPenalty(e.target.value)}
                    className={`${inputBaseClasses} mt-1`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-300 transition-colors font-semibold"
            >
              Criar Rodada
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
