"use client";

import { useEffect } from "react";

/** Clears this app's data, caches and service worker on mount (see guard-script). */
export function DeviceWipe() {
  useEffect(() => {
    void window.__fcqbWipe?.();
  }, []);
  return null;
}
