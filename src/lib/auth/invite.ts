/**
 * Invite codes — signed by the server, valid for 7 days after issue, no database.
 *
 * 15 bytes = issued-at seconds (4) + random nonce (3) + truncated HMAC (8),
 * written as 24 Crockford base32 characters in six groups: XXXX-XXXX-…
 * Anyone holding a code still needs the entry password, and each use starts a
 * fresh 30-day device session.
 */
import { decodeBase32, encodeBase32 } from "./base32";
import { signingSecret } from "./config";
import { hmac, randomBytes, safeEqualBytes } from "./crypto";

export const INVITE_DAYS = 7;
const INVITE_MS = INVITE_DAYS * 24 * 60 * 60 * 1000;
const CLOCK_SKEW_MS = 5 * 60 * 1000;
const BODY_BYTES = 7;
const SIG_BYTES = 8;
const CODE_LENGTH = 24;

export type InviteStatus = "valid" | "expired" | "invalid";

async function signature(secret: string, body: Uint8Array): Promise<Uint8Array> {
  return (await hmac(secret, body)).slice(0, SIG_BYTES);
}

/** Pulls the code out of whatever was pasted: a full link, a formatted code, or raw characters. */
export function normalizeInviteCode(input: string | null | undefined): string | null {
  if (!input) return null;
  const fromLink = /[?&]c=([^&#\s]+)/.exec(input)?.[1];
  const cleaned = decodeURIComponentSafe(fromLink ?? input)
    .toUpperCase()
    .replace(/[^0-9A-Z]/g, "");
  return cleaned.length === CODE_LENGTH ? cleaned : null;
}

function decodeURIComponentSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function formatInviteCode(code: string): string {
  return code.match(/.{1,4}/g)?.join("-") ?? code;
}

export async function createInvite(now = Date.now()): Promise<{ code: string; expiresAt: number } | null> {
  const secret = signingSecret("invite");
  if (!secret) return null;

  const issuedSec = Math.floor(now / 1000);
  const body = new Uint8Array(BODY_BYTES);
  new DataView(body.buffer).setUint32(0, issuedSec);
  body.set(randomBytes(BODY_BYTES - 4), 4);

  const bytes = new Uint8Array(BODY_BYTES + SIG_BYTES);
  bytes.set(body, 0);
  bytes.set(await signature(secret, body), BODY_BYTES);
  return { code: encodeBase32(bytes), expiresAt: issuedSec * 1000 + INVITE_MS };
}

export async function checkInvite(input: string | null | undefined, now = Date.now()): Promise<{ status: InviteStatus; expiresAt?: number }> {
  const secret = signingSecret("invite");
  const code = normalizeInviteCode(input);
  if (!secret || !code) return { status: "invalid" };

  const bytes = decodeBase32(code);
  if (!bytes || bytes.length !== BODY_BYTES + SIG_BYTES) return { status: "invalid" };

  const body = bytes.slice(0, BODY_BYTES);
  if (!safeEqualBytes(bytes.slice(BODY_BYTES), await signature(secret, body))) return { status: "invalid" };

  const issuedAt = new DataView(body.buffer).getUint32(0) * 1000;
  if (issuedAt > now + CLOCK_SKEW_MS) return { status: "invalid" };

  const expiresAt = issuedAt + INVITE_MS;
  return { status: now < expiresAt ? "valid" : "expired", expiresAt };
}
