/**
 * 오늘의 10문제 — the same 10 questions all day (Korea date), drawn first from the
 * 오답노트, then from questions never tried, then from the rest. Finishing all ten
 * earns that day's postmark stamp.
 */
import { readJson, writeJson } from "@/lib/storage/safe-storage";
import type { OptionNumber, Question } from "@/types/question";

import { emitStudyChanged } from "./events";
import { hashString, seededRandom, shuffled } from "./random";
import { isInWrongNote, type Records } from "./records";

export const DAILY_KEY = "pqb:daily:v1";
export const DAILY_COUNT = 10;

export interface DailyState {
  date: string;
  ids: string[];
  picks: Record<string, OptionNumber>;
  stamps: string[];
}

const EMPTY: DailyState = { date: "", ids: [], picks: {}, stamps: [] };

/** "2026-11-03" in Korea time. */
export function koreaDate(now = Date.now()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(now));
}

function pickToday(questions: Question[], records: Records, date: string): string[] {
  const random = seededRandom(hashString(`daily|${date}`));
  const wrong = shuffled(questions.filter((q) => isInWrongNote(records[q.id])), random);
  const fresh = shuffled(questions.filter((q) => !records[q.id]), random);
  const rest = shuffled(questions.filter((q) => records[q.id] && !isInWrongNote(records[q.id])), random);
  return [...wrong, ...fresh, ...rest].slice(0, DAILY_COUNT).map((q) => q.id);
}

export function readDaily(): DailyState {
  const saved = readJson<Partial<DailyState> | null>(DAILY_KEY, null);
  return {
    date: typeof saved?.date === "string" ? saved.date : "",
    ids: Array.isArray(saved?.ids) ? saved.ids : [],
    picks: saved?.picks && typeof saved.picks === "object" ? saved.picks : {},
    stamps: Array.isArray(saved?.stamps) ? saved.stamps : [],
  };
}

/** Today's set, creating it on the first visit of the day. */
export function ensureToday(questions: Question[], records: Records, now = Date.now()): DailyState {
  const date = koreaDate(now);
  const state = readDaily();
  if (state.date === date && state.ids.length > 0) return state;
  const next: DailyState = { ...EMPTY, stamps: state.stamps, date, ids: pickToday(questions, records, date) };
  writeJson(DAILY_KEY, next);
  return next;
}

export function saveDailyPicks(picks: Record<string, OptionNumber>): void {
  const state = readDaily();
  writeJson(DAILY_KEY, { ...state, picks });
}

/** Adds today's stamp once all of today's questions are answered. Returns true when newly stamped. */
export function stampToday(now = Date.now()): boolean {
  const state = readDaily();
  const date = koreaDate(now);
  if (state.date !== date || state.stamps.includes(date)) return false;
  if (!state.ids.every((id) => state.picks[id] !== undefined)) return false;
  writeJson(DAILY_KEY, { ...state, stamps: [...state.stamps, date].slice(-366) });
  emitStudyChanged();
  return true;
}

/** Consecutive stamped days ending today (or yesterday, if today isn't done yet). */
export function streakDays(stamps: string[], now = Date.now()): number {
  const set = new Set(stamps);
  const day = 24 * 60 * 60 * 1000;
  let cursor = set.has(koreaDate(now)) ? now : now - day;
  let count = 0;
  while (set.has(koreaDate(cursor))) {
    count += 1;
    cursor -= day;
  }
  return count;
}
