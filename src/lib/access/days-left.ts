import { ACCESS_UNTIL_COOKIE } from "@/lib/auth/cookie-names";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Access end time from the readable cookie, or null when unknown. Client only. */
export function accessUntil(): number | null {
  if (typeof document === "undefined") return null;
  const m = new RegExp(`(?:^|;\\s*)${ACCESS_UNTIL_COOKIE}=(\\d+)`).exec(document.cookie);
  return m ? Number(m[1]) : null;
}

/** Whole days left, counting a partial day as one. */
export function daysLeft(until: number, now = Date.now()): number {
  return Math.max(0, Math.ceil((until - now) / DAY_MS));
}
