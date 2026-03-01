/**
 * Base URL for the app (storefront). Use env in build, origin in browser.
 */
function getBaseUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
}

/**
 * Public store link for a restaurant. New restaurants get this link as soon as they are created.
 */
export function getRestaurantPublicLink(slug: string): string {
  const base = getBaseUrl();
  return base ? `${base}/r/${slug}` : `/r/${slug}`;
}
