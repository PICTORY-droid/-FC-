export const MESSAGE_MAX_LENGTH = 300;

// Control chars (except \t \n \r) and zero-width / bidi chars used to smuggle hidden instructions.
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁠-⁤﻿]/g;

/** Shared by client (pre-send) and server (authoritative) input cleaning. */
export function sanitizeText(input: string): string {
  return input.normalize("NFC").replace(CONTROL_CHARS, "").replace(/[<>]/g, "").trim();
}
