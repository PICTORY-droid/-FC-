import type { InviteResponse } from "@/app/api/admin/invite/route";

export type { InviteResponse };

type ApiResult = { ok: true; data: InviteResponse } | { ok: false; error: { code: string; message: string } };

/** Asks the server for a new invite. Throws an Error whose message is safe to show. */
export async function requestInvite(password: string): Promise<InviteResponse> {
  let res: Response;
  try {
    res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
      cache: "no-store",
    });
  } catch {
    throw new Error("인터넷 연결을 확인해 주세요.");
  }
  const body = (await res.json().catch(() => null)) as ApiResult | null;
  if (!body) throw new Error("잠시 후 다시 시도해 주세요.");
  if (!body.ok) throw new Error(body.error.message);
  return body.data;
}
