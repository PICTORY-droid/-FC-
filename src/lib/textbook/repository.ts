import "server-only";

import textbookJson from "@/data/textbook.json";

export interface GlossaryTerm {
  term: string;
  page: number;
  text: string;
}

/** 교재 '생명보험 용어해설' 용어 (원문 그대로) */
export function listGlossaryTerms(): GlossaryTerm[] {
  return (textbookJson as { terms: GlossaryTerm[] }).terms.map(({ term, page, text }) => ({ term, page, text }));
}
