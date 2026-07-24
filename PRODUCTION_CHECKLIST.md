# Production readiness checklist (manual QA)

## Environment
- [ ] `.env` set from `.env.example` (no secrets in git)
- [ ] `VITE_SITE_URL` / `SITE_URL` match production domain
- [ ] Supabase keys rotated if ever committed

## Storefront
- [ ] Home, Shop, PDP, Cart, Checkout, Auth, Wishlist load
- [ ] Search (⌘/Ctrl+K style modal) returns products/blog/pages
- [ ] Filters on `/shop` work
- [ ] Checkout creates order
- [ ] Mobile + desktop layouts

## SEO
- [ ] `/sitemap.xml` lists shop + products
- [ ] `/robots.txt` disallows admin/auth/checkout
- [ ] PDP has title, description, Product JSON-LD
- [ ] Canonical + OG tags present in page source

## Accessibility
- [ ] Skip to content link visible on keyboard focus
- [ ] Focus rings visible
- [ ] Search dialog has aria-modal + Escape closes

## Admin
- [ ] `/admin` gated to admin role
- [ ] Tracking IDs save and inject after reload
- [ ] Email notification toggles persist
- [ ] Backup restore point creates locally

## Performance
- [ ] `npm run build` succeeds
- [ ] Lighthouse pass on Home + PDP (target 95+)
- [ ] Images lazy-load below the fold

## Security
- [ ] HTTPS enforced in production (`FORCE_HTTPS=true`)
- [ ] `_headers` / server security headers present
- [ ] Service role key never exposed to client
