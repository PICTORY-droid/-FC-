/** localStorage wrapper that never throws (private mode, blocked storage, SSR). */
export function readJson<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — progress simply isn't persisted */
  }
}

export function removeKey(key: string): void {
  try {
    if (typeof window !== "undefined") window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const progressKey = (part: number) => `pqb:progress:p${part}:v1`;

/** 마지막으로 풀던 PART (앱을 다시 열었을 때 이어풀기 안내용) */
export const LAST_PART_KEY = "pqb:last-part:v1";
export interface LastPart {
  part: number;
  at: number;
}

/** 풀이 기록이 바뀌었음을 같은 화면의 다른 컴포넌트에 알리는 이벤트 이름 */
export const PROGRESS_CHANGED_EVENT = "pqb:progress-changed";
