import React from "react";

// --- SEÇÃO DE SUGESTÕES SENSUAIS ---
const HotSuggestionsSection = ({ sortedHotSuggestions, user, handleSelectHotSuggestion }) => (
        <div className="bg-gradient-to-br from-black/60 to-red-900/40 p-6 rounded-2xl border border-red-500/40 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-red-300 tracking-wider flex items-center">
              🔥 Sugestões Sensuais
            </h2>
            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
              Match Secreto
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-6">
            Escolham a mesma sugestão e criem um momento íntimo especial juntos 💕
          </p>

          <ul className="space-y-4">
            {sortedHotSuggestions.length > 0 ? (
              sortedHotSuggestions.map((activity) => {
                if (!activity || !activity.id || activity.matched) return null;
                const myStatus = activity.selections?.[user.uid];

                if (myStatus === "selected") {
                  return (
                    <li
                      key={activity.id}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleSelectHotSuggestion(activity.id);
                        }
                      }}
                      onClick={() => handleSelectHotSuggestion(activity.id)}
                      className="group cursor-pointer relative overflow-hidden rounded-xl bg-gradient-to-r from-pink-900/60 to-red-900/60 border-2 border-pink-500/70 backdrop-blur-sm hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-600/10 to-red-600/10 animate-pulse" />
                      <div className="relative z-10 p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <span className="font-semibold text-pink-200 text-lg">
                              💫 {activity.name}
                              {activity.points > 0 && (
                                <span className="ml-2 inline-block bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs font-bold">
                                  +{activity.points} pts
                                </span>
                              )}
                            </span>
                            {activity.description && (
                              <p className="text-sm text-pink-300 mt-2 leading-relaxed">
                                {activity.description}
                              </p>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-pink-300 animate-pulse">
                            💕 Esperando...
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                }

                return (
                  <li
                    key={activity.id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleSelectHotSuggestion(activity.id);
                      }
                    }}
                    onClick={() => handleSelectHotSuggestion(activity.id)}
                    className="group cursor-pointer relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-900/70 to-gray-800/70 border border-gray-600/50 hover:border-pink-500/70 backdrop-blur-sm hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <span className="font-semibold text-gray-200 text-lg group-hover:text-pink-200 transition-colors">
                            🌟 {activity.name}
                            {activity.points > 0 && (
                              <span className="ml-2 inline-block bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs font-bold">
                                +{activity.points} pts
                              </span>
                            )}
                          </span>
                          {activity.description && (
                            <p className="text-sm text-gray-400 group-hover:text-pink-300 mt-2 leading-relaxed transition-colors">
                              {activity.description}
                            </p>
                          )}
                        </div>
                        <div className="w-8 h-8 rounded-full border-2 border-gray-500 group-hover:border-pink-400 flex items-center justify-center transition-colors">
                          <div className="w-3 h-3 rounded-full bg-transparent group-hover:bg-pink-400 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl mb-2 block">💕</span>
                <p className="text-gray-400">Nenhuma sugestão sensual disponível hoje</p>
                <p className="text-xs text-gray-500 mt-1">Novas sugestões aparecerão em breve</p>
              </div>
            )}
          </ul>
        </div>
);

export default HotSuggestionsSection;
