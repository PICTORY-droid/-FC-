"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useRecords, useStars } from "@/hooks/useStudyData";
import { accessUntil, daysLeft } from "@/lib/access/days-left";
import { formatKoreanDateTime } from "@/lib/access/format-date";
import { indexBank } from "@/lib/study/bank";
import { readDaily, streakDays } from "@/lib/study/daily";
import { onStudyChanged } from "@/lib/study/events";
import { readExamHistory, type ExamResult } from "@/lib/study/exams";
import { buildReport } from "@/lib/study/report";
import { readKnownTerms } from "@/lib/study/terms";
import type { Part } from "@/types/question";

import { MenuShell, StatTile } from "./MenuShell";

interface Extras {
  exams: ExamResult[];
  stamps: string[];
  knownTerms: number;
  until: number | null;
}

/** 📊 학습 리포트 — PART별 정답률, 약한 PART, 오답·졸업, 이용 기간 */
export function ReportClient({ parts, termCount }: { parts: Part[]; termCount: number }) {
  const bank = useMemo(() => indexBank(parts), [parts]);
  const records = useRecords(bank.answers);
  const { stars } = useStars();
  const [extras, setExtras] = useState<Extras | null>(null);

  useEffect(() => {
    const load = () =>
      setExtras({ exams: readExamHistory(), stamps: readDaily().stamps, knownTerms: readKnownTerms().length, until: accessUntil() });
    load();
    return onStudyChanged(load);
  }, []);

  const report = useMemo(() => (records ? buildReport(parts, records) : null), [parts, records]);

  if (!report || !extras) {
    return (
      <MenuShell emoji="📊" title="학습 리포트" description="불러오는 중이에요…">
        <div className="h-60 animate-pulse rounded-[var(--radius-card)] bg-post-soft" aria-busy="true" />
      </MenuShell>
    );
  }

  const coverage = Math.round((report.tried / report.total) * 100);
  const lastExams = extras.exams.slice(-5);
  const left = extras.until ? daysLeft(extras.until) : null;

  return (
    <MenuShell emoji="📊" title="학습 리포트" description="이 기기에 저장된 풀이 기록으로 만든 나만의 리포트예요.">
      <div className="flex flex-col gap-4">
        {left !== null && (
          <section className={`card flex items-center gap-3 p-4 ${left <= 5 ? "border-signal/40" : ""}`} aria-label="이용 기간">
            <span className="stamp grid size-14 shrink-0 place-items-center bg-post-soft">
              <span className="font-cute text-[20px] tabular-nums text-post">D-{left}</span>
            </span>
            <div className="min-w-0">
              <p className="font-cute text-[16px] text-ink">이용 기간이 {left}일 남았어요</p>
              <p className="text-xs text-ink-soft">{formatKoreanDateTime(extras.until!)}까지 · 끝나면 새 링크를 받아 주세요</p>
            </div>
          </section>
        )}

        <section className="card p-4" aria-label="전체 진도">
          <div className="flex items-end justify-between">
            <p className="font-cute text-[16px] text-ink">전체 진도</p>
            <p className="text-xs tabular-nums text-ink-soft">
              {report.tried} / {report.total}문항 · <b className="text-post">{coverage}%</b>
            </p>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-post-soft">
            <div className="h-full rounded-full bg-post" style={{ width: `${coverage}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            <StatTile label="남은 오답" value={report.wrongNote} tone="signal" />
            <StatTile label="졸업" value={report.graduated} tone="correct" />
            <StatTile label="즐겨찾기" value={stars.length} tone="post" />
            <StatTile label="연속 학습" value={`${streakDays(extras.stamps)}일`} tone="ink" />
          </div>
        </section>

        <section className="card p-4" aria-label="PART별 정답률">
          <p className="font-cute text-[16px] text-ink">PART별 정답률</p>
          <p className="text-[11px] text-ink-mute">푼 문항의 가장 최근 풀이 기준</p>
          <ul className="mt-3 flex flex-col gap-3.5">
            {report.parts.map((p) => (
              <li key={p.part}>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="min-w-0 truncate font-bold text-ink">
                    PART {p.part} <span className="font-normal text-ink-soft">{p.title}</span>
                    {report.weakest?.part === p.part && <span className="chip ml-1.5 bg-signal-soft text-signal">집중 필요</span>}
                  </span>
                  <span className="shrink-0 tabular-nums text-ink-soft">{p.tried > 0 ? <b className="text-post">{p.rate}%</b> : "시작 전"}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-post-soft">
                  <div className={`h-full rounded-full ${p.rate >= 70 ? "bg-correct" : "bg-post"}`} style={{ width: `${p.rate}%` }} />
                </div>
                <p className="mt-1 text-[11px] tabular-nums text-ink-mute">
                  {p.tried} / {p.total}문항 풀이 · 최근 정답 {p.correctNow}문항
                </p>
              </li>
            ))}
          </ul>
          {report.weakest && (
            <Link href={`/quiz/${report.weakest.part}`} className="btn-primary mt-4 block py-3 text-center text-sm">
              PART {report.weakest.part} 다시 공부하기
            </Link>
          )}
        </section>

        <section className="card p-4" aria-label="모의고사 기록">
          <p className="font-cute text-[16px] text-ink">모의고사 기록</p>
          {lastExams.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">아직 응시 기록이 없어요.</p>
          ) : (
            <ol className="mt-3 flex items-end gap-2" aria-label="최근 5회 점수">
              {lastExams.map((x) => {
                const score = Math.round((x.correct / x.total) * 100);
                return (
                  <li key={x.at} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[11px] font-bold tabular-nums text-post">{score}점</span>
                    <span className="flex h-20 w-full items-end overflow-hidden rounded-t-lg bg-post-soft">
                      <span className="w-full rounded-t-lg bg-post" style={{ height: `${Math.max(score, 4)}%` }} />
                    </span>
                    <span className="text-[10px] text-ink-mute">
                      {new Date(x.at).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric", timeZone: "Asia/Seoul" })}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <section className="card flex items-center justify-between p-4" aria-label="용어 카드">
          <div>
            <p className="font-cute text-[16px] text-ink">용어 카드</p>
            <p className="text-xs text-ink-soft">
              {termCount}개 중 <b className="text-correct">{extras.knownTerms}개</b> 외웠어요
            </p>
          </div>
          <Link href="/terms" className="btn-ghost px-4 py-2 text-xs">
            이어서 외우기
          </Link>
        </section>
      </div>
    </MenuShell>
  );
}
