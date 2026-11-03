"use client";

import { useEffect, useState } from "react";

import { findQuestionPassage } from "@/lib/chat/question-passage";
import { citation, loadTextbook, type TextbookPassage } from "@/lib/chat/textbook";
import type { Question } from "@/types/question";

/** 📖 교재 원문 보기 — appears only when the question has a confident textbook match. */
export function TextbookRef({ question }: { question: Question }) {
  const [passage, setPassage] = useState<TextbookPassage | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    setPassage(null);
    setOpen(false);
    loadTextbook()
      .then((tb) => alive && setPassage(findQuestionPassage(question, tb)))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [question]);

  if (!passage) return null;

  return (
    <div className="mt-2.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="chip bg-surface text-post ring-1 ring-post/30 active:bg-post-soft"
      >
        📖 교재 {passage.page}쪽 원문 {open ? "접기" : "보기"}
      </button>
      {open && (
        <blockquote className="mt-2 rounded-2xl border-[1.5px] border-line bg-surface px-3.5 py-3 text-[13px] leading-relaxed text-ink">
          {passage.text}
          <footer className="mt-1.5 text-[11px] text-ink-mute">— {citation(passage)}</footer>
        </blockquote>
      )}
    </div>
  );
}
