/** 학습 리포트 집계 — 기기에 저장된 기록만으로 계산 */
import type { Part } from "@/types/question";

import { isGraduated, isInWrongNote, type Records } from "./records";

export interface PartReport {
  part: number;
  title: string;
  total: number;
  /** 한 번이라도 푼 문항 수 */
  tried: number;
  /** 가장 최근 풀이가 정답인 문항 수 */
  correctNow: number;
  /** 최근 정답률(%) — 푼 문항 기준 */
  rate: number;
}

export interface StudyReport {
  parts: PartReport[];
  tried: number;
  total: number;
  wrongNote: number;
  graduated: number;
  /** 5문항 이상 푼 PART 중 정답률이 가장 낮은 PART */
  weakest: PartReport | null;
}

const MIN_FOR_WEAKEST = 5;

export function buildReport(parts: Part[], records: Records): StudyReport {
  let wrongNote = 0;
  let graduated = 0;
  const reports = parts.map((p) => {
    let tried = 0;
    let correctNow = 0;
    for (const q of p.questions) {
      const r = records[q.id];
      if (!r) continue;
      tried += 1;
      if (r.l) correctNow += 1;
      if (isInWrongNote(r)) wrongNote += 1;
      if (isGraduated(r)) graduated += 1;
    }
    return { part: p.part, title: p.title, total: p.questions.length, tried, correctNow, rate: tried ? Math.round((correctNow / tried) * 100) : 0 };
  });
  const eligible = reports.filter((r) => r.tried >= MIN_FOR_WEAKEST);
  const weakest = eligible.length > 1 ? eligible.reduce((a, b) => (b.rate < a.rate ? b : a)) : null;
  return {
    parts: reports,
    tried: reports.reduce((n, r) => n + r.tried, 0),
    total: reports.reduce((n, r) => n + r.total, 0),
    wrongNote,
    graduated,
    weakest,
  };
}
