/**
 * Aplicação: seleção e ordenação das "Sugestões Especiais" exibidas na tela
 * principal.
 *
 * Regra que vivia inline em `MainView` (useMemo `sortedSpecialSuggestions`).
 * Extraída como função pura: recebe o mapa `dailySuggestions` e os ids dos
 * parceiros, devolve a lista filtrada e ordenada por nome.
 *
 * Observação: aqui `selections[uid]` é usado como STRING ("selected"), e não
 * como objeto `{ status, date }` — é o formato legado das sugestões
 * especiais. O comportamento original é preservado exatamente.
 */
export const getSortedSpecialSuggestions = (
  dailySuggestions,
  { userId, partnerId }
) => {
  if (!dailySuggestions) return [];

  return Object.values(dailySuggestions)
    .filter((activity) => {
      if (!activity || !activity.name) return false;
      // Se já teve match, não mostrar
      if (activity.matched) return false;
      // Se ambos selecionaram (mas ainda não processou o match), não mostrar
      const mySelection = activity.selections?.[userId];
      const partnerSelection = activity.selections?.[partnerId];
      if (mySelection === "selected" && partnerSelection === "selected")
        return false;
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};
