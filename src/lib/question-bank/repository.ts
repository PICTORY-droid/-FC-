import "server-only";

import bankJson from "@/data/question-bank.json";
import type { OptionNumber, Part, PartSummary, Question, QuestionBank } from "@/types/question";

const bank = bankJson as QuestionBank;

const QUESTION_ID_PATTERN = /^p([1-9])-(\d{1,3})$/;

export function getSource(): string {
  return bank.source;
}

export function listParts(): PartSummary[] {
  return bank.parts.map(({ part, title, pages, questions }) => ({
    part,
    title,
    pages,
    total: questions.length,
  }));
}

export function getPart(partNo: number): Part | null {
  return bank.parts.find((p) => p.part === partNo) ?? null;
}

export function getQuestionById(id: string): { part: Part; question: Question } | null {
  const match = QUESTION_ID_PATTERN.exec(id);
  if (!match) return null;
  const part = getPart(Number(match[1]));
  if (!part) return null;
  const question = part.questions.find((q) => q.id === id);
  return question ? { part, question } : null;
}

/** Every PART with its questions — for menus that mix questions across PARTs. */
export function listFullParts(): Part[] {
  return bank.parts;
}

/** question id → correct option, for screens that only need grading data. */
export function answerKey(): Record<string, OptionNumber> {
  return Object.fromEntries(bank.parts.flatMap((p) => p.questions.map((q) => [q.id, q.answer])));
}
