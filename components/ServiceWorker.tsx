"use client";

import { useEffect } from "react";

/** Registra el service worker solo en producción (en desarrollo rompería el HMR). */
export default function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        // Sin service worker la app funciona igual, solo que no offline.
      });
  }, []);

  return null;
}
