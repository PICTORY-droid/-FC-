"use client";

import { useEffect, useMemo, useState } from "react";

import type { RunnerState, RunnerStorage } from "@/hooks/useQuestionRunner";
import { useRecords } from "@/hooks/useStudyData";
import { indexBank } from "@/lib/study/bank";
import { DAILY_COUNT, ensureToday, koreaDate, readDaily, saveDailyPicks, stampToday, streakDays, type DailyState } from "@/lib/study/daily";
import type { Part } from "@/types/question";

import { MenuShell, StatTile } from "./MenuShell";
import { Postmark } from "./Postmark";
import { PracticeSession } from "./PracticeSession";

const RECENT_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

/** 🔥 오늘의 10문제 — 오답 우선으로 하루 10문제, 끝내면 소인 도장 */
export function TodayClient({ parts }: { parts: Part[] }) {
  const bank = useMemo(() => indexBank(parts), [parts]);
  const records = useRecords(bank.answers);
  const [daily, setDaily] = useState<DailyState | null>(null);
  const [solving, setSolving] = useState(false);
  const [justStamped, setJustStamped] = useState(false);

  useEffect(() => {
    if (records && !daily) setDaily(ensureToday(bank.questions, records));
  }, [records, daily, bank]);

  const storage = useMemo<RunnerStorage>(
    () => ({
      load: () => {
        const d = readDaily();
        return { picks: d.picks, cursor: Math.min(Object.keys(d.picks).length, Math.max(d.ids.length - 1, 0)) } satisfies RunnerState;
      },
      save: (state) => saveDailyPicks(state.picks),
      clear: () => saveDailyPicks({}),
    }),
    [],
  );

  if (!daily) {
    return (
      <MenuShell emoji="🔥" title="오늘의 10문제" description="불러오는 중이에요…">
        <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-post-soft" aria-busy="true" />
      </MenuShell>
    );
  }

  const today = koreaDate();
  const doneToday = daily.stamps.includes(today);
  const answeredToday = daily.ids.filter((id) => daily.picks[id] !== undefined).length;
  const streak = streakDays(daily.stamps);
  const recent = Array.from({ length: RECENT_DAYS }, (_, i) => koreaDate(Date.now() - (RECENT_DAYS - 1 - i) * DAY_MS));

  if (solving) {
    return (
      <PracticeSession
        bank={bank}
        ids={daily.ids}
        badge="오늘의 10문제"
        title={`${Number(today.slice(5, 7))}월 ${Number(today.slice(8))}일의 ${DAILY_COUNT}문제`}
        storage={storage}
        onFinished={() => {
          const stamped = stampToday();
          setJustStamped(stamped);
          setDaily(readDaily());
        }}
        onExit={() => setSolving(false)}
        exitLabel="도장판 보기"
        resultExtra={
          justStamped || doneToday ? (
            <div className="card flex items-center gap-4 p-4">
              <span className="animate-wiggle">
                <Postmark date={today} />
              </span>
              <div>
                <p className="font-cute text-[17px] text-post">오늘 도장 쾅!</p>
                <p className="text-xs text-ink-soft">연속 {streakDays(readDaily().stamps)}일째 이어가고 있어요.</p>
              </div>
            </div>
          ) : null
        }
      />
    );
  }

  return (
    <MenuShell emoji="🔥" title="오늘의 10문제" description="오답노트 문제를 먼저, 그다음 아직 안 푼 문제로 매일 10문제를 골라 드려요.">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          <StatTile label="연속 학습" value={`${streak}일`} tone="post" />
          <StatTile label="모은 도장" value={daily.stamps.length} tone="correct" />
          <StatTile label="오늘 진행" value={`${answeredToday}/${daily.ids.length}`} tone="ink" />
        </div>

        <button type="button" onClick={() => setSolving(true)} className="btn-primary py-3.5 text-sm">
          {doneToday ? "오늘 문제 다시 보기" : answeredToday > 0 ? `이어서 풀기 (${answeredToday + 1}번째부터)` : `오늘의 ${DAILY_COUNT}문제 시작`}
        </button>

        <section className="card p-4" aria-label="최근 2주 도장판">
          <p className="font-cute text-[15px] text-ink">최근 2주 도장판</p>
          <ul className="mt-3 grid grid-cols-7 gap-2">
            {recent.map((date) => (
              <li key={date} className="grid place-items-center">
                <Postmark date={date} active={daily.stamps.includes(date)} size={40} />
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-ink-mute">{doneToday ? "오늘 도장을 받았어요. 내일 또 만나요! 💌" : "10문제를 모두 풀면 오늘 날짜 도장을 받아요."}</p>
        </section>
      </div>
    </MenuShell>
  );
}
