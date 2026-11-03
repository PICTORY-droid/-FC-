import MiniSearch from "minisearch";

import type { Definition, FactSentence, Knowledge } from "@/types/chat";
import type { Question, QuestionBank } from "@/types/question";

const BLANK = /\(\s{2,}\)/g;
/** "틀린 것은?", "아닌 것은?" — the three non-answer options are TRUE statements. */
const ASKS_FALSE = /틀린|잘못|않은|못한|아닌|없는/;
/** "맞는 것은?", "옳은 것은?" — the answer option is a TRUE statement. */
const ASKS_TRUE = /맞는|옳은|적절한 것은|가장 가까운|가장 적절/;
/** "사회보장제도란 …" */
const DEFINES = /^['"]?([가-힣A-Za-z0-9()·\s]{2,24}?)['"]?\s*(?:이)?란\s/;
/** "보험금에서 총 납입보험료를 차감한 것을 보험차익이라 한다" */
const DEFINES_AS = /(?:을|를)\s*['"]?([가-힣A-Za-z0-9()]{2,20}?)['"]?\s*(?:이)?라(?:고)?\s*한다/;

function cleanTerm(raw: string): string {
  return raw.replace(/\(.*?\)/g, "").replace(/['"’‘]/g, "").trim();
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=다\.?)\s+|(?=[①②③④])/)
    .map((s) => s.replace(/^[①②③④]\s*/, "").trim())
    .filter((s) => s.length >= 8);
}

/** Fill the stem's blanks with the official answer. Returns null when the answer can't be mapped cleanly. */
function fillStem(q: Question): { terms: string[]; sentence: string } | null {
  const blanks = q.question.match(BLANK)?.length ?? 0;
  if (blanks === 0) return null;
  const answerText = q.options[q.answer - 1];
  const terms = blanks === 1 ? [answerText] : answerText.split(/\s*,\s*/);
  if (terms.length !== blanks || terms.some((t) => !t || t.length > 24)) return null;
  let i = 0;
  return { terms, sentence: q.question.replace(BLANK, () => `'${terms[i++]}'`) };
}

/**
 * Builds the helper's knowledge from the question bank — only the textbook's own
 * true sentences, never generated text. Sentences that would reveal a question's
 * answer carry a hidden variant for use before that question is graded.
 */
export function buildKnowledge(bank: QuestionBank): Knowledge {
  const definitions: Definition[] = [];
  const facts: FactSentence[] = [];

  const addFact = (f: FactSentence) => {
    facts.push(f);
    const m = DEFINES.exec(f.text) ?? DEFINES_AS.exec(f.text);
    if (m) definitions.push({ ...f, term: cleanTerm(m[1]) });
  };

  for (const part of bank.parts) {
    for (const q of part.questions) {
      const source = `PART ${part.part} ${q.no}번`;
      const base = { questionId: q.id, source };

      const filled = fillStem(q);
      if (filled) {
        const fact = { ...base, text: filled.sentence, hiddenText: q.question };
        addFact(fact);
        for (const term of filled.terms) {
          if (!/^\d/.test(term)) definitions.push({ ...fact, term });
        }
      }

      if (q.explanation) {
        for (const s of splitSentences(q.explanation)) addFact({ ...base, text: s, hiddenText: null });
      }

      if (ASKS_FALSE.test(q.question)) {
        q.options.forEach((o, i) => {
          if (i + 1 !== q.answer && o.length >= 8) addFact({ ...base, text: o, hiddenText: null });
        });
      } else if (ASKS_TRUE.test(q.question)) {
        const o = q.options[q.answer - 1];
        if (o.length >= 8) addFact({ ...base, text: o, hiddenText: null });
      }
    }
  }
  // MiniSearch (MIT): BM25 ranking + prefix("보험차익" → "보험차익이") + 1-typo fuzzy.
  // 비교용으로는 정답을 숨긴 문장(hiddenText)도 함께 색인합니다.
  const index = new MiniSearch<{ id: number; text: string }>({ fields: ["text"], idField: "id" });
  index.addAll(facts.map((f, id) => ({ id, text: `${f.text} ${f.hiddenText ?? ""}` })));
  const searchFacts = (query: string) =>
    index
      .search(query, { prefix: true, fuzzy: (term) => (term.length >= 3 ? 1 : 0), combineWith: "AND" })
      .map((r) => facts[r.id as number]);

  return { definitions, facts, searchFacts };
}

let cache: Promise<Knowledge> | null = null;

/** Lazily loads the full bank only when the helper needs cross-question facts. */
export function loadKnowledge(): Promise<Knowledge> {
  cache ??= import("@/data/question-bank.json").then((m) => buildKnowledge(m.default as QuestionBank));
  return cache;
}
