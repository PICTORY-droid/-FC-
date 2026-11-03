import type { QuizMode } from "@/hooks/useQuizMode";

const OPTIONS: { value: QuizMode; label: string; hint: string }[] = [
  { value: "auto", label: "바로 채점", hint: "누르면 바로 정답 확인" },
  { value: "manual", label: "직접 확인", hint: "골라 보고 '정답 확인'" },
];

export function ModeToggle({ mode, onChange }: { mode: QuizMode; onChange: (mode: QuizMode) => void }) {
  const active = OPTIONS.find((o) => o.value === mode) ?? OPTIONS[0];

  return (
    <div className="flex items-center justify-between gap-3">
      <div role="radiogroup" aria-label="채점 방식" className="flex rounded-full border-[1.5px] border-line bg-surface p-1">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={mode === o.value}
            onClick={() => onChange(o.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
              mode === o.value ? "bg-post text-white" : "text-ink-soft active:bg-post-soft"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-ink-mute">{active.hint}</p>
    </div>
  );
}
