/**
 * Per-question answer history across every screen (PART 풀이, 오답노트, 오늘의 10문제,
 * 즐겨찾기, 모의고사). Stored on this device only.
 *
 * 오답노트 rule: a question joins once it has been answered wrong, and "graduates"
 * after GRADUATE_STREAK correct answers in a row.
 */
import { progressKey, readJson, writeJson } from "@/lib/storage/safe-storage";
import type { OptionNumber } from "@/types/question";

import { emitStudyChanged } from "./events";

export const RECORDS_KEY = "pqb:records:v1";
/** Set once older per-PART progress has been folded into the records. */
const MIGRATED_KEY = "pqb:records-migrated:v1";
export const GRADUATE_STREAK = 2;

export interface QuestionRecord {
  /** total attempts */
  a: number;
  /** wrong attempts */
  w: number;
  /** current run of correct answers */
  s: number;
  /** was the latest attempt correct */
  l: boolean;
  /** latest attempt time (ms) */
  t: number;
}

export type Records = Record<string, QuestionRecord>;

const PART_NUMBERS = [1, 2, 3];

/** Builds history from per-PART progress saved before records existed (one-time). */
function migrate(answers: Record<string, OptionNumber>): Records {
  const records: Records = {};
  for (const part of PART_NUMBERS) {
    const saved = readJson<{ picks?: Record<string, number> } | null>(progressKey(part), null);
    for (const [id, pick] of Object.entries(saved?.picks ?? {})) {
      const answer = answers[id];
      if (!answer) continue;
      const ok = pick === answer;
      records[id] = { a: 1, w: ok ? 0 : 1, s: ok ? 1 : 0, l: ok, t: Date.now() };
    }
  }
  return records;
}

/** @param answers question id → correct option, used only for the first-run migration */
export function readRecords(answers: Record<string, OptionNumber>): Records {
  const saved = readJson<Records | null>(RECORDS_KEY, null);
  const records = saved && typeof saved === "object" ? saved : {};
  if (readJson<boolean>(MIGRATED_KEY, false)) return records;
  // 기존 PART 풀이 기록을 한 번만 합침 (이미 있는 기록이 우선)
  const merged = { ...migrate(answers), ...records };
  writeJson(RECORDS_KEY, merged);
  writeJson(MIGRATED_KEY, true);
  return merged;
}

export function recordAnswer(id: string, correct: boolean, now = Date.now()): void {
  const records = readJson<Records>(RECORDS_KEY, {});
  const prev = records[id] ?? { a: 0, w: 0, s: 0, l: false, t: 0 };
  records[id] = {
    a: prev.a + 1,
    w: prev.w + (correct ? 0 : 1),
    s: correct ? prev.s + 1 : 0,
    l: correct,
    t: now,
  };
  writeJson(RECORDS_KEY, records);
  emitStudyChanged();
}

export function isInWrongNote(r: QuestionRecord | undefined): boolean {
  return !!r && r.w > 0 && r.s < GRADUATE_STREAK;
}

export function isGraduated(r: QuestionRecord | undefined): boolean {
  return !!r && r.w > 0 && r.s >= GRADUATE_STREAK;
}
