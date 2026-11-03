/**
 * 문항·선지 섞기. Option order changes only for questions whose wording never points
 * at an option by its number (①②, ㄱㄴ …) — otherwise the 해설 would stop matching.
 * Answers are always stored in the original numbering.
 */
import { readJson, writeJson } from "@/lib/storage/safe-storage";
import type { OptionNumber, Question } from "@/types/question";

import { emitStudyChanged } from "./events";
import { hashString, randomSeed, seededRandom, shuffled } from "./random";

export const SHUFFLE_KEY = "pqb:shuffle:v1";

export interface ShuffleSetting {
  on: boolean;
  seed: number;
}

export function readShuffle(): ShuffleSetting {
  const saved = readJson<Partial<ShuffleSetting> | null>(SHUFFLE_KEY, null);
  return { on: saved?.on === true, seed: typeof saved?.seed === "number" ? saved.seed : 0 };
}

export function writeShuffle(on: boolean): ShuffleSetting {
  const next = { on, seed: on ? randomSeed() : 0 };
  writeJson(SHUFFLE_KEY, next);
  emitStudyChanged();
  return next;
}

const NUMBERED_REFERENCE = /[①②③④⑤㉠㉡㉢㉣ⓐⓑⓒⓓ]|(^|[\s,(])[ㄱㄴㄷㄹ가나다라](\s*[,·]\s*[ㄱㄴㄷㄹ가나다라])+/;

export function canShuffleOptions(q: Question): boolean {
  const texts = [q.question, q.explanation ?? "", ...q.options];
  return !texts.some((t) => NUMBERED_REFERENCE.test(t));
}

export function orderIds(ids: string[], setting: ShuffleSetting, salt = ""): string[] {
  return setting.on ? shuffled(ids, seededRandom(hashString(`${setting.seed}|order|${salt}`))) : ids;
}

export interface PresentedQuestion {
  question: Question;
  toOriginal: (shown: OptionNumber) => OptionNumber;
  toShown: (original: OptionNumber | undefined) => OptionNumber | undefined;
}

const IDENTITY: OptionNumber[] = [1, 2, 3, 4];

/** The question as displayed, plus converters between shown and original option numbers. */
export function presentQuestion(q: Question, setting: ShuffleSetting): PresentedQuestion {
  // perm[shownIndex] = original option number
  const perm = setting.on && canShuffleOptions(q) ? shuffled(IDENTITY, seededRandom(hashString(`${setting.seed}|${q.id}`))) : IDENTITY;
  const options = perm.map((n) => q.options[n - 1]) as Question["options"];
  const answer = (perm.indexOf(q.answer) + 1) as OptionNumber;
  return {
    question: perm === IDENTITY ? q : { ...q, options, answer },
    toOriginal: (shown) => perm[shown - 1],
    toShown: (original) => (original === undefined ? undefined : ((perm.indexOf(original) + 1) as OptionNumber)),
  };
}
