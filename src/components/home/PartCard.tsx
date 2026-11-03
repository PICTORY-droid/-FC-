"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { progressKey, readJson } from "@/lib/storage/safe-storage";
import type { PartSummary } from "@/types/question";

export function PartCard({ part }: { part: PartSummary }) {
  const [answered, setAnswered] = useState(0);

  useEffect(() => {
    const saved = readJson<{ picks?: Record<string, number> } | null>(progressKey(part.part), null);
    setAnswered(saved?.picks ? Object.keys(saved.picks).length : 0);
  }, [part.part]);

  const ratio = Math.min(answered / part.total, 1);

  return (
    <Link
      href={`/quiz/${part.part}`}
      className="group block rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-post/40 active:bg-post-soft/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-post">PART {part.part}</p>
          <h2 className="mt-1.5 text-[17px] font-bold tracking-tight text-ink">{part.title}</h2>
          <p className="mt-1 text-xs text-ink-mute">
            {part.total}문항 · 교재 {part.pages}쪽
          </p>
        </div>
        <span
          aria-hidden
          className="mt-1 grid size-8 shrink-0 place-items-center rounded-full border border-line text-ink-soft transition-colors group-hover:border-post group-hover:text-post"
        >
          →
        </span>
      </div>

      <div className="mt-4">
        <div className="h-1 overflow-hidden rounded-full bg-canvas">
          <div className="h-full rounded-full bg-post transition-[width] duration-500" style={{ width: `${ratio * 100}%` }} />
        </div>
        <p className="mt-1.5 text-right text-[11px] tabular-nums text-ink-mute">
          {answered > 0 ? `${answered} / ${part.total} 풀이` : "아직 풀지 않음"}
        </p>
      </div>
    </Link>
  );
}
