import React, { useState, useEffect } from "react";

// Este modal recebe a rodada a ser editada e a função para salvar.
export default function EditRoundModal({
  isOpen,
  onClose,
  onUpdateRound,
  round,
}) {
  // O estado do formulário é inicializado com os dados da rodada existente.
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // Adicione aqui os outros estados para as regras, se desejar que sejam editáveis.

  // useEffect para preencher o formulário quando o modal abre com uma nova rodada.
  useEffect(() => {
    if (round) {
      setName(round.name);
      setStartDate(round.startDate);
      setEndDate(round.endDate);
    }
  }, [round]);

  if (!isOpen || !round) {
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

    // Monta o objeto com os dados atualizados.
    const updatedData = {
      name,
      startDate,
      endDate,
      // Se você adicionar a edição de regras, inclua-as aqui.
    };

    // Chama a função de atualização, passando o ID da rodada e os novos dados.
    onUpdateRound(round.id, updatedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-md space-y-4 w-full max-w-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700">
            Editar Rodada Futura
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200"
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
              htmlFor="roundNameEdit"
              className="block text-sm font-medium text-gray-700"
            >
              Nome da Rodada
            </label>
            <input
              type="text"
              id="roundNameEdit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startDateEdit"
                className="block text-sm font-medium text-gray-700"
              >
                Data de Início
              </label>
              <input
                type="date"
                id="startDateEdit"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="endDateEdit"
                className="block text-sm font-medium text-gray-700"
              >
                Data de Término
              </label>
              <input
                type="date"
                id="endDateEdit"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
