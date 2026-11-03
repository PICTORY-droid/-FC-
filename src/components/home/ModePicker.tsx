"use client";

import { QUIZ_MODES, useQuizMode, type QuizMode } from "@/hooks/useQuizMode";

const ORDER: QuizMode[] = ["auto", "manual"];

/** 첫 화면에서 고르는 채점 방식. 선택은 기기에 저장되어 모든 PART에 적용됩니다. */
export function ModePicker() {
  const { mode, setMode } = useQuizMode();

  return (
    <section aria-labelledby="mode-title" className="mb-5">
      <h2 id="mode-title" className="mb-2 font-cute text-[16px] text-ink">
        채점 방식을 골라 주세요
      </h2>
      <div role="radiogroup" aria-labelledby="mode-title" className="grid grid-cols-2 gap-2.5">
        {ORDER.map((value) => {
          const active = mode === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setMode(value)}
              className={`rounded-2xl border-[1.5px] p-3.5 text-left transition-colors ${
                active ? "border-post bg-post-soft ring-2 ring-post/25" : "border-line bg-surface active:bg-post-soft"
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${
                    active ? "border-post bg-post" : "border-line bg-surface"
                  }`}
                >
                  {active && <span className="size-2 rounded-full bg-white" />}
                </span>
                <span className={`text-sm font-bold ${active ? "text-post" : "text-ink"}`}>{QUIZ_MODES[value].label}</span>
              </span>
              <span className="mt-1.5 block text-[11px] leading-snug text-ink-soft">{QUIZ_MODES[value].description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
