"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { onStudyChanged } from "@/lib/study/events";
import { readRecords, type Records } from "@/lib/study/records";
import { readShuffle, writeShuffle, type ShuffleSetting } from "@/lib/study/shuffle";
import { readStars, toggleStar } from "@/lib/study/stars";
import type { OptionNumber } from "@/types/question";

/** Re-reads `read()` on mount and whenever study data changes; null until loaded. */
function useStored<T>(read: () => T): T | null {
  const [value, setValue] = useState<T | null>(null);
  useEffect(() => {
    const load = () => setValue(read());
    load();
    return onStudyChanged(load);
  }, [read]);
  return value;
}

/** @param answers question id → correct option (needed once to fold in older PART progress) */
export function useRecords(answers: Record<string, OptionNumber>): Records | null {
  const read = useCallback(() => readRecords(answers), [answers]);
  return useStored(read);
}

export function useStars() {
  const stars = useStored(readStars);
  const set = useMemo(() => new Set(stars ?? []), [stars]);
  return { stars: stars ?? [], loaded: stars !== null, isStarred: (id: string) => set.has(id), toggle: toggleStar };
}

const OFF: ShuffleSetting = { on: false, seed: 0 };

export function useShuffleSetting() {
  const setting = useStored(readShuffle);
  return { setting: setting ?? OFF, loaded: setting !== null, setOn: writeShuffle };
}
