import type { OptionNumber, Question } from "@/types/question";

import { OptionList } from "./OptionList";

const MARKS = ["①", "②", "③", "④"] as const;

interface Props {
  question: Question;
  selected?: OptionNumber;
  onSelect: (option: OptionNumber) => void;
}

export function QuestionCard({ question, selected, onSelect }: Props) {
  const answered = selected !== undefined;
  const correct = answered && selected === question.answer;

  return (
    <article className="flex flex-col gap-4">
      <div className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-ink-mute">문항 {question.no}</p>
        <h2 className="mt-2 text-[16px] font-semibold leading-[1.7] tracking-tight text-ink">{question.question}</h2>
      </div>

      <OptionList options={question.options} selected={selected} answer={question.answer} onSelect={onSelect} />

      {answered && (
        <section
          aria-live="polite"
          className={`rounded-xl border-l-[3px] bg-surface px-4 py-3.5 text-sm leading-relaxed ${correct ? "border-correct" : "border-signal"}`}
        >
          <p className={`font-bold ${correct ? "text-correct" : "text-signal"}`}>
            {correct ? "정답입니다" : `오답 · 정답은 ${MARKS[question.answer - 1]}`}
          </p>
          <p className="mt-1.5 text-ink-soft">
            {question.explanation ?? "교재에 별도 해설이 없는 문항입니다. 궁금한 점은 아래 AI 도우미에게 물어보세요."}
          </p>
        </section>
      )}
    </article>
  );
}
