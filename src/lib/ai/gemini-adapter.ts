import "server-only";

import { LlmUnavailableError, type LlmAdapter, type LlmRequest } from "./adapter";

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.5-flash-lite";
const MODEL_NAME_PATTERN = /^[a-z0-9.\-]+$/;
const TIMEOUT_MS = 15_000;

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
}

export class GeminiAdapter implements LlmAdapter {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    const candidate = model?.trim() || DEFAULT_MODEL;
    this.model = MODEL_NAME_PATTERN.test(candidate) ? candidate : DEFAULT_MODEL;
  }

  async generate({ systemInstruction, history, userMessage }: LlmRequest): Promise<string> {
    const contents = [
      ...history.map((turn) => ({
        role: turn.role === "assistant" ? "model" : "user",
        parts: [{ text: turn.text }],
      })),
      { role: "user", parts: [{ text: userMessage }] },
    ];

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(`${ENDPOINT}/${this.model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": this.apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: { temperature: 0.1, topP: 0.8, maxOutputTokens: 700 },
        }),
        signal: controller.signal,
        cache: "no-store",
      });

      if (!res.ok) {
        // Status only — never forward provider body (may contain key hints / internals).
        throw new LlmUnavailableError(`gemini_http_${res.status}`);
      }

      const data = (await res.json()) as GeminiResponse;
      if (data.promptFeedback?.blockReason) return "";
      const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      return text.trim();
    } catch (err) {
      if (err instanceof LlmUnavailableError) throw err;
      throw new LlmUnavailableError(controller.signal.aborted ? "gemini_timeout" : "gemini_network");
    } finally {
      clearTimeout(timer);
    }
  }
}
