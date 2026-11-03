import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_UNTIL_COOKIE, COOKIE_MAX_AGE, SESSION_COOKIE, readSession } from "@/lib/auth/session";

/**
 * Every page and API needs a live 30-day device session. Public routes (entry,
 * invite redirect, expiry notice, issuer screen) and static assets are excluded
 * by the matcher below.
 *  - no/invalid session → /login (enter invite code + password)
 *  - session older than 30 days → /expired
 */
export async function middleware(req: NextRequest) {
  const session = await readSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (session.status === "valid") {
    const res = NextResponse.next();
    // Keep the readable end time in step with the signed session (missing or edited cookie).
    if (req.cookies.get(ACCESS_UNTIL_COOKIE)?.value !== String(session.until)) {
      res.cookies.set(ACCESS_UNTIL_COOKIE, String(session.until), {
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });
    }
    return res;
  }

  const expired = session.status === "expired";
  if (req.nextUrl.pathname.startsWith("/api/")) {
    const error = expired
      ? { code: "EXPIRED", message: "이용 기간이 끝났어요." }
      : { code: "UNAUTHORIZED", message: "입장이 필요해요." };
    return NextResponse.json({ ok: false, error }, { status: 401 });
  }

  const target = req.nextUrl.clone();
  target.pathname = expired ? "/expired" : "/login";
  target.search = "";
  return NextResponse.redirect(target);
}

export const config = {
  matcher: [
    "/((?!login|join|expired|admin|api/auth/|api/admin/|_next/static|_next/image|icons/|og-image\\.png|manifest\\.webmanifest|sw\\.js|favicon\\.ico).*)",
  ],
};
