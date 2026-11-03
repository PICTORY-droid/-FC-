export type ChatRole = "user" | "assistant";

export interface ChatTurn {
  role: ChatRole;
  text: string;
}

/** Request DTO for POST /api/chat. The server resolves question content itself from questionId. */
export interface ChatRequestDto {
  questionId: string;
  message: string;
  answered: boolean;
  history: ChatTurn[];
}

export type ChatErrorCode =
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "AI_UNAVAILABLE"
  | "INTERNAL";

export type ChatResponseDto =
  | { ok: true; answer: string; outOfScope: boolean }
  | { ok: false; error: { code: ChatErrorCode; message: string } };
