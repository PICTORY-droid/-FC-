"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { progressKey, readJson } from "@/lib/storage/safe-storage";
import type { PartSummary } from "@/types/question";

const PART_EMOJI: Record<number, string> = { 1: "🌱", 2: "📜", 3: "🧾" };

export function PartCard({ part }: { part: PartSummary }) {
  const [answered, setAnswered] = useState(0);

  useEffect(() => {
    const saved = readJson<{ picks?: Record<string, number> } | null>(progressKey(part.part), null);
    setAnswered(saved?.picks ? Object.keys(saved.picks).length : 0);
  }, [part.part]);

  const ratio = Math.min(answered / part.total, 1);

  return (
    <Link href={`/quiz/${part.part}`} className="card group block p-4 transition-transform active:scale-[0.98]">
      <div className="flex items-center gap-4">
        <div className="stamp grid size-16 shrink-0 place-items-center bg-post-soft text-[28px]" aria-hidden>
          {PART_EMOJI[part.part] ?? "✉️"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-cute text-[13px] text-post">PART {part.part}</p>
          <h2 className="truncate text-[17px] font-bold tracking-tight text-ink">{part.title}</h2>
          <p className="mt-0.5 text-xs text-ink-mute">
            {part.total}문항 · 교재 {part.pages}쪽
          </p>
        </div>
        <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-post text-white transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </div>

      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-post-soft">
          <div className="h-full rounded-full bg-post transition-[width] duration-500" style={{ width: `${ratio * 100}%` }} />
        </div>
        <p className="mt-1.5 text-right text-[11px] tabular-nums text-ink-mute">
          {answered > 0 ? `${answered} / ${part.total} 풀었어요` : "아직 시작 전이에요"}
        </p>
      </div>
    </Link>
  );
}
