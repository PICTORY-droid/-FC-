"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { computeStats, type Picks } from "@/lib/quiz/stats";
import { recordAnswer } from "@/lib/study/records";
import type { OptionNumber, Question } from "@/types/question";

import type { QuizMode } from "./useQuizMode";

export interface RunnerState {
  picks: Picks;
  cursor: number;
}

/** Where a run is saved. Omit for a run that lives only while the screen is open. */
export interface RunnerStorage {
  load: () => RunnerState | null;
  save: (state: RunnerState) => void;
  clear: () => void;
}

/**
 * Shared solving flow for every menu: ordering, auto/manual grading, navigation,
 * retry-wrong and restart. Every graded answer is also written to the cross-menu
 * study records (오답노트, 리포트).
 *
 * @param questions all questions this run may show
 * @param baseOrder question ids in display order (may change once the shuffle setting loads)
 */
export function useQuestionRunner(questions: Question[], baseOrder: string[], mode: QuizMode, storage?: RunnerStorage) {
  const byId = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions]);
  const [picks, setPicks] = useState<Picks>({});
  const [order, setOrder] = useState<string[]>(baseOrder);
  const [isReview, setIsReview] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [finished, setFinished] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  // manual 모드에서 '정답 확인' 전까지 바꿔 고를 수 있는 임시 선택
  const [draft, setDraft] = useState<OptionNumber | undefined>(undefined);

  const orderKey = baseOrder.join(",");
  useEffect(() => {
    if (!isReview) setOrder(baseOrder);
    // baseOrder identity changes every render upstream; its content is what matters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderKey]);

  useEffect(() => {
    const saved = storage?.load();
    if (saved?.picks) {
      const valid = Object.fromEntries(
        Object.entries(saved.picks).filter(([id, v]) => byId.has(id) && [1, 2, 3, 4].includes(v)),
      ) as Picks;
      setPicks(valid);
      if (Number.isInteger(saved.cursor)) setCursor(Math.min(Math.max(saved.cursor, 0), Math.max(baseOrder.length - 1, 0)));
    }
    setHydrated(true);
    // load once per question set
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byId]);

  useEffect(() => {
    if (hydrated && !isReview) storage?.save({ picks, cursor });
  }, [hydrated, isReview, picks, cursor, storage]);

  const current = byId.get(order[cursor]) ?? byId.get(order[0]) ?? questions[0];
  const selected = current ? picks[current.id] : undefined;

  useEffect(() => {
    setDraft(undefined);
  }, [current?.id]);

  const commit = useCallback(
    (option: OptionNumber) => {
      if (!current || picks[current.id] !== undefined) return;
      setPicks((prev) => ({ ...prev, [current.id]: option }));
      recordAnswer(current.id, option === current.answer);
    },
    [current, picks],
  );

  /** auto: 누르는 즉시 채점 · manual: 임시 선택만 바꿈 */
  const select = useCallback(
    (option: OptionNumber) => {
      if (selected !== undefined) return;
      if (mode === "auto") commit(option);
      else setDraft(option);
    },
    [commit, mode, selected],
  );

  /** manual: 임시 선택을 확정해 채점 */
  const confirm = useCallback(() => {
    if (draft !== undefined) commit(draft);
  }, [commit, draft]);

  const next = useCallback(() => {
    if (cursor >= order.length - 1) setFinished(true);
    else setCursor((c) => c + 1);
  }, [cursor, order.length]);

  const prev = useCallback(() => setCursor((c) => Math.max(c - 1, 0)), []);

  const scope = useMemo(() => questions.filter((q) => baseOrder.includes(q.id)), [questions, orderKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const stats = useMemo(() => computeStats(scope, picks), [scope, picks]);

  const retryWrong = useCallback(() => {
    const wrong = stats.wrongIds;
    if (wrong.length === 0) return;
    setPicks((prev) => Object.fromEntries(Object.entries(prev).filter(([id]) => !wrong.includes(id))) as Picks);
    setOrder(baseOrder.filter((id) => wrong.includes(id)));
    setIsReview(true);
    setCursor(0);
    setFinished(false);
  }, [stats.wrongIds, baseOrder]);

  const restart = useCallback(() => {
    storage?.clear();
    setDraft(undefined);
    setPicks({});
    setIsReview(false);
    setOrder(baseOrder);
    setCursor(0);
    setFinished(false);
  }, [storage, baseOrder]);

  return {
    hydrated,
    current,
    selected,
    draft: selected === undefined ? draft : undefined,
    position: cursor + 1,
    total: order.length,
    isReview,
    finished,
    stats,
    picks,
    scope,
    select,
    confirm,
    next,
    prev,
    retryWrong,
    restart,
  };
}

export type QuestionRunner = ReturnType<typeof useQuestionRunner>;
