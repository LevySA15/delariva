"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { registrarPushToken } from "@/lib/supabase/push-actions";

export function PushRegistration() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let cancelled = false;
    const handles: { remove: () => void }[] = [];

    (async () => {
      const { PushNotifications } = await import("@capacitor/push-notifications");
      if (cancelled) return;

      handles.push(
        await PushNotifications.addListener("registration", (token) => {
          registrarPushToken(token.value);
        }),
      );
      handles.push(
        await PushNotifications.addListener("registrationError", (err) => {
          console.error("Erro ao registrar push notifications", err);
        }),
      );

      const perm = await PushNotifications.checkPermissions();
      let status = perm.receive;
      if (status === "prompt") {
        status = (await PushNotifications.requestPermissions()).receive;
      }
      if (status === "granted" && !cancelled) {
        await PushNotifications.register();
      }
    })();

    return () => {
      cancelled = true;
      handles.forEach((h) => h.remove());
    };
  }, []);

  return null;
}
