import React, { useState, useEffect } from "react";

// Este modal recebe o item a ser editado e a função para salvar (onSave).
export default function EditWishlistItemModal({ item, onClose, onSave }) {
  // O estado do formulário é controlado aqui dentro.
  const [name, setName] = useState("");
  const [points, setPoints] = useState(0);
  const [link, setLink] = useState("");

  // Este efeito preenche o formulário com os dados do item quando o modal é aberto.
  useEffect(() => {
    if (item) {
      setName(item.name || "");
      setPoints(item.points || 0);
      setLink(item.link || "");
    }
  }, [item]);

  // Se o modal não deve estar aberto ou não há item, não renderiza nada.
  if (!item) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !points) {
      alert("Nome e pontos são obrigatórios.");
      return;
    }

    // Monta o objeto com os dados atualizados.
    const updatedData = {
      name,
      points: Number(points),
      link,
    };

    // Chama a função onSave (que é a handleUpdateWishlistItem do hook)
    onSave(item.id, updatedData);
    onClose(); // Fecha o modal
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-ink p-6 rounded-xl shadow-md space-y-4 w-full max-w-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">
            Editar Item da Lista de Desejos
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 text-gray-300"
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
              htmlFor="itemName"
              className="block text-sm font-medium text-gray-300"
            >
              Nome do Desejo
            </label>
            <input
              type="text"
              id="itemName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm text-white"
            />
          </div>
          <div>
            <label
              htmlFor="itemPoints"
              className="block text-sm font-medium text-gray-300"
            >
              Custo em Pontos
            </label>
            <input
              type="number"
              id="itemPoints"
              min="0"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm text-white"
            />
          </div>
          <div>
            <label
              htmlFor="itemLink"
              className="block text-sm font-medium text-gray-300"
            >
              Link (Opcional)
            </label>
            <input
              type="url"
              id="itemLink"
              placeholder="https://..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md shadow-sm text-white placeholder-gray-500"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-700 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-200 hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent hover:bg-accent-dark"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
