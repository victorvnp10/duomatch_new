import React, { useState, useMemo, useEffect } from "react";
import {
  PlusIcon,
  TrashIcon,
  EditIcon,
  ClockIcon,
  ArrowLeftIcon,
} from "./Icons"; // Adicionei ArrowLeftIcon
import AddRoundModal from "./AddRoundModal";
import EditRoundModal from "./EditRoundModal";
import { getTodayDateString } from "../../shared/utils";

export default function RoundsView(props) {
  const {
    rounds,
    setView,
    handleDeleteRound,
    handleAddRound,
    handleUpdateRound,
    coupleData,
    handleUpdateCoupleData,
  } = props;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [roundToEdit, setRoundToEdit] = useState(null);
  const [selectedTime, setSelectedTime] = useState("22:00");

  useEffect(() => {
    if (coupleData?.confirmationTime) {
      setSelectedTime(coupleData.confirmationTime);
    }
  }, [coupleData]);

  const handleSaveTime = async () => {
    try {
      await handleUpdateCoupleData({ confirmationTime: selectedTime });
      alert("Horário de confirmação automática salvo com sucesso!");
    } catch (error) {
      alert("Ocorreu um erro ao salvar o horário.");
      console.error("Erro ao salvar horário:", error);
    }
  };

  const { activeRounds, futureRounds, pastRounds } = useMemo(() => {
    // Data LOCAL — toISOString() é UTC e classificava errado à noite
    const today = getTodayDateString();
    const active = [];
    const future = [];
    const past = [];

    rounds.forEach((round) => {
      if (today >= round.startDate && today <= round.endDate) {
        active.push(round);
      } else if (today < round.startDate) {
        future.push(round);
      } else {
        past.push(round);
      }
    });
    return { activeRounds: active, futureRounds: future, pastRounds: past };
  }, [rounds]);

  const openEditModal = (round) => {
    setRoundToEdit(round);
    setIsEditModalOpen(true);
  };

  // --- SUBCOMPONENTE RoundList COM NOVO ESTILO ---
  const RoundList = ({ title, roundsList, actions, itemClassName }) => (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl shadow-lg p-6 backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-gray-200 tracking-wide mb-4">
        {title}
      </h2>
      <div className="space-y-3">
        {roundsList.length > 0 ? (
          roundsList.map((round) => (
            <div
              key={round.id}
              className={`bg-gray-900/50 p-4 border-l-4 rounded-lg flex items-center justify-between transition-all ${
                itemClassName || "border-gray-600"
              }`}
            >
              <div>
                <p className="font-semibold text-white">{round.name}</p>
                <p className="text-sm text-gray-400">
                  {new Date(round.startDate + "T00:00:00").toLocaleDateString()}{" "}
                  - {new Date(round.endDate + "T00:00:00").toLocaleDateString()}
                </p>
              </div>
              {actions && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(round)}
                    className="p-2 text-gray-400 hover:text-yellow-400 rounded-full hover:bg-gray-700/50 transition-colors"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => handleDeleteRound(round.id)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-700/50 transition-colors"
                  >
                    <TrashIcon />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">
            Nenhuma rodada nesta categoria.
          </p>
        )}
      </div>
    </div>
  );
  return (
    <>
      <AddRoundModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddRound={handleAddRound}
      />
      <EditRoundModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdateRound={handleUpdateRound}
        round={roundToEdit}
      />
      <div className="bg-gray-900 min-h-screen text-white">
        {/* HEADER MODERNIZADO */}
        <header className="bg-gray-900/70 backdrop-blur-md p-4 sticky top-0 z-20 border-b border-gray-700/50">
          <div className="max-w-4xl mx-auto flex items-center">
            <button
              onClick={() => setView("main")}
              className="p-2 rounded-full text-gray-300 hover:bg-gray-700/50 hover:text-white mr-2 transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold tracking-wider text-white">
              Gerenciar Rodadas
            </h1>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL COM NOVO ESTILO */}
        <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
          {/* CARD DE CONFIGURAÇÕES GERAIS */}
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl shadow-lg p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-gray-200 tracking-wide mb-1">
              Configurações Gerais
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Defina o horário em que as atividades selecionadas devem ser
              confirmadas automaticamente todos os dias.
            </p>
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <label
                htmlFor="auto-confirm-time"
                className="block text-sm font-medium text-gray-300"
              >
                Horário da Confirmação Automática
              </label>
              <div className="flex items-center gap-4 mt-2">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="auto-confirm-time"
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-white focus:ring-yellow-500 focus:border-yellow-500"
                  />
                </div>
                <button
                  onClick={handleSaveTime}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-900 bg-yellow-400 hover:bg-yellow-300 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>

          {/* LISTAS DE RODADAS */}
          <RoundList
            title="Rodada Ativa"
            roundsList={activeRounds}
            itemClassName="border-green-500 shadow-[0_0_15px_rgba(52,211,153,0.15)]"
          />
          <RoundList
            title="Rodadas Futuras"
            roundsList={futureRounds}
            actions={true}
            itemClassName="border-blue-500"
          />
          <RoundList
            title="Rodadas Passadas"
            roundsList={pastRounds}
            itemClassName="border-gray-600 opacity-60"
          />
        </main>

        {/* BOTÃO FLUTUANTE */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="fixed bottom-24 right-4 md:bottom-6 md:right-6 bg-yellow-400 text-gray-900 w-16 h-16 rounded-full shadow-lg flex items-center justify-center z-20 hover:bg-yellow-300 transition-all duration-300 transform hover:scale-110"
          aria-label="Adicionar Nova Rodada"
        >
          <PlusIcon />
        </button>
      </div>
    </>
  );
}
