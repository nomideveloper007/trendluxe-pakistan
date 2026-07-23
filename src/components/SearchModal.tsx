import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Search, TrendingUp, X } from "lucide-react";
import { fetchProducts, fetchTrendingProducts } from "@/lib/ecommerce-data";
import { resolveImage } from "@/lib/content";

const POPULAR = ["Lawn suits", "Bridal", "Luxury pret", "Eid", "Sale", "Embroidered"];

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState("");

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

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return products
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.fabric?.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [query, products]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/55 backdrop-blur-md p-4 pt-[8vh] animate-fade-in"
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border/60 bg-white/95 shadow-elegant animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border/70 px-5 py-4">
          <Search className="h-5 w-5 text-primary shrink-0" />
          <input
            type="search"
            placeholder="Search lawn, bridal, pret, fabric..."
            className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground outline-none font-medium"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-secondary/40 p-1.5 text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-5 py-4 space-y-5">
          {!query.trim() && (
            <>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-2.5">
                  Popular searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="rounded-full border border-border/70 bg-blush px-3.5 py-1.5 text-xs font-medium text-foreground/80 hover:border-primary hover:text-primary transition cursor-pointer"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-3">
                  <TrendingUp className="h-3 w-3 text-primary" /> Trending now
                </p>
                <div className="space-y-2">
                  {trending.slice(0, 4).map((p) => (
                    <Link
                      key={p.id}
                      to="/shop/$slug"
                      params={{ slug: p.slug }}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-2xl p-2.5 hover:bg-secondary/15 transition border border-transparent hover:border-primary/10"
                    >
                      <img
                        src={resolveImage(p.images[0])}
                        alt={p.title}
                        className="h-14 w-12 rounded-xl object-cover bg-muted"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase tracking-wider text-primary font-bold">
                          {p.category.replace(/-/g, " ")}
                        </p>
                        <p className="font-semibold text-sm truncate">{p.title}</p>
                        <p className="text-xs text-primary font-bold mt-0.5">
                          PKR {p.price.toLocaleString()}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}

          {query.trim() && results.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No products match “{query}”.
            </div>
          )}

          {results.map((p) => {
            const hasDiscount = p.compare_at_price && p.compare_at_price > p.price;
            return (
              <Link
                key={p.id}
                to="/shop/$slug"
                params={{ slug: p.slug }}
                onClick={onClose}
                className="flex gap-3 items-center rounded-2xl p-2.5 hover:bg-secondary/15 transition border border-transparent hover:border-primary/10"
              >
                <img
                  src={resolveImage(p.images[0])}
                  alt={p.title}
                  className="h-16 w-14 rounded-xl object-cover bg-muted shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    {p.category.replace(/-/g, " ")}
                  </p>
                  <p className="font-semibold text-sm truncate mt-0.5">{p.title}</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-primary">
                      PKR {p.price.toLocaleString()}
                    </span>
                    {hasDiscount && (
                      <span className="text-[11px] text-muted-foreground line-through">
                        PKR {p.compare_at_price!.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            );
          })}

          {query.trim() && results.length > 0 && (
            <Link
              to="/shop"
              search={{ search: query }}
              onClick={onClose}
              className="block text-center text-xs font-semibold text-primary hover:underline py-2"
            >
              View all results for “{query}”
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
