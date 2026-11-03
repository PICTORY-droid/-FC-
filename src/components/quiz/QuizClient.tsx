"use client";

import { useEffect } from "react";

import { FactGuardChat } from "@/components/chat/FactGuardChat";
import { QUIZ_MODES, useQuizMode } from "@/hooks/useQuizMode";
import { useQuizSession } from "@/hooks/useQuizSession";
import type { Part } from "@/types/question";

import { QuestionCard } from "./QuestionCard";
import { QuizHeader } from "./QuizHeader";
import { QuizNav } from "./QuizNav";
import { ResultPanel } from "./ResultPanel";

export function QuizClient({ part }: { part: Part }) {
  const { mode } = useQuizMode();
  const s = useQuizSession(part.part, part.questions, mode);
  const answered = s.selected !== undefined;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [s.current.id, s.finished]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
      <QuizHeader
        partNo={part.part}
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
      ) : s.finished ? (
        <ResultPanel
          total={part.questions.length}
          answered={s.stats.answered}
          correct={s.stats.correct}
          wrongCount={s.stats.wrongIds.length}
          onRetryWrong={s.retryWrong}
          onRestart={s.restart}
        />
      ) : (
        <div className="mt-5 flex flex-col gap-5">
          <QuestionCard question={s.current} selected={s.selected} pending={s.draft} onSelect={s.select} />
          <QuizNav
            canPrev={s.position > 1}
            isLast={s.position === s.total}
            awaitingConfirm={mode === "manual" && !answered}
            canConfirm={s.draft !== undefined}
            onPrev={s.prev}
            onNext={s.next}
            onConfirm={s.confirm}
          />
          <FactGuardChat question={s.current} answered={answered} />
        </div>
      )}
    </main>
  );
}
