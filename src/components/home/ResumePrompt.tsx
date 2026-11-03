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
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 pb-[max(env(safe-area-inset-bottom),1rem)] sm:items-center"
    >
      <div className="card w-full max-w-sm overflow-hidden p-6 text-center">
        <div className="airmail -mx-6 -mt-6 mb-5 rounded-none" aria-hidden />
        <Mascot size={64} className="mx-auto animate-wiggle" />
        <h2 id="resume-title" className="mt-3 font-cute text-[22px] text-ink">
          이어서 문제풀기 할까요?
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          <b className="text-post">PART {pending.part.part} {pending.part.title}</b>
          <br />
          {pending.part.total}문항 중 {pending.answered}문항을 풀었어요. ({pending.position}번째 문항부터)
        </p>
        <div className="mt-5 flex gap-3">
          <button type="button" onClick={restart} className="btn-ghost flex-1 py-3.5 text-sm">
            처음부터
          </button>
          <button type="button" onClick={resume} autoFocus className="btn-primary flex-1 py-3.5 text-sm">
            예, 이어서 풀기
          </button>
        </div>
        <p className="mt-3 text-[11px] text-ink-mute">'처음부터'를 누르면 이 PART의 풀이 기록이 지워져요.</p>
      </div>
    </div>
  );
}
