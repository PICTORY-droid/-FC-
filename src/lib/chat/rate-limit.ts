import "server-only";

/**
 * Sliding-window limiter kept in instance memory. On Vercel each warm instance
 * keeps its own window, so this is a first line of defence that protects the
 * free Gemini quota; swap for Upstash/Supabase if strict global limits are needed.
 */
const WINDOW_MS = 60_000;
const MAX_TRACKED_KEYS = 5_000;
const hits = new Map<string, number[]>();

function limitPerMinute(): number {
  const parsed = Number(process.env.CHAT_RATE_LIMIT_PER_MIN);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 60 ? parsed : 8;
}

export function consumeRateLimit(key: string, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= limitPerMinute()) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);

  if (hits.size > MAX_TRACKED_KEYS) {
    const oldest = hits.keys().next().value;
    if (oldest !== undefined) hits.delete(oldest);
  }
  return true;
}
