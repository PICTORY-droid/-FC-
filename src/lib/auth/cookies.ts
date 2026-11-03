import "server-only";

import type { NextResponse } from "next/server";

import { ACCESS_UNTIL_COOKIE, COOKIE_MAX_AGE, SESSION_COOKIE } from "./session";

/** Writes the signed session (HttpOnly) and its readable end time for the offline guard. */
export function setAccessCookies(res: NextResponse, session: { value: string; until: number }): void {
  const base = {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
  res.cookies.set(SESSION_COOKIE, session.value, { ...base, httpOnly: true });
  res.cookies.set(ACCESS_UNTIL_COOKIE, String(session.until), { ...base, httpOnly: false });
}
