/**
 * Notificações do sistema (sem backend) — Notification API + App Badging.
 *
 * COBERTURA (limite honesto): as notificações disparam enquanto uma aba com
 * o app está aberta — em primeiro plano ou em segundo plano (PWA instalado
 * costuma continuar vivo no background). Com o app totalmente fechado ou
 * sem conexão, nada é garantido sem Web Push (FCM), que fica fora do
 * escopo atual.
 *
 * O serviço é puro (sem React): cuida de suporte, permissão, dedup por
 * evento e clique (define o foco e reencaminha para a navegação do app).
 */

// Dedup de eventos já notificados na sessão (evita disparos repetidos do
// mesmo item em cada re-render).
const notifiedIds = new Set();

// Handlers de clique por id da notificação.
const clickHandlers = new Map();

export const isSystemNotificationsSupported = () =>
  typeof window !== "undefined" && "Notification" in window;

export const getNotificationPermission = () => {
  if (!isSystemNotificationsSupported()) return "unsupported";
  return Notification.permission;
};

export const requestNotificationPermission = async () => {
  if (!isSystemNotificationsSupported()) return "unsupported";
  if (Notification.permission === "default") {
    try {
      return await Notification.requestPermission();
    } catch (error) {
      return Notification.permission;
    }
  }
  return Notification.permission;
};

// Ícones do manifest são servidos da raiz do app (HTTPS obrigatório).
const iconUrl = (name) => `${window.location.origin}/${name}`;

/**
 * Exibe uma notificação do sistema se a permissão estiver concedida e o
 * evento ainda não tiver sido notificado nesta sessão.
 *
 * @param {string} id        Chave única do evento (usada no dedup).
 * @param {{title, body, onClick}} options
 * @returns {boolean} true se exibiu, false se ignorada.
 */
export const showSystemNotification = (id, { title, body, onClick } = {}) => {
  if (!isSystemNotificationsSupported()) return false;
  if (getNotificationPermission() !== "granted") return false;
  if (notifiedIds.has(id)) return false;

  notifiedIds.add(id);
  try {
    const notification = new Notification(title, {
      body: body || "",
      icon: iconUrl("logo192.png"),
      badge: iconUrl("icons/maskable-192.png"),
      tag: `duomatch-${id}`,
      silent: false,
    });
    if (onClick) {
      clickHandlers.set(id, onClick);
      notification.onclick = () => {
        window.focus();
        clickHandlers.get(id)?.();
        clickHandlers.delete(id);
        notification.close();
      };
    }
    return true;
  } catch (error) {
    // Construtor pode falhar em contexto não seguro — tenta de novo depois.
    notifiedIds.delete(id);
    return false;
  }
};

/** Marca ids como "já notificados" (usado para não spamar itens antigos). */
export const seedNotificationSeen = (ids) => {
  ids.forEach((id) => notifiedIds.add(id));
};

/**
 * Sincroniza o badge do ícone do PWA instalado com o número de pendências.
 * Requer contexto seguro + navegador com suporte (Chrome/Edge); senão, no-op.
 */
export const setAppBadge = async (count = 0) => {
  try {
    if (typeof navigator === "undefined") return;
    if (count > 0 && navigator.setAppBadge) {
      await navigator.setAppBadge(count);
    } else if (count <= 0 && navigator.clearAppBadge) {
      await navigator.clearAppBadge();
    }
  } catch (error) {
    // Sem suporte ou bloqueado por política de privacidade — silencioso.
  }
};