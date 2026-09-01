import React from "react";
import { usePwaNotifications } from "./usePwaNotifications";
import { usePushSubscription } from "./usePushSubscription";

/**
 * Componente ponte (sem UI) que conecta a Central de Notificações e o chat
 * às notificações do sistema + badge do PWA instalado + assinatura do Web
 * Push (FCM) para notificações "com app fechado".
 */
export default function PwaNotificationBridge(props) {
  usePwaNotifications(props);
  usePushSubscription({
    enabled: Boolean(props.pushEnabled && props.userId),
    userId: props.userId,
  });
  return null;
}