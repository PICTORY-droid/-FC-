import "server-only";

/**
 * Slows down guessing a short PIN: after MAX_FAILS wrong tries from one address,
 * further attempts are refused for LOCK_MS. Kept in instance memory — on Vercel each
 * warm instance tracks its own counts, which is enough to make 10,000-PIN sweeps slow.
 */
const MAX_FAILS = 5;
const LOCK_MS = 10 * 60_000;
const MAX_TRACKED = 5_000;

const fails = new Map<string, { count: number; lockedUntil: number }>();

export function isLocked(key: string, now = Date.now()): boolean {
  const entry = fails.get(key);
  return !!entry && entry.lockedUntil > now;
}

export function recordFailure(key: string, now = Date.now()): void {
  const entry = fails.get(key) ?? { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= MAX_FAILS) {
    entry.lockedUntil = now + LOCK_MS;
    entry.count = 0;
  }
  fails.set(key, entry);
  if (fails.size > MAX_TRACKED) {
    const oldest = fails.keys().next().value;
    if (oldest !== undefined) fails.delete(oldest);
  }
}

export function clearFailures(key: string): void {
  fails.delete(key);
}
