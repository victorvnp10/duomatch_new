/**
 * Retorna a próxima seleção de uma atividade normal.
 *
 * A seleção só pode ser desmarcada quando o registro confirmado pertence ao
 * dia atual. Uma seleção antiga deve ser substituída por uma nova marcação,
 * não interpretada como um clique de desmarcação.
 */
export const toggleActivitySelection = ({ selection, todayStr }) => {
  const isMarkedToday =
    selection?.status === "confirmed" && selection.date === todayStr;

  return isMarkedToday
    ? { status: null, date: null }
    : { status: "confirmed", date: todayStr };
};
