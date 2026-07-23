import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, Eye, GitCompareArrows, Heart, ShoppingBag, Star, Truck, Zap } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type Product } from "@/lib/ecommerce-data";
import { useAuth } from "@/lib/auth";
import { addFavorite, isFavorite, removeFavorite } from "@/lib/user-data";
import { useCart } from "@/hooks/useCart";
import { resolveImage } from "@/lib/content";
import { QuickViewModal } from "./QuickViewModal";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

function colorSwatch(color: string) {
  const c = color.toLowerCase();
  if (c === "white") return "#ffffff";
  if (c === "black") return "#111111";
  if (c === "red") return "#C2185B";
  if (c === "beige") return "#f5f5dc";
  if (c === "pink") return "#ffc0cb";
  if (c === "maroon") return "#800000";
  if (c === "gold") return "#d4af37";
  if (c === "teal") return "#008080";
  if (c === "blue") return "#3b82f6";
  if (c === "green") return "#16a34a";
  if (c === "lilac" || c === "lavender") return "#c8a2c8";
  return color;
}

function collectionLabel(category: string) {
  return category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function fabricTag(fabric: string | null, category: string) {
  if (!fabric) return collectionLabel(category);
  const short = fabric.split(/[&,]/)[0]?.trim() || fabric;
  return short.length > 22 ? `${short.slice(0, 20)}…` : short;
}

export function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { addToCart } = useCart();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "Default");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setSelectedColor(product.colors[0] || "Default");
  }, [product.id, product.colors]);

  const savedQ = useQuery({
    queryKey: ["favorite", "product", product.slug, user?.id],
    queryFn: () => (user ? isFavorite(user.id, "product", product.slug) : Promise.resolve(false)),
    enabled: !!user,
  });

  const toggleFavorite = useMutation({
    mutationFn: async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!user) throw new Error("not-signed-in");
      if (savedQ.data) {
        await removeFavorite(user.id, "product", product.slug);
      } else {
        await addFavorite(user.id, "product", product.slug);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorite", "product", product.slug, user?.id] });
      qc.invalidateQueries({ queryKey: ["favorites", user?.id] });
      toast.success(savedQ.data ? "Removed from wishlist" : "Added to wishlist");
    },
    onError: (e: Error) => {
      if (e.message === "not-signed-in") {
        toast.info("Sign in to save products to wishlist");
        navigate({ to: "/auth", search: {} });
      } else {
        toast.error(e.message);
      }
    },
  });

  const defaultSize = product.sizes[0] || "M";
  const outOfStock = product.stock_status === "out_of_stock";
  const hasDiscount = !!(product.compare_at_price && product.compare_at_price > product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;
  const savings = hasDiscount ? product.compare_at_price! - product.price : 0;

  const colorIndex = Math.max(0, product.colors.indexOf(selectedColor));
  const primaryImage = resolveImage(
    product.images[Math.min(colorIndex, product.images.length - 1)] || product.images[0],
  );
  const hoverImage = resolveImage(product.images[1] || product.images[0]);
  const showHoverSwap = hovered && !!product.images[1] && colorIndex === 0;

  const displaySizes =
    product.sizes.length > 0
      ? SIZE_ORDER.filter((s) => product.sizes.includes(s)).concat(
          product.sizes.filter((s) => !SIZE_ORDER.includes(s)),
        )
      : SIZE_ORDER.slice(0, 5);

  const visibleColors = product.colors.slice(0, 5);
  const extraColors = Math.max(0, product.colors.length - 5);
  const freeShipping = product.price >= 5000 || hasDiscount;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addToCart(product, defaultSize, selectedColor, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addToCart(product, defaultSize, selectedColor, 1);
    navigate({ to: "/checkout" });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const raw = localStorage.getItem("pahraan_compare");
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(product.slug)) {
        list.push(product.slug);
        localStorage.setItem("pahraan_compare", JSON.stringify(list.slice(-4)));
      }
      toast.success("Added to compare");
    } catch {
      toast.info("Compare saved");
    }
  };

  return (
    <>
      <article
        className="group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-[#F8BBD0]/35 bg-white shadow-[0_8px_28px_-12px_rgba(194,24,91,0.12)] transition-all duration-[350ms] ease-out hover:-translate-y-2 hover:shadow-[0_22px_50px_-18px_rgba(194,24,91,0.28)]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image ~70% of card feel */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#FFF5F8]">
          {/* Top-left badge: SALE takes priority over NEW */}
          <div className="absolute left-3.5 top-3.5 z-20">
            {hasDiscount ? (
              <span className="inline-flex rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-soft">
                Sale {discountPercent}%
              </span>
            ) : product.is_new_arrival ? (
              <span className="inline-flex rounded-full bg-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-soft">
                New
              </span>
            ) : null}
          </div>

          {/* Top-right wishlist */}
          <button
            type="button"
            onClick={(e) => toggleFavorite.mutate(e)}
            disabled={toggleFavorite.isPending}
            className={`absolute right-3.5 top-3.5 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/95 shadow-soft backdrop-blur transition duration-300 hover:scale-105 ${
              savedQ.data ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}
            aria-label="Wishlist"
          >
            <Heart
              className={`h-4.5 w-4.5 transition-all duration-300 ${
                savedQ.data ? "fill-current scale-110" : ""
              }`}
            />
          </button>

          <Link
            to="/shop/$slug"
            params={{ slug: product.slug }}
            className="absolute inset-0 block"
            aria-label={product.title}
          >
            <img
              src={primaryImage}
              alt={product.title}
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-[350ms] ease-out ${
                showHoverSwap
                  ? "opacity-0 scale-105"
                  : "opacity-100 scale-100 group-hover:scale-105"
              }`}
            />
            {product.images[1] && (
              <img
                src={hoverImage}
                alt=""
                loading="lazy"
                decoding="async"
                className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-[350ms] ease-out ${
                  showHoverSwap ? "opacity-100 scale-105" : "opacity-0 scale-100"
                }`}
              />
            )}
          </Link>

          {/* Hover floating actions */}
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex items-end justify-center px-3 opacity-0 translate-y-2 transition-all duration-[350ms] ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 max-md:pointer-events-auto max-md:opacity-100 max-md:translate-y-0">
            <button
              type="button"
              onClick={handleQuickView}
              className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-white/95 px-5 py-2.5 text-[11px] font-semibold text-foreground shadow-elegant backdrop-blur transition hover:text-primary cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" /> Quick View
            </button>
            <button
              type="button"
              onClick={handleCompare}
              className="pointer-events-auto absolute right-3 bottom-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-foreground/70 shadow-soft backdrop-blur transition hover:text-primary cursor-pointer"
              title="Compare"
              aria-label="Compare"
            >
              <GitCompareArrows className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
              {collectionLabel(product.category)}
            </p>
            <Link to="/shop/$slug" params={{ slug: product.slug }} className="mt-1.5 block">
              <h3 className="font-display text-[1.05rem] font-semibold leading-snug text-foreground transition group-hover:text-primary line-clamp-2 sm:text-lg">
                {product.title}
              </h3>
            </Link>

            <div className="mt-2 flex items-center gap-1.5">
              <div className="flex text-amber-400" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < Math.round(product.rating) ? "fill-current" : "fill-transparent"}`}
                  />
                ))}
              </div>
              <span className="text-[11px] font-semibold text-foreground">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-[11px] text-muted-foreground">
                ({product.review_count} Reviews)
              </span>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-display text-xl font-bold text-primary">
                PKR {product.price.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  PKR {product.compare_at_price!.toLocaleString()}
                </span>
              )}
            </div>
            {hasDiscount && (
              <p className="mt-1 text-[11px] font-semibold text-emerald-600">
                You Save PKR {savings.toLocaleString()}
              </p>
            )}
          </div>

          {/* Colors */}
          {visibleColors.length > 0 && (
            <div className="flex items-center gap-1.5">
              {visibleColors.map((color) => {
                const active = selectedColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedColor(color);
                    }}
                    className={`h-5 w-5 rounded-full border transition cursor-pointer ${
                      active
                        ? "border-primary ring-2 ring-primary/25 scale-110"
                        : "border-border/80 hover:border-primary/50"
                    }`}
                    style={{ backgroundColor: colorSwatch(color) }}
                    aria-label={`Color ${color}`}
                  />
                );
              })}
              {extraColors > 0 && (
                <span className="text-[10px] font-semibold text-muted-foreground">
                  +{extraColors}
                </span>
              )}
            </div>
          )}

          {/* Sizes */}
          <div className="flex flex-wrap gap-1.5">
            {(displaySizes.length ? displaySizes : SIZE_ORDER.slice(0, 5))
              .slice(0, 6)
              .map((size) => {
                const available = product.sizes.length === 0 || product.sizes.includes(size);
                return (
                  <span
                    key={size}
                    className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold tracking-wide ${
                      available
                        ? "border-border/70 bg-[#FFF9FB] text-foreground"
                        : "border-border/40 bg-muted/40 text-muted-foreground/50 line-through"
                    }`}
                  >
                    {size}
                  </span>
                );
              })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
              {fabricTag(product.fabric, product.category)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-white px-2.5 py-1 text-[10px] font-semibold text-foreground/75">
              {freeShipping ? (
                <>
                  <Truck className="h-3 w-3 text-primary" /> Free Shipping
                </>
              ) : (
                <>
                  <Zap className="h-3 w-3 text-primary" /> Fast Delivery
                </>
              )}
            </span>
          </div>

          <p
            className={`text-[11px] font-semibold ${
              outOfStock
                ? "text-destructive"
                : product.stock_status === "low_stock"
                  ? "text-amber-600"
                  : "text-emerald-600"
            }`}
          >
            {outOfStock
              ? "● Out of Stock"
              : product.stock_status === "low_stock"
                ? "Only a few left"
                : "● In Stock"}
          </p>

          <div className="mt-auto flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock}
              className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-soft transition duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                added ? "bg-emerald-600 hover:bg-emerald-600" : "bg-primary hover:bg-accent"
              }`}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" /> Added to Cart
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" /> Add to Cart
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={outOfStock}
              className="inline-flex h-11 w-full items-center justify-center rounded-full border border-primary bg-white text-xs font-bold uppercase tracking-wider text-primary transition duration-300 hover:bg-primary hover:text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>
        </div>
      </article>

      <QuickViewModal
        product={product}
        open={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}
