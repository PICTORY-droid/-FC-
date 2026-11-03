import type { ChatTurn } from "@/types/chat";

export interface LlmRequest {
  systemInstruction: string;
  history: ChatTurn[];
  userMessage: string;
}

/**
 * Provider-agnostic contract. Swap Gemini for another model by adding a new
 * adapter that implements this interface and returning it from getLlmAdapter().
 */
export interface LlmAdapter {
  generate(request: LlmRequest): Promise<string>;
}

export class LlmUnavailableError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = "LlmUnavailableError";
  }
}
