import { NextResponse, type NextRequest } from "next/server";

import { appPassword, signingSecret } from "@/lib/auth/config";
import { setAccessCookies } from "@/lib/auth/cookies";
import { safeEqual } from "@/lib/auth/crypto";
import { checkInvite, normalizeInviteCode } from "@/lib/auth/invite";
import { clearFailures, isLocked, recordFailure } from "@/lib/auth/login-throttle";
import { clientKey, isSameOrigin } from "@/lib/auth/request";
import { createSession } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type LoginError = "wrong" | "locked" | "setup" | "invite" | "invite-expired";

/** Back to the entry screen, keeping the invite code so it need not be retyped. */
function back(req: NextRequest, error: LoginError, code: string | null) {
  const url = new URL("/login", req.url);
  url.searchParams.set("error", error);
  if (code) url.searchParams.set("c", code);
  return NextResponse.redirect(url, 303);
}

/** POST form: code (invite), password. A valid pair starts a fresh 30-day session. */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ ok: false }, { status: 403 });

  const password = appPassword();
  if (!password || !signingSecret("session")) return back(req, "setup", null);

  const key = clientKey(req);
  let rawCode = "";
  let input = "";
  try {
    const form = await req.formData();
    rawCode = String(form.get("code") ?? "").slice(0, 512);
    input = String(form.get("password") ?? "").trim().slice(0, 64);
  } catch {
    return back(req, "wrong", null);
  }
  const code = normalizeInviteCode(rawCode);

  if (isLocked(key)) return back(req, "locked", code);

  const invite = await checkInvite(code);
  if (invite.status === "expired") return back(req, "invite-expired", null);
  if (invite.status === "invalid") {
    recordFailure(key);
    return back(req, isLocked(key) ? "locked" : "invite", code);
  }

  if (!safeEqual(input, password)) {
    recordFailure(key);
    return back(req, isLocked(key) ? "locked" : "wrong", code);
  }

  const session = await createSession();
  if (!session) return back(req, "setup", null);

  clearFailures(key);
  const res = NextResponse.redirect(new URL("/", req.url), 303);
  setAccessCookies(res, session);
  return res;
}
