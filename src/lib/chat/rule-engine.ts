import type { Definition, FactSentence, Knowledge } from "@/types/chat";
import type { OptionNumber, Question } from "@/types/question";

import { MARKS, compact, josa, pick } from "./korean";
import { citation, findTextbookDefinition, type Textbook, type TextbookPassage } from "./textbook";

export const OUT_OF_SCOPE_REPLY =
  "앗, 그 질문은 문제은행 범위 밖이라 제가 사실대로 답해 드리기 어려워요 📮 이 문제의 정답 이유나 선지, 용어 뜻을 물어봐 주세요!";

export interface EngineInput {
  message: string;
  question: Question;
  /** "보험과 세제" 처럼 지금 푸는 PART 제목 */
  partTitle: string;
  answered: boolean;
  knowledge: Knowledge;
  textbook: Textbook;
  /** 직전 답변에서 "어떤 연관이 궁금하세요?"라고 되물은 용어 */
  pendingTopic: string | null;
}

export interface EngineReply {
  text: string;
  /** 다음 턴에 이어서 연관 질문으로 받을 용어 (되물었을 때만) */
  pendingTopic: string | null;
}

const RELATION = /관계|연관|관련|차이|연결|이어지|상관|비교|무슨\s*상관/;

type Intent = "answer" | "why" | "option" | "term" | "hint" | "greet" | "unknown";

const WORDS = {
  answer: /정답|답이|답은|답 ?알려|몇 ?번|뭐가 ?맞/,
  why: /왜|이유|근거|설명|해설|어째서|이해가/,
  term: /뜻|의미|이란|란\b|이 ?뭐|가 ?뭐|뭐야|뭔가요|무엇|뭐예요|개념|에 ?대해|알려 ?줘|알려 ?주세요|설명해/,
  hint: /힌트|모르겠|헷갈|어려워|도와|팁/,
  greet: /^(안녕|하이|hello|hi|고마워|감사)/i,
};

/** Trailing question words removed to isolate the term the user asked about. */
const TERM_TAIL =
  /\s*(?:에\s*대해(?:서)?|이란|란|이|가|은|는|을|를)?\s*(?:뭐야|뭐예요|뭔가요|뭐지|무엇인가요|무엇이야|무엇|뜻이?(?:\s*뭐야)?|의미(?:가)?(?:\s*뭐야)?|알려\s*줘|알려\s*주세요|설명해\s*줘|설명해\s*주세요|궁금해(?:요)?)\s*[?？!.~]*$/;

const ORDINALS: Record<string, OptionNumber> = { 첫: 1, 두: 2, 세: 3, 네: 4 };

function findOption(msg: string): OptionNumber | null {
  const circled = MARKS.findIndex((m) => msg.includes(m));
  if (circled >= 0) return (circled + 1) as OptionNumber;
  const num = /([1-4])\s*(번|선지|번째)/.exec(msg);
  if (num) return Number(num[1]) as OptionNumber;
  const ord = /(첫|두|세|네)\s*(번)?\s*째/.exec(msg);
  return ord ? ORDINALS[ord[1]] : null;
}

function detectIntent(msg: string, option: OptionNumber | null): Intent {
  if (option) return "option";
  if (WORDS.greet.test(msg)) return "greet";
  if (WORDS.hint.test(msg)) return "hint";
  if (WORDS.answer.test(msg)) return "answer";
  if (WORDS.term.test(msg)) return "term";
  if (WORDS.why.test(msg)) return "why";
  return "unknown";
}

const SHORT_OPTION = 18;

/** "③ '순보험료'" for short options, "③번 선지" when the option is a full sentence. */
const quote = (q: Question, n: OptionNumber) => {
  const text = q.options[n - 1];
  return text.length <= SHORT_OPTION ? `${MARKS[n - 1]} '${text}'` : `${MARKS[n - 1]}번 선지`;
};

const isIt = (word: string) => josa(word, "이에요/예요");

/** Pulls the part of the textbook explanation that talks about one option (e.g. "②는 …"). */
function explanationFor(q: Question, n: OptionNumber): string | null {
  if (!q.explanation) return null;
  const start = q.explanation.indexOf(MARKS[n - 1]);
  if (start < 0) return null;
  const rest = q.explanation.slice(start + 1);
  const next = rest.search(/[①②③④]/);
  return (next >= 0 ? rest.slice(0, next) : rest).trim() || null;
}

/**
 * The sentence as it may be shown right now: facts from the current, ungraded
 * question are shown with the answer hidden — or not at all.
 */
function visibleText(f: FactSentence, q: Question, answered: boolean): string | null {
  if (answered || f.questionId !== q.id) return f.text;
  return f.hiddenText;
}

function teach(q: Question, k: Knowledge): string {
  if (q.explanation) return `교재 해설에는 이렇게 나와 있어요. "${q.explanation}"`;
  const filled = k.facts.find((f) => f.questionId === q.id && f.hiddenText);
  if (filled) return `문제 문장에 정답을 넣어 읽어 보면 이렇게 정리돼요. "${filled.text}"`;
  return "이 문항은 교재에 별도 해설이 없어요. 정답 선지 문장을 그대로 기억해 두시면 좋아요.";
}

/** Concept the question is about, using terms the textbook itself defines elsewhere. */
function keyConcept(q: Question, k: Knowledge): string | null {
  const stem = compact(q.question);
  const answerKey = compact(q.options[q.answer - 1]);
  let best: string | null = null;
  for (const d of k.definitions) {
    const key = compact(d.term);
    if (key.length < 3 || key === answerKey || d.questionId === q.id) continue;
    if (stem.includes(key) && (!best || key.length > compact(best).length)) best = d.term;
  }
  return best;
}

function hint(q: Question, k: Knowledge, seed: string): string {
  const wrong = ([1, 2, 3, 4] as OptionNumber[]).find((n) => n !== q.answer)!;
  const concept = keyConcept(q, k);
  const opener = pick(["좋아요, 힌트 드릴게요 💌", "같이 풀어 봐요 ✉️", "살짝만 알려드릴게요 📮"], seed);
  const conceptLine = concept ? ` 이 문제는 '${concept}' 개념과 연결돼 있어요. 그리고` : "";
  return `${opener}${conceptLine} ${josa(quote(q, wrong), "은/는")} 정답이 아니에요. 남은 선지 중에서 골라 보세요!`;
}

/** "사회보장제도가 뭐야?" → "사회보장제도" */
function extractTerm(msg: string): string {
  // "보험차익 뜻 알려줘"처럼 질문 꼬리가 여러 개 붙어도 모두 걷어냅니다.
  let term = msg.replace(/[?？!.~]+$/, "").trim();
  for (let prev = ""; prev !== term; ) {
    prev = term;
    term = term.replace(TERM_TAIL, "").trim();
  }
  return term;
}

function findDefinition(msg: string, k: Knowledge, q: Question, answered: boolean): { d: Definition; text: string } | null {
  const asked = compact(extractTerm(msg));
  const whole = compact(msg);
  let best: { d: Definition; text: string; score: number } | null = null;
  for (const d of k.definitions) {
    const t = compact(d.term);
    if (t.length < 2) continue;
    const exact = t === asked;
    if (!exact && !whole.includes(t)) continue;
    const text = visibleText(d, q, answered);
    if (!text) continue;
    // 정확히 같은 용어 > 긴 용어 > '○○란' 정의 문장 > 다른 문항 출처
    const score = (exact ? 1000 : 0) + t.length * 10 + (/란\s/.test(d.text) ? 5 : 0) + (d.questionId === q.id ? 0 : 1);
    if (!best || score > best.score) best = { d, text, score };
  }
  return best;
}

/** Up to two textbook sentences about the term, ranked by MiniSearch (short ones first among top hits). */
function findMentions(term: string, k: Knowledge, q: Question, answered: boolean): { text: string; source: string }[] {
  if (compact(term).length < 2) return [];
  const seen = new Set<string>();
  return k
    .searchFacts(term)
    .slice(0, 8)
    .map((f) => ({ f, text: visibleText(f, q, answered) }))
    .filter((x): x is { f: FactSentence; text: string } => !!x.text && !seen.has(x.text) && (seen.add(x.text), true))
    .sort((a, b) => a.text.length - b.text.length)
    .slice(0, 2)
    .map((x) => ({ text: x.text, source: x.f.source }));
}

const questionPart = (q: Question) => Number(/^p(\d)/.exec(q.id)?.[1] ?? 0);

/** Textbook text may be shown unless it would give away the current, ungraded answer. */
function safeText(text: string, q: Question, answered: boolean): boolean {
  if (answered) return true;
  const ans = compact(q.options[q.answer - 1]);
  return ans.length < 3 || !compact(text).includes(ans);
}

function bestPassage(term: string, tb: Textbook, q: Question, answered: boolean): TextbookPassage | null {
  const key = compact(term);
  const hits = tb
    .search(term)
    .slice(0, 12)
    .filter((p) => compact(p.text).includes(key) && safeText(p.text, q, answered));
  if (hits.length === 0) return null;
  const part = questionPart(q);
  // 같은 PART 문단 우선, 그다음 검색 순위
  return hits.find((p) => p.part === part) ?? hits[0];
}

/** Concept of the current question that the textbook defines (for relation questions). */
function questionTopic(q: Question, k: Knowledge, tb: Textbook): string | null {
  const stem = compact(q.question + " " + q.options[q.answer - 1]);
  let best: string | null = keyConcept(q, k);
  for (const d of tb.definitions) {
    const t = compact(d.term);
    if (t.length >= 3 && stem.includes(t) && (!best || t.length > compact(best).length)) best = d.term;
  }
  return best;
}

function crossAsk(term: string, partTitle: string): string {
  return ` 지금 푸는 '${partTitle}' 문제와 어떤 연관이 궁금하세요? 궁금한 점을 적어 주시면 교재에서 두 내용이 함께 나오는 부분을 찾아드릴게요 📮`;
}

function answerTerm(msg: string, input: EngineInput): EngineReply | null {
  const { question: q, answered, knowledge: k, textbook: tb, partTitle } = input;
  const term = extractTerm(msg);
  const part = questionPart(q);

  // 1) 교재 용어해설·본문 정의
  const tdef = findTextbookDefinition(term, tb);
  if (tdef && safeText(tdef.text, q, answered)) {
    const cross = tdef.partTitle !== partTitle;
    return {
      text: `'${tdef.term}', 교재에서는 이렇게 설명해요. "${tdef.text}" (${citation(tdef)})${cross ? crossAsk(tdef.term, partTitle) : ""}`,
      pendingTopic: cross ? tdef.term : null,
    };
  }
  // 2) 문제은행 정의 문장
  const def = findDefinition(msg, k, q, answered);
  if (def) return { text: `'${def.d.term}', 교재에서는 이렇게 설명해요. "${def.text}" (${def.d.source})`, pendingTopic: null };
  // 3) 교재 본문 검색
  const passage = bestPassage(term, tb, q, answered);
  if (passage) {
    const cross = passage.part !== part;
    return {
      text: `${josa(`'${term}'`, "은/는")} 교재에 이렇게 나와요. "${passage.text}" (${citation(passage)})${cross ? crossAsk(term, partTitle) : ""}`,
      pendingTopic: cross ? term : null,
    };
  }
  // 4) 문제은행 문장 검색
  const hits = findMentions(term, k, q, answered);
  if (hits.length === 0) return null;
  const lines = hits.map((h) => `"${h.text}" (${h.source})`).join(" 그리고 ");
  return { text: `${josa(`'${term}'`, "을/를")} 직접 정의한 문장은 없지만, 교재에서 이렇게 나와요. ${lines}`, pendingTopic: null };
}

const FILLER = new Set(["이", "그", "저", "이거", "이것", "문제", "지금", "무슨", "어떤", "뭐", "있어", "있나요", "궁금해", "알려줘", "오늘", "내일", "어제", "날씨", "주식", "추천", "점심", "저녁", "어때", "어때요"]);

/** "연금저축이랑 언더라이팅 무슨 관계야?" → ["연금저축", "언더라이팅"] */
function relationTopics(msg: string): string[] {
  return msg
    .replace(RELATION, " ")
    .replace(/[?？!.~]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/(이랑|랑|하고|와|과|은|는|이|가|을|를|의|에|도|이야|야|예요|인가요|있어|있나요|돼|되나요)$/, ""))
    .filter((w) => w.length >= 2 && !FILLER.has(w));
}

/** Short textbook explanation of one topic: definition first, otherwise the best passage. */
function describe(topic: string, input: EngineInput): string | null {
  const { question: q, answered, textbook: tb } = input;
  const d = findTextbookDefinition(topic, tb);
  if (d && safeText(d.text, q, answered)) return `'${d.term}': "${d.text}" (${citation(d)})`;
  const p = bestPassage(topic, tb, q, answered);
  return p ? `'${topic}': "${p.text}" (${citation(p)})` : null;
}

/** "언더라이팅이랑 이 문제 무슨 관계야?" — finds textbook passages that mention both topics. */
function answerRelation(msg: string, topicA: string, named: string | null, input: EngineInput): EngineReply {
  const { question: q, answered, knowledge: k, textbook: tb } = input;
  const a = compact(topicA);
  // 메시지에서 고른 용어가 있으면 그것을, 없으면 지금 문제의 핵심 개념을 B로
  const topicB = named && compact(named) !== a ? named : questionTopic(q, k, tb);

  if (topicB) {
    const b = compact(topicB);
    const both = tb.passages.filter((p) => {
      const t = compact(p.text);
      return t.includes(a) && t.includes(b) && safeText(p.text, q, answered);
    });
    if (both.length > 0) {
      const picked = both.sort((x, y) => x.text.length - y.text.length).slice(0, 2);
      const lines = picked.map((p) => `"${p.text}" (${citation(p)})`).join(" 그리고 ");
      return { text: `${josa(`'${topicA}'`, "와/과")} ${josa(`'${topicB}'`, "이/가")} 함께 나오는 교재 내용이에요. ${lines}`, pendingTopic: null };
    }
    // 같은 단원(절)에서 두 번째 용어를 다룬 문단 — 교재가 한 묶음으로 설명하는 내용
    const home = findTextbookDefinition(topicA, tb) ?? bestPassage(topicA, tb, q, answered);
    const chapter = home?.section.split(" · ").slice(0, 2).join(" · ");
    if (chapter && !home!.section.startsWith("생명보험 용어해설")) {
      const near = tb.passages
        .filter((p) => p.section.startsWith(chapter) && compact(p.text).includes(b) && safeText(p.text, q, answered))
        .sort((x, y) => x.text.length - y.text.length)[0];
      if (near) {
        const unit = chapter.split(" · ").slice(-1)[0];
        return {
          text: `${josa(`'${topicA}'`, "을/를")} 다루는 교재 같은 단원(${unit})에서 ${josa(`'${topicB}'`, "이/가")} 이렇게 함께 나와요. "${near.text}" (${citation(near)}) ${describe(topicA, input) ?? ""}`.trim(),
          pendingTopic: null,
        };
      }
    }
    const each = [describe(topicA, input), describe(topicB, input)].filter(Boolean).join(" / ");
    return {
      text: `교재에서 ${josa(`'${topicA}'`, "와/과")} ${josa(`'${topicB}'`, "을/를")} 한 문단에서 직접 연결해 설명한 부분은 없어요. 제가 임의로 엮어 말씀드리면 사실과 다를 수 있어서, 각각의 교재 설명을 드릴게요.${each ? ` ${each}` : ""}`,
      pendingTopic: null,
    };
  }
  return {
    text: `교재에서 ${josa(`'${topicA}'`, "와/과")} 이 문제를 직접 연결한 부분은 찾지 못했어요. 함께 궁금한 용어를 적어 주시면 다시 찾아볼게요 📮`,
    pendingTopic: topicA,
  };
}

function mentionsQuestion(msg: string, q: Question): boolean {
  const context = compact([q.question, ...q.options, q.explanation ?? ""].join(" "));
  return msg
    .split(/[^가-힣A-Za-z0-9]+/)
    .map((w) => w.replace(/(은|는|이|가|을|를|에|의|도|로|과|와|이란|란|이야|예요)$/, ""))
    .some((w) => w.length >= 2 && context.includes(compact(w)));
}

/** Produces a textbook-grounded reply. Never invents facts: every sentence is built from bank or textbook data. */
export function replyTo(input: EngineInput): EngineReply {
  const { message, question: q, answered, knowledge: k, pendingTopic } = input;
  const msg = message.trim();
  const option = findOption(msg);
  const intent = detectIntent(msg, option);
  const answerQuote = quote(q, q.answer);
  const say = (text: string): EngineReply => ({ text, pendingTopic: null });

  if (intent === "greet") {
    return say("안녕하세요! 저는 우체국 FC 문제은행의 누리 도우미예요 📮 이 문제의 정답 이유, 선지별 설명, 용어 뜻을 교재 내용 그대로 알려드려요.");
  }

  // 연관 질문: 직전에 되물었거나, "A랑 무슨 관계야?"처럼 물은 경우
  const asksRelation = RELATION.test(msg);
  if (intent !== "option" && intent !== "answer" && intent !== "hint" && (asksRelation || (pendingTopic && intent === "unknown"))) {
    const inTextbook = (w: string) =>
      !!findTextbookDefinition(w, input.textbook) || !!bestPassage(w, input.textbook, q, answered);
    const mentioned = relationTopics(msg).filter(inTextbook);
    const topicA = pendingTopic ?? mentioned[0];
    const topicB = pendingTopic ? mentioned[0] : mentioned[1];
    // 되물은 뒤 엉뚱한 말("오늘 날씨 어때?")은 연관 질문으로 보지 않음
    const valid = asksRelation || mentioned.length > 0;
    if (valid && topicA && compact(topicA).length >= 2) return answerRelation(msg, topicA, topicB ?? null, input);
  }

  if (intent === "term" || (intent === "unknown" && !mentionsQuestion(msg, q))) {
    const reply = answerTerm(msg, input);
    if (reply) return reply;
    if (intent === "unknown") return say(OUT_OF_SCOPE_REPLY);
    const term = extractTerm(msg);
    if (term && !mentionsQuestion(term, q)) {
      return say(`${josa(`'${term}'`, "은/는")} 교재 내용에서 찾지 못했어요 📮 교재에 나오는 용어나 이 문제의 정답 이유를 물어봐 주세요!`);
    }
  }

  if (!answered) {
    if (intent === "option" && option) {
      return say(`${MARKS[option - 1]}번이 맞는지는 답을 고르신 뒤에 바로 알려드릴게요 🙂 ${hint(q, k, msg)}`);
    }
    if (intent === "answer" || intent === "why") {
      return say(`아직 답을 고르지 않으셨네요! 먼저 골라 보시면 바로 채점해 드려요. ${hint(q, k, msg)}`);
    }
    return say(hint(q, k, msg));
  }

  if (intent === "option" && option) {
    if (option === q.answer) {
      const yes = pick(["네, 맞아요! 🎉", "정확해요! 💯", "딩동댕, 정답이에요! 🔔"], msg);
      return say(`${yes} ${josa(answerQuote, "이/가")} 정답이에요. ${teach(q, k)}`);
    }
    const specific = explanationFor(q, option);
    const why = specific
      ? `교재에서 ${MARKS[option - 1]}에 대해서는 "${specific}"라고 설명해요.`
      : `교재 해설에 ${MARKS[option - 1]}만 따로 다룬 문장은 없어요. 정답 쪽 설명을 보면 이해가 쉬워요. ${teach(q, k)}`;
    return say(`${josa(quote(q, option), "은/는")} 정답이 아니에요. 정답은 ${isIt(answerQuote)}. ${why}`);
  }

  if (intent === "hint") {
    return say(`이미 답을 고르셨으니 정답을 바로 알려드릴게요. 정답은 ${isIt(answerQuote)}. ${teach(q, k)}`);
  }

  const opener = pick(["정리해 드릴게요 ✉️", "좋은 질문이에요 📮", "함께 볼게요 💌"], msg);
  return say(`${opener} 정답은 ${isIt(answerQuote)}. ${teach(q, k)}`);
}

/** Quick-question chips that the engine is guaranteed to understand. */
export function suggestionsFor(answered: boolean, q: Question): string[] {
  if (!answered) return ["힌트 줘", "이 문제 핵심 개념이 뭐야?"];
  const wrong = ([1, 2, 3, 4] as OptionNumber[]).find((n) => n !== q.answer)!;
  return ["왜 이게 정답이야?", `${MARKS[wrong - 1]}번은 왜 틀려?`];
}
