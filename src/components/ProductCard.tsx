import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, ShoppingBag, Eye, Star } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type Product } from "@/lib/ecommerce-data";
import { useAuth } from "@/lib/auth";
import { addFavorite, isFavorite, removeFavorite } from "@/lib/user-data";
import { useCart } from "@/hooks/useCart";
import { resolveImage } from "@/lib/content";
import { QuickViewModal } from "./QuickViewModal";

export function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { addToCart } = useCart();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Favorites Query & Mutation
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
        navigate({ to: "/auth" });
      } else {
        toast.error(e.message);
      }
    },
  });

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Default to the first available size and color
    const defaultSize = product.sizes[0] || "M";
    const defaultColor = product.colors[0] || "Default";
    addToCart(product, defaultSize, defaultColor, 1);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  const displayImage = resolveImage(product.images[0]);

  return (
    <>
      <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-border/40 shadow-soft hover:shadow-elegant transition-all duration-500 hover:-translate-y-1">
        {/* Wishlist Heart Toggle */}
        <button
          onClick={(e) => toggleFavorite.mutate(e)}
          disabled={toggleFavorite.isPending}
          className={`absolute right-4.5 top-4.5 z-20 flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-soft backdrop-blur transition-all duration-300 hover:scale-105 active:scale-95 ${
            savedQ.data ? "text-primary" : "text-muted-foreground hover:text-primary"
          }`}
          aria-label="Toggle Wishlist"
        >
          <Heart className={`h-4.5 w-4.5 transition ${savedQ.data ? "fill-current" : ""}`} />
        </button>

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute left-4.5 top-4.5 z-20 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-soft">
            {discountPercent}% Off
          </span>
        )}

        {/* Product Image Panel */}
        <Link to="/shop/$slug" params={{ slug: product.slug }} className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
          <img
            src={displayImage}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Hover Overlay Actions */}
          <div className="absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/40 via-black/5 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="flex gap-2">
              <button
                onClick={handleQuickView}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-white/95 py-2.5 text-xs font-semibold text-foreground hover:text-primary transition hover:bg-white shadow-soft cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" /> Quick View
              </button>
              <button
                onClick={handleQuickAdd}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white hover:bg-accent transition shadow-soft cursor-pointer"
                title="Quick Add to Cart (Size: S/M)"
              >
                <ShoppingBag className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </Link>

        {/* Product Details Panel */}
        <div className="flex flex-1 flex-col p-4.5">
          {/* Brand & Rating row */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              {product.brand}
            </span>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-[10px] font-semibold text-foreground">
                {product.rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Title */}
          <Link
            to="/shop/$slug"
            params={{ slug: product.slug }}
            className="mt-1.5 block"
          >
            <h3 className="font-display text-base font-semibold leading-tight text-foreground transition group-hover:text-primary truncate">
              {product.title}
            </h3>
          </Link>

          {/* Excerpt / Short Description */}
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed flex-1">
            {product.short_description}
          </p>

          {/* Available Sizes & Colors row */}
          <div className="mt-3.5 flex items-center justify-between border-t border-border/40 pt-3">
            {/* Sizes */}
            <div className="flex gap-1">
              {product.sizes.slice(0, 3).map((size) => (
                <span
                  key={size}
                  className="rounded-md border border-border/60 bg-secondary/5 px-1.5 py-0.5 text-[9px] font-bold text-foreground"
                >
                  {size}
                </span>
              ))}
              {product.sizes.length > 3 && (
                <span className="text-[9px] font-medium text-muted-foreground py-0.5">
                  +{product.sizes.length - 3}
                </span>
              )}
            </div>

            {/* Color Dots */}
            <div className="flex gap-1">
              {product.colors.slice(0, 3).map((color, idx) => (
                <span
                  key={idx}
                  className="h-2.5 w-2.5 rounded-full border border-border shadow-soft shrink-0"
                  style={{
                    backgroundColor:
                      color.toLowerCase() === "white"
                        ? "#ffffff"
                        : color.toLowerCase() === "black"
                          ? "#000000"
                          : color.toLowerCase() === "red"
                            ? "#C2185B"
                            : color.toLowerCase() === "beige"
                              ? "#f5f5dc"
                              : color.toLowerCase() === "pink"
                                ? "#ffc0cb"
                                : color,
                  }}
                  title={color}
                />
              ))}
              {product.colors.length > 3 && (
                <span className="text-[9px] font-medium text-muted-foreground leading-none">
                  +{product.colors.length - 3}
                </span>
              )}
            </div>
          </div>

          {/* Pricing Row */}
          <div className="mt-3.5 flex items-baseline gap-2">
            <span className="font-display text-lg font-bold text-primary">
              PKR {product.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                PKR {product.compare_at_price!.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <QuickViewModal
        product={product}
        open={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}
