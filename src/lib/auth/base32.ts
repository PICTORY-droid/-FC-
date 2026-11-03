/**
 * Crockford base32 — no I, L, O or U, so a code read aloud or typed by hand
 * is hard to get wrong. Decoding forgives case and the usual look-alikes.
 */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const LOOKALIKES: Record<string, string> = { O: "0", I: "1", L: "1" };

export function encodeBase32(bytes: Uint8Array): string {
  let out = "";
  let buffer = 0;
  let bits = 0;
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(buffer >>> (bits - 5)) & 31];
      bits -= 5;
    }
    buffer &= (1 << bits) - 1;
  }
  if (bits > 0) out += ALPHABET[(buffer << (5 - bits)) & 31];
  return out;
}

/** Returns null when the text holds a character outside the alphabet. */
export function decodeBase32(text: string): Uint8Array | null {
  const out: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const raw of text.toUpperCase()) {
    const ch = LOOKALIKES[raw] ?? raw;
    const value = ALPHABET.indexOf(ch);
    if (value < 0) return null;
    buffer = (buffer << 5) | value;
    bits += 5;
    if (bits >= 8) {
      out.push((buffer >>> (bits - 8)) & 255);
      bits -= 8;
    }
    buffer &= (1 << bits) - 1;
  }
  return new Uint8Array(out);
}
