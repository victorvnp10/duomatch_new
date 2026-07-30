
import React from "react";
import { ArrowLeftIcon, WalletIcon } from "./Icons";

function WalletView({
  setView,
  user,
  userData,
  rewards,
  handleMarkAsDelivered,
}) {
  const allPurchasedRewards = rewards.filter((r) => r.status === "purchased");

  const myPurchases = allPurchasedRewards.filter(
    (r) => r.purchasedBy === user.uid
  );

  const mySales = allPurchasedRewards.filter((r) => r.purchasedBy !== user.uid);

  const partnerNickname = userData.partnerData?.nickname || "Parceiro(a)";

  const renderPurchaseItem = (item) => (
    <li
      key={item.id}
      className="p-4 bg-black/40 rounded-xl border-l-4 border-purple-400 backdrop-blur-sm hover:bg-black/50 transition-all"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-bold text-white text-lg">{item.name}</p>
          <p className="text-sm text-gray-300 mt-1 flex items-center">
            <span className="w-2 h-2 rounded-full bg-purple-400 mr-2"></span>
            Criado por: {item.createdBy === user.uid ? "Você" : partnerNickname}
          </p>
          <p className="text-xs text-gray-400 mt-2">{item.description}</p>
        </div>
        <div className="ml-4 flex flex-col items-center">
          {item.deliveryStatus === "delivered" ? (
            <div className="bg-green-400/20 border border-green-400/50 rounded-lg px-3 py-2">
              <span className="text-2xl">✅</span>
            </div>
          ) : (
            <div className="bg-orange-400/20 border border-orange-400/50 rounded-lg px-3 py-2 animate-pulse">
              <span className="text-2xl">⏳</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-700/50">
        {item.deliveryStatus === "delivered" ? (
          <span className="text-sm font-bold text-green-400 flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            Recebido! ✅
          </span>
        ) : (
          <span className="text-sm font-semibold text-orange-400 animate-pulse flex items-center">
            <span className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></span>
            Aguardando recebimento...
          </span>
        )}
      </div>
    </li>
  );

  const renderSaleItem = (item) => (
    <li
      key={item.id}
      className="p-4 bg-black/40 rounded-xl border-l-4 border-pink-500 backdrop-blur-sm hover:bg-black/50 transition-all"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="font-bold text-white text-lg">{item.name}</p>
          <p className="text-sm text-gray-300 mt-1 flex items-center">
            <span className="w-2 h-2 rounded-full bg-pink-500 mr-2"></span>
            Comprado por: {item.purchasedBy === user.uid ? "Você" : partnerNickname}
          </p>
          <p className="text-xs text-gray-400 mt-2">{item.description}</p>
        </div>
        <div className="ml-4 flex flex-col items-center">
          {item.deliveryStatus === "delivered" ? (
            <div className="bg-green-400/20 border border-green-400/50 rounded-lg px-3 py-2">
              <span className="text-2xl">✅</span>
            </div>
          ) : (
            <div className="bg-orange-400/20 border border-orange-400/50 rounded-lg px-3 py-2">
              <span className="text-2xl">📦</span>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-700/50 flex justify-end">
        {item.deliveryStatus === "delivered" ? (
          <span className="text-sm font-bold text-green-400 flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            Entrega confirmada
          </span>
        ) : (
          <button
            onClick={() => handleMarkAsDelivered(item.id)}
            className="text-sm font-bold text-gray-900 bg-green-400 hover:bg-green-300 px-4 py-2 rounded-lg transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Marcar ${item.name} como entregue`}
          >
            ✓ Marcar como Entregue
          </button>
        )}
      </div>
    </li>
  );

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 min-h-screen text-white">
      {/* HEADER MODERNIZADO */}
      <header className="bg-black/30 backdrop-blur-md p-4 sticky top-0 z-20 border-b border-purple-400/30">
        <div className="max-w-6xl mx-auto flex items-center">
          <button
            onClick={() => setView("main")}
            className="p-3 rounded-full text-gray-300 hover:bg-purple-400/10 hover:text-purple-400 mr-3 transition-all"
            aria-label="Voltar"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <div className="bg-purple-400/20 p-2 rounded-xl border border-purple-400/50">
              <WalletIcon className="h-8 w-8 text-purple-400" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Minha Carteira
              </h1>
              <p className="text-sm text-gray-400">Gerencie suas compras e vendas</p>
            </div>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-6xl mx-auto p-4 md:p-6 pb-24 space-y-8">
        
        {/* SEÇÃO DE ITENS COMPRADOS */}
        <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-400/30 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-purple-400/20 p-2 rounded-lg border border-purple-400/50 mr-3">
                <span className="text-2xl">🛍️</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Minhas Compras</h2>
                <p className="text-sm text-gray-400">{myPurchases.length} itens comprados</p>
              </div>
            </div>
          </div>
          
          <div className="bg-black/20 rounded-xl p-4 border border-purple-400/20 min-h-[250px]">
            <ul className="space-y-4">
              {myPurchases.length > 0 ? (
                myPurchases.map(renderPurchaseItem)
              ) : (
                <div className="text-center py-12">
                  <div className="bg-purple-700/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🛒</span>
                  </div>
                  <p className="text-gray-400 text-lg">Nenhuma compra realizada</p>
                  <p className="text-gray-500 text-sm mt-1">Que tal visitar a loja e adquirir algo especial?</p>
                </div>
              )}
            </ul>
          </div>

          <div className="text-center text-xs text-purple-400 mt-4">
            💡 Seus itens comprados aparecem aqui até serem entregues!
          </div>
        </div>

        {/* SEÇÃO DE ITENS VENDIDOS */}
        <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-400/30 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-pink-400/20 p-2 rounded-lg border border-pink-400/50 mr-3">
                <span className="text-2xl">💝</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Minhas Vendas</h2>
                <p className="text-sm text-gray-400">{mySales.length} itens vendidos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-black/20 rounded-xl p-4 border border-pink-400/20 min-h-[250px]">
            <ul className="space-y-4">
              {mySales.length > 0 ? (
                mySales.map(renderSaleItem)
              ) : (
                <div className="text-center py-12">
                  <div className="bg-pink-700/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🏪</span>
                  </div>
                  <p className="text-gray-400 text-lg">Nenhuma venda pendente</p>
                  <p className="text-gray-500 text-sm mt-1">Seus itens vendidos aparecerão aqui</p>
                </div>
              )}
            </ul>
          </div>

          <div className="text-center text-xs text-pink-400 mt-4">
            💡 Confirme as entregas para que o comprador receba seu item!
          </div>
        </div>

        {/* ESTATÍSTICAS RÁPIDAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-xl p-4 backdrop-blur-sm text-center hover:from-green-500/15 hover:to-emerald-500/15 transition-all">
            <div className="bg-green-400/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {myPurchases.filter(item => item.deliveryStatus === "delivered").length}
            </p>
            <p className="text-sm text-gray-400">Itens Recebidos</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-400/30 rounded-xl p-4 backdrop-blur-sm text-center hover:from-orange-500/15 hover:to-amber-500/15 transition-all">
            <div className="bg-orange-400/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">⏳</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {myPurchases.filter(item => item.deliveryStatus !== "delivered").length}
            </p>
            <p className="text-sm text-gray-400">Aguardando</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-xl p-4 backdrop-blur-sm text-center hover:from-blue-500/15 hover:to-cyan-500/15 transition-all">
            <div className="bg-blue-400/20 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {mySales.filter(item => item.deliveryStatus === "delivered").length}
            </p>
            <p className="text-sm text-gray-400">Entregas Feitas</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default WalletView;
