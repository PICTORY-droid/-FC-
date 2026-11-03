import { readJson, writeJson } from "@/lib/storage/safe-storage";

import { emitStudyChanged } from "./events";

export const TERMS_KNOWN_KEY = "pqb:terms-known:v1";

export function readKnownTerms(): string[] {
  const saved = readJson<unknown>(TERMS_KNOWN_KEY, []);
  return Array.isArray(saved) ? saved.filter((x): x is string => typeof x === "string") : [];
}

export function setTermKnown(term: string, known: boolean): void {
  const list = readKnownTerms().filter((t) => t !== term);
  writeJson(TERMS_KNOWN_KEY, known ? [...list, term] : list);
  emitStudyChanged();
}
