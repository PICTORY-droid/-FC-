"use client";

import { useShuffleSetting } from "@/hooks/useStudyData";

/** 문항·선지 섞기 — 정답 위치를 외우지 않도록 순서를 바꿔 줌 */
export function ShuffleToggle() {
  const { setting, setOn } = useShuffleSetting();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={setting.on}
      onClick={() => setOn(!setting.on)}
      className="mt-2.5 flex w-full items-center gap-3 rounded-2xl border-[1.5px] border-line bg-surface px-3.5 py-3 text-left active:bg-post-soft"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-ink">🔀 문항·선지 섞기</span>
        <span className="block text-[11px] text-ink-mute">정답 위치를 외우지 않게 순서를 바꿔요 (①② 번호가 나오는 문항은 그대로)</span>
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${setting.on ? "bg-post" : "bg-line"}`} aria-hidden>
        <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left] ${setting.on ? "left-[1.375rem]" : "left-0.5"}`} />
      </span>
    </button>
  );
}
