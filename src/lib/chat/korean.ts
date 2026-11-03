/** Small Korean text helpers for natural-sounding template replies. */

import { josa as pickJosa } from "es-hangul";

type JosaPair = Parameters<typeof pickJosa>[1];

/**
 * Particle (조사) selection via es-hangul (Toss, MIT): josa("정답", "은/는") → "정답은".
 * es-hangul reads the very last character, so trailing quotes/brackets are set aside
 * first: josa("'사회보험'", "이에요/예요") → "'사회보험'이에요".
 */
export function josa(word: string, pair: JosaPair): string {
  const [, base = "", tail = ""] = /^(.*?)(['"’‘)\]]*)$/.exec(word) ?? [];
  if (!base) return word;
  return `${word}${pickJosa(base, pair).slice(base.length)}`;
}

/** Space-insensitive comparison key. */
export function compact(text: string): string {
  return text.replace(/[\s·.,'"’‘()（）?!~]/g, "").toLowerCase();
}

/** Deterministic pick so the same question gets a stable but varied phrasing. */
export function pick<T>(items: readonly T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return items[Math.abs(h) % items.length];
}

export const MARKS = ["①", "②", "③", "④"] as const;
