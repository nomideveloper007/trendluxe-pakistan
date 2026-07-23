import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Home, LayoutGrid, Search, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";

type Props = {
  onSearch: () => void;
};

export function MobileBottomNav({ onSearch }: Props) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { cart, openCart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (pathname.startsWith("/admin") || pathname.startsWith("/checkout")) return null;

  const itemClass = (active: boolean) =>
    `flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-semibold tracking-wide transition ${
      active ? "text-primary" : "text-muted-foreground"
    }`;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-white/95 backdrop-blur-xl md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch">
        <Link to="/" className={itemClass(pathname === "/")}>
          <Home className="h-5 w-5" />
          Home
        </Link>
        <Link to="/shop" className={itemClass(pathname.startsWith("/shop"))}>
          <LayoutGrid className="h-5 w-5" />
          Categories
        </Link>
        <button type="button" onClick={onSearch} className={itemClass(false)}>
          <Search className="h-5 w-5" />
          Search
        </button>
        <Link to="/wishlist" className={itemClass(pathname.startsWith("/wishlist"))}>
          <Heart className="h-5 w-5" />
          Wishlist
        </Link>
        <button type="button" onClick={openCart} className={`${itemClass(false)} relative`}>
          <span className="relative">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </span>
          Cart
        </button>
      </div>
    </nav>
  );
}
