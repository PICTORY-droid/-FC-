/**
 * Small Web Crypto helpers shared by the Edge middleware and Node route handlers.
 */
const encoder = new TextEncoder();

export async function hmac(key: string, data: string | Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey("raw", encoder.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = typeof data === "string" ? encoder.encode(data) : data;
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, bytes as BufferSource));
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/** Constant-time comparison to avoid timing leaks. */
export function safeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return diff === 0;
}

export function safeEqual(a: string, b: string): boolean {
  return safeEqualBytes(encoder.encode(a), encoder.encode(b));
}
