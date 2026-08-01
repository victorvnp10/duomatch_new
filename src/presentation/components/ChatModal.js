import React, { useState, useEffect, useRef } from "react";
import { Avatar } from "./avatars/AvatarCatalog";

function ChatModal({
  activity,
  user,
  userData,
  comments,
  onClose,
  handlePostComment,
  handleEditComment,
  handleDeleteComment,
}) {
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    handlePostComment(activity.id, newComment);
    setNewComment("");
  };

  /**
   * Uma mensagem própria pode ser editada/apagada até o parceiro
   * visualizá-la — depois disso, fica travada.
   */
  const canModify = (comment) => comment.authorId === user.uid && !comment.readAt;

  const startEditing = (comment) => {
    setEditingId(comment.id);
    setEditingText(comment.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText("");
  };

  const saveEditing = (comment) => {
    if (editingText.trim() && editingText.trim() !== comment.text) {
      handleEditComment(activity.id, comment.id, editingText);
    }
    cancelEditing();
  };

  const confirmDelete = (comment) => {
    if (window.confirm("Apagar esta mensagem?")) {
      handleDeleteComment(activity.id, comment.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 font-sans">
      <div
        className="bg-gray-900 border border-gray-700 w-full max-w-lg rounded-2xl shadow-lg flex flex-col backdrop-blur-sm"
        style={{ height: "80vh" }}
      >
        {/* Cabeçalho do Modal */}
        <header className="p-4 border-b border-gray-700/50 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Chat da Atividade
            </h2>
            <p className="text-sm text-yellow-400">{activity.name}</p>
          </div>
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
        </header>

        {/* Corpo do Chat (mensagens) */}
        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {comments.map((comment) => {
            const isMyComment = comment.authorId === user.uid;
            const isEditing = editingId === comment.id;
            const modifiable = canModify(comment);
            return (
              <div
                key={comment.id}
                className={`group flex items-end gap-2 ${
                  isMyComment ? "justify-end" : "justify-start"
                }`}
              >
                {!isMyComment && (
                  <Avatar
                    photoURL={userData?.partnerData?.photoURL}
                    nickname={comment.authorNickname}
                    size="w-8 h-8"
                    className="border-2 border-accent"
                  />
                )}

                {isMyComment && modifiable && !isEditing && (
                  <div className="flex items-center gap-1 mb-1">
                    <button
                      onClick={() => startEditing(comment)}
                      className="text-xs text-gray-400 hover:text-yellow-400 transition-colors"
                      aria-label="Editar mensagem"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => confirmDelete(comment)}
                      className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                      aria-label="Apagar mensagem"
                    >
                      🗑️
                    </button>
                  </div>
                )}

                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    isMyComment
                      ? "bg-yellow-400 text-gray-900 rounded-br-none"
                      : "bg-gray-700 text-white rounded-bl-none"
                  }`}
                >
                  {!isMyComment && (
                    <p className="text-xs font-bold text-pink-400 mb-1">
                      {comment.authorNickname}
                    </p>
                  )}
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full px-2 py-1 rounded-lg bg-white/70 text-gray-900 text-sm resize-none focus:outline-none"
                        rows={2}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={cancelEditing}
                          className="text-xs font-semibold text-gray-700 hover:text-gray-900"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => saveEditing(comment)}
                          className="text-xs font-semibold text-gray-900 underline"
                        >
                          Salvar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap break-words">
                        {comment.text}
                      </p>
                      {comment.editedAt && (
                        <p
                          className={`text-[10px] mt-1 ${
                            isMyComment ? "text-gray-700" : "text-gray-400"
                          }`}
                        >
                          editada
                        </p>
                      )}
                    </>
                  )}
                </div>
                {isMyComment && (
                  <Avatar
                    photoURL={userData?.photoURL}
                    nickname={userData?.nickname}
                    size="w-8 h-8"
                    className="border-2 border-gold"
                  />
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Rodapé do Modal (formulário de envio) */}
        <footer className="p-4 border-t border-gray-700/50 flex-shrink-0">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-grow px-4 py-2 border border-gray-600 rounded-full bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              autoFocus
            />
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 p-3 rounded-full flex-shrink-0 transition-colors"
              aria-label="Enviar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009.894 15V4a1 1 0 00-1.447-.894l-5 1.428a1 1 0 00-.894 1.447l7 14a1 1 0 001.788 0l7-14a1 1 0 00-1.169-1.409l-5 1.428A1 1 0 0010.106 5V16a1 1 0 001.447.894l5-1.428a1 1 0 00.894-1.447l-7-14z" />
              </svg>
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}

export default ChatModal;
