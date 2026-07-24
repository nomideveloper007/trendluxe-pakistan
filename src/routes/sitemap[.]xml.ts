import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { getSiteUrl } from "@/lib/site-config";
import { categories } from "@/lib/content";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const BASE_URL = getSiteUrl();
        const supabase = createClient<Database>(
          process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY!,
          { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
        );

        const [{ data: trends }, { data: posts }, productsRes] = await Promise.all([
          supabase.from("trends").select("slug,published_at,updated_at").eq("published", true),
          supabase.from("blog_posts").select("slug,published_at,updated_at").eq("published", true),
          (supabase as any).from("products").select("slug,updated_at").order("updated_at", { ascending: false }),
        ]);

        const products = ((productsRes as any)?.data ?? []) as { slug: string; updated_at?: string }[];

        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/shop", changefreq: "daily", priority: "0.95" },
          { path: "/trends", changefreq: "weekly", priority: "0.9" },
          { path: "/blog", changefreq: "weekly", priority: "0.9" },
          { path: "/about", changefreq: "monthly", priority: "0.5" },
          { path: "/contact", changefreq: "monthly", priority: "0.5" },
          ...categories.map((c) => ({
            path: `/shop?category=${c.slug}`,
            changefreq: "weekly" as const,
            priority: "0.75",
          })),
          ...categories.map((c) => ({
            path: `/collections/${c.slug}`,
            changefreq: "weekly" as const,
            priority: "0.7",
          })),
          ...products.map((p) => ({
            path: `/shop/${p.slug}`,
            lastmod: p.updated_at?.slice(0, 10),
            changefreq: "weekly" as const,
            priority: "0.85",
          })),
          ...(trends ?? []).map((t) => ({
            path: `/trends/${t.slug}`,
            lastmod: (t.published_at ?? t.updated_at)?.slice(0, 10),
            changefreq: "monthly" as const,
            priority: "0.8",
          })),
          ...(posts ?? []).map((p) => ({
            path: `/blog/${p.slug}`,
            lastmod: (p.published_at ?? p.updated_at)?.slice(0, 10),
            changefreq: "monthly" as const,
            priority: "0.7",
          })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path.startsWith("/") ? e.path : `/${e.path}`}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
