import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronRight, FolderTree, Package, Search, Sparkles, X } from "lucide-react";
import { fetchProducts, fetchTrendingProducts } from "@/lib/ecommerce-data";
import { fetchAllPosts } from "@/lib/blog-data";
import { fetchAllTrends } from "@/lib/trends-data";
import { categories, resolveImage } from "@/lib/content";

const POPULAR = ["Lawn suits", "Bridal", "Luxury pret", "Eid", "Sale", "Embroidered"];

type Props = {
  open: boolean;
  onClose: () => void;
};

type Hit = {
  type: "product" | "collection" | "category" | "blog" | "page" | "trend";
  label: string;
  href: string;
  meta?: string;
  image?: string;
};

const PAGES: Hit[] = [
  { type: "page", label: "Shop", href: "/shop", meta: "All products" },
  { type: "page", label: "About", href: "/about", meta: "Our story" },
  { type: "page", label: "Contact", href: "/contact", meta: "Support" },
  { type: "page", label: "Wishlist", href: "/wishlist", meta: "Saved pieces" },
  { type: "page", label: "Blog", href: "/blog", meta: "Editorial" },
  { type: "page", label: "Trends", href: "/trends", meta: "Lookbook" },
];

export function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: products = [] } = useQuery({
    queryKey: ["products", "search-index"],
    queryFn: () => fetchProducts(),
    enabled: open,
  });

  const { data: trending = [] } = useQuery({
    queryKey: ["products", "search-trending"],
    queryFn: () => fetchTrendingProducts(),
    enabled: open,
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["posts", "search-index"],
    queryFn: () => fetchAllPosts(),
    enabled: open,
  });

  const { data: trends = [] } = useQuery({
    queryKey: ["trends", "search-index"],
    queryFn: () => fetchAllTrends(),
    enabled: open,
  });

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [] as Hit[];
    const hits: Hit[] = [];

    for (const p of products) {
      if (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.fabric?.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        hits.push({
          type: "product",
          label: p.title,
          href: `/shop/${p.slug}`,
          meta: `PKR ${p.price.toLocaleString()} · ${p.category}`,
          image: resolveImage(p.images[0]),
        });
      }
      if (hits.length >= 6) break;
    }

    for (const c of categories) {
      if (c.name.toLowerCase().includes(q) || c.slug.includes(q) || c.blurb.toLowerCase().includes(q)) {
        hits.push({
          type: "category",
          label: c.name,
          href: `/shop?category=${c.slug}`,
          meta: "Category",
        });
      }
    }

    for (const post of posts) {
      if (post.title.toLowerCase().includes(q) || post.excerpt.toLowerCase().includes(q)) {
        hits.push({ type: "blog", label: post.title, href: `/blog/${post.slug}`, meta: "Article" });
      }
      if (hits.filter((h) => h.type === "blog").length >= 3) break;
    }

    for (const trend of trends) {
      if (trend.title.toLowerCase().includes(q) || trend.excerpt?.toLowerCase().includes(q)) {
        hits.push({ type: "trend", label: trend.title, href: `/trends/${trend.slug}`, meta: "Trend" });
      }
      if (hits.filter((h) => h.type === "trend").length >= 3) break;
    }

    for (const page of PAGES) {
      if (page.label.toLowerCase().includes(q)) hits.push(page);
    }

    return hits.slice(0, 12);
  }, [query, products, posts, trends]);

  if (!open) return null;

  const iconFor = (type: Hit["type"]) => {
    if (type === "product") return Package;
    if (type === "blog") return BookOpen;
    if (type === "trend") return Sparkles;
    if (type === "category" || type === "collection") return FolderTree;
    return Search;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site search"
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/55 backdrop-blur-md p-4 pt-[8vh] animate-fade-in"
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border/60 bg-white/95 shadow-elegant animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border/70 px-5 py-4">
          <Search className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            placeholder="Search products, collections, blog, pages…"
            className="flex-1 bg-transparent text-base font-medium text-foreground outline-none placeholder:text-muted-foreground"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search Pahraan"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary/30 cursor-pointer"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-3">
          {!query.trim() && (
            <>
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Popular
              </p>
              <div className="mb-4 flex flex-wrap gap-2 px-2">
                {POPULAR.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-primary/30 cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Trending
              </p>
              <div className="space-y-1">
                {trending.slice(0, 5).map((p) => (
                  <Link
                    key={p.id}
                    to="/shop/$slug"
                    params={{ slug: p.slug }}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-2xl px-2 py-2 hover:bg-secondary/20"
                  >
                    <img
                      src={resolveImage(p.images[0])}
                      alt=""
                      className="h-12 w-10 rounded-xl object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{p.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        PKR {p.price.toLocaleString()}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </>
          )}

          {query.trim() && results.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">No matches for “{query}”</p>
          )}

          {results.length > 0 && (
            <ul className="space-y-1" role="listbox" aria-label="Search results">
              {results.map((hit) => {
                const Icon = iconFor(hit.type);
                return (
                  <li key={`${hit.type}-${hit.href}-${hit.label}`}>
                    <a
                      href={hit.href}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-2xl px-2 py-2 hover:bg-secondary/20"
                    >
                      {hit.image ? (
                        <img
                          src={hit.image}
                          alt=""
                          className="h-12 w-10 rounded-xl object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/25 text-primary">
                          <Icon className="h-4 w-4" />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{hit.label}</p>
                        <p className="text-[11px] capitalize text-muted-foreground">
                          {hit.type}
                          {hit.meta ? ` · ${hit.meta}` : ""}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}

          {query.trim() && (
            <Link
              to="/shop"
              search={{ search: query }}
              onClick={onClose}
              className="mt-3 flex items-center justify-center gap-1 rounded-2xl border border-border py-3 text-xs font-bold text-primary hover:bg-secondary/15"
            >
              View all shop results <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
