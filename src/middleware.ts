import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, isValidSession } from "@/lib/auth/session";

/**
 * Every page and API is behind the password gate, except the login screen itself
 * and public assets (build files, icons, share image) needed to render it and to
 * show link previews.
 */
export async function middleware(req: NextRequest) {
  if (await isValidSession(req.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next();

  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED", message: "로그인이 필요해요." } }, { status: 401 });
  }

  const login = req.nextUrl.clone();
  login.pathname = "/login";
  login.search = "";
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/((?!login|api/auth/|_next/static|_next/image|icons/|og-image\\.png|manifest\\.webmanifest|sw\\.js|favicon\\.ico).*)"],
};
