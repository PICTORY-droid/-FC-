"use client";

import { useEffect } from "react";

/** Registers /sw.js once in production so the app can be installed and opened offline. */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    if (window.location.pathname.startsWith("/login")) return; // 입장 후에만 오프라인 저장 시작
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      /* registration failure only disables offline mode */
    });
  }, []);
  return null;
}
