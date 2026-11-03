/**
 * 문제 → 교재 원문 연결. Precision over coverage: a passage is linked only when the
 * textbook wording clearly carries the answer, so the app never points at an
 * unrelated page. Questions without a confident match simply show no link.
 *
 *  - 빈칸형 "(   )": the passage must contain every answer word, and either overlap
 *    the question wording strongly or be the textbook's own definition line for it.
 *  - 진술형: the passage must contain most of the words of the 해설 (or the answer).
 */
import type { Question } from "@/types/question";

import { compact } from "./korean";
import type { Textbook, TextbookPassage } from "./textbook";

const BLANK = /\(\s*\)/;
const PARTICLE = /(은|는|이|가|을|를|의|에|에서|으로|로|와|과|도|만|이다|한다|된다|있다|없다)$/;
const BLANK_OVERLAP = 0.75;
const DEFINITION_OVERLAP = 0.5;
const STATEMENT_OVERLAP = 0.8;
const MIN_WORDS = 3;
const MIN_PASSAGE = 25;

function words(text: string): string[] {
  const list = text
    .replace(/[()（）'"‘’?·.,「」]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(PARTICLE, ""))
    .filter((w) => w.length >= 2);
  return [...new Set(list)];
}

function overlap(passage: string, list: string[]): number {
  if (list.length === 0) return 0;
  const body = compact(passage);
  return list.filter((w) => body.includes(compact(w))).length / list.length;
}

function partOf(q: Question): number {
  return Number(/^p(\d+)-/.exec(q.id)?.[1] ?? 0);
}

export function findQuestionPassage(q: Question, tb: Textbook): TextbookPassage | null {
  const part = partOf(q);
  const candidates = tb.passages.filter((p) => p.part === part && p.text.length >= MIN_PASSAGE && !p.text.startsWith("Q."));
  const answer = q.options[q.answer - 1];

  if (BLANK.test(q.question)) {
    const answerWords = answer
      .split(/[,·]/)
      .map((s) => compact(s))
      .filter(Boolean);
    const questionWords = words(q.question.replace(/\(\s*\)/g, " "));
    let best: { p: TextbookPassage; s: number } | null = null;
    for (const p of candidates) {
      const body = compact(p.text);
      if (!answerWords.every((a) => body.includes(a))) continue;
      const s = overlap(p.text, questionWords);
      const isDefinition = answerWords.length === 1 && body.startsWith(answerWords[0]);
      if ((s >= BLANK_OVERLAP || (isDefinition && s >= DEFINITION_OVERLAP)) && (!best || s > best.s)) best = { p, s };
    }
    return best?.p ?? null;
  }

  const basis = words(q.explanation ?? answer);
  if (basis.length < MIN_WORDS) return null;
  let best: { p: TextbookPassage; s: number } | null = null;
  for (const p of candidates) {
    const s = overlap(p.text, basis);
    if (s >= STATEMENT_OVERLAP && (!best || s > best.s)) best = { p, s };
  }
  return best?.p ?? null;
}
