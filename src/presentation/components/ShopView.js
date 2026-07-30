
import React, { useState } from "react";
import AddRewardModal from "./AddRewardModal";
import { PlusIcon, EditIcon, TrashIcon, ArrowLeftIcon, TagIcon } from "./Icons";

function ShopView({
  setView,
  user,
  userData,
  rewards,
  handleCreateReward,
  handleApproveReward,
  handlePurchaseReward,
  setRewardToEdit,
  setRewardToDelete,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState(null);
  const [approvalCosts, setApprovalCosts] = useState({});

  const partnerNickname = userData.partnerData?.nickname || "Parceiro(a)";
  const suggestedRewards = [
    {
      name: "Fantasia de Roupa Íntima",
      description: "O comprador escolhe uma peça que sempre quis ver usada...",
      cost: 50,
    },
    {
      name: "Vale 'Um Desejo seu é uma Ordem'",
      description: "O comprador pode fazer um pequeno pedido (não material)...",
      cost: 35,
    },
    {
      name: "Noite de Acampamento na Sala",
      description: "Montem uma cabana na sala e passem a noite 'acamapados'...",
      cost: 40,
    },
    {
      name: "Vale Dia de Desconexão",
      description: "Um dia inteiro para se desconectarem das telas...",
      cost: 20,
    },
    {
      name: "Noite de Degustação",
      description: "Organizar uma noite de degustação de vinhos, queijos...",
      cost: 25,
    },
    {
      name: "Vale-Troca de Mensagens Quentes",
      description: "Trocar 5 mensagens mais ousadas durante o dia...",
      cost: 10,
    },
    {
      name: "Vale uma Massagem",
      description: "Massagem caprichada com creme à escolha, sem interrupções.",
      cost: 25,
    },
    {
      name: "Dia do 'Sim'",
      description: "O parceiro que compra escolhe 3 pequenos pedidos...",
      cost: 25,
    },
    {
      name: "Tarde de Hobby do Parceiro",
      description: "O comprador participa com interesse genuíno por 1 hora...",
      cost: 35,
    },
    {
      name: "Jantar à Luz de Velas",
      description:
        "O parceiro deve organizar a mesa com velas para um clima romântico.",
      cost: 20,
    },
    {
      name: "Vale 'Você Tinha Razão'",
      description:
        "Para ser usado em uma discussão futura. O parceiro deve admitir...",
      cost: 75,
    },
  ];

  const handleSelectSuggestion = (suggestion) => {
    setModalInitialData(suggestion);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalInitialData(null);
    setIsModalOpen(false);
  };

  const handleCostChange = (rewardId, cost) => {
    setApprovalCosts((prev) => ({ ...prev, [rewardId]: Number(cost) }));
  };

  const availableRewards = rewards.filter(
    (r) => r.status === "pending_approval" || r.status === "approved"
  );
  const purchasedRewards = rewards.filter((r) => r.status === "purchased");

  const renderRewardItem = (reward) => {
    const iAmCreator = reward.createdBy === user.uid;
    const isPending = reward.status === "pending_approval";
    const canApprove = isPending && !iAmCreator;
    const finalCost = approvalCosts[reward.id] || reward.cost;

    return (
      <li
        key={reward.id}
        className={`p-4 rounded-xl border-l-4 bg-black/40 backdrop-blur-sm transition-all hover:bg-black/50 ${
          iAmCreator ? "border-pink-500" : "border-yellow-400"
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="font-bold text-white text-lg">{reward.name}</p>
            <p className="text-sm text-gray-300 italic mt-1 leading-relaxed">
              {reward.description}
            </p>
            <p className="text-xs text-gray-400 mt-3 flex items-center">
              <span className="w-2 h-2 rounded-full bg-gray-500 mr-2"></span>
              Criado por: {iAmCreator ? "Você" : partnerNickname}
            </p>
          </div>
          <div className="flex flex-col items-center ml-4">
            <div className="bg-yellow-400/20 border border-yellow-400/50 rounded-lg px-3 py-2">
              <p className="text-xl font-bold text-yellow-400">{reward.cost}</p>
              <p className="text-xs text-yellow-300">pontos</p>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-700/50 flex justify-end items-center gap-2 h-9">
          {isPending && iAmCreator && (
            <>
              <div className="bg-orange-400/20 border border-orange-400/50 rounded-lg px-3 py-1 mr-auto">
                <span className="text-xs text-orange-400 font-semibold animate-pulse flex items-center">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></span>
                  Aguardando aprovação...
                </span>
              </div>
              <button
                onClick={() => setRewardToEdit(reward)}
                className="p-2 text-gray-400 hover:text-yellow-400 rounded-full hover:bg-yellow-400/10 transition-all"
              >
                <EditIcon />
              </button>
              <button
                onClick={() => setRewardToDelete(reward)}
                className="p-2 text-gray-400 hover:text-red-400 rounded-full hover:bg-red-400/10 transition-all"
              >
                <TrashIcon />
              </button>
            </>
          )}
          {canApprove && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Ajustar valor:</span>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={finalCost}
                  onChange={(e) => handleCostChange(reward.id, e.target.value)}
                  className="w-20 px-2 py-1 border border-gray-600/50 rounded-lg bg-gray-800/80 text-white text-sm focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all"
                />
              </div>
              <button
                onClick={() => handleApproveReward(reward.id, finalCost)}
                className="text-xs font-bold text-gray-900 bg-green-400 hover:bg-green-300 px-4 py-2 rounded-lg transition-all hover:scale-105 shadow-lg"
              >
                ✓ Aprovar
              </button>
            </>
          )}
          {reward.status === "approved" && (
            <>
              <span className="text-xs font-bold text-green-400 bg-green-400/20 border border-green-400/50 px-3 py-1 rounded-lg mr-auto flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                APROVADO
              </span>
              <button
                onClick={() => handlePurchaseReward(reward)}
                className="text-sm font-bold text-gray-900 bg-yellow-400 hover:bg-yellow-300 px-6 py-2 rounded-lg transition-all hover:scale-105 shadow-lg flex items-center"
              >
                🛒 Comprar
              </button>
            </>
          )}
        </div>
      </li>
    );
  };

  const renderPurchasedItem = (reward) => (
    <li key={reward.id} className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/30 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-semibold text-gray-400 line-through text-lg">{reward.name}</p>
          <p className="text-sm text-gray-500 mt-1 flex items-center">
            <span className="w-2 h-2 rounded-full bg-gray-500 mr-2"></span>
            Comprado por: {reward.purchasedBy === user.uid ? "Você" : partnerNickname}
          </p>
        </div>
        <div className="bg-gray-600/20 border border-gray-600/50 rounded-lg px-3 py-2">
          <span className="text-xl">✅</span>
        </div>
      </div>
    </li>
  );

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen text-white">
      <AddRewardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleCreateReward}
        initialData={modalInitialData}
      />

      {/* HEADER MODERNIZADO */}
      <header className="bg-black/30 backdrop-blur-md p-4 sticky top-0 z-20 border-b border-yellow-400/30">
        <div className="max-w-6xl mx-auto flex items-center">
          <button
            onClick={() => setView("main")}
            className="p-3 rounded-full text-gray-300 hover:bg-yellow-400/10 hover:text-yellow-400 mr-3 transition-all"
            aria-label="Voltar"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <div className="bg-yellow-400/20 p-2 rounded-xl border border-yellow-400/50">
              <TagIcon className="h-8 w-8 text-yellow-400" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Loja de Recompensas
              </h1>
              <p className="text-sm text-gray-400">Troque seus pontos por experiências especiais</p>
            </div>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-6xl mx-auto p-4 md:p-6 pb-28 space-y-8">
        
        {/* SEÇÃO RECOMPENSAS DISPONÍVEIS */}
        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-yellow-400/20 p-2 rounded-lg border border-yellow-400/50 mr-3">
                <span className="text-2xl">🎁</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Recompensas Disponíveis</h2>
                <p className="text-sm text-gray-400">{availableRewards.length} itens na loja</p>
              </div>
            </div>
            <div className="bg-yellow-400/20 border border-yellow-400/50 rounded-lg px-3 py-1">
              <span className="text-yellow-400 font-bold text-sm">{availableRewards.length}</span>
            </div>
          </div>
          
          <div className="bg-black/20 rounded-xl p-4 border border-yellow-400/20">
            <ul className="space-y-4">
              {availableRewards.length > 0 ? (
                availableRewards.map(renderRewardItem)
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-700/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🏪</span>
                  </div>
                  <p className="text-gray-400 text-lg">Loja vazia no momento</p>
                  <p className="text-gray-500 text-sm mt-1">Que tal criar a primeira recompensa?</p>
                </div>
              )}
            </ul>
          </div>

          <div className="text-center text-xs text-yellow-400 mt-4">
            💡 Crie recompensas especiais para tornar a relação ainda mais divertida!
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SEÇÃO RECOMPENSAS RESGATADAS */}
          <div className="bg-gradient-to-br from-gray-500/10 to-gray-600/10 border border-gray-400/30 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-gray-400/20 p-2 rounded-lg border border-gray-400/50 mr-3">
                  <span className="text-2xl">📦</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-300">Histórico de Compras</h3>
                  <p className="text-sm text-gray-400">{purchasedRewards.length} itens resgatados</p>
                </div>
              </div>
              <div className="bg-gray-400/20 border border-gray-400/50 rounded-lg px-3 py-1">
                <span className="text-gray-400 font-bold text-sm">{purchasedRewards.length}</span>
              </div>
            </div>
            
            <div className="bg-black/20 rounded-xl p-4 border border-gray-400/20 min-h-[200px]">
              <ul className="space-y-3">
                {purchasedRewards.length > 0 ? (
                  purchasedRewards.map(renderPurchasedItem)
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-gray-700/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">📝</span>
                    </div>
                    <p className="text-gray-500">Nenhuma compra realizada ainda</p>
                  </div>
                )}
              </ul>
            </div>
            
            <div className="text-center text-xs text-gray-400 mt-4">
              📦 Itens comprados ficam registrados aqui para acompanhamento
            </div>
          </div>

          {/* SEÇÃO CRIAR NOVA RECOMPENSA */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center mb-4">
                <div className="bg-green-400/20 p-2 rounded-lg border border-green-400/50 mr-3">
                  <span className="text-2xl">✨</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Criar Recompensa</h3>
                  <p className="text-sm text-gray-400">Adicione um novo prêmio à loja</p>
                </div>
              </div>
              
              <div className="bg-black/20 rounded-xl p-4 border border-green-400/20">
                <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                  Crie "vales" especiais que podem ser comprados com pontos. 
                  Seja criativo e pense em experiências que vocês dois vão adorar!
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-gradient-to-r from-green-400 to-emerald-400 text-gray-900 py-3 rounded-xl hover:from-green-300 hover:to-emerald-300 transition-all font-bold text-lg shadow-lg hover:scale-105 flex items-center justify-center"
                >
                  <PlusIcon className="mr-2" />
                  Adicionar à Loja
                </button>
              </div>
              
              <div className="text-center text-xs text-green-400 mt-4">
                ✨ Recompensas criativas tornam o relacionamento mais divertido!
              </div>
            </div>

            {/* SEÇÃO SUGESTÕES RÁPIDAS */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center mb-4">
                <div className="bg-purple-400/20 p-2 rounded-lg border border-purple-400/50 mr-3">
                  <span className="text-2xl">💡</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Sugestões Populares</h3>
                  <p className="text-sm text-gray-400">Ideias que outros casais adoram</p>
                </div>
              </div>
              
              <div className="bg-black/20 rounded-xl p-4 border border-purple-400/20 max-h-80 overflow-y-auto">
                <div className="space-y-2">
                  {suggestedRewards.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full text-left p-3 bg-gray-800/40 hover:bg-gray-700/60 rounded-lg transition-all border border-gray-700/30 hover:border-purple-400/30 group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                            {suggestion.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {suggestion.description}
                          </p>
                        </div>
                        <div className="bg-yellow-400/20 border border-yellow-400/50 rounded-lg px-2 py-1 ml-3">
                          <p className="text-xs font-bold text-yellow-400">
                            {suggestion.cost}pts
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="text-center text-xs text-purple-400 mt-4">
                💡 Clique em qualquer sugestão para personalizar e adicionar!
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BOTÃO FLUTUANTE PARA MOBILE */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="md:hidden fixed bottom-24 right-4 bg-gradient-to-r from-green-400 to-emerald-400 text-gray-900 w-16 h-16 rounded-full shadow-xl flex items-center justify-center z-20 hover:from-green-300 hover:to-emerald-300 transition-all duration-300 transform hover:scale-110 active:scale-95"
        aria-label="Adicionar Recompensa"
      >
        <PlusIcon />
      </button>
    </div>
  );
}

export default ShopView;
