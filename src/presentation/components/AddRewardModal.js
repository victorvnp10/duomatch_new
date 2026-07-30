import React, { useState, useEffect } from "react";

function AddRewardModal({ isOpen, onClose, onConfirm, initialData = null }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState(10);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setCost(initialData.cost || 10);
    } else {
      // Limpa o formulário quando abre sem dados iniciais
      setName("");
      setDescription("");
      setCost(10);
    }
  }, [initialData, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleInternalSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || Number(cost) <= 0) {
      alert("Por favor, preencha o nome e um custo válido para a recompensa.");
      return;
    }

    onConfirm({
      name: name.trim(),
      description: description.trim(),
      cost: Number(cost),
    });

    onClose();
  };

  const inputBaseClasses =
    "w-full block px-4 py-2 border border-gray-600 rounded-lg shadow-sm bg-gray-800 text-white focus:ring-yellow-500 focus:border-yellow-500";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl shadow-lg w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white tracking-wide">
            Criar Nova Recompensa
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

        <form onSubmit={handleInternalSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="reward-name"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Nome da Recompensa
            </label>
            <input
              type="text"
              id="reward-name"
              placeholder="Ex: Vale-massagem especial"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputBaseClasses}
              required
              autoFocus
            />
          </div>
          <div>
            <label
              htmlFor="reward-description"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Descrição (opcional)
            </label>
            <textarea
              id="reward-description"
              placeholder="Ex: Uma massagem de 20 minutos com óleo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputBaseClasses}
              rows="3"
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="reward-cost"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Custo Sugerido (em pontos)
            </label>
            <input
              type="number"
              id="reward-cost"
              min="1"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className={inputBaseClasses}
              required
            />
          </div>
          <div className="pt-4 flex justify-end gap-4">
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
              Adicionar à Loja
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddRewardModal;
