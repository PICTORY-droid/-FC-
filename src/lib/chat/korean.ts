/** Small Korean text helpers for natural-sounding template replies. */

function hasFinalConsonant(word: string): boolean {
  const last = word.trim().replace(/[\s'"’‘)\]]+$/, "").slice(-1);
  const code = last.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 !== 0;
  if (/[0-9]/.test(last)) return "013678".includes(last); // 영, 일, 삼, 육, 칠, 팔
  return false;
}

/** Attach the right particle: josa("정답", "은", "는") → "정답은" */
export function josa(word: string, withFinal: string, withoutFinal: string): string {
  return `${word}${hasFinalConsonant(word) ? withFinal : withoutFinal}`;
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
