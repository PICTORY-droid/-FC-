/**
 * Rule-based structured summary of a textbook passage: no generation, only the
 * textbook's own clauses — trimmed, split into short bullet points and given
 * concise endings ("~한다." → "~함").
 */

const MAX_POINTS = 4;
const LONG_CLAUSE = 55;
const MIN_PIECE = 14;

const ENDINGS: [RegExp, string][] = [
  // 존댓말 종결 먼저 (일반 '다.' 규칙보다 앞서야 함)
  [/합니다\.?$/, "함"],
  [/됩니다\.?$/, "됨"],
  [/봅니다\.?$/, "봄"],
  [/드립니다\.?$/, "드림"],
  [/있습니다\.?$/, "있음"],
  [/없습니다\.?$/, "없음"],
  [/않습니다\.?$/, "않음"],
  [/입니다\.?$/, ""],
  [/(이라|라)고\s*한다\.?$/, "이라고 함"],
  [/(이라|라)\s*한다\.?$/, "이라 함"],
  [/말한다\.?$/, "말함"],
  [/된다\.?$/, "됨"],
  [/한다\.?$/, "함"],
  [/있다\.?$/, "있음"],
  [/없다\.?$/, "없음"],
  [/않는다\.?$/, "않음"],
  [/않다\.?$/, "않음"],
  [/(이)?다\.?$/, ""],
  // 문장 중간에서 자른 연결어미 → 짧은 명사형
  [/것으로서$|것으로$/, "것"],
  [/(으로서|로서)$/, ""],
  [/하지만$|하나$/, "함"],
  [/하며$|하고$/, "함"],
  [/되며$|되고$/, "됨"],
  [/이며$/, "임"],
  [/있으나$|있지만$/, "있음"],
  [/(으나|지만)$/, ""],
];

const LEAD_FILLER = /^(이는|이것은|이 때|이때|즉|따라서|또한|그리고)\s*,?\s*/;

function stripLongParens(text: string): string {
  let prev = "";
  let t = text;
  while (prev !== t) {
    prev = t;
    t = t.replace(/\([^()]{14,}\)/g, "");
  }
  return t.replace(/\s+/g, " ");
}

function concise(clause: string): string {
  let c = clause
    .replace(/^\s*(Q\.|A\.|예\))\s*/, "")
    .replace(LEAD_FILLER, "")
    .replace(/^다만,?\s*/, "단, ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[,;:]$/, "");
  for (const [re, to] of ENDINGS) {
    if (re.test(c)) {
      c = c.replace(re, to).trim();
      break;
    }
  }
  return c.replace(/\s*[.。]$/, "");
}

function sentences(text: string): string[] {
  return text
    .replace(/([①②③④⑤⑥⑦]|(?:^|\s)\d+\.\s)/g, "\n$1")
    .split(/(?<=[다요음함]\.)\s+|\n|(?<=\.)\s+(?=[A-Z가-힣])/)
    .map((s) => s.replace(/^[①②③④⑤⑥⑦]\s*|^\s*\d+\.\s*/, "").trim())
    .filter((s) => s.length >= 4);
}

/** Splits one long sentence at natural joints (",", "하며", "하고", "으로서") into readable pieces. */
function splitLong(sentence: string): string[] {
  if (sentence.length <= LONG_CLAUSE) return [sentence];
  const parts = sentence
    .split(/(?<=으로서|로서|하며|이며|하고|되며|으나|지만|는데|데|경우),?\s+|,\s+(?=[가-힣]{2,}[이가은는을를])/)
    .map((s) => s.trim())
    .filter(Boolean);
  // 너무 짧은 조각("보험계약의 경우")은 다음 조각과 다시 합침
  const merged: string[] = [];
  for (const part of parts) {
    const prev = merged[merged.length - 1];
    if (prev !== undefined && prev.length < MIN_PIECE) merged[merged.length - 1] = `${prev} ${part}`;
    else merged.push(part);
  }
  if (merged.length >= 2 && merged[merged.length - 1].length < MIN_PIECE) {
    const last = merged.pop()!;
    merged[merged.length - 1] += ` ${last}`;
  }
  return merged.length >= 2 ? merged : [sentence];
}

export interface Summary {
  points: string[];
  /** 원문이 길어 일부를 줄였는지 */
  trimmed: boolean;
}

export function summarize(text: string, term?: string): Summary {
  let source = stripLongParens(text);
  // "언더라이팅(…)이란 ~" 처럼 용어로 시작하는 정의문은 용어 부분을 떼어 핵심만
  if (term) {
    const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    source = source.replace(new RegExp(`^[^.]{0,30}?${esc}[^\\s]*?\\s*(?:이)?란\\s+`), "");
  }
  const pieces = sentences(source).flatMap(splitLong).map(concise).filter((p) => p.length >= 4);
  const seen = new Set<string>();
  const unique = pieces.filter((p) => (seen.has(p) ? false : (seen.add(p), true)));
  return { points: unique.slice(0, MAX_POINTS), trimmed: unique.length > MAX_POINTS };
}

/** Chat-ready block: title line, "• " bullets, source line. */
export function summaryCard(title: string, text: string, source: string, term?: string): string {
  const { points, trimmed } = summarize(text, term);
  const body = points.length > 0 ? points.map((p) => `• ${p}`).join("\n") : `• ${text}`;
  return `${title}\n${body}${trimmed ? "\n• …(자세한 내용은 교재 참고)" : ""}\n📖 ${source}`;
}
