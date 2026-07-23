import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { type Coupon, type Product, verifyCoupon } from "@/lib/ecommerce-data";
import { useAuth } from "@/lib/auth";
import { fetchUserCart, upsertUserCart } from "@/lib/user-data";

export type CartItem = {
  productId: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  savedForLater: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  moveToSaved: (productId: string, size: string, color: string) => void;
  moveSavedToCart: (productId: string, size: string, color: string) => void;
  removeSaved: (productId: string, size: string, color: string) => void;
  cartSubtotal: number;
  productDiscount: number;
  appliedCoupon: Coupon | null;
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  discountAmount: number;
  shippingCost: number;
  taxCost: number;
  cartTotal: number;
  itemCount: number;
  giftNote: string;
  setGiftNote: (note: string) => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "pahraan_cart";
const SAVED_KEY = "pahraan_cart_saved";
const COUPON_KEY = "pahraan_cart_coupon";
const NOTE_KEY = "pahraan_cart_gift_note";

function itemKey(productId: string, size: string, color: string) {
  return `${productId}::${size}::${color}`;
}

function isValidCartItem(item: unknown): item is CartItem {
  if (!item || typeof item !== "object") return false;
  const i = item as CartItem;
  return (
    typeof i.productId === "string" &&
    typeof i.size === "string" &&
    typeof i.color === "string" &&
    typeof i.quantity === "number" &&
    i.quantity > 0 &&
    !!i.product &&
    typeof i.product === "object"
  );
}

/** Merge guest + remote carts without duplicate variants (sums quantities). */
function mergeCartItems(local: CartItem[], remote: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of [...remote, ...local]) {
    if (!isValidCartItem(item)) continue;
    const key = itemKey(item.productId, item.size, item.color);
    const existing = map.get(key);
    if (existing) {
      map.set(key, {
        ...existing,
        quantity: existing.quantity + item.quantity,
        product: item.product ?? existing.product,
      });
    } else {
      map.set(key, item);
    }
  }
  return Array.from(map.values());
}

function readLocalCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidCartItem) : [];
  } catch {
    return [];
  }
}

function readLocalSaved(): CartItem[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isValidCartItem) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedForLater, setSavedForLater] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [giftNote, setGiftNote] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedUser = useRef<string | null>(null);

  // Hydrate from localStorage (guests + first paint)
  useEffect(() => {
    try {
      setCart(readLocalCart());
      setSavedForLater(readLocalSaved());
      const storedNote = localStorage.getItem(NOTE_KEY);
      if (storedNote) setGiftNote(storedNote);
      const storedCoupon = localStorage.getItem(COUPON_KEY);
      if (storedCoupon) setAppliedCoupon(JSON.parse(storedCoupon));
    } catch (e) {
      console.error("Failed to load cart from storage", e);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Merge remote cart after login; keep writing localStorage always
  useEffect(() => {
    if (!hydrated) return;

    if (!user?.id) {
      lastSyncedUser.current = null;
      return;
    }

    if (lastSyncedUser.current === user.id) return;
    lastSyncedUser.current = user.id;

    let cancelled = false;
    (async () => {
      const remote = await fetchUserCart(user.id);
      if (cancelled) return;

      const localCart = readLocalCart();
      const localSaved = readLocalSaved();

      if (!remote) {
        // First login or table not ready — push local snapshot up
        void upsertUserCart(user.id, {
          cart_items: localCart,
          saved_items: localSaved,
          coupon_code: appliedCoupon?.code ?? null,
          gift_note: giftNote,
        });
        return;
      }

      const remoteCart = (remote.cart_items as CartItem[]).filter(isValidCartItem);
      const remoteSaved = (remote.saved_items as CartItem[]).filter(isValidCartItem);
      const mergedCart = mergeCartItems(localCart, remoteCart);
      const mergedSaved = mergeCartItems(localSaved, remoteSaved);

      setCart(mergedCart);
      setSavedForLater(mergedSaved);
      localStorage.setItem(CART_KEY, JSON.stringify(mergedCart));
      localStorage.setItem(SAVED_KEY, JSON.stringify(mergedSaved));

      if (remote.gift_note && !giftNote) {
        setGiftNote(remote.gift_note);
        localStorage.setItem(NOTE_KEY, remote.gift_note);
      }

      void upsertUserCart(user.id, {
        cart_items: mergedCart,
        saved_items: mergedSaved,
        coupon_code: appliedCoupon?.code ?? null,
        gift_note: giftNote || remote.gift_note || "",
      });

      if (mergedCart.length > localCart.length) {
        toast.success("Your bag was restored across devices");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync once per user session
  }, [user?.id, hydrated]);

  // Debounced remote sync while logged in
  useEffect(() => {
    if (!hydrated || !user?.id) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      void upsertUserCart(user.id, {
        cart_items: cart,
        saved_items: savedForLater,
        coupon_code: appliedCoupon?.code ?? null,
        gift_note: giftNote,
      });
    }, 600);
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [cart, savedForLater, appliedCoupon, giftNote, user?.id, hydrated]);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem(CART_KEY, JSON.stringify(newCart));
  };

  const saveSaved = (items: CartItem[]) => {
    setSavedForLater(items);
    localStorage.setItem(SAVED_KEY, JSON.stringify(items));
  };

  const addToCart = (product: Product, size: string, color: string, quantity: number = 1) => {
    const resolvedSize = size || product.sizes?.[0] || "";
    const resolvedColor = color || product.colors?.[0] || "";

    if (!resolvedSize) {
      toast.error("Please select a size");
      return;
    }
    if (!resolvedColor) {
      toast.error("Please select a color");
      return;
    }

    const newCart = [...cart];
    const existingIndex = newCart.findIndex(
      (item) =>
        itemKey(item.productId, item.size, item.color) ===
        itemKey(product.id, resolvedSize, resolvedColor),
    );

    if (existingIndex > -1) {
      newCart[existingIndex] = {
        ...newCart[existingIndex],
        quantity: newCart[existingIndex].quantity + quantity,
        product,
      };
    } else {
      newCart.push({
        productId: product.id,
        product,
        size: resolvedSize,
        color: resolvedColor,
        quantity,
      });
    }

    saveSaved(
      savedForLater.filter(
        (s) =>
          itemKey(s.productId, s.size, s.color) !==
          itemKey(product.id, resolvedSize, resolvedColor),
      ),
    );

    saveCart(newCart);
    toast.success(`${product.title} added to bag`);
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    saveCart(
      cart.filter(
        (item) =>
          itemKey(item.productId, item.size, item.color) !== itemKey(productId, size, color),
      ),
    );
    toast.info("Item removed");
  };

  const updateQuantity = (productId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    saveCart(
      cart.map((item) =>
        itemKey(item.productId, item.size, item.color) === itemKey(productId, size, color)
          ? { ...item, quantity }
          : item,
      ),
    );
  };

  const clearCart = () => {
    saveCart([]);
    setAppliedCoupon(null);
    setGiftNote("");
    localStorage.removeItem(COUPON_KEY);
    localStorage.removeItem(NOTE_KEY);
  };

  const moveToSaved = (productId: string, size: string, color: string) => {
    const item = cart.find(
      (i) => itemKey(i.productId, i.size, i.color) === itemKey(productId, size, color),
    );
    if (!item) return;
    const without = cart.filter(
      (i) => itemKey(i.productId, i.size, i.color) !== itemKey(productId, size, color),
    );
    saveCart(without);
    const exists = savedForLater.some(
      (s) => itemKey(s.productId, s.size, s.color) === itemKey(productId, size, color),
    );
    if (exists) {
      saveSaved(
        savedForLater.map((s) =>
          itemKey(s.productId, s.size, s.color) === itemKey(productId, size, color)
            ? { ...s, quantity: s.quantity + item.quantity }
            : s,
        ),
      );
    } else {
      saveSaved([...savedForLater, item]);
    }
    toast.success("Saved for later");
  };

  const moveSavedToCart = (productId: string, size: string, color: string) => {
    const item = savedForLater.find(
      (i) => itemKey(i.productId, i.size, i.color) === itemKey(productId, size, color),
    );
    if (!item) return;
    saveSaved(
      savedForLater.filter(
        (i) => itemKey(i.productId, i.size, i.color) !== itemKey(productId, size, color),
      ),
    );
    addToCart(item.product, item.size, item.color, item.quantity);
  };

  const removeSaved = (productId: string, size: string, color: string) => {
    saveSaved(
      savedForLater.filter(
        (i) => itemKey(i.productId, i.size, i.color) !== itemKey(productId, size, color),
      ),
    );
  };

  const saveGiftNote = (note: string) => {
    setGiftNote(note);
    localStorage.setItem(NOTE_KEY, note);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const productDiscount = cart.reduce((sum, item) => {
    const compare = item.product.compare_at_price;
    if (compare && compare > item.product.price) {
      return sum + (compare - item.product.price) * item.quantity;
    }
    return sum;
  }, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === "percentage") {
      discountAmount = (cartSubtotal * appliedCoupon.discount_value) / 100;
    } else if (appliedCoupon.discount_type === "fixed") {
      discountAmount = appliedCoupon.discount_value;
    }
    discountAmount = Math.min(discountAmount, cartSubtotal);
  }

  const isFreeShipping =
    cartSubtotal >= 5000 || (appliedCoupon && appliedCoupon.discount_type === "free_shipping");
  const shippingCost = cart.length === 0 || isFreeShipping ? 0 : 250;
  const taxCost = Math.round((cartSubtotal - discountAmount) * 0.05);
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost + taxCost);

  const applyCouponCode = async (code: string): Promise<boolean> => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return false;
    }
    try {
      const coupon = await verifyCoupon(code, cartSubtotal);
      setAppliedCoupon(coupon);
      localStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
      toast.success(`Coupon “${coupon.code}” applied`);
      return true;
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Invalid coupon");
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem(COUPON_KEY);
    toast.info("Coupon removed");
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        savedForLater,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        moveToSaved,
        moveSavedToCart,
        removeSaved,
        cartSubtotal,
        productDiscount,
        appliedCoupon,
        applyCouponCode,
        removeCoupon,
        discountAmount,
        shippingCost,
        taxCost,
        cartTotal,
        itemCount,
        giftNote,
        setGiftNote: saveGiftNote,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
