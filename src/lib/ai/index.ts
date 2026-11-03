import "server-only";

import { LlmUnavailableError, type LlmAdapter } from "./adapter";
import { GeminiAdapter } from "./gemini-adapter";

let cached: LlmAdapter | null = null;

export function getLlmAdapter(): LlmAdapter {
  if (cached) return cached;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new LlmUnavailableError("missing_api_key");
  cached = new GeminiAdapter(apiKey, process.env.GEMINI_MODEL);
  return cached;
}

export { LlmUnavailableError } from "./adapter";
export type { LlmAdapter } from "./adapter";
