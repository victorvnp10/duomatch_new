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
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-auto space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Editar Item</h3>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />

        <textarea
          placeholder="Descrição (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          rows="2"
        ></textarea>

        <div className="grid grid-cols-2 gap-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            disabled={type === "desafio_hot"}
          >
            {Object.keys(categoryIcons).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* --- CORREÇÃO 1: O campo de pontos agora é sempre visível --- */}
          {/* A condição {type.startsWith("desafio") && ...} foi removida daqui */}
          <input
            type="number"
            min="0"
            placeholder="Pontos"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Campos Condicionais para Atividades (Recorrência) */}
        {type === "atividade" && (
          <div className="pt-2">
            <label className="text-sm font-medium text-gray-700">
              Recorrência
            </label>
            <div className="flex gap-4 mt-1">
              <select
                value={periodicityType}
                onChange={(e) => setPeriodicityType(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg"
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
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditActivityModal;
