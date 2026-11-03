import "server-only";

import { getLlmAdapter } from "@/lib/ai";
import { getQuestionById } from "@/lib/question-bank/repository";
import type { ChatResponseDto } from "@/types/chat";
import {
  OUT_OF_SCOPE_REPLY,
  buildSystemInstruction,
  isOutOfScopeReply,
  normaliseModelText,
} from "./guardrail";
import type { ValidChatRequest } from "./validation";

export class QuestionNotFoundError extends Error {}

/** Business logic for one guarded chat turn. Transport concerns stay in the route handler. */
export async function answerQuestion(req: ValidChatRequest): Promise<Extract<ChatResponseDto, { ok: true }>> {
  const found = getQuestionById(req.questionId);
  if (!found) throw new QuestionNotFoundError(req.questionId);

  const raw = await getLlmAdapter().generate({
    systemInstruction: buildSystemInstruction(found.part, found.question, req.answered),
    history: req.history,
    userMessage: req.message,
  });

  const text = normaliseModelText(raw);
  if (!text || isOutOfScopeReply(text)) {
    return { ok: true, answer: OUT_OF_SCOPE_REPLY, outOfScope: true };
  }
  return { ok: true, answer: text, outOfScope: false };
}
