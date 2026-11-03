"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { progressKey, readJson, removeKey, writeJson } from "@/lib/storage/safe-storage";
import type { OptionNumber, Question } from "@/types/question";

type Picks = Record<string, OptionNumber>;

interface StoredProgress {
  picks: Picks;
  cursor: number;
}

export interface QuizStats {
  answered: number;
  correct: number;
  wrongIds: string[];
}

export function computeStats(questions: Question[], picks: Picks): QuizStats {
  let answered = 0;
  let correct = 0;
  const wrongIds: string[] = [];
  for (const q of questions) {
    const pick = picks[q.id];
    if (pick === undefined) continue;
    answered += 1;
    if (pick === q.answer) correct += 1;
    else wrongIds.push(q.id);
  }
  return { answered, correct, wrongIds };
}

/** Quiz navigation + grading state for one part, persisted per device. */
export function useQuizSession(partNo: number, questions: Question[]) {
  const [picks, setPicks] = useState<Picks>({});
  const [order, setOrder] = useState<string[]>(() => questions.map((q) => q.id));
  const [cursor, setCursor] = useState(0);
  const [finished, setFinished] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const byId = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions]);

  useEffect(() => {
    const saved = readJson<StoredProgress | null>(progressKey(partNo), null);
    if (saved?.picks) {
      const valid = Object.fromEntries(
        Object.entries(saved.picks).filter(([id, v]) => byId.has(id) && [1, 2, 3, 4].includes(v)),
      ) as Picks;
      setPicks(valid);
      if (Number.isInteger(saved.cursor)) setCursor(Math.min(Math.max(saved.cursor, 0), questions.length - 1));
    }
    setHydrated(true);
  }, [partNo, byId, questions.length]);

  useEffect(() => {
    if (hydrated && order.length === questions.length) writeJson(progressKey(partNo), { picks, cursor });
  }, [hydrated, partNo, picks, cursor, order.length, questions.length]);

  const current = byId.get(order[cursor]) ?? questions[0];
  const selected = picks[current.id];

  const select = useCallback(
    (option: OptionNumber) => setPicks((prev) => (prev[current.id] ? prev : { ...prev, [current.id]: option })),
    [current.id],
  );

  const next = useCallback(() => {
    if (cursor >= order.length - 1) setFinished(true);
    else setCursor((c) => c + 1);
  }, [cursor, order.length]);

  const prev = useCallback(() => setCursor((c) => Math.max(c - 1, 0)), []);

  const retryWrong = useCallback(() => {
    const wrong = computeStats(questions, picks).wrongIds;
    if (wrong.length === 0) return;
    setPicks((prev) => Object.fromEntries(Object.entries(prev).filter(([id]) => !wrong.includes(id))) as Picks);
    setOrder(wrong);
    setCursor(0);
    setFinished(false);
  }, [questions, picks]);

  const restart = useCallback(() => {
    removeKey(progressKey(partNo));
    setPicks({});
    setOrder(questions.map((q) => q.id));
    setCursor(0);
    setFinished(false);
  }, [partNo, questions]);

  const stats = useMemo(() => computeStats(questions, picks), [questions, picks]);

  return {
    hydrated,
    current,
    selected,
    position: cursor + 1,
    total: order.length,
    isReview: order.length !== questions.length,
    finished,
    stats,
    select,
    next,
    prev,
    retryWrong,
    restart,
  };
}
