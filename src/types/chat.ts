export type ChatRole = "user" | "assistant";

export interface ChatTurn {
  role: ChatRole;
  text: string;
}

/** A true sentence taken from the textbook data (filled-in stem, explanation, or a confirmed-true option). */
export interface FactSentence {
  text: string;
  /** Same sentence with the answer hidden — used for the current question before it is graded. */
  hiddenText: string | null;
  questionId: string;
  source: string;
}

/** A term the textbook defines ("○○란 …", "…을 ○○이라 한다"). */
export interface Definition extends FactSentence {
  term: string;
}

export interface Knowledge {
  definitions: Definition[];
  facts: FactSentence[];
  /** Ranked full-text search over facts (prefix + 1-typo tolerant). */
  searchFacts: (query: string) => FactSentence[];
}
