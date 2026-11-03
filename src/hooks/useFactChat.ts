"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { loadGlossary } from "@/lib/chat/glossary";
import { replyTo } from "@/lib/chat/rule-engine";
import { MESSAGE_MAX_LENGTH, sanitizeText } from "@/lib/chat/sanitize";
import type { ChatTurn } from "@/types/chat";
import type { Question } from "@/types/question";

type Status = "idle" | "loading" | "error";

const TYPING_DELAY_MS = 350;

/** Conversation state for the on-device, textbook-only helper — scoped to one question. */
export function useFactChat(question: Question, answered: boolean) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const runRef = useRef(0);

  useEffect(() => {
    runRef.current += 1;
    setTurns([]);
    setStatus("idle");
    setError(null);
  }, [question.id]);

  const ask = useCallback(
    async (input: string) => {
      const message = sanitizeText(input).slice(0, MESSAGE_MAX_LENGTH);
      if (!message || status === "loading") return false;

      const run = ++runRef.current;
      setTurns((prev) => [...prev, { role: "user", text: message }]);
      setStatus("loading");
      setError(null);

      try {
        const [glossary] = await Promise.all([
          loadGlossary(),
          new Promise((r) => setTimeout(r, TYPING_DELAY_MS)),
        ]);
        if (run !== runRef.current) return false;
        const answer = replyTo({ message, question, answered, glossary });
        setTurns((prev) => [...prev, { role: "assistant", text: answer }]);
        setStatus("idle");
        return true;
      } catch {
        if (run !== runRef.current) return false;
        setError("답변을 준비하지 못했어요. 앱을 새로고침한 뒤 다시 시도해 주세요.");
        setStatus("error");
        return false;
      }
    },
    [answered, question, status],
  );

  return { turns, status, error, ask };
}
