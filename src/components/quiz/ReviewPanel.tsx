"use client";

import { useMemo, useState } from "react";

import { Mascot } from "@/components/brand/Mascot";
import { buildReview, filterReview, type ReviewFilter, type ReviewItem } from "@/lib/quiz/review";
import type { OptionNumber, Question } from "@/types/question";

const MARKS = ["①", "②", "③", "④"] as const;
const NO_EXPLANATION = "교재에 별도 해설이 없는 문항이에요.";

interface Props {
  questions: Question[];
  picks: Record<string, OptionNumber>;
  onBack: () => void;
}

/** 풀이 확인: 푼 문항을 틀린/맞힌 문제로 나눠 보고, 틀린 문제는 풀이까지 확인. */
export function ReviewPanel({ questions, picks, onBack }: Props) {
  const items = useMemo(() => buildReview(questions, picks), [questions, picks]);
  const wrongCount = items.filter((i) => !i.isCorrect).length;
  const [filter, setFilter] = useState<ReviewFilter>(wrongCount > 0 ? "wrong" : "all");
  const shown = filterReview(items, filter);

  const tabs: { value: ReviewFilter; label: string; count: number }[] = [
    { value: "wrong", label: "틀린 문제", count: wrongCount },
    { value: "correct", label: "맞힌 문제", count: items.length - wrongCount },
    { value: "all", label: "전체", count: items.length },
  ];

  return (
    <section className="flex flex-col gap-4 py-5" aria-label="풀이 확인">
      <div className="flex items-center justify-between">
        <h2 className="font-cute text-[20px] text-ink">풀이 확인</h2>
        <button type="button" onClick={onBack} className="btn-ghost px-4 py-2 text-xs">
          ← 결과로
        </button>
      </div>

      <div role="tablist" aria-label="문제 분류" className="grid grid-cols-3 gap-2">
        {tabs.map((tab) => {
          const active = filter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(tab.value)}
              className={`rounded-2xl border-[1.5px] px-2 py-2.5 text-xs font-bold transition-colors ${
                active ? "border-post bg-post-soft text-post ring-2 ring-post/25" : "border-line bg-surface text-ink-soft active:bg-post-soft"
              }`}
            >
              {tab.label} <span className="tabular-nums">{tab.count}</span>
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-6 text-center">
          <Mascot size={56} mood={filter === "wrong" ? "wow" : "think"} />
          <p className="text-sm text-ink-soft">{filter === "wrong" ? "틀린 문제가 없어요. 완벽해요!" : "아직 해당하는 문제가 없어요."}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((item) => (
            <li key={item.question.id}>
              <ReviewCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ReviewCard({ item }: { item: ReviewItem }) {
  const { question, pick, isCorrect } = item;
  const answerText = question.options[question.answer - 1];

  return (
    <article className={`card border-l-4 p-4 ${isCorrect ? "border-l-correct" : "border-l-signal"}`}>
      <div className="flex items-center gap-2">
        <span className="chip bg-sunny-soft text-ink-soft">문항 {question.no}</span>
        <span className={`chip ${isCorrect ? "bg-correct-soft text-correct" : "bg-signal-soft text-signal"}`}>
          {isCorrect ? "✓ 맞힘" : "✕ 틀림"}
        </span>
      </div>
      <p className="mt-2.5 text-[14px] font-semibold leading-[1.7] text-ink">{question.question}</p>

      <dl className="mt-3 flex flex-col gap-1.5 text-[13px] leading-relaxed">
        {!isCorrect && (
          <div className="flex gap-2 rounded-xl bg-signal-soft px-3 py-2">
            <dt className="shrink-0 font-bold text-signal">내 답</dt>
            <dd className="text-ink-soft">
              {MARKS[pick - 1]} {question.options[pick - 1]}
            </dd>
          </div>
        )}
        <div className="flex gap-2 rounded-xl bg-correct-soft px-3 py-2">
          <dt className="shrink-0 font-bold text-correct">정답</dt>
          <dd className="text-ink">
            {MARKS[question.answer - 1]} {answerText}
          </dd>
        </div>
      </dl>

      {!isCorrect && (
        <div className="mt-3 flex gap-2.5 rounded-2xl border-[1.5px] border-post/25 bg-post-soft/60 p-3">
          <Mascot size={32} mood="think" className="shrink-0" />
          <div className="text-[13px] leading-relaxed">
            <p className="font-cute text-[14px] text-post">풀이</p>
            <p className="mt-0.5 text-ink-soft">{question.explanation ?? NO_EXPLANATION}</p>
          </div>
        </div>
      )}
    </article>
  );
}
