import React from "react";

/**
 * Um modal genérico para confirmar uma ação de exclusão.
 * @param {object} item - O objeto a ser excluído. Se for nulo, o modal não aparece.
 * @param {function} onClose - A função a ser chamada para fechar o modal.
 * @param {function} onConfirm - A função a ser chamada quando o usuário confirma a exclusão.
 * @param {string} title - O título do modal (ex: "Excluir Atividade").
 * @param {string} message - A mensagem de confirmação.
 */
export default function DeleteConfirmationModal({
  item,
  onClose,
  onConfirm,
  title,
  message,
}) {
  // Se não houver 'item' para deletar, o modal não renderiza nada.
  // Isso nos permite chamar o componente sem nos preocuparmos se o estado está nulo.
  if (!item) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm w-full">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
