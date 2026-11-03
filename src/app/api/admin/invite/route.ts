import { NextResponse, type NextRequest } from "next/server";

import { adminPassword } from "@/lib/auth/config";
import { safeEqual } from "@/lib/auth/crypto";
import { createInvite, formatInviteCode } from "@/lib/auth/invite";
import { clearFailures, isLocked, recordFailure } from "@/lib/auth/login-throttle";
import { clientKey, isSameOrigin } from "@/lib/auth/request";
import { siteUrl } from "@/lib/brand/assets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface InviteResponse {
  link: string;
  code: string;
  expiresAt: number;
}

type ErrorCode = "FORBIDDEN" | "SETUP" | "LOCKED" | "WRONG" | "BAD_REQUEST";

function fail(code: ErrorCode, message: string, status: number) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status, headers: { "Cache-Control": "no-store" } });
}

/** POST { password } → a new 7-day invite link for one FC to share. */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return fail("FORBIDDEN", "허용되지 않은 요청이에요.", 403);

  const expected = adminPassword();
  if (!expected) return fail("SETUP", "관리자 비밀번호(ADMIN_PASSWORD, 8자 이상)가 아직 설정되지 않았어요.", 503);

  const key = `admin:${clientKey(req)}`;
  if (isLocked(key)) return fail("LOCKED", "여러 번 틀려서 10분 동안 잠겼어요.", 429);

  let input = "";
  try {
    const body: unknown = await req.json();
    const value = (body as { password?: unknown } | null)?.password;
    input = typeof value === "string" ? value.trim().slice(0, 128) : "";
  } catch {
    return fail("BAD_REQUEST", "요청 형식이 올바르지 않아요.", 400);
  }

  if (!safeEqual(input, expected)) {
    recordFailure(key);
    return isLocked(key) ? fail("LOCKED", "여러 번 틀려서 10분 동안 잠겼어요.", 429) : fail("WRONG", "관리자 비밀번호가 맞지 않아요.", 401);
  }
  clearFailures(key);

  const invite = await createInvite();
  if (!invite) return fail("SETUP", "입장 비밀번호(APP_PASSWORD)가 아직 설정되지 않았어요.", 503);

  const link = new URL("/join", siteUrl());
  link.searchParams.set("c", invite.code);
  const data: InviteResponse = { link: link.toString(), code: formatInviteCode(invite.code), expiresAt: invite.expiresAt };
  return NextResponse.json({ ok: true, data }, { headers: { "Cache-Control": "no-store" } });
}
