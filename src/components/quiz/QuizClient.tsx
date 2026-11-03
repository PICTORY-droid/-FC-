"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { QUIZ_MODES, useQuizMode } from "@/hooks/useQuizMode";
import { useQuizSession } from "@/hooks/useQuizSession";
import type { Part } from "@/types/question";

import { CheerToast } from "./CheerToast";
import { QuizHeader } from "./QuizHeader";
import { ResetNotice } from "./ResetNotice";
import { ResultPanel } from "./ResultPanel";
import { ReviewPanel } from "./ReviewPanel";
import { SolveStep } from "./SolveStep";

const RESET_NOTICE_MS = 1300;

export function QuizClient({ part }: { part: Part }) {
  const { mode } = useQuizMode();
  const s = useQuizSession(part.part, part.questions, mode);
  const router = useRouter();
  const [reviewing, setReviewing] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [s.current.id, s.finished, reviewing]);

  // 초기화 안내를 잠깐 보여 준 뒤 메인으로 이동
  useEffect(() => {
    if (!resetting) return;
    const timer = window.setTimeout(() => router.replace("/"), RESET_NOTICE_MS);
    return () => window.clearTimeout(timer);
  }, [resetting, router]);

  const { restart } = s;
  const reset = useCallback(() => {
    restart();
    setResetting(true);
  }, [restart]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
      {resetting && <ResetNotice />}
      <CheerToast answered={s.stats.answered} ready={s.hydrated} />
      <QuizHeader
        badge={`PART ${part.part}`}
        title={part.title}
        position={s.position}
        total={s.total}
        correct={s.stats.correct}
        answered={s.stats.answered}
        isReview={s.isReview}
        modeLabel={QUIZ_MODES[mode].label}
      />

      {!s.hydrated ? (
        <div className="mt-5 flex flex-col gap-3" aria-busy="true">
          <div className="h-28 animate-pulse rounded-[var(--radius-card)] bg-post-soft" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-post-soft/70" />
          ))}
        </div>
      ) : s.finished && reviewing ? (
        <ReviewPanel questions={part.questions} picks={s.picks} onBack={() => setReviewing(false)} />
      ) : s.finished ? (
        <ResultPanel
          total={part.questions.length}
          answered={s.stats.answered}
          correct={s.stats.correct}
          wrongCount={s.stats.wrongIds.length}
          onRetryWrong={() => {
            setReviewing(false);
            s.retryWrong();
          }}
          onRestart={reset}
          onReview={() => setReviewing(true)}
        />
      ) : (
        <SolveStep runner={s} mode={mode} partTitle={part.title} />
      )}
    </main>
  );
}
