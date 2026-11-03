import { NextResponse, type NextRequest } from "next/server";

import { LlmUnavailableError } from "@/lib/ai";
import { QuestionNotFoundError, answerQuestion } from "@/lib/chat/chat-service";
import { consumeRateLimit } from "@/lib/chat/rate-limit";
import { chatRequestSchema } from "@/lib/chat/validation";
import type { ChatErrorCode, ChatResponseDto } from "@/types/chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16_000;

function fail(code: ChatErrorCode, message: string, status: number) {
  return NextResponse.json<ChatResponseDto>({ ok: false, error: { code, message } }, { status });
}

function clientKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip") || "anonymous";
}

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients; still rate limited
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return fail("INVALID_INPUT", "허용되지 않은 요청입니다.", 403);
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return fail("INVALID_INPUT", "요청 형식이 올바르지 않습니다.", 415);
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return fail("INVALID_INPUT", "요청이 너무 깁니다.", 413);

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return fail("INVALID_INPUT", "요청 형식이 올바르지 않습니다.", 400);
  }

  const parsed = chatRequestSchema.safeParse(json);
  if (!parsed.success) return fail("INVALID_INPUT", "질문은 1~300자 이내로 입력해 주세요.", 400);

  if (!consumeRateLimit(clientKey(req))) {
    return fail("RATE_LIMITED", "질문이 너무 많습니다. 잠시 후 다시 시도해 주세요.", 429);
  }

  try {
    const result = await answerQuestion(parsed.data);
    return NextResponse.json<ChatResponseDto>(result, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (err instanceof QuestionNotFoundError) return fail("NOT_FOUND", "문항을 찾을 수 없습니다.", 404);
    if (err instanceof LlmUnavailableError) {
      console.error("[chat] llm unavailable:", err.message);
      return fail("AI_UNAVAILABLE", "AI 응답을 받을 수 없습니다. 잠시 후 다시 시도해 주세요.", 503);
    }
    console.error("[chat] unexpected error");
    return fail("INTERNAL", "일시적인 오류가 발생했습니다.", 500);
  }
}
