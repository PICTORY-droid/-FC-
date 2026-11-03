"use client";

import { useEffect } from "react";

/** Registers /sw.js once in production so the app can be installed and opened offline. */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      /* registration failure only disables offline mode */
    });
  }, []);
  return null;
}
