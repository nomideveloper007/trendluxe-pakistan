import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Gift } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { resolveImage } from "@/lib/content";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cart,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    discountAmount,
    shippingCost,
    taxCost,
    cartTotal,
    giftNote,
    setGiftNote,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplying(true);
    const success = await applyCouponCode(couponInput);
    if (success) {
      setCouponInput("");
    }
    setApplying(false);
  };

  if (cart.length === 0) {
    return (
      <div className="container-page py-24 text-center animate-fade-in font-body text-foreground flex flex-col items-center">
        <div className="rounded-full bg-secondary/15 p-5 text-primary shrink-0 animate-bounce">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="mt-6 font-display text-3xl font-bold">Your bag is waiting</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm leading-relaxed">
          Your shopping bag is waiting for something beautiful.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-xs font-semibold text-primary-foreground shadow-elegant hover:bg-accent transition"
        >
          Continue Shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10 font-body text-foreground animate-fade-in bg-background">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">Shopping Bag</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_350px] items-start">
        {/* CART ITEMS LIST */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-white overflow-hidden shadow-soft">
            <div className="divide-y divide-border/40">
              {cart.map((item, index) => {
                const hasDisc = item.product.compare_at_price && item.product.compare_at_price > item.product.price;
                const lineTotal = item.product.price * item.quantity;
                const itemImg = item.product.images[0] || "";

                return (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:bg-secondary/5"
                  >
                    {/* Image & Title details */}
                    <div className="flex gap-4 items-center flex-1">
                      <div className="h-20 w-16 overflow-hidden rounded-xl border border-border bg-muted shadow-soft shrink-0">
                        <img src={resolveImage(itemImg)} alt={item.product.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary">
                          {item.product.brand}
                        </span>
                        <Link
                          to="/shop/$slug"
                          params={{ slug: item.product.slug }}
                          className="block mt-0.5"
                        >
                          <h4 className="font-display font-bold text-sm text-foreground hover:text-primary transition truncate max-w-[250px]">
                            {item.product.title}
                          </h4>
                        </Link>
                        {/* Variant details */}
                        <div className="flex gap-2.5 text-[10px] text-muted-foreground mt-1 font-semibold uppercase tracking-wider">
                          <span>Size: <strong className="text-foreground">{item.size}</strong></span>
                          <span>Color: <strong className="text-foreground capitalize">{item.color}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Edit controls */}
                    <div className="flex items-center gap-6 justify-between w-full sm:w-auto sm:justify-start">
                      <div className="flex h-9 items-center rounded-full border border-border bg-secondary/10 px-1 shrink-0">
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                          className="h-7 w-7 rounded-full font-bold hover:bg-white transition flex items-center justify-center"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-bold text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                          className="h-7 w-7 rounded-full font-bold hover:bg-white transition flex items-center justify-center"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Line pricing */}
                      <div className="text-right shrink-0">
                        <p className="font-display text-sm font-bold text-foreground">
                          PKR {lineTotal.toLocaleString()}
                        </p>
                        {hasDisc && (
                          <p className="text-[10px] text-muted-foreground line-through">
                            PKR {(item.product.compare_at_price! * item.quantity).toLocaleString()}
                          </p>
                        )}
                      </div>

                      {/* Remove item button */}
                      <button
                        onClick={() => removeFromCart(item.productId, item.size, item.color)}
                        className="text-muted-foreground hover:text-destructive transition p-1.5 rounded-full hover:bg-destructive/5 cursor-pointer shrink-0"
                        title="Remove Item"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GIFT NOTE TEXTBOX */}
          <div className="rounded-3xl border border-border bg-white p-5 shadow-soft space-y-3">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
              <Gift className="h-4.5 w-4.5 text-primary" /> Gift Wrap Option (Free)
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Writing a sweet gift message? Include it here and we'll wrap it in a premium Pahraan presentation box.
            </p>
            <textarea
              placeholder="Enter your gift note card message..."
              value={giftNote}
              onChange={(e) => setGiftNote(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xs outline-none focus:border-primary transition"
            />
          </div>
        </div>

        {/* ORDER SUMMARY SIDEBAR */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-border bg-white p-5 shadow-soft space-y-4">
            <h3 className="font-display text-lg font-bold border-b border-border/40 pb-3">Summary</h3>

            {/* Coupons input form */}
            {!appliedCoupon ? (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code (PAHRAAN10)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary transition"
                />
                <Button
                  type="submit"
                  disabled={applying}
                  size="sm"
                  className="bg-primary hover:bg-accent text-white px-4 cursor-pointer text-xs"
                >
                  <Tag className="h-3.5 w-3.5 mr-1" /> Apply
                </Button>
              </form>
            ) : (
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2.5 text-xs text-emerald-800">
                <span className="flex items-center gap-1.5 font-bold uppercase">
                  <Tag className="h-4.5 w-4.5 text-emerald-600" /> {appliedCoupon.code} Applied
                </span>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-destructive hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}

            {/* Totals Breakdown */}
            <div className="space-y-2.5 text-xs text-muted-foreground pt-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">PKR {cartSubtotal.toLocaleString()}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount</span>
                  <span>- PKR {discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping Cost</span>
                <span className="font-semibold text-foreground">
                  {shippingCost === 0 ? "FREE" : `PKR ${shippingCost}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Sales Tax (5% GST)</span>
                <span className="font-semibold text-foreground">PKR {taxCost.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-base font-bold text-foreground border-t border-border/40 pt-3.5">
                <span className="font-display">Total</span>
                <span className="text-primary font-display">PKR {cartTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                onClick={() => {
                  if (!user) {
                    toast.info("Please sign in to proceed to checkout");
                    navigate({ to: "/auth", search: { redirect: "/checkout" } });
                  } else {
                    navigate({ to: "/checkout" });
                  }
                }}
                className="w-full bg-primary hover:bg-accent text-white rounded-full py-5.5 font-semibold shadow-soft hover:shadow-elegant flex items-center justify-center gap-1.5 cursor-pointer text-xs"
              >
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Button>
              <Link
                to="/shop"
                className="w-full border border-border bg-white text-foreground hover:bg-secondary/10 hover:border-primary transition rounded-full py-2.5 flex items-center justify-center font-semibold text-xs text-center cursor-pointer shadow-soft"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
