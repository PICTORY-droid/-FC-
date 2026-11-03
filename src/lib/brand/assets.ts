/**
 * Brand asset URLs in one place. Bump a version whenever the matching script
 * regenerates the image, so phones, messengers and the service worker fetch the
 * new file instead of a stale cached copy.
 *  - ICON_VERSION ← scripts/build_app_icons.py
 *  - SHARE_IMAGE_VERSION ← scripts/build_og_image.mjs
 */
export const ICON_VERSION = "3";
export const SHARE_IMAGE_VERSION = "1";

const v = (path: string, version: string) => `${path}?v=${version}`;

export const APP_ICONS = {
  any192: v("/icons/icon-192.png", ICON_VERSION),
  any512: v("/icons/icon-512.png", ICON_VERSION),
  maskable512: v("/icons/icon-maskable-512.png", ICON_VERSION),
  apple180: v("/icons/apple-touch-icon.png", ICON_VERSION),
} as const;

export const SHARE_IMAGE = {
  url: v("/og-image.png", SHARE_IMAGE_VERSION),
  width: 1200,
  height: 630,
  alt: "우체국 FC 문제은행 — 교재 원문 240문항, 바로 채점, 누리 도우미",
} as const;

/** Public origin for absolute share links. Vercel sets VERCEL_PROJECT_PRODUCTION_URL automatically. */
export function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return new URL(explicit || (vercel ? `https://${vercel}` : "http://localhost:3000"));
}
