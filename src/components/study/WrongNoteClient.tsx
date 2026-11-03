"use client";

import { useMemo, useState } from "react";

import { useRecords } from "@/hooks/useStudyData";
import { indexBank } from "@/lib/study/bank";
import { shuffled } from "@/lib/study/random";
import { GRADUATE_STREAK, isGraduated, isInWrongNote } from "@/lib/study/records";
import type { Part } from "@/types/question";

import { EmptyCard, MenuShell, StatTile } from "./MenuShell";
import { PartFilter, countByPart, inPart } from "./PartFilter";
import { PracticeSession } from "./PracticeSession";
import { QuestionList } from "./QuestionList";

/** 📒 오답노트 — 모든 PART의 틀린 문제. 2번 연속 맞히면 졸업. */
export function WrongNoteClient({ parts }: { parts: Part[] }) {
  const bank = useMemo(() => indexBank(parts), [parts]);
  const records = useRecords(bank.answers);
  const [part, setPart] = useState<number | null>(null);
  const [session, setSession] = useState<string[] | null>(null);
  const [startGraduated, setStartGraduated] = useState(0);

  const wrongIds = useMemo(() => (records ? bank.questions.filter((q) => isInWrongNote(records[q.id])).map((q) => q.id) : []), [records, bank]);
  const graduated = useMemo(() => (records ? bank.questions.filter((q) => isGraduated(records[q.id])).length : 0), [records, bank]);
  const shown = wrongIds.filter((id) => inPart(id, part));

  if (session) {
    const newlyGraduated = Math.max(0, graduated - startGraduated);
    return (
      <PracticeSession
        bank={bank}
        ids={session}
        badge="오답노트"
        title={`오답노트 ${session.length}문항`}
        onExit={() => setSession(null)}
        exitLabel="오답노트로"
        resultExtra={
          <p className="rounded-2xl bg-correct-soft px-4 py-3 text-center text-sm text-ink">
            {newlyGraduated > 0 ? (
              <>
                🎓 <b className="text-correct">{newlyGraduated}문항</b>이 오답노트를 졸업했어요!
              </>
            ) : (
              `${GRADUATE_STREAK}번 연속으로 맞히면 오답노트를 졸업해요.`
            )}
          </p>
        }
      />
    );
  }

  return (
    <MenuShell emoji="📒" title="오답노트" description={`모든 PART에서 틀린 문제를 모았어요. ${GRADUATE_STREAK}번 연속 맞히면 졸업해요.`}>
      {!records ? (
        <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-post-soft" aria-busy="true" />
      ) : wrongIds.length === 0 ? (
        <EmptyCard
          mood={graduated > 0 ? "wow" : "think"}
          title={graduated > 0 ? "오답노트가 비었어요!" : "아직 틀린 문제가 없어요"}
          text={graduated > 0 ? `지금까지 ${graduated}문항을 졸업했어요. 정말 잘하고 있어요.` : "PART 문제를 풀다 틀린 문제가 생기면 여기에 자동으로 모여요."}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <StatTile label="남은 오답" value={wrongIds.length} tone="signal" />
            <StatTile label="졸업한 문항" value={graduated} tone="correct" />
          </div>
          <PartFilter parts={parts} value={part} counts={countByPart(wrongIds)} total={wrongIds.length} onChange={setPart} />
          <button
            type="button"
            disabled={shown.length === 0}
            onClick={() => {
              setStartGraduated(graduated);
              setSession(shuffled(shown));
            }}
            className="btn-primary py-3.5 text-sm"
          >
            {shown.length > 0 ? `오답 ${shown.length}문항 다시 풀기` : "이 PART에는 오답이 없어요"}
          </button>
          <QuestionList
            items={shown.map((id) => ({
              question: bank.byId.get(id)!,
              note: `틀림 ${records[id]?.w ?? 0}회`,
            }))}
          />
        </div>
      )}
    </MenuShell>
  );
}
