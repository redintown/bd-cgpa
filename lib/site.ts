/**
 * Canonical origin of the deployed site.
 *
 * Configured through `NEXT_PUBLIC_SITE_URL` and falls back to localhost for
 * local development. No production domain is hardcoded anywhere in the app —
 * metadata, canonical URLs and the sitemap all resolve through this module.
 */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Resolves an app-relative path (e.g. `/universities/iub`) to an absolute URL. */
export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}
