"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { postChat } from "@/lib/api/chat-client";
import { MESSAGE_MAX_LENGTH, sanitizeText } from "@/lib/chat/sanitize";
import type { ChatTurn } from "@/types/chat";

type Status = "idle" | "loading" | "error";

/** Conversation state for the guarded chatbot, scoped to a single question. */
export function useFactChat(questionId: string, answered: boolean) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    setTurns([]);
    setStatus("idle");
    setError(null);
  }, [questionId]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const ask = useCallback(
    async (input: string) => {
      const message = sanitizeText(input).slice(0, MESSAGE_MAX_LENGTH);
      if (!message || status === "loading") return false;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const history = turns;
      setTurns([...history, { role: "user", text: message }]);
      setStatus("loading");
      setError(null);

      const res = await postChat({ questionId, message, answered, history }, controller.signal);
      if (controller.signal.aborted) return false;

      if (res.ok) {
        setTurns((prev) => [...prev, { role: "assistant", text: res.answer }]);
        setStatus("idle");
      } else {
        setTurns(history);
        setError(res.error.message);
        setStatus("error");
      }
      return res.ok;
    },
    [answered, questionId, status, turns],
  );

  return { turns, status, error, ask };
}
