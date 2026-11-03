import type { OptionNumber, Question } from "@/types/question";

export type Picks = Record<string, OptionNumber>;

export interface QuizStats {
  answered: number;
  correct: number;
  wrongIds: string[];
}

export function computeStats(questions: Question[], picks: Picks): QuizStats {
  let answered = 0;
  let correct = 0;
  const wrongIds: string[] = [];
  for (const q of questions) {
    const pick = picks[q.id];
    if (pick === undefined) continue;
    answered += 1;
    if (pick === q.answer) correct += 1;
    else wrongIds.push(q.id);
  }
  return { answered, correct, wrongIds };
}
