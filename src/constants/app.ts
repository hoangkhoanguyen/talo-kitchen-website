/**
 * Application-wide constants
 */

export const APP_URL = "https://www.talokitchenhg.com";
export const APP_NAME = "TALO Kitchen & Lounge";
export const APP_DESCRIPTION =
  "Welcome to TALO Kitchen & Lounge, where culinary excellence meets a warm and inviting atmosphere.";

/**
 * Shared favicon / app icon metadata.
 *
 * IMPORTANT: PNG icons must come first. Google Search and many browsers do not
 * render SVG favicons correctly (they fall back to rendering the raw SVG
 * background, e.g. the green/yellow band). Keep the SVG only as a last-resort
 * fallback so modern browsers that support it can still use it.
 *
 * Reuse this in every page-level `metadata.icons` so per-page metadata never
 * overrides the root layout back to an SVG-only icon.
 */
export const APP_ICONS = {
  icon: [
    { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
    { url: "/favicon-96.png", type: "image/png", sizes: "96x96" },
    { url: "/favicon-192.png", type: "image/png", sizes: "192x192" },
    { url: "/favicon-512.png", type: "image/png", sizes: "512x512" },
    { url: "/talo-logo-bg.svg", type: "image/svg+xml" },
  ],
  apple: [{ url: "/favicon-180.png", sizes: "180x180", type: "image/png" }],
  other: [{ rel: "mask-icon", url: "/talo-logo-bg.svg" }],
};
