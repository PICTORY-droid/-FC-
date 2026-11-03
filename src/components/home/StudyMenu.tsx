"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useRecords, useStars } from "@/hooks/useStudyData";
import { koreaDate, readDaily } from "@/lib/study/daily";
import { onStudyChanged } from "@/lib/study/events";
import { isInWrongNote } from "@/lib/study/records";
import type { OptionNumber } from "@/types/question";

interface Tile {
  href: string;
  emoji: string;
  title: string;
  hint: (c: Counts) => string;
}

interface Counts {
  wrong: number;
  stars: number;
  todayDone: boolean;
}

const TILES: Tile[] = [
  { href: "/today", emoji: "🔥", title: "오늘의 10문제", hint: (c) => (c.todayDone ? "오늘 도장 완료 ✓" : "하루 10문제 · 도장 모으기") },
  { href: "/wrong-note", emoji: "📒", title: "오답노트", hint: (c) => (c.wrong > 0 ? `남은 오답 ${c.wrong}문항` : "틀린 문제가 모여요") },
  { href: "/exam", emoji: "⏱️", title: "실전 모의고사", hint: () => "시간 제한 · 한 번에 채점" },
  { href: "/stars", emoji: "⭐", title: "즐겨찾기", hint: (c) => (c.stars > 0 ? `${c.stars}문항 모음` : "헷갈린 문제 모아보기") },
  { href: "/terms", emoji: "📖", title: "핵심 용어 카드", hint: () => "교재 용어해설 암기" },
  { href: "/report", emoji: "📊", title: "학습 리포트", hint: () => "정답률 · 약한 PART" },
];

/** 홈 학습 메뉴 — 각 메뉴의 현재 상태를 한 줄로 보여 줌 */
export function StudyMenu({ answers }: { answers: Record<string, OptionNumber> }) {
  const records = useRecords(answers);
  const { stars } = useStars();
  const [todayDone, setTodayDone] = useState(false);

  useEffect(() => {
    const load = () => setTodayDone(readDaily().stamps.includes(koreaDate()));
    load();
    return onStudyChanged(load);
  }, []);

  const counts: Counts = {
    wrong: records ? Object.values(records).filter(isInWrongNote).length : 0,
    stars: stars.length,
    todayDone,
  };

  return (
    <section aria-labelledby="menu-title" className="mb-6">
      <h2 id="menu-title" className="mb-2 font-cute text-[16px] text-ink">
        학습 메뉴
      </h2>
      <ul className="grid grid-cols-2 gap-2.5">
        {TILES.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="card flex h-full items-start gap-2.5 p-3.5 transition-transform active:scale-[0.98]">
              <span className="stamp grid size-10 shrink-0 place-items-center bg-post-soft text-[19px]" aria-hidden>
                {t.emoji}
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] font-bold leading-tight tracking-tight text-ink">{t.title}</span>
                <span className="mt-1 block text-[11px] leading-snug text-ink-mute">{t.hint(counts)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
