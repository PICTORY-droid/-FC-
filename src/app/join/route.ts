import { NextResponse, type NextRequest } from "next/server";

import { normalizeInviteCode } from "@/lib/auth/invite";

export const dynamic = "force-dynamic";

/** Invite link entry point: /join?c=CODE → entry screen with the code already filled in. */
export function GET(req: NextRequest) {
  const url = new URL("/login", req.url);
  const code = normalizeInviteCode(req.nextUrl.searchParams.get("c"));
  if (code) url.searchParams.set("c", code);
  return NextResponse.redirect(url, 307);
}
