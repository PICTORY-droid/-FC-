"use client";

import { useCallback, useEffect, useState } from "react";

import { readJson, writeJson } from "@/lib/storage/safe-storage";

/**
 * auto   — 선지를 누르는 즉시 채점(바꿀 수 없음)
 * manual — 선지를 자유롭게 바꿔 고른 뒤 '정답 확인'을 눌러 채점
 */
export type QuizMode = "auto" | "manual";

/** Labels shared by the home picker and the in-quiz badge. */
export const QUIZ_MODES: Record<QuizMode, { label: string; description: string }> = {
  auto: { label: "바로 채점", description: "선지를 누르면 바로 정답을 알려드려요." },
  manual: { label: "직접 확인", description: "여러 번 바꿔 골라 보고 '정답 확인'을 눌러요." },
};

const MODE_KEY = "pqb:mode:v1";

/** Grading-mode preference, remembered on this device for every part. */
export function useQuizMode() {
  const [mode, setModeState] = useState<QuizMode>("auto");

  useEffect(() => {
    const saved = readJson<QuizMode | null>(MODE_KEY, null);
    if (saved === "auto" || saved === "manual") setModeState(saved);
  }, []);

  const setMode = useCallback((next: QuizMode) => {
    setModeState(next);
    writeJson(MODE_KEY, next);
  }, []);

  return { mode, setMode };
}
