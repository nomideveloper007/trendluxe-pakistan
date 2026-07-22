import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, ShoppingBag, Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type Product } from "@/lib/ecommerce-data";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/lib/auth";
import { isFavorite, addFavorite, removeFavorite } from "@/lib/user-data";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { resolveImage } from "@/lib/content";

type QuickViewModalProps = {
  product: Product;
  open: boolean;
  onClose: () => void;
};

export function QuickViewModal({ product, open, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  // Favorites logic
  const savedQ = useQuery({
    queryKey: ["favorite", "product", product.slug, user?.id],
    queryFn: () => (user ? isFavorite(user.id, "product", product.slug) : Promise.resolve(false)),
    enabled: !!user && open,
  });

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.info("Please sign in to save products");
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
    } catch (e: any) {
      toast.error(e.message || "Failed to update wishlist");
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
    onClose();
  };

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

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
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl border border-border/80 bg-white/95 backdrop-blur-md shadow-elegant animate-scale-in">
        {/* Hide default close button or style inside. Radix provides DialogTitle for accessibility */}
        <div className="sr-only">
          <DialogTitle>Quick View: {product.title}</DialogTitle>
        </div>

        <button
          onClick={onClose}
          className="absolute right-4.5 top-4.5 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 border border-border/40 text-muted-foreground hover:text-foreground shadow-soft transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Gallery Column */}
          <div className="relative bg-muted aspect-square md:aspect-auto md:h-[500px]">
            {product.images.length > 0 ? (
              <img
                src={resolveImage(product.images[currentImgIdx])}
                alt={product.title}
                className="h-full w-full object-cover transition-all"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm font-medium">
                No images available
              </div>
            )}

            {/* Slider arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-soft hover:bg-white transition text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-soft hover:bg-white transition text-foreground"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Indicators dots */}
                <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5 z-20">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImgIdx(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        currentImgIdx === idx ? "w-4 bg-primary" : "w-1.5 bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Discount Badge */}
            {hasDiscount && (
              <span className="absolute left-4.5 top-4.5 z-20 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-soft">
                {discountPercent}% Off
              </span>
            )}
          </div>

          {/* Details Column */}
          <div className="p-6 md:p-8 flex flex-col justify-between max-h-[500px] overflow-y-auto">
            <div>
              {/* Brand & Stock */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  {product.brand}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide border ${
                    product.stock_status === "in_stock"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : product.stock_status === "low_stock"
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-destructive/20 bg-destructive/5 text-destructive"
                  }`}
                >
                  {product.stock_status.replace("_", " ")}
                </span>
              </div>

              {/* Title */}
              <h2 className="font-display text-2xl font-bold text-foreground mt-2 leading-tight">
                {product.title}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mt-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.round(product.rating) ? "fill-current" : ""
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-foreground">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({product.review_count} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-display text-2xl font-bold text-primary">
                  PKR {product.price.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-muted-foreground line-through">
                    PKR {product.compare_at_price!.toLocaleString()}
                  </span>
                )}
              </div>

              {/* SKU & Category details */}
              <div className="mt-3 grid grid-cols-2 gap-y-1 text-xs border-y border-border/40 py-2.5 my-4">
                <div>
                  <span className="text-muted-foreground font-medium">SKU:</span>{" "}
                  <span className="font-semibold text-foreground">{product.sku}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">Fabric:</span>{" "}
                  <span className="font-semibold text-foreground">{product.fabric || "Premium Cotton"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">Category:</span>{" "}
                  <span className="font-semibold text-foreground capitalize">{product.category.replace("-", " ")}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">Embroidery:</span>{" "}
                  <span className="font-semibold text-foreground">{product.embroidery || "None"}</span>
                </div>
              </div>

              {/* Size Selector */}
              {product.sizes.length > 0 && (
                <div className="mt-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                    Size: {selectedSize}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`h-9 w-9 rounded-xl border text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                          selectedSize === size
                            ? "border-primary bg-primary text-white"
                            : "border-border hover:border-primary text-foreground hover:text-primary bg-white"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {product.colors.length > 0 && (
                <div className="mt-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                    Color: {selectedColor}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 capitalize ${
                          selectedColor === color
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-white text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full border border-border"
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
                                      : color,
                          }}
                        />
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Add/Wishlist Drawer Row */}
            <div className="mt-6 border-t border-border/40 pt-4.5">
              <div className="flex flex-wrap items-center gap-3">
                {/* Quantity select */}
                <div className="flex h-11 items-center rounded-full border border-border bg-secondary/15 px-1 shrink-0">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-9 w-9 rounded-full font-bold hover:bg-white/80 transition flex items-center justify-center text-foreground"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-foreground">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="h-9 w-9 rounded-full font-bold hover:bg-white/80 transition flex items-center justify-center text-foreground"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart button */}
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock_status === "out_of_stock"}
                  className="flex-1 h-11 bg-primary hover:bg-accent text-white rounded-full font-semibold shadow-soft hover:shadow-elegant flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="h-4.5 w-4.5" />
                  {product.stock_status === "out_of_stock" ? "Out of Stock" : "Add to Cart"}
                </Button>

                {/* Wishlist Button */}
                <button
                  onClick={handleToggleFavorite}
                  className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border shadow-soft transition hover:scale-105 active:scale-95 ${
                    savedQ.data
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-white text-muted-foreground hover:text-primary hover:border-primary"
                  }`}
                  title="Add to Wishlist"
                >
                  <Heart className={`h-4.5 w-4.5 ${savedQ.data ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* View details */}
              <div className="mt-4 text-center">
                <Link
                  to="/shop/$slug"
                  params={{ slug: product.slug }}
                  onClick={onClose}
                  className="text-xs font-semibold text-primary hover:underline hover:text-accent uppercase tracking-wider"
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
