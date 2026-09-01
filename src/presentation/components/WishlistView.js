
import React, { useState } from "react";
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  GiftIcon,
  ArrowLeftIcon,
} from "./Icons";
import AddWishlistItemModal from "./AddWishlistItemModal";

export default function WishlistView(props) {
  const {
    setView,
    user,
    userData,
    wishlistItems,
    handleAddItemToWishlist,
    setWishlistItemToEdit,
    setWishlistItemToDelete,
    handleGiftWishlistItem,
    handleConfirmGiftReceived,
  } = props;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const myWishlist = wishlistItems.filter(
    (item) => item.createdBy === user.uid,
  );
  const partnerWishlist = wishlistItems.filter(
    (item) => item.createdBy !== user.uid,
  );
  const partnerNickname = userData.partnerData?.nickname || "Parceiro(a)";

  // --- SUBCOMPONENTE renderItem COM NOVO ESTILO ---
  const renderItem = (item, isMine) => {
    const isAvailable = item.status === "active";
    const isGifted = item.status === "gifted";
    const isConfirmed = item.status === "confirmed";

    const canIEditOrDelete = isMine && isAvailable;
    const canIBuy = !isMine && isAvailable;
    const iGaveThis = !isMine && isGifted && item.giftedBy === user.uid;
    const iNeedToConfirm = isMine && isGifted && item.giftedBy !== user.uid;

    // B2-49: defesa extra na renderização — itens legados podem ter link
    // malicioso salvo; se o esquema não for http/https, nem vira âncora
    // (um "javascript:..." renderizado é XSS executável entre o par).
    const isSafeLink = /^https?:\/\//i.test((item.link || "").trim());

    return (
      <div
        key={item.id}
        className={`bg-gray-900/50 p-4 rounded-lg border-l-4 transition-all ${
          isMine ? "border-pink-500" : "border-purple-400"
        } ${isConfirmed ? "opacity-50" : ""}`}
      >
        <div className="flex justify-between items-start">
          <div>
            {isSafeLink ? (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-white hover:underline"
              >
                {item.name}
              </a>
            ) : (
              <span className="font-bold text-white">{item.name}</span>
            )}
            <p className="text-sm text-gray-400 italic mt-1">
              {item.description}
            </p>
          </div>
          <p className="text-xl font-bold text-yellow-400">{item.points} pts</p>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-700/50 flex justify-end items-center h-8">
          {canIEditOrDelete && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setWishlistItemToEdit(item)}
                className="p-2 text-gray-400 hover:text-yellow-400 rounded-full hover:bg-gray-700/50 transition-colors"
              >
                <EditIcon />
              </button>
              <button
                onClick={() => setWishlistItemToDelete(item)}
                className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-700/50 transition-colors"
              >
                <TrashIcon />
              </button>
            </div>
          )}

          {canIBuy && (
            <button
              onClick={() => handleGiftWishlistItem(item.id)}
              className="text-sm font-bold text-gray-900 bg-yellow-400 hover:bg-yellow-300 px-4 py-1.5 rounded-md transition-colors"
            >
              Dar de Presente!
            </button>
          )}

          {iGaveThis && (
            <span className="text-xs text-gray-400 font-semibold animate-pulse">
              Aguardando {partnerNickname} confirmar...
            </span>
          )}

          {iNeedToConfirm && (
            <button
              onClick={() => handleConfirmGiftReceived(item)}
              className="text-sm font-bold text-white bg-green-600 hover:bg-green-500 px-4 py-1.5 rounded-md transition-colors"
            >
              Confirmar Recebimento
            </button>
          )}

          {isConfirmed && (
            <span className="text-sm font-bold text-green-500">
              Presente Recebido! ✅
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <AddWishlistItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        handleAddItemToWishlist={(itemData) => {
          handleAddItemToWishlist(itemData);
          setIsAddModalOpen(false);
        }}
      />

      {/* HEADER MODERNIZADO */}
      <header className="bg-gray-900/70 backdrop-blur-md p-4 sticky top-0 z-20 border-b border-gray-700/50">
        <div className="max-w-5xl mx-auto flex items-center">
          <button
            onClick={() => setView("main")}
            className="p-2 rounded-full text-gray-300 hover:bg-gray-700/50 hover:text-white mr-2 transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div className="flex items-center text-yellow-400">
            <GiftIcon />
            <h1 className="ml-2 text-xl font-bold tracking-wider text-white">
              Lista de Desejos
            </h1>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL COM NOVO ESTILO */}
      <main className="max-w-5xl mx-auto mt-4 grid grid-cols-1 md:grid-cols-2 gap-8 pb-28 p-4">
        {/* SUA LISTA DE DESEJOS */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-pink-400">
            Sua Lista de Desejos
          </h2>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl shadow-lg p-6 backdrop-blur-sm min-h-[200px]">
            <ul className="space-y-4">
              {myWishlist.length > 0 ? (
                myWishlist.map((item) => renderItem(item, true))
              ) : (
                <p className="text-center text-gray-500 pt-10">
                  Sua lista de desejos está vazia.
                </p>
              )}
            </ul>
          </div>
        </section>

        {/* LISTA DE DESEJOS DO PARCEIRO(A) */}
        <section>
          <h2 className="text-xl font-bold mb-4 text-purple-400">
            Desejos de {partnerNickname}
          </h2>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl shadow-lg p-6 backdrop-blur-sm min-h-[200px]">
            <ul className="space-y-4">
              {partnerWishlist.length > 0 ? (
                partnerWishlist.map((item) => renderItem(item, false))
              ) : (
                <p className="text-center text-gray-500 pt-10">
                  A lista de {partnerNickname} está vazia.
                </p>
              )}
            </ul>
          </div>
        </section>
      </main>

      {/* BOTÃO FLUTUANTE */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-24 right-4 md:bottom-6 md:right-6 bg-yellow-400 text-gray-900 w-16 h-16 rounded-full shadow-lg flex items-center justify-center z-20 hover:bg-yellow-300 transition-all duration-300 transform hover:scale-110"
        aria-label="Adicionar Novo Desejo"
      >
        <PlusIcon />
      </button>
    </div>
  );
}
