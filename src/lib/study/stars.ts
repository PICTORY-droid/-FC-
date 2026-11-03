import { readJson, writeJson } from "@/lib/storage/safe-storage";

import { emitStudyChanged } from "./events";

export const STARS_KEY = "pqb:stars:v1";

export function readStars(): string[] {
  const saved = readJson<unknown>(STARS_KEY, []);
  return Array.isArray(saved) ? saved.filter((x): x is string => typeof x === "string") : [];
}

export function toggleStar(id: string): boolean {
  const stars = readStars();
  const on = !stars.includes(id);
  writeJson(STARS_KEY, on ? [...stars, id] : stars.filter((x) => x !== id));
  emitStudyChanged();
  return on;
}
