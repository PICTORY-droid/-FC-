"use client";

import { useEffect, type RefObject } from "react";

/**
 * Keeps a focused input visible above the on-screen keyboard in mobile browsers
 * and WebViews. Uses visualViewport where available; the viewport meta tag
 * (interactive-widget=resizes-content) handles modern Android Chrome natively.
 */
export function useKeyboardSafeViewport(targetRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const target = targetRef.current;
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!target) return;

    let focused = false;
    const reveal = () => {
      if (!focused) return;
      target.scrollIntoView({ block: "end", behavior: "smooth" });
    };

    const onFocusIn = () => {
      focused = true;
      // Wait for the keyboard animation before measuring.
      window.setTimeout(reveal, 280);
    };
    const onFocusOut = () => {
      focused = false;
    };

    target.addEventListener("focusin", onFocusIn);
    target.addEventListener("focusout", onFocusOut);
    vv?.addEventListener("resize", reveal);

    return () => {
      target.removeEventListener("focusin", onFocusIn);
      target.removeEventListener("focusout", onFocusOut);
      vv?.removeEventListener("resize", reveal);
    };
  }, [targetRef]);
}
