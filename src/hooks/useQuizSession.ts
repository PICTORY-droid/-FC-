"use client";

import { useMemo } from "react";

import {
  LAST_PART_KEY,
  PROGRESS_CHANGED_EVENT,
  progressKey,
  readJson,
  removeKey,
  writeJson,
  type LastPart,
} from "@/lib/storage/safe-storage";
import { orderIds } from "@/lib/study/shuffle";
import type { Question } from "@/types/question";

import type { QuizMode } from "./useQuizMode";
import { useQuestionRunner, type RunnerState, type RunnerStorage } from "./useQuestionRunner";
import { useShuffleSetting } from "./useStudyData";

export { computeStats, type QuizStats } from "@/lib/quiz/stats";

/** One PART solved in book order (or the device's shuffled order), saved per device. */
export function useQuizSession(partNo: number, questions: Question[], mode: QuizMode = "auto") {
  const { setting, loaded } = useShuffleSetting();

  const storage = useMemo<RunnerStorage>(
    () => ({
      load: () => readJson<RunnerState | null>(progressKey(partNo), null),
      save: (state) => {
        writeJson(progressKey(partNo), state);
        if (Object.keys(state.picks).length > 0) writeJson(LAST_PART_KEY, { part: partNo, at: Date.now() } satisfies LastPart);
      },
      /** 초기화: 이 PART의 풀이 기록과 '이어풀기' 안내를 지움 */
      clear: () => {
        removeKey(progressKey(partNo));
        if (readJson<LastPart | null>(LAST_PART_KEY, null)?.part === partNo) removeKey(LAST_PART_KEY);
        window.dispatchEvent(new Event(PROGRESS_CHANGED_EVENT));
        window.scrollTo({ top: 0 });
      },
    }),
    [partNo],
  );

  const ids = useMemo(() => questions.map((q) => q.id), [questions]);
  const order = useMemo(() => orderIds(ids, setting, `part${partNo}`), [ids, setting, partNo]);
  const runner = useQuestionRunner(questions, order, mode, storage);

  return { ...runner, hydrated: runner.hydrated && loaded };
}
