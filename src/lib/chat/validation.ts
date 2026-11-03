import "server-only";

import { z } from "zod";

import { MESSAGE_MAX_LENGTH, sanitizeText } from "./sanitize";

const HISTORY_MAX_TURNS = 6;

const turnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string().max(1500).transform(sanitizeText),
});

export const chatRequestSchema = z.object({
  questionId: z.string().regex(/^p[1-9]-\d{1,3}$/),
  message: z
    .string()
    .transform(sanitizeText)
    .pipe(z.string().min(1).max(MESSAGE_MAX_LENGTH)),
  answered: z.boolean(),
  history: z
    .array(turnSchema)
    .max(20)
    .transform((turns) => turns.filter((t) => t.text.length > 0).slice(-HISTORY_MAX_TURNS)),
});

export type ValidChatRequest = z.infer<typeof chatRequestSchema>;
