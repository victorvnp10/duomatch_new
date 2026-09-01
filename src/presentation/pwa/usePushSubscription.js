import { useEffect, useRef } from "react";
import { getNotificationPermission } from "./systemNotifications";
import { ensurePushSubscription, hasPushEnvironment } from "./pushSubscription";

/**
 * Hook de ponte: dispara o registro do Web Push quando o ambiente permite.
 *
 * Gatilhos: (1) usuário logado + casal vinculado + permissão já concedida
 * (ex.: abriu o app e já tinha liberado antes); (2) event
 * `duomatch:push-optin` (disparado pelo NotificationCenter logo após o
 * usuário tocar em "Ativar notificações").
 *
 * Tenta no máximo uma vez por condição; se falhar de forma transitória,
 * re-arma para a próxima oportunidade.
 *
 * @param {{ enabled: boolean, userId: string|null }} props
 */
export function usePushSubscription({ enabled, userId }) {
  const optsRef = useRef({ enabled, userId });
  optsRef.current = { enabled, userId };
  const subscribedRef = useRef(false);

  const maybeSubscribe = () => {
    const { enabled: isEnabled, userId: uid } = optsRef.current;
    if (!isEnabled || !uid) return;
    if (subscribedRef.current) return;
    if (getNotificationPermission() !== "granted") return;
    if (!hasPushEnvironment()) return;

    subscribedRef.current = true;
    ensurePushSubscription({ userId: uid }).then((token) => {
      if (!token) {
        // Falhou (transitório/sem suporte) — permite tentar de novo.
        subscribedRef.current = false;
      }
    });
  };

  useEffect(() => {
    maybeSubscribe();
    const handler = () => maybeSubscribe();
    window.addEventListener("duomatch:push-optin", handler);
    return () => window.removeEventListener("duomatch:push-optin", handler);
  }, []);
}