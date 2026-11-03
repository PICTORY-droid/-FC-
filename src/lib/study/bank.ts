import type { OptionNumber, Part, Question } from "@/types/question";

/** Lookups over the full question bank, built once per screen. */
export interface BankIndex {
  parts: Part[];
  questions: Question[];
  byId: Map<string, Question>;
  partOf: (id: string) => Part | undefined;
  answers: Record<string, OptionNumber>;
}

export function indexBank(parts: Part[]): BankIndex {
  const questions = parts.flatMap((p) => p.questions);
  const partById = new Map(parts.flatMap((p) => p.questions.map((q) => [q.id, p] as const)));
  return {
    parts,
    questions,
    byId: new Map(questions.map((q) => [q.id, q])),
    partOf: (id) => partById.get(id),
    answers: Object.fromEntries(questions.map((q) => [q.id, q.answer])),
  };
}
