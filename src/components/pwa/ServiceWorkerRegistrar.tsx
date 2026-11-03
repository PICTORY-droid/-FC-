"use client";

import { useEffect } from "react";

import { PUBLIC_PATHS } from "@/lib/access/guard-script";

/** Registers /sw.js once in production so the app can be installed and opened offline. */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    const first = window.location.pathname.split("/")[1] ?? "";
    if ((PUBLIC_PATHS as readonly string[]).includes(first)) return; // 입장 후에만 오프라인 저장 시작
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      /* registration failure only disables offline mode */
    });
  }, []);
  return null;
}
