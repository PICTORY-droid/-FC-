"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { CheerToast } from "@/components/quiz/CheerToast";
import { QuizHeader } from "@/components/quiz/QuizHeader";
import { ReviewPanel } from "@/components/quiz/ReviewPanel";
import { ScoreCard } from "@/components/quiz/ScoreCard";
import { SolveStep } from "@/components/quiz/SolveStep";
import { useQuestionRunner, type RunnerStorage } from "@/hooks/useQuestionRunner";
import { QUIZ_MODES, useQuizMode } from "@/hooks/useQuizMode";
import type { BankIndex } from "@/lib/study/bank";

interface Props {
  bank: BankIndex;
  /** 풀 문항 id (표시 순서) */
  ids: string[];
  badge: string;
  title: string;
  storage?: RunnerStorage;
  /** 결과 화면 위에 덧붙일 내용 (예: 졸업 안내, 도장) */
  resultExtra?: React.ReactNode;
  onFinished?: () => void;
  onExit: () => void;
  exitLabel?: string;
}

/** 여러 PART 문항을 섞어 푸는 공통 세션 (오답노트·즐겨찾기·오늘의 10문제) */
export function PracticeSession({ bank, ids, badge, title, storage, resultExtra, onFinished, onExit, exitLabel = "메뉴로 돌아가기" }: Props) {
  const { mode } = useQuizMode();
  const questions = useMemo(() => ids.map((id) => bank.byId.get(id)).filter((q) => q !== undefined), [ids, bank]);
  const s = useQuestionRunner(questions, ids, mode, storage);
  const [reviewing, setReviewing] = useState(false);
  const part = bank.partOf(s.current?.id ?? "");

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [s.current?.id, s.finished, reviewing]);

  useEffect(() => {
    if (s.finished) onFinished?.();
    // notify once when the run ends
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.finished]);

  if (questions.length === 0) return null;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
      <CheerToast answered={s.stats.answered} ready={s.hydrated} />
      <QuizHeader
        badge={badge}
        title={title}
        position={s.position}
        total={s.total}
        correct={s.stats.correct}
        answered={s.stats.answered}
        isReview={s.isReview}
        modeLabel={QUIZ_MODES[mode].label}
        backHref="/"
        backLabel="← 홈"
      />

      {!s.hydrated ? (
        <div className="mt-5 h-40 animate-pulse rounded-[var(--radius-card)] bg-post-soft" aria-busy="true" />
      ) : s.finished && reviewing ? (
        <ReviewPanel questions={s.scope} picks={s.picks} onBack={() => setReviewing(false)} />
      ) : s.finished ? (
        <section className="flex flex-col gap-4 py-6" aria-label="풀이 결과">
          <ScoreCard total={s.scope.length} answered={s.stats.answered} correct={s.stats.correct} wrongCount={s.stats.wrongIds.length} />
          {resultExtra}
          <button
            type="button"
            onClick={() => {
              setReviewing(false);
              s.retryWrong();
            }}
            disabled={s.stats.wrongIds.length === 0}
            className="btn-primary py-3.5 text-sm"
          >
            {s.stats.wrongIds.length > 0 ? `틀린 ${s.stats.wrongIds.length}문항 다시 풀기` : "틀린 문항이 없어요"}
          </button>
          <div className="flex gap-3">
            <button type="button" onClick={onExit} className="btn-ghost flex-1 py-3.5 text-sm">
              {exitLabel}
            </button>
            <button type="button" onClick={() => setReviewing(true)} disabled={s.stats.answered === 0} className="btn-ghost flex-1 py-3.5 text-sm">
              📝 풀이 확인
            </button>
          </div>
          <Link href="/" className="text-center text-xs font-bold text-ink-mute active:text-post">
            홈으로
          </Link>
        </section>
      ) : (
        <SolveStep runner={s} mode={mode} partTitle={part?.title ?? ""} partLabel={part ? `PART ${part.part}` : undefined} />
      )}
    </main>
  );
}
