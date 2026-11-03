import type { GlossaryEntry } from "@/types/chat";
import type { QuestionBank } from "@/types/question";

const BLANK = /\(\s{2,}\)/g;

/**
 * Turns every fill-in-the-blank question into a fact sentence using the official answer,
 * e.g. "…확률을 예측한 것이 (   )이다." + "예정위험률" → "…확률을 예측한 것이 '예정위험률'이다."
 * Only the textbook's own words are used — nothing is generated.
 */
export function buildGlossary(bank: QuestionBank): GlossaryEntry[] {
  const entries: GlossaryEntry[] = [];
  for (const part of bank.parts) {
    for (const q of part.questions) {
      const blanks = q.question.match(BLANK)?.length ?? 0;
      if (blanks === 0) continue;
      const answerText = q.options[q.answer - 1];
      const terms = blanks === 1 ? [answerText] : answerText.split(/\s*,\s*/);
      if (terms.length !== blanks || terms.some((t) => !t || t.length > 24)) continue;

      let i = 0;
      const sentence = q.question.replace(BLANK, () => `'${terms[i++]}'`);
      const source = `PART ${part.part} ${q.no}번`;
      for (const term of terms) {
        if (/^\d/.test(term)) continue; // 숫자·기간 정답은 용어 사전에서 제외
        entries.push({ term, sentence, questionId: q.id, source });
      }
    }
  }
  return entries;
}

let cache: Promise<GlossaryEntry[]> | null = null;

/** Lazily loads the full bank only when the helper needs cross-question facts. */
export function loadGlossary(): Promise<GlossaryEntry[]> {
  cache ??= import("@/data/question-bank.json").then((m) => buildGlossary(m.default as QuestionBank));
  return cache;
}
