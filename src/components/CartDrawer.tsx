import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  Heart,
  Loader2,
  Minus,
  Pencil,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useCart, type CartItem } from "@/hooks/useCart";
import { useAuth } from "@/lib/auth";
import { addFavorite } from "@/lib/user-data";
import { fetchTrendingProducts } from "@/lib/ecommerce-data";
import { resolveImage } from "@/lib/content";

const FREE_SHIPPING_THRESHOLD = 5000;

function collectionLabel(category: string) {
  return category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function CartLineItem({ item, onClose }: { item: CartItem; onClose: () => void }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateQuantity, removeFromCart, moveToSaved } = useCart();
  const [wishLoading, setWishLoading] = useState(false);

  const hasDisc =
    item.product.compare_at_price && item.product.compare_at_price > item.product.price;
  const lineTotal = item.product.price * item.quantity;
  const outOfStock = item.product.stock_status === "out_of_stock";
  const lowStock = item.product.stock_status === "low_stock";

  const moveToWishlist = async () => {
    if (!user) {
      toast.info("Sign in to save wishlist");
      navigate({ to: "/auth", search: { redirect: undefined } });
      return;
    }
    setWishLoading(true);
    try {
      await addFavorite(user.id, "product", item.product.slug);
      removeFromCart(item.productId, item.size, item.color);
      toast.success("Moved to wishlist");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Could not save wishlist");
    } finally {
      setWishLoading(false);
    }
  };

  return (
    <li className="rounded-[20px] border border-[#F8BBD0]/35 bg-white p-3 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant">
      <div className="flex gap-3">
        <Link
          to="/shop/$slug"
          params={{ slug: item.product.slug }}
          onClick={onClose}
          className="h-28 w-[5.5rem] shrink-0 overflow-hidden rounded-2xl bg-[#FFF5F8]"
        >
          <img
            src={resolveImage(item.product.images[0])}
            alt={item.product.title}
            className="h-full w-full object-cover"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-primary">
                {collectionLabel(item.product.category)}
              </p>
              <Link
                to="/shop/$slug"
                params={{ slug: item.product.slug }}
                onClick={onClose}
                className="mt-0.5 block font-display text-sm font-semibold leading-snug text-foreground hover:text-primary line-clamp-2"
              >
                {item.product.title}
              </Link>
            </div>
            <button
              type="button"
              onClick={() => removeFromCart(item.productId, item.size, item.color)}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive cursor-pointer"
              aria-label="Remove"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {item.color} · {item.size}
            {item.product.fabric ? ` · ${item.product.fabric.split(/[&,]/)[0]?.trim()}` : ""}
          </p>

          <p
            className={`mt-1 text-[10px] font-semibold ${
              outOfStock ? "text-destructive" : lowStock ? "text-amber-600" : "text-emerald-600"
            }`}
          >
            {outOfStock ? "● Out of stock" : lowStock ? "Only a few left" : "● In stock"}
          </p>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-0.5 rounded-full border border-border/70 bg-[#FFF9FB] p-0.5">
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-white cursor-pointer"
                onClick={() =>
                  updateQuantity(item.productId, item.size, item.color, item.quantity - 1)
                }
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-7 text-center text-xs font-bold tabular-nums">
                {item.quantity}
              </span>
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-full transition hover:bg-white cursor-pointer"
                onClick={() =>
                  updateQuantity(item.productId, item.size, item.color, item.quantity + 1)
                }
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            <div className="text-right">
              <p className="font-display text-sm font-bold text-primary tabular-nums">
                PKR {lineTotal.toLocaleString()}
              </p>
              {hasDisc && (
                <p className="text-[10px] text-muted-foreground line-through tabular-nums">
                  PKR {(item.product.compare_at_price! * item.quantity).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => moveToSaved(item.productId, item.size, item.color)}
              className="rounded-full border border-border px-2.5 py-1 text-[10px] font-semibold text-foreground/75 transition hover:border-primary hover:text-primary cursor-pointer"
            >
              Save for later
            </button>
            <button
              type="button"
              disabled={wishLoading}
              onClick={moveToWishlist}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[10px] font-semibold text-foreground/75 transition hover:border-primary hover:text-primary cursor-pointer disabled:opacity-50"
            >
              <Heart className="h-3 w-3" /> Wishlist
            </button>
            <Link
              to="/shop/$slug"
              params={{ slug: item.product.slug }}
              onClick={onClose}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[10px] font-semibold text-foreground/75 transition hover:border-primary hover:text-primary"
            >
              <Pencil className="h-3 w-3" /> Edit
            </Link>
          </div>
        </div>
      </div>
    </li>
  );
}

export function CartDrawer() {
  const {
    cart,
    savedForLater,
    isCartOpen,
    closeCart,
    cartSubtotal,
    productDiscount,
    shippingCost,
    discountAmount,
    taxCost,
    cartTotal,
    itemCount,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    moveSavedToCart,
    removeSaved,
    addToCart,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [applying, setApplying] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [visible, setVisible] = useState(false);
  const [entering, setEntering] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<
    { slug: string; title: string; price: number; image: string }[]
  >([]);

  const trendingQ = useQuery({
    queryKey: ["products", "cart-recommend"],
    queryFn: () => fetchTrendingProducts(),
    enabled: isCartOpen,
  });

  useEffect(() => {
    if (isCartOpen) {
      setVisible(true);
      requestAnimationFrame(() => setEntering(true));
      document.body.style.overflow = "hidden";
      try {
        const raw = localStorage.getItem("pahraan_recently_viewed");
        if (raw) setRecentlyViewed(JSON.parse(raw).slice(0, 6));
      } catch {
        /* ignore */
      }
    } else {
      setEntering(false);
      const t = window.setTimeout(() => setVisible(false), 300);
      document.body.style.overflow = "";
      return () => window.clearTimeout(t);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  const progress = Math.min(100, (cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);

  const recommendations = useMemo(() => {
    const cartIds = new Set(cart.map((c) => c.productId));
    return (trendingQ.data ?? []).filter((p) => !cartIds.has(p.id)).slice(0, 6);
  }, [trendingQ.data, cart]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <button
        type="button"
        aria-label="Close cart"
        className={`absolute inset-0 bg-black/40 backdrop-blur-[6px] transition-opacity duration-300 ${
          entering ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeCart}
      />

      <aside
        className={`relative flex h-full w-full flex-col border-l border-[#F8BBD0]/40 bg-white shadow-elegant transition-transform duration-300 ease-out md:max-w-[380px] lg:max-w-[420px] ${
          entering ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">Shopping Cart</h2>
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="grid h-10 w-10 place-items-center rounded-full border border-border/60 text-foreground/70 transition hover:border-primary hover:text-primary cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Free shipping progress */}
        <div className="border-b border-border/40 bg-blush px-5 py-3.5">
          <div className="flex items-start gap-2 text-xs text-foreground/85">
            <Truck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            {remaining > 0 ? (
              <span>
                You&apos;re only{" "}
                <strong className="text-primary">PKR {remaining.toLocaleString()}</strong> away from{" "}
                <strong>FREE Shipping</strong>!
              </span>
            ) : (
              <span className="font-semibold text-primary">
                You unlocked FREE shipping — beautifully done.
              </span>
            )}
          </div>
          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/90">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cart.length === 0 ? (
            <div className="flex min-h-[50%] flex-col items-center justify-center py-12 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[#FFF5F8] text-primary shadow-soft">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold">Your bag is waiting</h3>
              <p className="mt-2 max-w-[240px] text-sm text-muted-foreground leading-relaxed">
                Your shopping bag is waiting for something beautiful.
              </p>
              <button
                type="button"
                onClick={closeCart}
                className="mt-6 rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-elegant hover:bg-accent cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {cart.map((item) => (
                <CartLineItem
                  key={`${item.productId}-${item.size}-${item.color}`}
                  item={item}
                  onClose={closeCart}
                />
              ))}
            </ul>
          )}

          {/* Saved for later */}
          {savedForLater.length > 0 && (
            <div className="mt-8">
              <h3 className="font-display text-base font-semibold">Saved for Later</h3>
              <ul className="mt-3 space-y-2">
                {savedForLater.map((item) => (
                  <li
                    key={`saved-${item.productId}-${item.size}-${item.color}`}
                    className="flex gap-3 rounded-2xl border border-border/50 bg-[#FFF9FB] p-2.5"
                  >
                    <img
                      src={resolveImage(item.product.images[0])}
                      alt=""
                      className="h-16 w-14 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{item.product.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.size} · {item.color}
                      </p>
                      <div className="mt-1.5 flex gap-2">
                        <button
                          type="button"
                          onClick={() => moveSavedToCart(item.productId, item.size, item.color)}
                          className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer"
                        >
                          Move to bag
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSaved(item.productId, item.size, item.color)}
                          className="text-[10px] font-semibold text-muted-foreground hover:text-destructive cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* You may also like */}
          {recommendations.length > 0 && (
            <div className="mt-8">
              <h3 className="font-display text-base font-semibold">You May Also Like</h3>
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
                {recommendations.map((p) => (
                  <div
                    key={p.id}
                    className="w-36 shrink-0 overflow-hidden rounded-2xl border border-border/40 bg-white p-2 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant"
                  >
                    <Link
                      to="/shop/$slug"
                      params={{ slug: p.slug }}
                      onClick={closeCart}
                      className="block"
                    >
                      <div className="aspect-[3/4] overflow-hidden rounded-xl bg-muted">
                        <img
                          src={resolveImage(p.images[0])}
                          alt={p.title}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="mt-1.5 line-clamp-2 font-display text-[11px] font-semibold">
                        {p.title}
                      </p>
                      <p className="text-[11px] font-bold text-primary">
                        PKR {p.price.toLocaleString()}
                      </p>
                    </Link>
                    <button
                      type="button"
                      onClick={() => addToCart(p, p.sizes?.[0] ?? "", p.colors?.[0] ?? "", 1)}
                      className="mt-2 w-full rounded-full bg-primary/90 py-1.5 text-[9px] font-bold uppercase tracking-wider text-white transition hover:bg-primary cursor-pointer"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recently viewed */}
          {recentlyViewed.length > 0 && (
            <div className="mt-8 mb-4">
              <h3 className="font-display text-base font-semibold">Recently Viewed</h3>
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                {recentlyViewed.map((p) => (
                  <Link
                    key={p.slug}
                    to="/shop/$slug"
                    params={{ slug: p.slug }}
                    onClick={closeCart}
                    className="w-28 shrink-0 overflow-hidden rounded-2xl border border-border/40 bg-white p-2 shadow-soft"
                  >
                    <div className="aspect-[3/4] overflow-hidden rounded-xl bg-muted">
                      <img
                        src={resolveImage(p.image)}
                        alt={p.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="mt-1 line-clamp-2 text-[10px] font-semibold">{p.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky footer summary */}
        {cart.length > 0 && (
          <div className="border-t border-border/50 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-3 shadow-[0_-8px_30px_-12px_rgba(194,24,91,0.12)]">
            <form
              className="flex gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!couponInput.trim()) return;
                setApplying(true);
                setCouponMsg(null);
                const ok = await applyCouponCode(couponInput.trim());
                setApplying(false);
                if (ok) {
                  setCouponInput("");
                  setCouponMsg({ type: "ok", text: "Coupon applied successfully" });
                } else {
                  setCouponMsg({ type: "err", text: "Invalid coupon code" });
                }
              }}
            >
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value);
                    setCouponMsg(null);
                  }}
                  placeholder="Apply coupon"
                  className="w-full rounded-full border border-border bg-[#FFF9FB] py-2.5 pl-9 pr-3 text-xs outline-none transition focus:border-primary"
                />
              </div>
              <button
                type="submit"
                disabled={applying}
                className="inline-flex min-w-[72px] items-center justify-center rounded-full border border-border px-4 text-xs font-bold uppercase tracking-wider transition hover:border-primary hover:text-primary cursor-pointer disabled:opacity-60"
              >
                {applying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
              </button>
            </form>

            {couponMsg && (
              <p
                className={`flex items-center gap-1 text-[11px] font-semibold ${
                  couponMsg.type === "ok" ? "text-emerald-600" : "text-destructive"
                }`}
              >
                {couponMsg.type === "ok" && <Check className="h-3 w-3" />}
                {couponMsg.text}
              </p>
            )}
            {appliedCoupon && (
              <button
                type="button"
                onClick={() => {
                  removeCoupon();
                  setCouponMsg(null);
                }}
                className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
              >
                Remove “{appliedCoupon.code}”
              </button>
            )}

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">PKR {cartSubtotal.toLocaleString()}</span>
              </div>
              {productDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span className="tabular-nums">− PKR {productDiscount.toLocaleString()}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Coupon discount</span>
                  <span className="tabular-nums">− PKR {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="tabular-nums">
                  {shippingCost === 0 ? "Free" : `PKR ${shippingCost.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated tax</span>
                <span className="tabular-nums">PKR {taxCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-border/40 pt-2">
                <span className="font-display text-base font-bold">Grand Total</span>
                <span className="font-display text-lg font-bold text-primary tabular-nums transition-all duration-300">
                  PKR {cartTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <Link
              to="/checkout"
              onClick={closeCart}
              className="flex w-full items-center justify-center rounded-full bg-primary py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-elegant transition hover:bg-accent"
            >
              Proceed to Checkout
            </Link>
            <button
              type="button"
              onClick={closeCart}
              className="w-full rounded-full border border-border py-3 text-xs font-semibold transition hover:border-primary hover:text-primary cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
