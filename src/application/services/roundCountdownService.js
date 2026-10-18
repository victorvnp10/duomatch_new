/**
 * Aplicação: formatação do aviso de contagem regressiva da rodada ativa.
 *
 * Esta função era local ao componente `MainView` (`getRoundCountdownInfo`)
 * e misturava a decisão de negócio ("a rodada acaba hoje?") com a
 * formatação de tela (texto + classes de estilo). Extraída como função pura
 * para a camada de aplicação: não depende de React nem de infraestrutura,
 * só recebe a rodada ativa e a data de hoje.
 *
 * O fim da rodada é INCLUSIVO: comparar a data-string do fim (YYYY-MM-DD)
 * com hoje é exato. `Math.ceil` sobre `endDate + T23:59:59` nunca produzia
 * `diffDays === 0`, então o aviso "acaba hoje" nunca aparecia.
 */
export const getRoundCountdownInfo = (activeRound, todayStr) => {
  const baseClasses = "text-center text-sm mt-4";
  if (!activeRound) return { text: null, className: baseClasses };

  if (todayStr >= activeRound.endDate) {
    return {
      text: "A rodada acaba hoje!",
      className: `${baseClasses} text-yellow-400 font-bold`,
    };
  }

  const diffDays = Math.ceil(
    (new Date(activeRound.endDate).getTime() - new Date(todayStr).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const text =
    diffDays === 1
      ? "Falta 1 dia para acabar a rodada."
      : `Faltam ${diffDays} dias para acabar a rodada.`;
  return { text, className: `${baseClasses} text-gray-400 italic` };
};
