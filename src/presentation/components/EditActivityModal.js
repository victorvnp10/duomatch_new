// Arquivo: src/components/EditActivityModal.js

import React, { useState, useEffect } from "react";
import { categoryIcons } from "./Icons";
import PeriodicityInputs from "./PeriodicityInputs";

function EditActivityModal(props) {
  // --- CORREÇÃO: Trocamos as props para usar onClose e onSave, como definido no DuoMatchApp ---
  const { activity, onClose, onSave } = props;

  const [name, setName] = useState(activity.name);
  const [type, setType] = useState(activity.type || "atividade");
  const [category, setCategory] = useState(activity.category);
  const [points, setPoints] = useState(activity.points || 0);
  const [description, setDescription] = useState(activity.description || "");
  const [periodicityType, setPeriodicityType] = useState(
    activity.periodicity?.type || "none"
  );
  const [periodicityValue, setPeriodicityValue] = useState(
    activity.periodicity?.value || ""
  );

  useEffect(() => {
    setName(activity.name);
    setType(activity.type || "atividade");
    setCategory(activity.category);
    setPoints(activity.points || 0);
    setDescription(activity.description || "");
    setPeriodicityType(activity.periodicity?.type || "none");
    setPeriodicityValue(activity.periodicity?.value || "");
  }, [activity]);

  useEffect(() => {
    if (type === "desafio_hot") {
      setCategory("Hot");
    }
  }, [type]);

  const handleSubmit = () => {
    const updatedActivity = {
      name,
      type,
      category,
      description,
      // --- CORREÇÃO 2: A lógica agora salva os pontos para qualquer tipo ---
      points: Number(points) || 0,
      periodicity:
        type === "atividade"
          ? { type: periodicityType, value: periodicityValue }
          : null,
    };
    onSave(activity.id, updatedActivity);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-ink p-6 rounded-lg shadow-xl w-full max-w-md mx-auto space-y-4">
        <h3 className="text-xl font-bold text-white">Editar Item</h3>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
        >
          <option value="atividade">Atividade</option>
          <option value="desafio">Desafio</option>
          <option value="desafio_hot">Desafio Hot</option>
        </select>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome da Atividade/Desafio"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
        />

        <textarea
          placeholder="Descrição (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
          rows="2"
        ></textarea>

        <div className="grid grid-cols-2 gap-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            disabled={type === "desafio_hot"}
          >
            {Object.keys(categoryIcons).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="0"
            placeholder="Pontos"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
          />
        </div>

        {type === "atividade" && (
          <div className="pt-2">
            <label className="text-sm font-medium text-gray-300">
              Recorrência
            </label>
            <div className="flex gap-4 mt-1">
              <select
                value={periodicityType}
                onChange={(e) => setPeriodicityType(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              >
                <option value="none">Nenhuma</option>
                <option value="diaria">Diária</option>
                <option value="especifica">Data Específica</option>
                <option value="semanal">Semanal</option>
                <option value="mensal">Mensal</option>
                <option value="anual">Anual</option>
              </select>
              <PeriodicityInputs
                type={periodicityType}
                value={periodicityValue}
                setValue={setPeriodicityValue}
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditActivityModal;
