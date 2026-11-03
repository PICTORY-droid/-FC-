import type { OptionNumber } from "@/types/question";

const MARKS = ["①", "②", "③", "④"] as const;

interface Props {
  options: readonly string[];
  selected?: OptionNumber;
  answer: OptionNumber;
  onSelect: (option: OptionNumber) => void;
}

function tone(n: OptionNumber, selected: OptionNumber | undefined, answer: OptionNumber) {
  if (selected === undefined) return "border-line bg-surface text-ink hover:border-post/50 active:bg-post-soft/50";
  if (n === answer) return "border-correct bg-correct-soft text-ink";
  if (n === selected) return "border-signal bg-signal-soft text-ink";
  return "border-line bg-surface text-ink-mute";
}

export function OptionList({ options, selected, answer, onSelect }: Props) {
  const locked = selected !== undefined;

  return (
    <ul className="flex flex-col gap-2.5" role="radiogroup" aria-label="선지">
      {options.map((text, i) => {
        const n = (i + 1) as OptionNumber;
        const isAnswer = locked && n === answer;
        const isWrongPick = locked && n === selected && n !== answer;
        return (
          <li key={n}>
            <button
              type="button"
              role="radio"
              aria-checked={selected === n}
              disabled={locked}
              onClick={() => onSelect(n)}
              className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left text-[15px] leading-relaxed transition-colors disabled:cursor-default ${tone(n, selected, answer)}`}
            >
              <span className={`mt-px shrink-0 text-base font-semibold ${isAnswer ? "text-correct" : isWrongPick ? "text-signal" : "text-post"}`}>
                {MARKS[i]}
              </span>
              <span className="flex-1">{text}</span>
              {isAnswer && <span className="mt-0.5 shrink-0 text-[11px] font-bold text-correct">정답</span>}
              {isWrongPick && <span className="mt-0.5 shrink-0 text-[11px] font-bold text-signal">선택</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
