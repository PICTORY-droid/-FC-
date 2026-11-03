import { Mascot } from "@/components/brand/Mascot";
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
      <div className="card p-5">
        <span className="chip bg-sunny-soft text-ink-soft">문항 {question.no}</span>
        <h2 className="mt-3 text-[16px] font-semibold leading-[1.75] tracking-tight text-ink">{question.question}</h2>
      </div>

      <OptionList options={question.options} selected={selected} answer={question.answer} onSelect={onSelect} />

      {answered && (
        <section
          aria-live="polite"
          className={`flex gap-3 rounded-[var(--radius-card)] border-[1.5px] p-4 text-sm leading-relaxed ${
            correct ? "border-correct/40 bg-correct-soft" : "border-signal/30 bg-signal-soft"
          }`}
        >
          <Mascot size={40} mood={correct ? "happy" : "sad"} className={`shrink-0 ${correct ? "animate-wiggle" : ""}`} />
          <div>
            <p className={`font-cute text-[16px] ${correct ? "text-correct" : "text-signal"}`}>
              {correct ? "딩동댕! 정답이에요" : `아쉬워요! 정답은 ${MARKS[question.answer - 1]}`}
            </p>
            <p className="mt-1 text-ink-soft">
              {question.explanation ?? "교재에 별도 해설이 없는 문항이에요. 궁금한 점은 아래 누리 도우미에게 물어보세요."}
            </p>
          </div>
        </section>
      )}
    </article>
  );
}
