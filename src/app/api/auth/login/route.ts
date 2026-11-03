import { NextResponse, type NextRequest } from "next/server";

import { clearFailures, isLocked, recordFailure } from "@/lib/auth/login-throttle";
import { SESSION_COOKIE, SESSION_MAX_AGE, configuredPassword, safeEqual, sessionToken } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientKey(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "anonymous";
}

function back(req: NextRequest, error: "wrong" | "locked" | "setup") {
  const url = new URL("/login", req.url);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url, 303);
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const password = configuredPassword();
  if (!password) return back(req, "setup");

  const key = clientKey(req);
  if (isLocked(key)) return back(req, "locked");

  let input = "";
  try {
    const form = await req.formData();
    input = String(form.get("password") ?? "").trim().slice(0, 64);
  } catch {
    return back(req, "wrong");
  }

  if (!safeEqual(input, password)) {
    recordFailure(key);
    return back(req, isLocked(key) ? "locked" : "wrong");
  }

  clearFailures(key);
  const res = NextResponse.redirect(new URL("/", req.url), 303);
  res.cookies.set(SESSION_COOKIE, await sessionToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
