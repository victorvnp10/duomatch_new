// Arquivo: src/components/SetPointsModal.js

import React, { useState, useEffect } from "react";

function SetPointsModal({ activity, onSave, onClose }) {
  const [points, setPoints] = useState(5);

  useEffect(() => {
    if (activity) {
      setPoints(activity.points || 5);
    }
  }, [activity?.id]); // Dependência estável para evitar loops

  if (!activity) return null;

  const handleSave = () => {
    onSave(activity.id, points);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm mx-auto">
        <h3 className="text-lg font-bold mb-2">Definir Pontuação</h3>
        <p className="text-gray-600 mb-4">
          Quantos pontos vale a atividade{" "}
          <strong className="text-pink-500">"{activity.name}"</strong>?
        </p>
        <input
          type="number"
          min="1"
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center font-bold text-xl mb-6"
          autoFocus
          id="points-modal-input"
          name="points-modal-input"
        />
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Salvar Pontos
          </button>
        </div>
      </div>
    </div>
  );
}

export default SetPointsModal;
