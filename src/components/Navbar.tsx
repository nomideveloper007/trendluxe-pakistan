import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  Shield,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { SITE, resolveImage } from "@/lib/content";
import { useAuth } from "@/lib/auth";
import { fetchProfile, fetchFavorites } from "@/lib/user-data";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-pahraan.png";
import { SearchModal } from "@/components/SearchModal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const CENTER_LINKS = [
  { label: "Home", to: "/" as const, exact: true },
  { label: "Shop", to: "/shop" as const },
  { label: "New Arrivals", to: "/shop" as const, search: { tag: "new-arrivals" } },
  { label: "Collections", to: "/shop" as const, search: { tag: "featured" } },
  { label: "Sale", to: "/shop" as const, search: { tag: "sale" } },
  { label: "Blog", to: "/blog" as const },
  { label: "About", to: "/about" as const },
  { label: "Contact", to: "/contact" as const },
];

type NavbarProps = {
  searchOpen: boolean;
  onSearchOpenChange: (open: boolean) => void;
};

export function Navbar({ searchOpen, onSearchOpenChange }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileShopOpen, setIsMobileShopOpen] = useState(false);
  const { session, isAdmin, user } = useAuth();
  const { cart, openCart } = useCart();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const profileQ = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => (user ? fetchProfile(user.id) : Promise.resolve(null)),
    enabled: !!user,
  });
  const profile = profileQ.data;

  const favQ = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: () => (user ? fetchFavorites(user.id) : Promise.resolve([])),
    enabled: !!user,
  });
  const wishlistCount = (favQ.data ?? []).filter((f) => f.item_type === "product").length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-45 transition-all duration-500 ${
        scrolled || open
          ? "border-b border-border/60 bg-white/95 shadow-soft backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container-page grid h-16 grid-cols-[auto_1fr_auto] items-center gap-4 lg:h-[4.25rem]">
        <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label={SITE.name}>
          <img src={logo} alt={`${SITE.name} logo`} className="h-11 w-auto lg:h-12" />
          <span className="font-display text-xl font-semibold tracking-wider text-primary hidden sm:inline">
            {SITE.name}
          </span>
        </Link>

        <nav className="hidden xl:flex items-center justify-center gap-6 h-full">
          {CENTER_LINKS.map((link) =>
            link.label === "Shop" ? (
              <div key={link.label} className="group relative h-full flex items-center">
                <Link
                  to="/shop"
                  className="nav-link nav-link-underline gap-0.5 py-5"
                  activeProps={{ className: "text-primary font-semibold", "data-status": "active" }}
                >
                  Shop
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-300 group-hover:rotate-180 group-hover:text-primary" />
                </Link>
                <div className="invisible absolute top-full left-1/2 z-50 w-[580px] -translate-x-1/2 translate-y-3 rounded-3xl border border-border/80 bg-white/95 p-6 shadow-elegant opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 backdrop-blur-md">
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-display text-xs uppercase tracking-wider font-bold text-primary mb-3">
                        Categories
                      </h4>
                      <ul className="space-y-2 text-xs text-foreground/80">
                        {[
                          ["lawn-suits", "Lawn Collection"],
                          ["pret-wear", "Pret Wear"],
                          ["casual-wear", "Casual Wear"],
                          ["formal-wear", "Formal Wear"],
                          ["luxury-pret", "Luxury Pret"],
                          ["bridal-wear", "Bridal Collection"],
                        ].map(([cat, label]) => (
                          <li key={cat}>
                            <Link
                              to="/shop"
                              search={{ category: cat }}
                              className="hover:text-primary transition font-medium"
                            >
                              {label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-display text-xs uppercase tracking-wider font-bold text-primary mb-3">
                        Collections
                      </h4>
                      <ul className="space-y-2 text-xs text-foreground/80">
                        <li>
                          <Link
                            to="/shop"
                            search={{ tag: "new-arrivals" }}
                            className="hover:text-primary transition font-medium"
                          >
                            New Arrivals
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/shop"
                            search={{ tag: "best-sellers" }}
                            className="hover:text-primary transition font-medium"
                          >
                            Best Sellers
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/shop"
                            search={{ category: "eid-collections" }}
                            className="hover:text-primary transition font-medium"
                          >
                            Eid Collection
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/shop"
                            search={{ tag: "sale" }}
                            className="text-primary font-bold hover:text-accent transition"
                          >
                            Sale
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted flex items-end p-4 shadow-soft">
                      <img
                        src={resolveImage("cat-bridal")}
                        alt="Bridal Wear"
                        className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="relative z-10 text-white">
                        <p className="font-display text-sm font-semibold">Bridal Couture</p>
                        <Link
                          to="/shop"
                          search={{ category: "bridal-wear" }}
                          className="mt-1 block text-[9px] uppercase font-bold tracking-widest text-[#F8BBD0] hover:underline"
                        >
                          Shop Collection →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.label}
                to={link.to}
                search={"search" in link ? link.search : undefined}
                className="nav-link nav-link-underline"
                activeProps={{ className: "text-primary font-semibold", "data-status": "active" }}
                activeOptions={link.exact ? { exact: true } : undefined}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          <button
            type="button"
            aria-label="Search"
            onClick={() => onSearchOpenChange(true)}
            className="grid h-9 w-9 place-items-center rounded-full text-foreground/70 transition hover:bg-secondary/60 hover:text-primary cursor-pointer"
          >
            <Search className="h-4.5 w-4.5" />
          </button>

          <Link
            to="/wishlist"
            className="relative hidden sm:grid h-9 w-9 place-items-center rounded-full text-foreground/70 transition hover:bg-secondary/60 hover:text-primary"
            title="Wishlist"
          >
            <Heart className="h-4.5 w-4.5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="hidden md:flex items-center gap-2 rounded-full border border-border bg-white/90 p-1 pr-3 hover:border-primary hover:shadow-soft transition outline-none cursor-pointer"
                >
                  <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary shrink-0">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      (profile?.display_name || user?.email || "ME").slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-semibold text-foreground truncate max-w-[72px]">
                    {profile?.display_name || "Account"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52 rounded-2xl p-1.5 shadow-elegant border border-border/80 bg-white/95 backdrop-blur-md"
              >
                <div className="px-3 py-2 text-xs border-b border-border/40 mb-1">
                  <p className="font-semibold text-foreground">
                    {profile?.display_name || "Account"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user?.email}</p>
                </div>
                <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-xs font-medium cursor-pointer">
                  <Link to="/profile" search={{ tab: "home" }}>My Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-xs font-medium cursor-pointer">
                  <Link to="/profile" search={{ tab: "orders" }}>Orders</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-xs font-medium cursor-pointer text-primary">
                    <Link to="/admin" className="flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5" /> Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-border/40 my-1" />
                <DropdownMenuItem
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.reload();
                  }}
                  className="rounded-xl px-3 py-2 text-xs font-medium cursor-pointer text-destructive"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/auth"
              search={{ redirect: undefined }}
              className="hidden md:grid h-9 w-9 place-items-center rounded-full text-foreground/70 hover:bg-secondary/60 hover:text-primary transition"
              title="Account"
            >
              <User className="h-4.5 w-4.5" />
            </Link>
          )}

          <button
            type="button"
            onClick={openCart}
            className="relative grid h-9 w-9 place-items-center rounded-full text-foreground/70 transition hover:bg-secondary/60 hover:text-primary cursor-pointer"
            title="Shopping Cart"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className="grid h-9 w-9 place-items-center text-foreground/80 xl:hidden cursor-pointer"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-white/98 xl:hidden animate-fade-in max-h-[80vh] overflow-y-auto">
          <nav className="container-page flex flex-col py-4 space-y-1 pb-24">
            {CENTER_LINKS.filter((l) => l.label !== "Shop").map((link) => (
              <Link
                key={link.label}
                to={link.to}
                search={"search" in link ? link.search : undefined}
                onClick={() => setOpen(false)}
                className="py-2.5 px-4 rounded-xl text-sm font-medium text-foreground/85 hover:bg-secondary/20 hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            <div>
              <button
                type="button"
                onClick={() => setIsMobileShopOpen((v) => !v)}
                className="w-full text-left py-2.5 px-4 rounded-xl text-sm font-medium text-foreground/85 hover:bg-secondary/20 hover:text-primary flex items-center justify-between cursor-pointer"
              >
                <span>Shop</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isMobileShopOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isMobileShopOpen && (
                <div className="pl-6 pr-2 py-1 space-y-1 flex flex-col border-l border-border/80 ml-4 my-1">
                  <Link
                    to="/shop"
                    onClick={() => setOpen(false)}
                    className="py-2 px-3 text-xs font-semibold text-primary"
                  >
                    View All
                  </Link>
                  {[
                    ["lawn-suits", "Lawn Collection"],
                    ["luxury-pret", "Luxury Pret"],
                    ["casual-wear", "Casual Wear"],
                    ["party-wear", "Party Wear"],
                    ["formal-wear", "Formal Wear"],
                    ["bridal-wear", "Bridal Collection"],
                  ].map(([cat, label]) => (
                    <Link
                      key={cat}
                      to="/shop"
                      search={{ category: cat }}
                      onClick={() => setOpen(false)}
                      className="py-1.5 px-3 text-xs text-foreground/80 hover:text-primary"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              to={session ? "/profile" : "/auth"}
              search={session ? { tab: "home" } : { redirect: undefined }}
              onClick={() => setOpen(false)}
              className="py-2.5 px-4 rounded-xl text-sm font-medium text-primary hover:bg-secondary/20"
            >
              {session ? "My Account" : "Sign in"}
            </Link>
          </nav>
        </div>
      )}

      <SearchModal open={searchOpen} onClose={() => onSearchOpenChange(false)} />
    </header>
  );
}
