/**
 * App icon URLs in one place. Bump ICON_VERSION whenever scripts/build_app_icons.py
 * regenerates the images, so phones and the service worker fetch the new files
 * instead of serving a stale cached icon.
 */
export const ICON_VERSION = "3";

const v = (path: string) => `${path}?v=${ICON_VERSION}`;

export const APP_ICONS = {
  any192: v("/icons/icon-192.png"),
  any512: v("/icons/icon-512.png"),
  maskable512: v("/icons/icon-maskable-512.png"),
  apple180: v("/icons/apple-touch-icon.png"),
} as const;
