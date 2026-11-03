"use client";

import { useMemo, useState } from "react";

import { useStars } from "@/hooks/useStudyData";
import { indexBank } from "@/lib/study/bank";
import { shuffled } from "@/lib/study/random";
import type { Part } from "@/types/question";

import { EmptyCard, MenuShell } from "./MenuShell";
import { PartFilter, countByPart, inPart } from "./PartFilter";
import { PracticeSession } from "./PracticeSession";
import { QuestionList } from "./QuestionList";

/** ⭐ 즐겨찾기 — 풀다가 ☆ 헷갈려요를 누른 문제만 모아 다시 풀기 */
export function StarsClient({ parts }: { parts: Part[] }) {
  const bank = useMemo(() => indexBank(parts), [parts]);
  const { stars, loaded, toggle } = useStars();
  const [part, setPart] = useState<number | null>(null);
  const [session, setSession] = useState<string[] | null>(null);

  const ids = useMemo(() => bank.questions.filter((q) => stars.includes(q.id)).map((q) => q.id), [bank, stars]);
  const shown = ids.filter((id) => inPart(id, part));

  if (session) {
    return <PracticeSession bank={bank} ids={session} badge="즐겨찾기" title={`즐겨찾기 ${session.length}문항`} onExit={() => setSession(null)} exitLabel="즐겨찾기로" />;
  }

  return (
    <MenuShell emoji="⭐" title="즐겨찾기" description="문제를 풀다 ☆ 헷갈려요를 누른 문제만 모아서 다시 풀어요.">
      {!loaded ? (
        <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-post-soft" aria-busy="true" />
      ) : ids.length === 0 ? (
        <EmptyCard title="아직 즐겨찾기가 없어요" text="문제 카드 오른쪽 위의 ☆ 헷갈려요를 누르면 여기에 모여요." />
      ) : (
        <div className="flex flex-col gap-4">
          <PartFilter parts={parts} value={part} counts={countByPart(ids)} total={ids.length} onChange={setPart} />
          <button type="button" disabled={shown.length === 0} onClick={() => setSession(shuffled(shown))} className="btn-primary py-3.5 text-sm">
            {shown.length > 0 ? `즐겨찾기 ${shown.length}문항 풀기` : "이 PART에는 즐겨찾기가 없어요"}
          </button>
          <QuestionList
            items={shown.map((id) => ({ question: bank.byId.get(id)! }))}
            action={(q) => (
              <button type="button" onClick={() => toggle(q.id)} className="chip bg-sunny text-ink" aria-label="즐겨찾기 해제">
                ★ 해제
              </button>
            )}
          />
        </div>
      )}
    </MenuShell>
  );
}
