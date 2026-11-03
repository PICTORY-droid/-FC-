"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Mascot } from "@/components/brand/Mascot";
import { LAST_PART_KEY, PROGRESS_CHANGED_EVENT, progressKey, readJson, removeKey, type LastPart } from "@/lib/storage/safe-storage";
import type { PartSummary } from "@/types/question";

/** sessionStorage는 앱을 완전히 끄면 비워지므로, "다시 켰을 때 한 번만" 묻는 표시로 씁니다. */
const ASKED_KEY = "pqb:resume-asked";

function alreadyAsked(): boolean {
  try {
    return window.sessionStorage.getItem(ASKED_KEY) === "1";
  } catch {
    return false;
  }
}

function markAsked(): void {
  try {
    window.sessionStorage.setItem(ASKED_KEY, "1");
  } catch {
    /* storage unavailable — prompt may show again, harmless */
  }
}

interface Pending {
  part: PartSummary;
  answered: number;
  position: number;
}

/** 앱을 다시 열었을 때 풀던 PART가 있으면 "이어서 문제풀기 할까요?"를 묻습니다. */
export function ResumePrompt({ parts }: { parts: PartSummary[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<Pending | null>(null);

  useEffect(() => {
    if (alreadyAsked()) return;
    markAsked();
    const last = readJson<LastPart | null>(LAST_PART_KEY, null);
    const part = last ? parts.find((p) => p.part === last.part) : undefined;
    if (!part) return;
    const saved = readJson<{ picks?: Record<string, number>; cursor?: number } | null>(progressKey(part.part), null);
    const answered = saved?.picks ? Object.keys(saved.picks).length : 0;
    if (answered === 0 || answered >= part.total) return; // 시작 전이거나 다 푼 경우는 묻지 않음
    setPending({ part, answered, position: Math.min((saved?.cursor ?? 0) + 1, part.total) });
  }, [parts]);

  if (!pending) return null;

  const resume = () => router.push(`/quiz/${pending.part.part}`);
  const restart = () => {
    removeKey(progressKey(pending.part.part));
    removeKey(LAST_PART_KEY);
    window.dispatchEvent(new Event(PROGRESS_CHANGED_EVENT));
    setPending(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-title"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[max(env(safe-area-inset-bottom),1rem)]"
    >
      <div className="card flex w-full max-w-sm items-center gap-3 p-3 pl-4">
        <Mascot size={32} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <h2 id="resume-title" className="font-cute text-[15px] leading-tight text-ink">
            이어서 풀까요?
          </h2>
          <p className="truncate text-[11px] text-ink-mute">
            PART {pending.part.part} · {pending.position}번째 문항부터
          </p>
        </div>
        <button type="button" onClick={restart} title="이 PART 기록을 지우고 처음부터" className="btn-ghost shrink-0 px-3 py-2 text-xs">
          처음부터
        </button>
        <button type="button" onClick={resume} autoFocus className="btn-primary shrink-0 px-3 py-2 text-xs">
          이어풀기
        </button>
      </div>
    </div>
  );
}
