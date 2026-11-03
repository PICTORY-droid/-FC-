"use client";

import { useEffect, useMemo, useState } from "react";

import { onStudyChanged } from "@/lib/study/events";
import { shuffled } from "@/lib/study/random";
import { readKnownTerms, setTermKnown } from "@/lib/study/terms";

import { MenuShell, StatTile } from "./MenuShell";

export interface TermCard {
  term: string;
  page: number;
  text: string;
}

type Filter = "all" | "learning";

/** 📖 핵심 용어 카드 — 교재 '생명보험 용어해설' 원문 그대로 앞뒤 카드 */
export function TermsClient({ terms }: { terms: TermCard[] }) {
  const [known, setKnown] = useState<string[] | null>(null);
  const [filter, setFilter] = useState<Filter>("learning");
  const [order, setOrder] = useState<TermCard[]>(terms);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const load = () => setKnown(readKnownTerms());
    load();
    return onStudyChanged(load);
  }, []);

  const knownSet = useMemo(() => new Set(known ?? []), [known]);
  const deck = useMemo(() => (filter === "all" ? order : order.filter((t) => !knownSet.has(t.term))), [filter, order, knownSet]);
  const card = deck[Math.min(index, deck.length - 1)];

  useEffect(() => {
    setFlipped(false);
  }, [card?.term]);

  const go = (delta: number) => {
    if (deck.length === 0) return;
    setIndex((i) => (Math.min(i, deck.length - 1) + delta + deck.length) % deck.length);
  };

  const mark = (isKnown: boolean) => {
    if (!card) return;
    setTermKnown(card.term, isKnown);
    // '외울 카드'만 보는 중이면 외운 카드는 빠지므로 같은 자리의 다음 카드가 보임
    if (filter === "all" || !isKnown) go(1);
  };

  return (
    <MenuShell emoji="📖" title="핵심 용어 카드" description={`교재 '생명보험 용어해설'의 ${terms.length}개 용어를 카드로 외워요. 카드를 누르면 뜻이 보여요.`}>
      {known === null ? (
        <div className="h-60 animate-pulse rounded-[var(--radius-card)] bg-post-soft" aria-busy="true" />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-2">
            <StatTile label="전체" value={terms.length} tone="ink" />
            <StatTile label="외웠어요" value={knownSet.size} tone="correct" />
            <StatTile label="외울 카드" value={terms.length - knownSet.size} tone="post" />
          </div>

          <div className="flex gap-2">
            {(["learning", "all"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setFilter(f);
                  setIndex(0);
                }}
                aria-pressed={filter === f}
                className={`flex-1 rounded-2xl border-[1.5px] py-2.5 text-xs font-bold ${
                  filter === f ? "border-post bg-post-soft text-post ring-2 ring-post/25" : "border-line bg-surface text-ink-soft"
                }`}
              >
                {f === "learning" ? "외울 카드만" : "전체 카드"}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setOrder(shuffled(terms));
                setIndex(0);
              }}
              className="btn-ghost px-4 text-xs"
            >
              🔀 섞기
            </button>
          </div>

          {!card ? (
            <div className="card flex flex-col items-center gap-2 p-8 text-center">
              <p className="font-cute text-[18px] text-correct">🎉 모든 용어를 외웠어요!</p>
              <p className="text-sm text-ink-soft">&lsquo;전체 카드&rsquo;로 한 번 더 복습해 보세요.</p>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setFlipped((v) => !v)}
                aria-label={flipped ? "용어 보기" : "뜻 보기"}
                className={`card relative flex min-h-[15rem] flex-col items-center justify-center overflow-hidden p-6 text-center transition-colors ${
                  flipped ? "bg-surface" : "bg-post-soft"
                }`}
              >
                <div className="airmail absolute inset-x-0 top-0 rounded-none" aria-hidden />
                {flipped ? (
                  <>
                    <p className="font-cute text-[16px] text-post">{card.term}</p>
                    <p className="mt-3 text-left text-[14px] leading-[1.8] text-ink">{card.text}</p>
                    <p className="mt-3 self-end text-[11px] text-ink-mute">교재 {card.page}쪽 · 생명보험 용어해설</p>
                  </>
                ) : (
                  <>
                    <span className="chip bg-surface text-ink-soft">교재 {card.page}쪽</span>
                    <p className="mt-4 font-cute text-[28px] leading-snug text-ink">{card.term}</p>
                    <p className="mt-4 text-xs text-ink-mute">눌러서 뜻 보기 ↻</p>
                  </>
                )}
                {knownSet.has(card.term) && <span className="chip absolute right-3 top-4 bg-correct-soft text-correct">✓ 외웠어요</span>}
              </button>

              <p className="text-center text-xs tabular-nums text-ink-mute">
                {Math.min(index, deck.length - 1) + 1} / {deck.length}
              </p>

              <div className="flex gap-3">
                <button type="button" onClick={() => go(-1)} className="btn-ghost px-5 py-3.5 text-sm" aria-label="이전 카드">
                  ←
                </button>
                {knownSet.has(card.term) ? (
                  <button type="button" onClick={() => mark(false)} className="btn-ghost flex-1 py-3.5 text-sm">
                    다시 외울래요
                  </button>
                ) : (
                  <button type="button" onClick={() => mark(true)} className="btn-primary flex-1 py-3.5 text-sm">
                    외웠어요 ✓
                  </button>
                )}
                <button type="button" onClick={() => go(1)} className="btn-ghost px-5 py-3.5 text-sm" aria-label="다음 카드">
                  →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </MenuShell>
  );
}
