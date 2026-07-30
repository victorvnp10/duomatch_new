import React, { useState, useEffect } from "react";

function AddWishlistItemModal({ isOpen, onClose, handleAddItemToWishlist }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [points, setPoints] = useState(50);

  // Efeito para limpar o formulário sempre que o modal for aberto
  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setLink("");
      setPoints(50);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || points <= 0) {
      alert("Por favor, preencha o nome e um valor de pontos válido.");
      return;
    }
    handleAddItemToWishlist({
      name,
      description,
      link,
      points: Number(points),
    });
    onClose();
  };

  if (!isOpen) return null;

  const inputBaseClasses =
    "w-full block px-4 py-2 border border-gray-600 rounded-lg shadow-sm bg-gray-800 text-white focus:ring-yellow-500 focus:border-yellow-500";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl shadow-lg w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white tracking-wide">
            Adicionar Novo Desejo
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="wish-name"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Nome do Desejo
            </label>
            <input
              type="text"
              id="wish-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Tênis de corrida"
              className={inputBaseClasses}
              required
              autoFocus
            />
          </div>
          <div>
            <label
              htmlFor="wish-desc"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Descrição (opcional)
            </label>
            <textarea
              id="wish-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cor, tamanho, modelo, etc."
              className={inputBaseClasses}
              rows="2"
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="wish-link"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Link (opcional)
            </label>
            <input
              type="url"
              id="wish-link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              className={inputBaseClasses}
            />
          </div>
          <div>
            <label
              htmlFor="wish-points"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Pontos (se você ganhar de presente)
            </label>
            <input
              type="number"
              id="wish-points"
              min="1"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className={inputBaseClasses}
              required
            />
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
              Adicionar Desejo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddWishlistItemModal;
