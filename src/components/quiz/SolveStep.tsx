"use client";

import { useMemo } from "react";

import { FactGuardChat } from "@/components/chat/FactGuardChat";
import type { QuestionRunner } from "@/hooks/useQuestionRunner";
import type { QuizMode } from "@/hooks/useQuizMode";
import { useShuffleSetting, useStars } from "@/hooks/useStudyData";
import { presentQuestion } from "@/lib/study/shuffle";

import { QuestionCard } from "./QuestionCard";
import { QuizNav } from "./QuizNav";

interface Props {
  runner: QuestionRunner;
  mode: QuizMode;
  /** 문항이 속한 PART 제목 (누리 도우미 안내용) */
  partTitle: string;
  /** 여러 PART가 섞이는 메뉴에서 문항 출처 칩 */
  partLabel?: string;
}

/** One question of any menu: shuffled display, star, navigation and the 누리 helper. */
export function SolveStep({ runner: s, mode, partTitle, partLabel }: Props) {
  const { setting } = useShuffleSetting();
  const { isStarred, toggle } = useStars();
  const view = useMemo(() => presentQuestion(s.current, setting), [s.current, setting]);
  const answered = s.selected !== undefined;

  return (
    <div className="mt-5 flex flex-col gap-5">
      <QuestionCard
        question={view.question}
        selected={view.toShown(s.selected)}
        pending={view.toShown(s.draft)}
        onSelect={(n) => s.select(view.toOriginal(n))}
        starred={isStarred(s.current.id)}
        onToggleStar={() => toggle(s.current.id)}
        partLabel={partLabel}
      />
      <QuizNav
        canPrev={s.position > 1}
        isLast={s.position === s.total}
        awaitingConfirm={mode === "manual" && !answered}
        canConfirm={s.draft !== undefined}
        onPrev={s.prev}
        onNext={s.next}
        onConfirm={s.confirm}
      />
      <FactGuardChat question={view.question} partTitle={partTitle} answered={answered} picked={view.toShown(s.selected)} />
    </div>
  );
}
