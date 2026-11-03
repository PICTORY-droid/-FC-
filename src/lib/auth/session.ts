/**
 * Password gate session helpers — Web Crypto only, so they run in both the
 * Edge middleware and Node route handlers.
 *
 * The password lives only in the APP_PASSWORD environment variable (never in code).
 * The session cookie holds an HMAC derived from it, so changing the password
 * signs everyone out automatically.
 */
export const SESSION_COOKIE = "fcqb_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30일

const SESSION_LABEL = "fcqb-session-v1";
const encoder = new TextEncoder();

export function configuredPassword(): string | null {
  const value = process.env.APP_PASSWORD?.trim();
  return value ? value : null;
}

async function hmacHex(key: string, message: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey("raw", encoder.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Constant-time string comparison to avoid timing leaks. */
export function safeEqual(a: string, b: string): boolean {
  const aa = encoder.encode(a);
  const bb = encoder.encode(b);
  let diff = aa.length ^ bb.length;
  for (let i = 0; i < Math.max(aa.length, bb.length); i++) diff |= (aa[i] ?? 0) ^ (bb[i] ?? 0);
  return diff === 0;
}

export async function sessionToken(password: string): Promise<string> {
  return hmacHex(password, SESSION_LABEL);
}

export async function isValidSession(cookieValue: string | undefined): Promise<boolean> {
  const password = configuredPassword();
  if (!password || !cookieValue) return false;
  return safeEqual(cookieValue, await sessionToken(password));
}
