import type { ChatRequestDto, ChatResponseDto } from "@/types/chat";

const NETWORK_ERROR: ChatResponseDto = {
  ok: false,
  error: { code: "AI_UNAVAILABLE", message: "네트워크 연결을 확인한 뒤 다시 시도해 주세요." },
};

export async function postChat(body: ChatRequestDto, signal?: AbortSignal): Promise<ChatResponseDto> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
    const data = (await res.json()) as ChatResponseDto;
    return data && typeof data === "object" && "ok" in data ? data : NETWORK_ERROR;
  } catch {
    return NETWORK_ERROR;
  }
}
