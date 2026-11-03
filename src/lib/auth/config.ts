/**
 * Secrets come only from environment variables (never from code):
 *  - APP_PASSWORD   — the entry password every FC types (e.g. a 4-digit PIN)
 *  - ADMIN_PASSWORD — the issuer's password for /admin (8+ characters)
 *
 * Both feed the signing key, so changing either one invalidates every
 * outstanding invite and signs every device out.
 */
export const ADMIN_PASSWORD_MIN = 8;

function env(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export function appPassword(): string | null {
  return env("APP_PASSWORD");
}

export function adminPassword(): string | null {
  const value = env("ADMIN_PASSWORD");
  return value && value.length >= ADMIN_PASSWORD_MIN ? value : null;
}

export type SigningPurpose = "session" | "invite";

/** HMAC key for one purpose, or null until both passwords are configured. */
export function signingSecret(purpose: SigningPurpose): string | null {
  const app = appPassword();
  const admin = adminPassword();
  if (!app || !admin) return null;
  return `fcqb-v2|${purpose}|${app}|${admin}`;
}
