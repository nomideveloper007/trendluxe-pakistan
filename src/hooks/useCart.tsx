import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { type Product, type Coupon, verifyCoupon } from "@/lib/ecommerce-data";

export type CartItem = {
  productId: string;
  product: Product;
  size: string;
  color: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  appliedCoupon: Coupon | null;
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  discountAmount: number;
  shippingCost: number;
  taxCost: number;
  cartTotal: number;
  giftNote: string;
  setGiftNote: (note: string) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [giftNote, setGiftNote] = useState<string>("");

  // Load cart from LocalStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("pahraan_cart");
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
      const storedNote = localStorage.getItem("pahraan_cart_gift_note");
      if (storedNote) {
        setGiftNote(storedNote);
      }
      const storedCoupon = localStorage.getItem("pahraan_cart_coupon");
      if (storedCoupon) {
        setAppliedCoupon(JSON.parse(storedCoupon));
      }
    } catch (e) {
      console.error("Failed to load cart from storage", e);
    }
  }, []);

  // Sync cart to LocalStorage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("pahraan_cart", JSON.stringify(newCart));
  };

  const addToCart = (product: Product, size: string, color: string, quantity: number = 1) => {
    if (!size) {
      toast.error("Please select a size");
      return;
    }
    if (!color) {
      toast.error("Please select a color");
      return;
    }

    const newCart = [...cart];
    const existingIndex = newCart.findIndex(
      (item) => item.productId === product.id && item.size === size && item.color === color
    );

    if (existingIndex > -1) {
      newCart[existingIndex].quantity += quantity;
    } else {
      newCart.push({
        productId: product.id,
        product,
        size,
        color,
        quantity,
      });
    }

    saveCart(newCart);
    toast.success(`${product.title} (${size} / ${color}) added to cart!`);
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    const newCart = cart.filter(
      (item) => !(item.productId === productId && item.size === size && item.color === color)
    );
    saveCart(newCart);
    toast.info("Item removed from cart");
  };

  const updateQuantity = (productId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    const newCart = cart.map((item) => {
      if (item.productId === productId && item.size === size && item.color === color) {
        return { ...item, quantity };
      }
      return item;
    });
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
    setAppliedCoupon(null);
    setGiftNote("");
    localStorage.removeItem("pahraan_cart_coupon");
    localStorage.removeItem("pahraan_cart_gift_note");
  };

  const saveGiftNote = (note: string) => {
    setGiftNote(note);
    localStorage.setItem("pahraan_cart_gift_note", note);
  };

  // Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === "percentage") {
      discountAmount = (cartSubtotal * appliedCoupon.discount_value) / 100;
    } else if (appliedCoupon.discount_type === "fixed") {
      discountAmount = appliedCoupon.discount_value;
    }
    // Limit discount to subtotal
    discountAmount = Math.min(discountAmount, cartSubtotal);
  }

  // Shipping (PKR 250 flat rate, free over PKR 5000 or if coupon is free shipping)
  const isFreeShipping =
    cartSubtotal > 5000 || (appliedCoupon && appliedCoupon.discount_type === "free_shipping");
  const shippingCost = cart.length === 0 || isFreeShipping ? 0 : 250;

  // Tax (5% GST)
  const taxRate = 0.05;
  const taxCost = Math.round((cartSubtotal - discountAmount) * taxRate);

  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost + taxCost);

  const applyCouponCode = async (code: string): Promise<boolean> => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return false;
    }
    try {
      const coupon = await verifyCoupon(code, cartSubtotal);
      setAppliedCoupon(coupon);
      localStorage.setItem("pahraan_cart_coupon", JSON.stringify(coupon));
      toast.success(`Coupon "${coupon.code}" applied successfully!`);
      return true;
    } catch (e: any) {
      toast.error(e.message || "Failed to apply coupon");
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem("pahraan_cart_coupon");
    toast.info("Coupon removed");
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartSubtotal,
        appliedCoupon,
        applyCouponCode,
        removeCoupon,
        discountAmount,
        shippingCost,
        taxCost,
        cartTotal,
        giftNote,
        setGiftNote: saveGiftNote,
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
