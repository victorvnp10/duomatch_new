import React, { useState, useMemo } from "react";
import { EditIcon, TrashIcon, categoryIcons, ArrowLeftIcon } from "./Icons";
import { formatPeriodicity } from "../../shared/utils";

export default function AllActivitiesView({
  userData,
  allActivities,
  mySelections,
  setView,
  setActivityToEdit,
  setActivityToDelete,
}) {

  const [searchTerm, setSearchTerm] = useState("");

  const filteredActivities = useMemo(() => {
    if (!searchTerm) {
      return allActivities;
    }
    return allActivities.filter((activity) =>
      activity.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allActivities, searchTerm]);

  const renderItemTag = (item) => {
    if (item.type === "desafio")
      return (
        <span className="text-xs font-bold text-purple-300 bg-purple-900/50 px-2 py-1 rounded-full mr-2">
          DESAFIO ({item.points} pts)
        </span>
      );
    if (item.type === "desafio_hot")
      return (
        <span className="text-xs font-bold text-red-400 bg-red-900/50 px-2 py-1 rounded-full mr-2">
          DESAFIO HOT ({item.points} pts)
        </span>
      );
    return null;
  };

  return (
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
            Gerenciar Atividades
          </h1>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL COM NOVO ESTILO */}
      <main className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar atividade pelo nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-700 rounded-lg shadow-sm bg-gray-800 text-white focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>

        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl shadow-lg p-4 md:p-6 backdrop-blur-sm space-y-3">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="bg-gray-900/50 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-grow mb-3 sm:mb-0">
                  <div className="flex items-center mb-1">
                    {renderItemTag(activity)}
                    <span className="text-gray-400 mr-2 text-xl">
                      {categoryIcons[activity.category]}
                    </span>
                    <p className="font-semibold text-white">
                      {activity.name}
                      {activity.points > 0 && (
                        <span className="ml-2 font-bold text-yellow-400">
                          ({activity.points} pts)
                        </span>
                      )}
                    </p>
                  </div>
                  {activity.description && (
                    <p className="text-sm text-gray-400 pl-2 italic">
                      {activity.description}
                    </p>
                  )}
                  {activity.periodicity && (
                    <p className="text-xs text-gray-500 pl-2 mt-1">
                      {formatPeriodicity(activity.periodicity)}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 flex-shrink-0">
                  <button
                    onClick={() => setActivityToEdit(activity)}
                    className="p-2 text-gray-400 hover:text-yellow-400 rounded-full hover:bg-gray-700/50 transition-colors"
                    aria-label="Editar"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => setActivityToDelete(activity)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-700/50 transition-colors"
                    aria-label="Deletar"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-10">
              Nenhuma atividade encontrada.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}