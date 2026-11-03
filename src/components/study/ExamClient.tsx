"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { QuestionCard } from "@/components/quiz/QuestionCard";
import { ReviewPanel } from "@/components/quiz/ReviewPanel";
import { ScoreCard } from "@/components/quiz/ScoreCard";
import { useExam } from "@/hooks/useExam";
import { useShuffleSetting } from "@/hooks/useStudyData";
import { indexBank } from "@/lib/study/bank";
import { EXAM_SIZES, SECONDS_PER_QUESTION, readExamHistory, type ExamResult } from "@/lib/study/exams";
import { presentQuestion } from "@/lib/study/shuffle";
import type { Part } from "@/types/question";

import { MenuShell } from "./MenuShell";

function clock(sec: number): string {
  return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
}

function minutes(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}분 ${s}초` : `${s}초`;
}

/** ⏱️ 실전 모의고사 — 전 PART에서 비율대로 출제, 제한 시간 안에 풀고 한 번에 채점 */
export function ExamClient({ parts }: { parts: Part[] }) {
  const bank = useMemo(() => indexBank(parts), [parts]);
  const e = useExam(bank);

  if (!e.loaded) {
    return (
      <MenuShell emoji="⏱️" title="실전 모의고사" description="불러오는 중이에요…">
        <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-post-soft" aria-busy="true" />
      </MenuShell>
    );
  }
  if (e.result && e.exam) return <ExamResultView parts={parts} bankQuestions={bank.questions} exam={e.exam} result={e.result} onAgain={e.leave} />;
  if (e.exam) return <ExamRunner e={e} bank={bank} />;
  return <ExamSetup parts={parts} onStart={e.start} />;
}

function ExamSetup({ parts, onStart }: { parts: Part[]; onStart: (size: number) => void }) {
  const [size, setSize] = useState<number>(EXAM_SIZES[1]);
  const [history, setHistory] = useState<ExamResult[]>([]);
  useEffect(() => setHistory(readExamHistory().slice(-3).reverse()), []);
  const total = parts.reduce((n, p) => n + p.questions.length, 0);

  return (
    <MenuShell emoji="⏱️" title="실전 모의고사" description="모든 PART에서 문항 수 비율대로 무작위 출제해요. 다 풀고 제출하면 한 번에 채점해요.">
      <div className="flex flex-col gap-4">
        <section className="card p-4" aria-labelledby="exam-size">
          <h2 id="exam-size" className="font-cute text-[16px] text-ink">
            문항 수
          </h2>
          <div role="radiogroup" aria-labelledby="exam-size" className="mt-2.5 grid grid-cols-3 gap-2">
            {EXAM_SIZES.map((n) => {
              const active = size === n;
              return (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSize(n)}
                  className={`rounded-2xl border-[1.5px] py-3 text-center transition-colors ${
                    active ? "border-post bg-post-soft ring-2 ring-post/25" : "border-line bg-surface active:bg-post-soft"
                  }`}
                >
                  <span className={`block font-cute text-xl ${active ? "text-post" : "text-ink"}`}>{n}문항</span>
                  <span className="text-[11px] text-ink-mute">{(n * SECONDS_PER_QUESTION) / 60}분</span>
                </button>
              );
            })}
          </div>
          <ul className="mt-3 space-y-1 text-[12px] text-ink-soft">
            {parts.map((p) => (
              <li key={p.part}>
                · PART {p.part} {p.title} — 약 {Math.round((size * p.questions.length) / total)}문항
              </li>
            ))}
          </ul>
        </section>

        <button type="button" onClick={() => onStart(size)} className="btn-primary py-3.5 text-sm">
          {size}문항 모의고사 시작
        </button>
        <p className="-mt-2 text-center text-[11px] text-ink-mute">제한 시간이 끝나면 자동으로 제출돼요. 앱을 닫아도 이어서 볼 수 있어요.</p>

        {history.length > 0 && (
          <section className="card p-4" aria-label="최근 응시 기록">
            <p className="font-cute text-[15px] text-ink">최근 응시 기록</p>
            <ul className="mt-2 divide-y divide-line">
              {history.map((h) => (
                <li key={h.at} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-ink-soft">
                    {new Date(h.at).toLocaleDateString("ko-KR", { month: "long", day: "numeric", timeZone: "Asia/Seoul" })} · {h.total}문항
                  </span>
                  <span className="font-cute text-[17px] tabular-nums text-post">{Math.round((h.correct / h.total) * 100)}점</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </MenuShell>
  );
}

function ExamRunner({ e, bank }: { e: ReturnType<typeof useExam>; bank: ReturnType<typeof indexBank> }) {
  const exam = e.exam!;
  const { setting } = useShuffleSetting();
  const [confirming, setConfirming] = useState(false);
  const id = exam.ids[e.cursor];
  const question = bank.byId.get(id)!;
  const part = bank.partOf(id);
  const view = useMemo(() => presentQuestion(question, setting), [question, setting]);
  const unanswered = exam.ids.length - e.answeredCount;
  const urgent = e.left <= 60;

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setConfirming(false);
  }, [e.cursor]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
      <header className="sticky top-0 z-10 -mx-4 bg-canvas/95 px-4 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)] backdrop-blur">
        <div className="flex items-center justify-between">
          <button type="button" onClick={e.quit} className="btn-ghost px-3 py-1.5 text-xs">
            응시 그만두기
          </button>
          <span className={`chip text-[13px] tabular-nums ${urgent ? "bg-signal text-white" : "bg-post-soft text-post"}`} role="timer" aria-live={urgent ? "polite" : "off"}>
            ⏱️ {clock(e.left)}
          </span>
        </div>
        <div className="mt-2.5 flex items-end justify-between">
          <h1 className="font-cute text-[18px] text-ink">실전 모의고사</h1>
          <p className="text-xs tabular-nums text-ink-mute">
            <span className="font-bold text-post">{e.cursor + 1}</span> / {exam.ids.length} · 푼 문항 {e.answeredCount}
          </p>
        </div>
        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-post-soft" role="progressbar" aria-valuemin={0} aria-valuemax={exam.ids.length} aria-valuenow={e.answeredCount}>
          <div className="h-full rounded-full bg-post transition-[width] duration-300" style={{ width: `${(e.answeredCount / exam.ids.length) * 100}%` }} />
        </div>
      </header>

      <div className="mt-5 flex flex-col gap-5">
        <QuestionCard
          question={view.question}
          selected={view.toShown(exam.picks[id])}
          onSelect={(n) => e.pick(id, view.toOriginal(n))}
          partLabel={part ? `PART ${part.part}` : undefined}
          reveal={false}
        />

        <nav className="flex gap-3" aria-label="문항 이동">
          <button type="button" onClick={() => e.setCursor(Math.max(e.cursor - 1, 0))} disabled={e.cursor === 0} className="btn-ghost flex-1 py-3.5 text-sm">
            이전 문항
          </button>
          {e.cursor < exam.ids.length - 1 ? (
            <button type="button" onClick={() => e.setCursor(e.cursor + 1)} className="btn-primary flex-1 py-3.5 text-sm">
              다음 문항 →
            </button>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} className="btn-primary flex-1 py-3.5 text-sm">
              제출하기
            </button>
          )}
        </nav>

        <section className="card p-4" aria-label="문항 바로가기">
          <div className="flex items-center justify-between">
            <p className="font-cute text-[15px] text-ink">문항 바로가기</p>
            <button type="button" onClick={() => setConfirming(true)} className="chip bg-post text-white">
              제출하기
            </button>
          </div>
          <ol className="mt-3 grid grid-cols-8 gap-1.5">
            {exam.ids.map((qid, i) => {
              const done = exam.picks[qid] !== undefined;
              const here = i === e.cursor;
              return (
                <li key={qid}>
                  <button
                    type="button"
                    onClick={() => e.setCursor(i)}
                    aria-label={`${i + 1}번 ${done ? "풀었음" : "안 풀었음"}`}
                    aria-current={here}
                    className={`grid h-8 w-full place-items-center rounded-lg text-[11px] font-bold tabular-nums ${
                      done ? "bg-post text-white" : "bg-canvas text-ink-mute ring-1 ring-line"
                    } ${here ? "ring-2 ring-sunny ring-offset-1" : ""}`}
                  >
                    {i + 1}
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        {confirming && (
          <div role="alertdialog" aria-label="제출 확인" className="card border-post/40 p-4 text-center">
            <p className="font-cute text-[16px] text-ink">{unanswered > 0 ? `아직 ${unanswered}문항을 안 풀었어요` : "모든 문항을 풀었어요"}</p>
            <p className="mt-1 text-xs text-ink-soft">제출하면 바로 채점하고 더는 고칠 수 없어요.</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => setConfirming(false)} className="btn-ghost flex-1 py-3 text-sm">
                계속 풀기
              </button>
              <button type="button" onClick={e.submit} className="btn-primary flex-1 py-3 text-sm">
                제출하고 채점
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

interface ResultProps {
  parts: Part[];
  bankQuestions: ReturnType<typeof indexBank>["questions"];
  exam: NonNullable<ReturnType<typeof useExam>["exam"]>;
  result: ExamResult;
  onAgain: () => void;
}

function ExamResultView({ parts, bankQuestions, exam, result, onAgain }: ResultProps) {
  const [reviewing, setReviewing] = useState(false);
  const questions = useMemo(() => {
    const set = new Set(exam.ids);
    return bankQuestions.filter((q) => set.has(q.id));
  }, [bankQuestions, exam.ids]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [reviewing]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-10 pt-[max(env(safe-area-inset-top),1rem)]">
      {reviewing ? (
        <ReviewPanel questions={questions} picks={exam.picks} onBack={() => setReviewing(false)} />
      ) : (
        <section className="flex flex-col gap-4 py-2" aria-label="모의고사 결과">
          <h1 className="font-cute text-[22px] text-post">⏱️ 모의고사 결과</h1>
          <ScoreCard
            total={result.total}
            answered={result.answered}
            correct={result.correct}
            wrongCount={result.answered - result.correct}
            scoreBase="total"
            extra={<p className="mt-1 text-xs text-ink-mute">소요 시간 {minutes(result.durationSec)}</p>}
          />

          <section className="card p-4" aria-label="PART별 정답률">
            <p className="font-cute text-[15px] text-ink">PART별 정답률</p>
            <ul className="mt-3 flex flex-col gap-3">
              {result.parts.map((ps) => {
                const rate = ps.total ? Math.round((ps.correct / ps.total) * 100) : 0;
                const title = parts.find((p) => p.part === ps.part)?.title ?? "";
                return (
                  <li key={ps.part}>
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-ink">
                        PART {ps.part} <span className="font-normal text-ink-soft">{title}</span>
                      </span>
                      <span className="tabular-nums text-ink-soft">
                        {ps.correct}/{ps.total} · <b className="text-post">{rate}%</b>
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-post-soft">
                      <div className={`h-full rounded-full ${rate >= 70 ? "bg-correct" : "bg-post"}`} style={{ width: `${rate}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <button type="button" onClick={() => setReviewing(true)} disabled={result.answered === 0} className="btn-primary py-3.5 text-sm">
            📝 풀이 확인
          </button>
          <div className="flex gap-3">
            <button type="button" onClick={onAgain} className="btn-ghost flex-1 py-3.5 text-sm">
              새 모의고사
            </button>
            <Link href="/" className="btn-ghost flex-1 py-3.5 text-center text-sm">
              홈으로
            </Link>
          </div>
          <p className="text-center text-[11px] text-ink-mute">틀린 문제는 📒 오답노트에 자동으로 모였어요.</p>
        </section>
      )}
    </main>
  );
}
