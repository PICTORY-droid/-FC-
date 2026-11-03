/**
 * 실전 모의고사 — questions drawn at random from every PART in proportion to its size,
 * with a time limit. An unfinished exam survives closing the app; results are kept
 * for the 학습 리포트.
 */
import { readJson, removeKey, writeJson } from "@/lib/storage/safe-storage";
import type { OptionNumber, Part } from "@/types/question";

import { emitStudyChanged } from "./events";
import { shuffled } from "./random";

export const EXAM_ACTIVE_KEY = "pqb:exam-active:v1";
export const EXAM_HISTORY_KEY = "pqb:exam-history:v1";
export const EXAM_SIZES = [20, 40, 60] as const;
/** 문항당 제한 시간(초) */
export const SECONDS_PER_QUESTION = 60;
const HISTORY_LIMIT = 10;

export interface ActiveExam {
  ids: string[];
  picks: Record<string, OptionNumber>;
  startedAt: number;
  limitSec: number;
}

export interface PartScore {
  part: number;
  total: number;
  correct: number;
}

export interface ExamResult {
  at: number;
  total: number;
  correct: number;
  answered: number;
  durationSec: number;
  parts: PartScore[];
}

/** Splits `size` across parts by their question counts (largest remainder), then draws at random. */
export function drawExam(parts: Part[], size: number): string[] {
  const all = parts.reduce((n, p) => n + p.questions.length, 0);
  const quotas = parts.map((p) => {
    const exact = (size * p.questions.length) / all;
    return { part: p, n: Math.floor(exact), rem: exact - Math.floor(exact) };
  });
  let left = size - quotas.reduce((n, q) => n + q.n, 0);
  for (const q of [...quotas].sort((a, b) => b.rem - a.rem)) {
    if (left-- <= 0) break;
    q.n += 1;
  }
  return quotas.flatMap((q) => shuffled(q.part.questions).slice(0, q.n).map((x) => x.id));
}

export function startExam(parts: Part[], size: number, now = Date.now()): ActiveExam {
  const exam: ActiveExam = { ids: drawExam(parts, size), picks: {}, startedAt: now, limitSec: size * SECONDS_PER_QUESTION };
  writeJson(EXAM_ACTIVE_KEY, exam);
  return exam;
}

export function readActiveExam(): ActiveExam | null {
  const saved = readJson<ActiveExam | null>(EXAM_ACTIVE_KEY, null);
  return saved && Array.isArray(saved.ids) && saved.ids.length > 0 && typeof saved.startedAt === "number" ? saved : null;
}

export function saveExamPicks(picks: Record<string, OptionNumber>): void {
  const exam = readActiveExam();
  if (exam) writeJson(EXAM_ACTIVE_KEY, { ...exam, picks });
}

export function remainingSec(exam: ActiveExam, now = Date.now()): number {
  return Math.max(0, exam.limitSec - Math.floor((now - exam.startedAt) / 1000));
}

export function gradeExam(exam: ActiveExam, answers: Map<string, OptionNumber>, now = Date.now()): ExamResult {
  const byPart = new Map<number, PartScore>();
  let correct = 0;
  let answered = 0;
  for (const id of exam.ids) {
    const part = Number(/^p(\d+)-/.exec(id)?.[1] ?? 0);
    const score = byPart.get(part) ?? { part, total: 0, correct: 0 };
    score.total += 1;
    const pick = exam.picks[id];
    if (pick !== undefined) answered += 1;
    if (pick !== undefined && pick === answers.get(id)) {
      score.correct += 1;
      correct += 1;
    }
    byPart.set(part, score);
  }
  return {
    at: now,
    total: exam.ids.length,
    correct,
    answered,
    durationSec: Math.min(exam.limitSec, Math.floor((now - exam.startedAt) / 1000)),
    parts: [...byPart.values()].sort((a, b) => a.part - b.part),
  };
}

export function finishExam(result: ExamResult): void {
  removeKey(EXAM_ACTIVE_KEY);
  writeJson(EXAM_HISTORY_KEY, [...readExamHistory(), result].slice(-HISTORY_LIMIT));
  emitStudyChanged();
}

export function discardExam(): void {
  removeKey(EXAM_ACTIVE_KEY);
}

export function readExamHistory(): ExamResult[] {
  const saved = readJson<unknown>(EXAM_HISTORY_KEY, []);
  return Array.isArray(saved) ? (saved as ExamResult[]) : [];
}
