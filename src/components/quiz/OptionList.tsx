import type { OptionNumber } from "@/types/question";

const MARKS = ["①", "②", "③", "④"] as const;

interface Props {
  options: readonly string[];
  /** 확정된(채점된) 선택 */
  selected?: OptionNumber;
  /** 직접 정답 확인 모드에서 '정답 확인' 전 임시 선택 */
  pending?: OptionNumber;
  answer: OptionNumber;
  onSelect: (option: OptionNumber) => void;
}

function tone(n: OptionNumber, selected: OptionNumber | undefined, pending: OptionNumber | undefined, answer: OptionNumber) {
  if (selected === undefined) {
    if (n === pending) return "border-post bg-post-soft text-ink font-semibold ring-2 ring-post/25";
    return "border-line bg-surface text-ink hover:border-post/50 active:bg-post-soft";
  }
  if (n === answer) return "border-correct bg-correct-soft text-ink";
  if (n === selected) return "border-signal bg-signal-soft text-ink";
  return "border-line bg-surface text-ink-mute";
}

function badgeTone(isAnswer: boolean, isWrongPick: boolean, isPending: boolean) {
  if (isAnswer) return "bg-correct text-white";
  if (isWrongPick) return "bg-signal text-white";
  if (isPending) return "bg-post text-white";
  return "bg-post-soft text-post";
}

export function OptionList({ options, selected, pending, answer, onSelect }: Props) {
  const locked = selected !== undefined;

  return (
    <ul className="flex flex-col gap-2.5" role="radiogroup" aria-label="선지">
      {options.map((text, i) => {
        const n = (i + 1) as OptionNumber;
        const isAnswer = locked && n === answer;
        const isWrongPick = locked && n === selected && n !== answer;
        const isPending = !locked && n === pending;
        return (
          <li key={n}>
            <button
              type="button"
              role="radio"
              aria-checked={locked ? selected === n : isPending}
              disabled={locked}
              onClick={() => onSelect(n)}
              className={`flex w-full items-start gap-3 rounded-2xl border-[1.5px] px-4 py-3.5 text-left text-[15px] leading-relaxed transition-colors disabled:cursor-default ${tone(n, selected, pending, answer)}`}
            >
              <span className={`grid size-7 shrink-0 place-items-center rounded-full text-sm font-bold ${badgeTone(isAnswer, isWrongPick, isPending)}`}>
                {isAnswer ? "✓" : isWrongPick ? "✕" : MARKS[i]}
              </span>
              <span className="flex-1 pt-0.5">{text}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
