import React from "react";
import { usePwaNotifications } from "./usePwaNotifications";

/**
 * Componente ponte (sem UI) que conecta a Central de Notificações e o chat
 * às notificações do sistema + badge do PWA instalado.
 */
export default function PwaNotificationBridge(props) {
  usePwaNotifications(props);
  return null;
}