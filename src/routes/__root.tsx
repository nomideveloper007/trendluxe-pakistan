import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { SITE } from "@/lib/content";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/hooks/useCart";
import { AnalyticsBootstrap } from "@/lib/analytics";
import { absoluteUrl, getSiteUrl, SITE_DEFAULTS } from "@/lib/site-config";
import { organizationSchema, websiteSchema } from "@/lib/seo";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 font-display text-2xl text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-accent"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="max-w-2xl text-center">
        <h1 className="font-display text-2xl text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. Try refreshing or head back home.
        </p>
        <div className="mt-6 max-h-80 overflow-auto rounded-2xl border border-rose-200 bg-rose-50/50 p-4 text-left text-xs font-mono text-rose-700">
          <p className="mb-1 font-bold">Error: {error?.message || String(error)}</p>
          {error?.stack && <pre className="mt-2 whitespace-pre-wrap">{error.stack}</pre>}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-accent"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-full border border-input bg-background px-5 py-2 text-sm font-medium hover:bg-accent/10"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => {
    const url = getSiteUrl();
    const ogImage = absoluteUrl(SITE_DEFAULTS.defaultOgImage);
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: `${SITE.name} — ${SITE.tagline}` },
        { name: "description", content: SITE.description },
        {
          name: "keywords",
          content:
            "Pahraan, Pakistani fashion, lawn suits, bridal wear, luxury pret, embroidered suits",
        },
        { name: "author", content: SITE.name },
        { name: "robots", content: "index,follow" },
        { property: "og:site_name", content: SITE.name },
        { property: "og:title", content: `${SITE.name} — ${SITE.tagline}` },
        { property: "og:description", content: SITE.description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:image", content: ogImage },
        { property: "og:locale", content: SITE_DEFAULTS.locale },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${SITE.name} — ${SITE.tagline}` },
        { name: "twitter:description", content: SITE.description },
        { name: "twitter:image", content: ogImage },
        { name: "theme-color", content: SITE_DEFAULTS.themeColor },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/favicon.png", type: "image/png" },
        { rel: "canonical", href: `${url}/` },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        { rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Poppins:wght@300;400;500;600;700&display=swap",
        },
      ],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(websiteSchema()) },
        { type: "application/ld+json", children: JSON.stringify(organizationSchema()) },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          {!isAdminPage && <AnalyticsBootstrap />}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-elegant"
          >
            Skip to content
          </a>
          <div className="flex min-h-screen flex-col overflow-x-clip">
            {!isAdminPage && (
              <Navbar searchOpen={searchOpen} onSearchOpenChange={setSearchOpen} />
            )}
            <main id="main-content" className="flex-1" tabIndex={-1}>
              <Outlet />
            </main>
            {!isAdminPage && <Footer />}
          </div>
          {!isAdminPage && <CartDrawer />}
          {!isAdminPage && <MobileBottomNav onSearch={() => setSearchOpen(true)} />}
          <Toaster position="top-center" richColors />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
