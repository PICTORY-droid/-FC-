export type ChatRole = "user" | "assistant";

export interface ChatTurn {
  role: ChatRole;
  text: string;
}

/** A fact sentence rebuilt from a fill-in-the-blank question and its official answer. */
export interface GlossaryEntry {
  term: string;
  sentence: string;
  questionId: string;
  source: string;
}
