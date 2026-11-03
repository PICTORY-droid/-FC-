"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { BankIndex } from "@/lib/study/bank";
import {
  discardExam,
  finishExam,
  gradeExam,
  readActiveExam,
  remainingSec,
  saveExamPicks,
  startExam,
  type ActiveExam,
  type ExamResult,
} from "@/lib/study/exams";
import { recordAnswer } from "@/lib/study/records";
import type { OptionNumber } from "@/types/question";

/** 실전 모의고사 상태: 응시 중 기록은 앱을 꺼도 유지되고, 시간이 다 되면 자동 제출 */
export function useExam(bank: BankIndex) {
  const [exam, setExam] = useState<ActiveExam | null>(null);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [cursor, setCursor] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = readActiveExam();
    // 저장된 문항이 지금 문제은행에 모두 있을 때만 이어서 응시
    if (saved && saved.ids.every((id) => bank.byId.has(id))) setExam(saved);
    else if (saved) discardExam();
    setLoaded(true);
  }, [bank]);

  const answers = useMemo(() => new Map(Object.entries(bank.answers)), [bank]);

  const submit = useCallback(() => {
    if (!exam) return;
    const graded = gradeExam(exam, answers);
    for (const id of exam.ids) {
      const pick = exam.picks[id];
      if (pick !== undefined) recordAnswer(id, pick === answers.get(id));
    }
    finishExam(graded);
    setResult(graded);
  }, [exam, answers]);

  const left = exam && !result ? remainingSec(exam, now) : 0;

  useEffect(() => {
    if (!exam || result) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [exam, result]);

  useEffect(() => {
    if (exam && !result && loaded && left === 0) submit();
  }, [exam, result, loaded, left, submit]);

  const start = useCallback(
    (size: number) => {
      setResult(null);
      setCursor(0);
      setNow(Date.now());
      setExam(startExam(bank.parts, size));
    },
    [bank],
  );

  const pick = useCallback(
    (id: string, option: OptionNumber) => {
      setExam((prev) => {
        if (!prev) return prev;
        const next = { ...prev, picks: { ...prev.picks, [id]: option } };
        saveExamPicks(next.picks);
        return next;
      });
    },
    [],
  );

  const leave = useCallback(() => {
    setExam(null);
    setResult(null);
  }, []);

  const quit = useCallback(() => {
    discardExam();
    leave();
  }, [leave]);

  return {
    loaded,
    exam,
    result,
    cursor,
    setCursor,
    left,
    answeredCount: exam ? Object.keys(exam.picks).length : 0,
    start,
    pick,
    submit,
    leave,
    quit,
  };
}
