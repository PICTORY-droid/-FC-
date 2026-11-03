import MiniSearch from "minisearch";

import { compact } from "./korean";

export interface TextbookPassage {
  id: string;
  part: number;
  partTitle: string;
  page: number;
  section: string;
  text: string;
}

export interface TextbookTerm {
  term: string;
  page: number;
  text: string;
}

export interface Textbook {
  passages: TextbookPassage[];
  /** 용어해설(39~54쪽) + 본문의 "○○란 …" 정의 */
  definitions: (TextbookTerm & { partTitle: string; section: string })[];
  search: (query: string) => TextbookPassage[];
}

/** "고지의무(계약 전 알릴의무)" → ["고지의무", "계약 전 알릴의무"] */
function termAliases(term: string): string[] {
  const m = /^(.+?)\((.+)\)$/.exec(term);
  return m ? [term, m[1].trim(), m[2].trim()] : [term];
}

const DEFINES = /^['"]?([가-힣A-Za-z0-9·\s]{2,20}?)(?:\([^)]*\))?['"]?\s*(?:이)?란\s/;
/** "계약선택, 언더라이팅(Underwriting)이란 …" — 쉼표로 나열한 동의어도 각각 정의로 */
const DEFINES_LIST = /^([가-힣·\s,]{2,30}?)(?:\([A-Za-z\s]+\))?\s*(?:이)?란\s/;
const MIN_PASSAGE = 25;

export function buildTextbook(data: { passages: TextbookPassage[]; terms: TextbookTerm[] }): Textbook {
  const passages = data.passages;
  const definitions: Textbook["definitions"] = [];

  for (const t of data.terms) {
    for (const alias of termAliases(t.term)) {
      definitions.push({ ...t, term: alias, partTitle: "생명보험의 이해", section: "생명보험 용어해설" });
    }
  }
  for (const p of passages) {
    if (p.section.startsWith("생명보험 용어해설") || p.text.length < MIN_PASSAGE) continue;
    const list = DEFINES_LIST.exec(p.text);
    const names = list ? list[1].split(",").map((x) => x.trim()) : [DEFINES.exec(p.text)?.[1]?.trim()];
    for (const name of names) {
      if (name && name.length >= 2) definitions.push({ term: name, page: p.page, text: p.text, partTitle: p.partTitle, section: p.section });
    }
  }

  const index = new MiniSearch<TextbookPassage>({ fields: ["text", "section"], storeFields: [], idField: "id" });
  index.addAll(passages);
  const byId = new Map(passages.map((p) => [p.id, p]));
  const search = (query: string) =>
    index
      .search(query, { prefix: true, fuzzy: (term) => (term.length >= 3 ? 1 : 0), combineWith: "AND", boost: { section: 2 } })
      .map((r) => byId.get(String(r.id))!)
      .filter((p) => p && p.text.length >= MIN_PASSAGE); // "○○이란?" 같은 제목 줄 제외

  return { passages, definitions, search };
}

export function citation(p: { page: number; partTitle: string; section: string }): string {
  const last = p.section.split(" · ").filter(Boolean).slice(-1)[0];
  return `교재 ${p.page}쪽 · ${p.partTitle}${last ? ` · ${last}` : ""}`;
}

export function findTextbookDefinition(term: string, tb: Textbook) {
  const key = compact(term);
  if (key.length < 2) return null;
  return (
    tb.definitions.find((d) => compact(d.term) === key) ??
    tb.definitions.find((d) => compact(d.term).startsWith(key) && compact(d.term).length - key.length <= 2) ??
    null
  );
}

let cache: Promise<Textbook> | null = null;

/** The textbook (~250KB) loads only when the helper first needs it. */
export function loadTextbook(): Promise<Textbook> {
  cache ??= import("@/data/textbook.json").then((m) =>
    buildTextbook(m.default as unknown as { passages: TextbookPassage[]; terms: TextbookTerm[] }),
  );
  return cache;
}
