"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { loadKnowledge } from "@/lib/chat/glossary";
import { replyTo } from "@/lib/chat/rule-engine";
import { loadTextbook } from "@/lib/chat/textbook";
import { MESSAGE_MAX_LENGTH, sanitizeText } from "@/lib/chat/sanitize";
import type { ChatTurn } from "@/types/chat";
import type { Question } from "@/types/question";

type Status = "idle" | "loading" | "error";

const TYPING_DELAY_MS = 350;

/** Conversation state for the on-device, textbook-only helper — scoped to one question. */
export function useFactChat(question: Question, partTitle: string, answered: boolean) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const runRef = useRef(0);
  // 직전에 '어떤 연관이 궁금하세요?'라고 되물은 용어
  const pendingRef = useRef<string | null>(null);

  useEffect(() => {
    runRef.current += 1;
    pendingRef.current = null;
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
        const [knowledge, textbook] = await Promise.all([
          loadKnowledge(),
          loadTextbook(),
          new Promise((r) => setTimeout(r, TYPING_DELAY_MS)),
        ]);
        if (run !== runRef.current) return false;
        const reply = replyTo({ message, question, partTitle, answered, knowledge, textbook, pendingTopic: pendingRef.current });
        pendingRef.current = reply.pendingTopic;
        setTurns((prev) => [...prev, { role: "assistant", text: reply.text }]);
        setStatus("idle");
        return true;
      } catch {
        if (run !== runRef.current) return false;
        setError("답변을 준비하지 못했어요. 앱을 새로고침한 뒤 다시 시도해 주세요.");
        setStatus("error");
        return false;
      }
    },
    [answered, partTitle, question, status],
  );

  return { turns, status, error, ask };
}
