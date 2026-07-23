import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type Product } from "@/lib/ecommerce-data";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/lib/auth";
import { isFavorite, addFavorite, removeFavorite } from "@/lib/user-data";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { resolveImage } from "@/lib/content";

type QuickViewModalProps = {
  product: Product;
  open: boolean;
  onClose: () => void;
};

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
  return color;
}

export function QuickViewModal({ product, open, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [added, setAdded] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedSize(product.sizes[0] || "");
    setSelectedColor(product.colors[0] || "");
    setQuantity(1);
    setCurrentImgIdx(0);
    setAdded(false);
    setZoomed(false);
  }, [open, product.id, product.sizes, product.colors]);

  const savedQ = useQuery({
    queryKey: ["favorite", "product", product.slug, user?.id],
    queryFn: () => (user ? isFavorite(user.id, "product", product.slug) : Promise.resolve(false)),
    enabled: !!user && open,
  });

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.info("Please sign in to save products");
      navigate({ to: "/auth", search: {} });
      return;
    }
    try {
      if (savedQ.data) {
        await removeFavorite(user.id, "product", product.slug);
        toast.success("Removed from wishlist");
      } else {
        await addFavorite(user.id, "product", product.slug);
        toast.success("Added to wishlist");
      }
      savedQ.refetch();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update wishlist");
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (!selectedColor) {
      toast.error("Please select a color");
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  const handleBuyNow = () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select size and color");
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
    onClose();
    navigate({ to: "/checkout" });
  };

  const hasDiscount = !!(product.compare_at_price && product.compare_at_price > product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;
  const savings = hasDiscount ? product.compare_at_price! - product.price : 0;

  const nextImage = () => {
    if (product.images.length === 0) return;
    setCurrentImgIdx((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    if (product.images.length === 0) return;
    setCurrentImgIdx((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl gap-0 overflow-hidden rounded-[20px] border border-[#F8BBD0]/40 bg-white p-0 shadow-elegant sm:max-w-4xl">
        <div className="sr-only">
          <DialogTitle>Quick View: {product.title}</DialogTitle>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-border/50 bg-white/95 text-muted-foreground shadow-soft transition hover:text-foreground cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid md:grid-cols-2">
          <div className="relative aspect-[4/5] bg-[#FFF5F8] md:aspect-auto md:min-h-[540px]">
            {product.images.length > 0 ? (
              <button
                type="button"
                className="absolute inset-0 cursor-zoom-in"
                onClick={() => setZoomed((z) => !z)}
                aria-label="Toggle zoom"
              >
                <img
                  src={resolveImage(product.images[currentImgIdx])}
                  alt={product.title}
                  className={`h-full w-full object-cover transition-transform duration-300 ${
                    zoomed ? "scale-125" : "scale-100"
                  }`}
                />
              </button>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No images available
              </div>
            )}

            {product.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-soft transition hover:bg-white cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-soft transition hover:bg-white cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-4 inset-x-0 z-10 flex justify-center gap-1.5">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentImgIdx(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        currentImgIdx === idx ? "w-5 bg-primary" : "w-1.5 bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {hasDiscount && (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-soft">
                Sale {discountPercent}%
              </span>
            )}
          </div>

          <div className="flex max-h-[80vh] flex-col justify-between overflow-y-auto p-6 md:max-h-[540px] md:p-8">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                    {product.category.replace(/-/g, " ")}
                  </p>
                  <h2 className="mt-1 font-display text-2xl font-bold leading-tight text-foreground">
                    {product.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-soft transition cursor-pointer ${
                    savedQ.data
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-white text-muted-foreground hover:text-primary"
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`h-4.5 w-4.5 ${savedQ.data ? "fill-current" : ""}`} />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.round(product.rating) ? "fill-current" : ""
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold">
                  {product.rating.toFixed(1)} ({product.review_count} Reviews)
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-display text-2xl font-bold text-primary">
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

              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.short_description || product.description.slice(0, 160)}
              </p>

              {product.sizes.length > 0 && (
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Size: {selectedSize}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`flex h-9 min-w-9 items-center justify-center rounded-xl border px-2.5 text-xs font-bold transition cursor-pointer ${
                          selectedSize === size
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-white text-foreground hover:border-primary"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.colors.length > 0 && (
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Color: {selectedColor}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color, idx) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setSelectedColor(color);
                          if (product.images[idx]) setCurrentImgIdx(idx);
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold capitalize transition cursor-pointer ${
                          selectedColor === color
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-white text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-border"
                          style={{ backgroundColor: colorSwatch(color) }}
                        />
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3 border-t border-border/40 pt-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-11 items-center rounded-full border border-border bg-[#FFF9FB] px-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white cursor-pointer"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock_status === "out_of_stock"}
                  className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-xs font-bold uppercase tracking-wider text-white transition cursor-pointer disabled:opacity-50 ${
                    added ? "bg-emerald-600" : "bg-primary hover:bg-accent"
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
              </div>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stock_status === "out_of_stock"}
                className="flex h-11 w-full items-center justify-center rounded-full border border-primary bg-white text-xs font-bold uppercase tracking-wider text-primary transition hover:bg-primary hover:text-white cursor-pointer disabled:opacity-50"
              >
                Buy Now
              </button>

              <div className="text-center">
                <Link
                  to="/shop/$slug"
                  params={{ slug: product.slug }}
                  onClick={onClose}
                  className="text-[11px] font-semibold uppercase tracking-wider text-primary hover:underline"
                >
                  View Full Details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
