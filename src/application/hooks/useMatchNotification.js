import { useEffect, useState } from "react";

/**
 * Extrai o nome da atividade de um CustomEvent de match.
 *
 * Formatos suportados no `detail`: string (formato legado, dispatch em
 * useSuggestions/useActivities) ou objeto `{ activityName }`. Este parsing
 * estava duplicado, idêntico, em MainView.js e HotZone.js.
 */
export const extractMatchActivityName = (event) => {
  const detail = event?.detail;
  if (typeof detail === "string") return detail;
  return detail?.activityName || "";
};

/**
 * Estado + listener do overlay de notificação de match.
 *
 * Antes, MainView e HotZone registravam, cada um, o seu próprio listener para
 * o evento global `activityMatch` (HotZone também para `hotActivityMatch`),
 * com corpo de handler idêntico. As duas views são mutuamente exclusivas
 * (`renderCurrentView` no DuoMatchApp monta só uma por vez), então nunca
 * houve efeito duplicado em runtime — mas o código era duplicado.
 *
 * Este hook é a fonte única. O estado permanece POR INSTÂNCIA (cada view tem
 * o seu), não é compartilhado nem movido entre componentes.
 *
 * @param {string[]} eventNames eventos a escutar (default: ["activityMatch"]).
 * @param {Function} extractActivityName parser estável; permite preservar contratos legados.
 */
export function useMatchNotification(
  eventNames = ["activityMatch"],
  extractActivityName = extractMatchActivityName
) {
  const [matchedActivityName, setMatchedActivityName] = useState("");
  const [showMatchNotification, setShowMatchNotification] = useState(false);

  // Chave estável: os consumidores passam arrays literais a cada render, então
  // dependemos da string (não da identidade do array) para registrar uma vez.
  const eventNamesKey = eventNames.join(",");

  useEffect(() => {
    const handleMatchEvent = (event) => {
      setMatchedActivityName(extractActivityName(event));
      setShowMatchNotification(true);
    };

    const names = eventNamesKey.split(",");
    names.forEach((name) => window.addEventListener(name, handleMatchEvent));
    return () => {
      names.forEach((name) =>
        window.removeEventListener(name, handleMatchEvent)
      );
    };
  }, [eventNamesKey, extractActivityName]);

  const hideMatchNotification = () => setShowMatchNotification(false);

  return { showMatchNotification, matchedActivityName, hideMatchNotification };
}
