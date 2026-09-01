import { useEffect, useRef } from "react";
import {
  getNotificationPermission,
  showSystemNotification,
  seedNotificationSeen,
  setAppBadge,
} from "./systemNotifications";

// Dispara quando o usuário NÃO está olhando o app (segundo plano,
// aba/minimizado). Quem está com o app aberto e focado já vê o sino e os
// toasts — mostrar popup do sistema seria redundante e irritante.
const appIsInBackground = () =>
  typeof document !== "undefined" && !document.hasFocus();

/**
 * Ponte de notificações PWA.
 *
 * Observa (1) a Central de Notificações derivada (pendências que existem
 * de verdade, não toasts) e (2) novas mensagens de chat do parceiro, e:
 *  - no mount, marca as pendências já existentes como "vistas" (sem spam);
 *  - quando um item NOVO aparece com o app sem foco, dispara notificação
 *    do sistema; com o app focado, retém a pendência e dispara quando o
 *    usuário volta a trocar de aba/minimizar;
 *  - clicar na notificação foca o app e navega para a view alvo;
 *  - mantém o badge do ícone do PWA instalado sincronizado com a contagem.
 */
export function usePwaNotifications({
  notifications = [],
  count = 0,
  chatNotification,
  onNavigate,
}) {
  const seededRef = useRef(false);
  const pendingRef = useRef(new Map()); // id -> payload de notificação
  const onNavigateRef = useRef(onNavigate);
  onNavigateRef.current = onNavigate;

  // Semeia o dedup com as pendências que JÁ existiam ao abrir o app,
  // para não notificar sobre coisas antigas.
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    seedNotificationSeen(notifications.map((n) => n.id));
  }, [notifications]);

  // Itens NOVOS da Central de Notificações.
  useEffect(() => {
    if (getNotificationPermission() !== "granted") return;

    const currentIds = new Set(notifications.map((n) => n.id));
    // Limpa pendências que deixaram de ser verdade (ex.: confirmei a
    // atividade que o parceiro tinha marcado). Nunca remove chat pendente.
    pendingRef.current.forEach((_, id) => {
      if (!id.startsWith("chat:") && !currentIds.has(id)) {
        pendingRef.current.delete(id);
      }
    });

    notifications.forEach((n) => {
      const payload = {
        title: n.title,
        body: n.message,
        onClick: () => n.targetView && onNavigateRef.current(n.targetView),
      };
      if (appIsInBackground()) {
        showSystemNotification(n.id, payload);
      } else {
        pendingRef.current.set(n.id, payload);
      }
    });
  }, [notifications]);

  // Nova mensagem de chat do parceiro (vinda do useChat).
  useEffect(() => {
    const chat = chatNotification;
    if (!chat?.visible || !chat.activityId) return;
    if (getNotificationPermission() !== "granted") return;

    const id = `chat:${chat.activityId}:${chat.text}`;
    const payload = {
      title: `Nova mensagem em "${chat.activityName}"`,
      body: chat.text,
      onClick: () => onNavigateRef.current("main"),
    };
    if (appIsInBackground()) {
      showSystemNotification(id, payload);
    } else {
      pendingRef.current.set(id, payload);
    }
  }, [chatNotification]);

  // Quando o usuário deixa de olhar o app, entrega as pendências retidas.
  useEffect(() => {
    const firePending = () => {
      if (!appIsInBackground()) return;
      pendingRef.current.forEach((payload, id) => {
        showSystemNotification(id, payload);
        pendingRef.current.delete(id);
      });
    };
    const events = ["visibilitychange", "blur"];
    events.forEach((event) => window.addEventListener(event, firePending));
    return () =>
      events.forEach((event) =>
        window.removeEventListener(event, firePending)
      );
  }, []);

  // Badge do PWA instalado = nº de pendências da central.
  useEffect(() => {
    setAppBadge(count);
  }, [count]);
}