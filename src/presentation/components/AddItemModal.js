import React, { useState, useMemo } from "react";
import { Timestamp, serverTimestamp } from "../../infrastructure/firebase";
import PeriodicityInputs from "./PeriodicityInputs";
import { categoryIcons } from "./Icons";
import { getTodayDateString } from "../../shared/utils";

export default function AddItemModal({
  isOpen,
  onClose,
  user,
  rounds,
  allActivities,
  handleAddActivity,
}) {
  const [newActivityType, setNewActivityType] = useState("atividade");
  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityDescription, setNewActivityDescription] = useState("");
  const [newActivityPoints, setNewActivityPoints] = useState(1);
  const [newActivityCategory, setNewActivityCategory] =
    useState("Hobbies & Outros");
  const [newActivityPeriodicityType, setNewActivityPeriodicityType] =
    useState("none");
  const [newActivityPeriodicityValue, setNewActivityPeriodicityValue] =
    useState("");
  const [newActivityDurationDays, setNewActivityDurationDays] = useState(0);
  const [newActivityDurationHours, setNewActivityDurationHours] = useState(1);
  const [newActivityDurationMinutes, setNewActivityDurationMinutes] =
    useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    return [
      ...new Map(
        allActivities
          .filter((activity) =>
            activity.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((item) => [item.name, item])
      ).values(),
    ].slice(0, 5);
  }, [searchQuery, allActivities]);

  const handleSelectPastActivity = (activity) => {
    setNewActivityName(activity.name);
    setNewActivityDescription(activity.description || "");
    setNewActivityType(activity.type || "atividade");
    setNewActivityPoints(activity.points || 1);
    setNewActivityCategory(activity.category || "Hobbies & Outros");
    if (activity.type?.startsWith("desafio")) {
      setNewActivityPeriodicityType("none");
      setNewActivityPeriodicityValue("");
    } else {
      setNewActivityPeriodicityType(activity.periodicity?.type || "none");
      setNewActivityPeriodicityValue(activity.periodicity?.value || "");
    }
    setSearchQuery("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newActivityName.trim()) return;

    const today = getTodayDateString();
    const activeRound = rounds.find(
      (r) => today >= r.startDate && today <= r.endDate
    );
    if (!activeRound && (Number(newActivityPoints) || 0) > 0) {
      if (
        !window.confirm(
          "Atenção: Não há uma rodada ativa. Itens com pontos não contarão para o placar. Deseja continuar?"
        )
      ) {
        return;
      }
    }

    const dataToAdd = {
      name: newActivityName.trim(),
      description: newActivityDescription.trim(),
      type: newActivityType,
      category: newActivityType === "desafio_hot" ? "Hot" : newActivityCategory,
      points: Number(newActivityPoints) || 0,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      selections: {},
      completionStatus: null,
      challengeState: newActivityType.startsWith("desafio")
        ? "pending_acceptance"
        : null,
    };

    if (newActivityType.startsWith("desafio")) {
      const durationInMillis =
        newActivityDurationDays * 86400000 +
        newActivityDurationHours * 3600000 +
        newActivityDurationMinutes * 60000;
      if (durationInMillis > 0)
        dataToAdd.expiresAt = Timestamp.fromDate(
          new Date(Date.now() + durationInMillis)
        );
      dataToAdd.selections[user.uid] = {
        status: "confirmed",
        date: getTodayDateString(),
      };
    } else {
      dataToAdd.periodicity =
        newActivityPeriodicityType !== "none"
          ? {
              type: newActivityPeriodicityType,
              value: newActivityPeriodicityValue,
            }
          : null;
    }

    handleAddActivity(dataToAdd);
    onClose();
  };

  const inputBaseClasses =
    "w-full block px-4 py-2 border border-gray-600 rounded-lg shadow-sm bg-gray-800 text-white focus:ring-yellow-500 focus:border-yellow-500";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white tracking-wide">
            Adicionar Novo Item
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
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

        <div className="overflow-y-auto pr-2 space-y-4 flex-grow">
          <div className="relative">
            <input
              type="text"
              placeholder="Reutilizar um item? Busque aqui..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={inputBaseClasses}
            />
            {searchResults.length > 0 && (
              <ul className="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                {searchResults.map((activity) => (
                  <li
                    key={activity.id}
                    onClick={() => handleSelectPastActivity(activity)}
                    className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white"
                  >
                    {activity.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                value={newActivityType}
                onChange={(e) => setNewActivityType(e.target.value)}
                className={inputBaseClasses}
              >
                <option value="atividade">Atividade</option>
                <option value="desafio">Desafio</option>
                <option value="desafio_hot">Desafio Hot</option>
              </select>
              <select
                value={newActivityCategory}
                onChange={(e) => setNewActivityCategory(e.target.value)}
                className={inputBaseClasses}
                disabled={newActivityType === "desafio_hot"}
              >
                {Object.keys(categoryIcons).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Nome do Item"
                value={newActivityName}
                onChange={(e) => setNewActivityName(e.target.value)}
                className={`${inputBaseClasses} sm:col-span-2`}
                required
              />
              <input
                type="number"
                min="0"
                placeholder="Pontos"
                value={newActivityPoints}
                onChange={(e) => setNewActivityPoints(e.target.value)}
                className={inputBaseClasses}
              />
            </div>

            <textarea
              placeholder="Descrição (opcional)"
              value={newActivityDescription}
              onChange={(e) => setNewActivityDescription(e.target.value)}
              className={inputBaseClasses}
              rows="2"
            ></textarea>

            {newActivityType === "atividade" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  value={newActivityPeriodicityType}
                  onChange={(e) =>
                    setNewActivityPeriodicityType(e.target.value)
                  }
                  className={inputBaseClasses}
                >
                  <option value="none">Recorrência</option>
                  <option value="diaria">Diária</option>
                  <option value="especifica">Data Específica</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensal">Mensal</option>
                  <option value="anual">Anual</option>
                </select>
                <PeriodicityInputs
                  type={newActivityPeriodicityType}
                  value={newActivityPeriodicityValue}
                  setValue={setNewActivityPeriodicityValue}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duração do Desafio
                </label>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <input
                    type="number"
                    min="0"
                    value={newActivityDurationDays}
                    onChange={(e) =>
                      setNewActivityDurationDays(Number(e.target.value))
                    }
                    className={`${inputBaseClasses} w-16 text-center`}
                  />{" "}
                  d
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={newActivityDurationHours}
                    onChange={(e) =>
                      setNewActivityDurationHours(Number(e.target.value))
                    }
                    className={`${inputBaseClasses} w-16 text-center`}
                  />{" "}
                  h
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={newActivityDurationMinutes}
                    onChange={(e) =>
                      setNewActivityDurationMinutes(Number(e.target.value))
                    }
                    className={`${inputBaseClasses} w-16 text-center`}
                  />{" "}
                  m
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto bg-yellow-400 text-gray-900 px-6 py-2 rounded-lg hover:bg-yellow-300 font-semibold transition-colors"
              >
                Adicionar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
