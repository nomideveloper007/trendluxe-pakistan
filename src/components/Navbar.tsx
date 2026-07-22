import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, Search, Shield, ChevronRight, Heart, ShoppingBag, ChevronDown } from "lucide-react";
import { SITE, resolveImage } from "@/lib/content";
import { useAuth } from "@/lib/auth";
import { fetchProfile, fetchFavorites } from "@/lib/user-data";
import { fetchAllTrends } from "@/lib/trends-data";
import { fetchAllPosts } from "@/lib/blog-data";
import { fetchProducts } from "@/lib/ecommerce-data";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-pahraan.png";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileShopOpen, setIsMobileShopOpen] = useState(false);
  const { session, isAdmin, user } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Load live profile info for navbar avatar and display name
  const profileQ = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => (user ? fetchProfile(user.id) : Promise.resolve(null)),
    enabled: !!user,
  });
  const profile = profileQ.data;

  // Load live wishlist info
  const favQ = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: () => (user ? fetchFavorites(user.id) : Promise.resolve([])),
    enabled: !!user,
  });
  const wishlistCount = (favQ.data ?? []).filter((f) => f.item_type === "product").length;

  return (
    <header className="sticky top-0 z-45 border-b border-border/60 bg-white/80 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2.5" aria-label={SITE.name}>
          <img src={logo} alt={`${SITE.name} logo`} className="h-12 w-auto animate-fade-in" />
          <span className="font-display text-xl font-semibold tracking-wider text-primary">
            {SITE.name}
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden items-center gap-7 md:flex h-full">
          <Link
            to="/"
            className="text-sm font-medium text-foreground/85 transition-colors hover:text-primary"
            activeProps={{ className: "text-primary font-semibold" }}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>

          {/* Mega Menu Shop Trigger */}
          <div className="group relative h-full flex items-center">
            <Link
              to="/shop"
              className="flex items-center gap-0.5 text-sm font-medium text-foreground/85 transition-colors hover:text-primary cursor-pointer py-5"
              activeProps={{ className: "text-primary font-semibold" }}
            >
              <span>Shop</span>
              <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180 text-muted-foreground group-hover:text-primary" />
            </Link>

            {/* Mega Menu Dropdown */}
            <div className="invisible absolute top-[100%] left-1/2 z-50 w-[600px] -translate-x-1/2 translate-y-3 rounded-3xl border border-border/80 bg-white/95 p-6 shadow-elegant opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 backdrop-blur-md">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <h4 className="font-display text-xs uppercase tracking-wider font-bold text-primary mb-3">
                    Categories
                  </h4>
                  <ul className="space-y-2 text-xs text-foreground/80">
                    <li>
                      <Link to="/shop" search={{ category: "lawn-suits" }} className="hover:text-primary transition font-medium">
                        Lawn Collection
                      </Link>
                    </li>
                    <li>
                      <Link to="/shop" search={{ category: "pret-wear" }} className="hover:text-primary transition font-medium">
                        Pret Wear
                      </Link>
                    </li>
                    <li>
                      <Link to="/shop" search={{ category: "casual-wear" }} className="hover:text-primary transition font-medium">
                        Casual Wear
                      </Link>
                    </li>
                    <li>
                      <Link to="/shop" search={{ category: "formal-wear" }} className="hover:text-primary transition font-medium">
                        Formal Wear
                      </Link>
                    </li>
                    <li>
                      <Link to="/shop" search={{ category: "luxury-pret" }} className="hover:text-primary transition font-medium">
                        Luxury Pret
                      </Link>
                    </li>
                    <li>
                      <Link to="/shop" search={{ category: "bridal-wear" }} className="hover:text-primary transition font-medium">
                        Bridal Collection
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-display text-xs uppercase tracking-wider font-bold text-primary mb-3">
                    Collections
                  </h4>
                  <ul className="space-y-2 text-xs text-foreground/80">
                    <li>
                      <Link to="/shop" search={{ tag: "new-arrivals" }} className="hover:text-primary transition font-medium">
                        New Arrivals
                      </Link>
                    </li>
                    <li>
                      <Link to="/shop" search={{ tag: "best-sellers" }} className="hover:text-primary transition font-medium">
                        Best Sellers
                      </Link>
                    </li>
                    <li>
                      <Link to="/shop" search={{ category: "eid-collections" }} className="hover:text-primary transition font-medium">
                        Eid Collection
                      </Link>
                    </li>
                    <li>
                      <Link to="/shop" search={{ tag: "sale" }} className="text-primary font-bold hover:text-accent transition">
                        Sale Drop %
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className="overflow-hidden rounded-2xl relative aspect-[4/3] bg-muted flex items-end p-4 shadow-soft">
                  <img
                    src={resolveImage("cat-bridal")}
                    alt="Bridal Wear"
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="relative text-white z-10">
                    <p className="font-display text-sm font-semibold leading-tight">Bridal Couture</p>
                    <Link
                      to="/shop"
                      search={{ category: "bridal-wear" }}
                      className="text-[9px] uppercase font-bold tracking-widest text-[#F8BBD0] hover:underline mt-1 block"
                    >
                      Shop Collection →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/shop"
            search={{ tag: "new-arrivals" }}
            className="text-sm font-medium text-foreground/85 transition-colors hover:text-primary"
            activeProps={{ className: "text-primary font-semibold" }}
          >
            New Arrivals
          </Link>
          <Link
            to="/about"
            className="text-sm font-medium text-foreground/85 transition-colors hover:text-primary"
            activeProps={{ className: "text-primary font-semibold" }}
          >
            About Us
          </Link>
          <Link
            to="/contact"
            className="text-sm font-medium text-foreground/85 transition-colors hover:text-primary"
            activeProps={{ className: "text-primary font-semibold" }}
          >
            Contact
          </Link>
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Live search button */}
          <button
            aria-label="Search"
            onClick={() => setIsSearchOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-full text-foreground/70 transition hover:bg-secondary/60 hover:text-primary cursor-pointer"
          >
            <Search className="h-4.5 w-4.5" />
          </button>

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            className="relative grid h-9 w-9 place-items-center rounded-full text-foreground/70 transition hover:bg-secondary/60 hover:text-primary"
            title="Wishlist"
          >
            <Heart className="h-4.5 w-4.5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white shadow-soft">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Link */}
          <Link
            to="/cart"
            className="relative grid h-9 w-9 place-items-center rounded-full text-foreground/70 transition hover:bg-secondary/60 hover:text-primary"
            title="Shopping Cart"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white shadow-soft">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Profile authentication dropdown */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border bg-white p-1 pr-3 hover:border-primary hover:shadow-soft transition outline-none cursor-pointer">
                  <div className="h-7 w-7 overflow-hidden rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-semibold text-xs text-primary shadow-soft shrink-0">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      (profile?.display_name || user?.email || "ME").slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-semibold text-foreground truncate max-w-[80px]">
                    {profile?.display_name || "Profile"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5 shadow-elegant border border-border/80 bg-white/95 backdrop-blur-md">
                <div className="px-3 py-2 text-xs border-b border-border/40 mb-1 shrink-0">
                  <p className="font-semibold text-foreground">{profile?.display_name || "Anonymous Reader"}</p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{user?.email}</p>
                </div>
                <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-xs font-medium cursor-pointer hover:bg-secondary/20 hover:text-primary focus:bg-secondary/20 focus:text-primary">
                  <Link to="/profile">My Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-xs font-medium cursor-pointer hover:bg-secondary/20 hover:text-primary focus:bg-secondary/20 focus:text-primary">
                  <Link to="/profile" hash="orders">Order History</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-xs font-medium cursor-pointer hover:bg-secondary/20 hover:text-primary focus:bg-secondary/20 focus:text-primary">
                  <Link to="/profile" hash="addresses">Saved Addresses</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild className="rounded-xl px-3 py-2 text-xs font-medium cursor-pointer hover:bg-secondary/20 hover:text-primary focus:bg-secondary/20 focus:text-primary text-primary bg-primary/5 border border-primary/10">
                    <Link to="/admin" className="flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5" /> Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-border/40 my-1" />
                <DropdownMenuItem
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.reload();
                  }}
                  className="rounded-xl px-3 py-2 text-xs font-medium cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/auth"
              className="text-sm font-semibold text-foreground/80 hover:text-primary hover:bg-secondary/25 px-4.5 py-2.5 rounded-full transition"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* MOBILE CONTROLS */}
        <div className="flex items-center gap-1 md:hidden">
          <Link
            to="/cart"
            className="relative grid h-9 w-9 place-items-center rounded-full text-foreground/80"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            className="text-foreground/80 grid h-9 w-9 place-items-center"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER MENU */}
      {open && (
        <div className="border-t border-border bg-background md:hidden animate-fade-in max-h-[85vh] overflow-y-auto">
          <nav className="container-page flex flex-col py-4 space-y-1">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="py-2.5 px-4 rounded-xl text-sm font-medium text-foreground/85 hover:bg-secondary/20 hover:text-primary"
            >
              Home
            </Link>

            {/* Collapsible Mobile Shop links */}
            <div>
              <button
                onClick={() => setIsMobileShopOpen((v) => !v)}
                className="w-full text-left py-2.5 px-4 rounded-xl text-sm font-medium text-foreground/85 hover:bg-secondary/20 hover:text-primary flex items-center justify-between cursor-pointer"
              >
                <span>Shop</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isMobileShopOpen ? "rotate-180" : ""}`} />
              </button>

              {isMobileShopOpen && (
                <div className="pl-6 pr-2 py-1 space-y-1 flex flex-col border-l border-border/80 ml-4.5 my-1">
                  <Link
                    to="/shop"
                    onClick={() => setOpen(false)}
                    className="py-2 px-3 text-xs font-semibold text-primary hover:bg-secondary/10 rounded-lg"
                  >
                    View All Shop
                  </Link>
                  <Link
                    to="/shop"
                    search={{ category: "lawn-suits" }}
                    onClick={() => setOpen(false)}
                    className="py-1.5 px-3 text-xs text-foreground/80 hover:text-primary rounded-lg"
                  >
                    Lawn Collection
                  </Link>
                  <Link
                    to="/shop"
                    search={{ category: "pret-wear" }}
                    onClick={() => setOpen(false)}
                    className="py-1.5 px-3 text-xs text-foreground/80 hover:text-primary rounded-lg"
                  >
                    Pret Wear
                  </Link>
                  <Link
                    to="/shop"
                    search={{ category: "casual-wear" }}
                    onClick={() => setOpen(false)}
                    className="py-1.5 px-3 text-xs text-foreground/80 hover:text-primary rounded-lg"
                  >
                    Casual Wear
                  </Link>
                  <Link
                    to="/shop"
                    search={{ category: "formal-wear" }}
                    onClick={() => setOpen(false)}
                    className="py-1.5 px-3 text-xs text-foreground/80 hover:text-primary rounded-lg"
                  >
                    Formal Wear
                  </Link>
                  <Link
                    to="/shop"
                    search={{ category: "luxury-pret" }}
                    onClick={() => setOpen(false)}
                    className="py-1.5 px-3 text-xs text-foreground/80 hover:text-primary rounded-lg"
                  >
                    Luxury Pret
                  </Link>
                  <Link
                    to="/shop"
                    search={{ category: "bridal-wear" }}
                    onClick={() => setOpen(false)}
                    className="py-1.5 px-3 text-xs text-foreground/80 hover:text-primary rounded-lg"
                  >
                    Bridal Wear
                  </Link>
                  <Link
                    to="/shop"
                    search={{ tag: "sale" }}
                    onClick={() => setOpen(false)}
                    className="py-1.5 px-3 text-xs font-bold text-primary hover:text-accent rounded-lg"
                  >
                    Sale Drop
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/shop"
              search={{ tag: "new-arrivals" }}
              onClick={() => setOpen(false)}
              className="py-2.5 px-4 rounded-xl text-sm font-medium text-foreground/85 hover:bg-secondary/20 hover:text-primary"
            >
              New Arrivals
            </Link>
            <Link
              to="/about"
              onClick={() => setOpen(false)}
              className="py-2.5 px-4 rounded-xl text-sm font-medium text-foreground/85 hover:bg-secondary/20 hover:text-primary"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="py-2.5 px-4 rounded-xl text-sm font-medium text-foreground/85 hover:bg-secondary/20 hover:text-primary"
            >
              Contact
            </Link>

            <button
              onClick={() => {
                setOpen(false);
                setIsSearchOpen(true);
              }}
              className="w-full text-left py-2.5 px-4 rounded-xl text-sm font-medium text-foreground/85 hover:bg-secondary/20 hover:text-primary flex items-center gap-2 cursor-pointer"
            >
              <Search className="h-4 w-4" /> Search Shop & Styles
            </button>

            <Link
              to="/wishlist"
              onClick={() => setOpen(false)}
              className="py-2.5 px-4 rounded-xl text-sm font-medium text-foreground/85 hover:bg-secondary/20 hover:text-primary flex items-center gap-2"
            >
              <Heart className="h-4 w-4" /> Wishlist ({wishlistCount})
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="py-2.5 px-4 rounded-xl text-sm font-semibold text-primary hover:bg-secondary/20 flex items-center gap-1.5"
              >
                <Shield className="h-4 w-4" /> Admin Dashboard
              </Link>
            )}

            <Link
              to={session ? "/profile" : "/auth"}
              onClick={() => setOpen(false)}
              className="py-2.5 px-4 rounded-xl text-sm font-medium text-primary hover:bg-secondary/20"
            >
              {session ? "My Account" : "Sign in"}
            </Link>
          </nav>
        </div>
      )}

      {/* Fuzzy search modal */}
      <SearchModal open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}

function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { type: "product"; title: string; slug: string; image: string; category: string }[]
  >([]);

  const { data: products = [] } = useQuery({
    queryKey: ["products", "search-index"],
    queryFn: () => fetchProducts(),
    enabled: open,
  });

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      return;
    }
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase().trim();

    const filteredProducts = products
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.fabric?.toLowerCase().includes(q)
      )
      .map((p) => ({
        type: "product" as const,
        title: p.title,
        slug: p.slug,
        image: resolveImage(p.images[0] || ""),
        category: p.category,
      }));

    setResults(filteredProducts.slice(0, 6));
  }, [query, products]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-md p-4 pt-[10vh] animate-fade-in"
    >
      <div
        className="w-full max-w-2xl rounded-3xl border border-border/60 bg-white/95 p-6 shadow-elegant animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border/80 pb-4">
          <Search className="h-5 w-5 text-primary shrink-0" />
          <input
            type="text"
            placeholder="Search Pahraan collections, lawn kurtas, chiffon, bridal gold..."
            className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground outline-none font-medium"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={onClose}
            className="rounded-full bg-secondary/40 p-1.5 text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1 space-y-2.5">
          {results.map((res, i) => {
            const linkTo = `/shop/${res.slug}`;

            return (
              <Link
                key={i}
                to={linkTo}
                onClick={onClose}
                className="flex gap-4 items-center p-3 rounded-2xl hover:bg-secondary/15 transition border border-transparent hover:border-primary/10"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border/40 bg-muted">
                  <img src={res.image} alt={res.title} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 rounded-md uppercase font-semibold border-primary/20 bg-primary/5 text-primary shrink-0">
                      {res.type}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider truncate">
                      {res.category.replace("-", " ")}
                    </span>
                  </div>
                  <div className="font-semibold text-foreground text-sm truncate mt-0.5">{res.title}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            );
          })}

          {query.trim() && results.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground italic">
              No matching products found.
            </div>
          )}

          {!query.trim() && (
            <div className="py-8 text-center text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Start typing to search products, lawn suits, and couture...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
