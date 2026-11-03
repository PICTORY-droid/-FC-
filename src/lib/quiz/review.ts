import type { OptionNumber, Question } from "@/types/question";

export type ReviewFilter = "all" | "wrong" | "correct";

export interface ReviewItem {
  question: Question;
  pick: OptionNumber;
  isCorrect: boolean;
}

/** Questions the learner actually answered (skipped ones excluded), in book order. */
export function buildReview(questions: Question[], picks: Record<string, OptionNumber>): ReviewItem[] {
  const items: ReviewItem[] = [];
  for (const question of questions) {
    const pick = picks[question.id];
    if (pick === undefined) continue;
    items.push({ question, pick, isCorrect: pick === question.answer });
  }
  return items;
}

export function filterReview(items: ReviewItem[], filter: ReviewFilter): ReviewItem[] {
  if (filter === "all") return items;
  return items.filter((item) => (filter === "correct" ? item.isCorrect : !item.isCorrect));
}
