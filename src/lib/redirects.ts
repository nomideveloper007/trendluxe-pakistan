/**
 * Custom 301 redirect map (path → destination).
 * Used by server middleware and Cloudflare `_redirects`.
 */
export const REDIRECTS: Record<string, string> = {
  "/home": "/",
  "/store": "/shop",
  "/products": "/shop",
  "/collection": "/shop",
  "/login": "/auth",
  "/signin": "/auth",
  "/account": "/profile",
  "/my-account": "/profile",
};

/** Pretty aliases handled as soft redirects in route loaders */
export function resolveRedirect(pathname: string): string | null {
  const clean = pathname.replace(/\/$/, "") || "/";
  if (REDIRECTS[clean]) return REDIRECTS[clean];
  // /product/:slug → /shop/:slug
  const product = clean.match(/^\/product\/([^/]+)$/);
  if (product) return `/shop/${product[1]}`;
  // /collections/:slug → /shop?category=
  const collection = clean.match(/^\/collections\/([^/]+)$/);
  if (collection) return `/shop?category=${encodeURIComponent(collection[1])}`;
  return null;
}
