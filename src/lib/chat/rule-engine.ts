import type { GlossaryEntry } from "@/types/chat";
import type { OptionNumber, Question } from "@/types/question";

import { MARKS, compact, josa, pick } from "./korean";

export const OUT_OF_SCOPE_REPLY =
  "앗, 그 질문은 문제은행 범위 밖이라 제가 사실대로 답해 드리기 어려워요 📮 이 문제의 정답 이유나 선지, 용어 뜻을 물어봐 주세요!";

export interface EngineInput {
  message: string;
  question: Question;
  answered: boolean;
  glossary: GlossaryEntry[];
}

type Intent = "answer" | "why" | "option" | "term" | "hint" | "greet" | "unknown";

const WORDS = {
  answer: /정답|답이|답은|답 ?알려|몇 ?번|뭐가 ?맞/,
  why: /왜|이유|근거|설명|해설|어째서|무슨 ?뜻이야|이해가/,
  term: /뜻|의미|이란|란\b|이 ?뭐|가 ?뭐|뭐야|뭔가요|무엇|뭐예요|개념/,
  hint: /힌트|모르겠|헷갈|어려워|도와|팁/,
  greet: /^(안녕|하이|hello|hi|고마워|감사)/i,
};

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

const isIt = (word: string) => josa(word, "이에요", "예요");

/** Pulls the part of the textbook explanation that talks about one option (e.g. "②는 …"). */
function explanationFor(q: Question, n: OptionNumber): string | null {
  if (!q.explanation) return null;
  const marker = MARKS[n - 1];
  const start = q.explanation.indexOf(marker);
  if (start < 0) return null;
  const rest = q.explanation.slice(start + 1);
  const next = rest.search(/[①②③④]/);
  return (next >= 0 ? rest.slice(0, next) : rest).trim() || null;
}

function filledSentence(q: Question, glossary: GlossaryEntry[]): string | null {
  return glossary.find((g) => g.questionId === q.id)?.sentence ?? null;
}

function teach(q: Question, glossary: GlossaryEntry[]): string {
  if (q.explanation) return `교재 해설에는 이렇게 나와 있어요. "${q.explanation}"`;
  const filled = filledSentence(q, glossary);
  if (filled) return `문제 문장에 정답을 넣어 읽어 보면 이렇게 정리돼요. "${filled}"`;
  return "이 문항은 교재에 별도 해설이 없어요. 정답 선지 문장을 그대로 기억해 두시면 좋아요.";
}

/** Concept the question is about, using terms the textbook itself defines elsewhere. */
function keyConcept(q: Question, glossary: GlossaryEntry[]): string | null {
  const stem = compact(q.question);
  const answerKey = compact(q.options[q.answer - 1]);
  let best: string | null = null;
  for (const g of glossary) {
    const key = compact(g.term);
    if (key.length < 3 || key === answerKey || g.questionId === q.id) continue;
    if (stem.includes(key) && (!best || key.length > compact(best).length)) best = g.term;
  }
  return best;
}

function hint(q: Question, glossary: GlossaryEntry[], seed: string): string {
  const wrong = ([1, 2, 3, 4] as OptionNumber[]).find((n) => n !== q.answer)!;
  const concept = keyConcept(q, glossary);
  const opener = pick(["좋아요, 힌트 드릴게요 💌", "같이 풀어 봐요 ✉️", "살짝만 알려드릴게요 📮"], seed);
  const conceptLine = concept ? ` 이 문제는 '${concept}' 개념과 연결돼 있어요. 그리고` : "";
  return `${opener}${conceptLine} ${josa(quote(q, wrong), "은", "는")} 정답이 아니에요. 남은 선지 중에서 골라 보세요!`;
}

function lookupTerm(msg: string, glossary: GlossaryEntry[], excludeId: string | null): GlossaryEntry | null {
  const key = compact(msg);
  let best: GlossaryEntry | null = null;
  for (const g of glossary) {
    if (g.questionId === excludeId) continue;
    const t = compact(g.term);
    if (t.length >= 2 && key.includes(t) && (!best || t.length > compact(best.term).length)) best = g;
  }
  return best;
}

function mentionsQuestion(msg: string, q: Question): boolean {
  const context = compact([q.question, ...q.options, q.explanation ?? ""].join(" "));
  return msg
    .split(/[^가-힣A-Za-z0-9]+/)
    .map((w) => w.replace(/(은|는|이|가|을|를|에|의|도|로|과|와|이란|란|이야|예요)$/, ""))
    .some((w) => w.length >= 2 && context.includes(compact(w)));
}

/** Produces a textbook-grounded reply. Never invents facts: every sentence is built from bank data. */
export function replyTo({ message, question: q, answered, glossary }: EngineInput): string {
  const msg = message.trim();
  const option = findOption(msg);
  const intent = detectIntent(msg, option);
  const answerQuote = quote(q, q.answer);

  if (intent === "greet") {
    return "안녕하세요! 저는 우체국 FC 문제은행의 누리 도우미예요 📮 이 문제의 정답 이유, 선지별 설명, 용어 뜻을 교재 내용 그대로 알려드려요.";
  }

  if (intent === "term" || (intent === "unknown" && !mentionsQuestion(msg, q))) {
    const hit = lookupTerm(msg, glossary, answered ? null : q.id);
    if (hit) return `'${hit.term}', 교재에서는 이렇게 설명해요. "${hit.sentence}" (${hit.source})`;
    if (intent === "unknown") return OUT_OF_SCOPE_REPLY;
  }

  if (!answered) {
    if (intent === "option" && option) {
      return `${MARKS[option - 1]}번이 맞는지는 답을 고르신 뒤에 바로 알려드릴게요 🙂 ${hint(q, glossary, msg)}`;
    }
    if (intent === "answer" || intent === "why") {
      return `아직 답을 고르지 않으셨네요! 먼저 골라 보시면 바로 채점해 드려요. ${hint(q, glossary, msg)}`;
    }
    return hint(q, glossary, msg);
  }

  if (intent === "option" && option) {
    if (option === q.answer) {
      const yes = pick(["네, 맞아요! 🎉", "정확해요! 💯", "딩동댕, 정답이에요! 🔔"], msg);
      return `${yes} ${josa(answerQuote, "이", "가")} 정답이에요. ${teach(q, glossary)}`;
    }
    const specific = explanationFor(q, option);
    const why = specific ? `교재에서 ${MARKS[option - 1]}에 대해서는 "${specific}"라고 설명해요.` : teach(q, glossary);
    return `${josa(quote(q, option), "은", "는")} 정답이 아니에요. 정답은 ${isIt(answerQuote)}. ${why}`;
  }

  if (intent === "hint") {
    return `이미 답을 고르셨으니 정답을 바로 알려드릴게요. 정답은 ${isIt(answerQuote)}. ${teach(q, glossary)}`;
  }

  const opener = pick(["정리해 드릴게요 ✉️", "좋은 질문이에요 📮", "함께 볼게요 💌"], msg);
  return `${opener} 정답은 ${isIt(answerQuote)}. ${teach(q, glossary)}`;
}

/** Quick-question chips that the engine is guaranteed to understand. */
export function suggestionsFor(answered: boolean, q: Question): string[] {
  if (!answered) return ["힌트 줘", "이 문제 핵심 개념이 뭐야?"];
  const wrong = ([1, 2, 3, 4] as OptionNumber[]).find((n) => n !== q.answer)!;
  return ["왜 이게 정답이야?", `${MARKS[wrong - 1]}번은 왜 틀려?`];
}
