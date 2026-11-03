"use client";

import { useCallback, useEffect, useState } from "react";

import { readJson, writeJson } from "@/lib/storage/safe-storage";

/**
 * auto   — 선지를 누르는 즉시 채점(바꿀 수 없음)
 * manual — 선지를 자유롭게 바꿔 고른 뒤 '정답 확인'을 눌러 채점
 */
export type QuizMode = "auto" | "manual";

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
