/**
 * Device access session: 30 days counted from the moment an invite was used.
 *
 * Cookie value = "<grantedAtMs>.<hmac>". The signature proves the server issued it,
 * and the timestamp lets both the middleware and the page guard tell an expired
 * device apart from one that never entered. A second, readable cookie carries only
 * the end time so the offline app can lock itself without a server round-trip.
 */
import { signingSecret } from "./config";
import { hmac, safeEqual, toHex } from "./crypto";

export { ACCESS_UNTIL_COOKIE, SESSION_COOKIE } from "./cookie-names";

const DAY_MS = 24 * 60 * 60 * 1000;
export const ACCESS_DAYS = 30;
export const ACCESS_MS = ACCESS_DAYS * DAY_MS;
/** Cookies outlive the access period so an expired device still sees the "기간 종료" screen. */
export const COOKIE_MAX_AGE = 90 * 24 * 60 * 60;
const CLOCK_SKEW_MS = 5 * 60 * 1000;

export type SessionState = { status: "valid"; until: number } | { status: "expired" } | { status: "none" };

async function sign(secret: string, grantedAt: number): Promise<string> {
  return toHex(await hmac(secret, `session|${grantedAt}`));
}

export async function createSession(now = Date.now()): Promise<{ value: string; until: number } | null> {
  const secret = signingSecret("session");
  if (!secret) return null;
  return { value: `${now}.${await sign(secret, now)}`, until: now + ACCESS_MS };
}

export async function readSession(value: string | undefined, now = Date.now()): Promise<SessionState> {
  const secret = signingSecret("session");
  if (!secret || !value) return { status: "none" };

  const match = /^(\d{13})\.([0-9a-f]{64})$/.exec(value);
  if (!match) return { status: "none" };

  const grantedAt = Number(match[1]);
  if (!safeEqual(match[2], await sign(secret, grantedAt))) return { status: "none" };
  if (grantedAt > now + CLOCK_SKEW_MS) return { status: "none" };

  const until = grantedAt + ACCESS_MS;
  return now < until ? { status: "valid", until } : { status: "expired" };
}
