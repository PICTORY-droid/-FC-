export type OptionNumber = 1 | 2 | 3 | 4;

export interface Question {
  id: string;
  no: number;
  question: string;
  options: [string, string, string, string];
  answer: OptionNumber;
  explanation: string | null;
}

export interface Part {
  part: number;
  title: string;
  pages: string;
  questions: Question[];
}

export interface QuestionBank {
  source: string;
  version: string;
  parts: Part[];
}

/** Lightweight part info for listing screens (no question payload). */
export interface PartSummary {
  part: number;
  title: string;
  pages: string;
  total: number;
}
