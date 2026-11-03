import { Mascot } from "@/components/brand/Mascot";
import type { OptionNumber, Question } from "@/types/question";

import { OptionList } from "./OptionList";
import { TextbookRef } from "./TextbookRef";

const MARKS = ["①", "②", "③", "④"] as const;

interface Props {
  question: Question;
  selected?: OptionNumber;
  pending?: OptionNumber;
  onSelect: (option: OptionNumber) => void;
  /** 즐겨찾기 — omit both to hide the star */
  starred?: boolean;
  onToggleStar?: () => void;
  /** 다른 PART 문항이 섞여 나오는 메뉴에서 출처 표시 */
  partLabel?: string;
  /** false: 모의고사처럼 채점 결과를 바로 보여 주지 않음 */
  reveal?: boolean;
}

export function QuestionCard({ question, selected, pending, onSelect, starred, onToggleStar, partLabel, reveal = true }: Props) {
  const answered = reveal && selected !== undefined;
  const correct = answered && selected === question.answer;

  return (
    <article className="flex flex-col gap-4">
      <div className="card p-5">
        <div className="flex items-center gap-1.5">
          {partLabel && <span className="chip bg-post-soft text-post">{partLabel}</span>}
          <span className="chip bg-sunny-soft text-ink-soft">문항 {question.no}</span>
          {onToggleStar && (
            <button
              type="button"
              onClick={onToggleStar}
              aria-pressed={!!starred}
              aria-label={starred ? "즐겨찾기 해제" : "즐겨찾기에 추가"}
              className={`chip ml-auto transition-colors ${starred ? "bg-sunny text-ink" : "bg-canvas text-ink-mute ring-1 ring-line"}`}
            >
              {starred ? "★ 즐겨찾기" : "☆ 헷갈려요"}
            </button>
          )}
        </div>
        <h2 className="mt-3 text-[16px] font-semibold leading-[1.75] tracking-tight text-ink">{question.question}</h2>
      </div>

      <OptionList
        options={question.options}
        selected={reveal ? selected : undefined}
        pending={reveal ? pending : (selected ?? pending)}
        answer={question.answer}
        onSelect={onSelect}
      />

      {answered && (
        <section
          aria-live="polite"
          className={`flex gap-3 rounded-[var(--radius-card)] border-[1.5px] p-4 text-sm leading-relaxed ${
            correct ? "border-correct/40 bg-correct-soft" : "border-signal/30 bg-signal-soft"
          }`}
        >
          <Mascot size={40} mood={correct ? "happy" : "sad"} className={`shrink-0 ${correct ? "animate-wiggle" : ""}`} />
          <div className="min-w-0">
            <p className={`font-cute text-[16px] ${correct ? "text-correct" : "text-signal"}`}>
              {correct ? "딩동댕! 정답이에요" : `아쉬워요! 정답은 ${MARKS[question.answer - 1]}`}
            </p>
            <p className="mt-1 text-ink-soft">
              {question.explanation ?? "교재에 별도 해설이 없는 문항이에요. 궁금한 점은 아래 누리 도우미에게 물어보세요."}
            </p>
            <TextbookRef question={question} />
          </div>
        </section>
      )}
    </article>
  );
}
