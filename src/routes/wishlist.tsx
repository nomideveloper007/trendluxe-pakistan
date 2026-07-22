import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fetchFavorites } from "@/lib/user-data";
import { fetchProducts } from "@/lib/ecommerce-data";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/wishlist")({
  component: WishlistPage,
});

function WishlistPage() {
  const { user, loading } = useAuth();

  const favoritesQ = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: () => (user ? fetchFavorites(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const productsQ = useQuery({
    queryKey: ["products-wishlist"],
    queryFn: () => fetchProducts(),
  });

  if (loading || favoritesQ.isLoading || productsQ.isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Loading wishlist...
          </span>
        </div>
      </div>
    );
  }

  // Load wishlist. If not logged in, we check if they have a guest wishlist?
  // Let's assume we read from the favorites query
  const wishlistedSlugs = (favoritesQ.data ?? [])
    .filter((f) => f.item_type === "product")
    .map((f) => f.item_slug);

  const wishlistedProducts = (productsQ.data ?? []).filter((p) =>
    wishlistedSlugs.includes(p.slug)
  );

  if (!user) {
    return (
      <div className="container-page py-24 text-center animate-fade-in font-body text-foreground flex flex-col items-center">
        <div className="rounded-full bg-secondary/15 p-5 text-primary shrink-0">
          <Heart className="h-8 w-8" />
        </div>
        <h2 className="mt-6 font-display text-3xl font-bold">Wishlist Account Required</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs leading-relaxed">
          Sign in to save items to your wishlist and view them across all your devices.
        </p>
        <Link
          to="/auth"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-xs font-semibold text-primary-foreground shadow-elegant hover:bg-accent transition cursor-pointer"
        >
          Sign In / Create Account
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (wishlistedProducts.length === 0) {
    return (
      <div className="container-page py-24 text-center animate-fade-in font-body text-foreground flex flex-col items-center">
        <div className="rounded-full bg-secondary/15 p-5 text-primary shrink-0">
          <Heart className="h-8 w-8" />
        </div>
        <h2 className="mt-6 font-display text-3xl font-bold">Your Wishlist is Empty</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs leading-relaxed">
          Tap the heart icon on any premium clothing item to save it here for later.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-xs font-semibold text-primary-foreground shadow-elegant hover:bg-accent transition"
        >
          Browse Collections
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10 font-body text-foreground animate-fade-in bg-background">
      <div className="mb-8 border-b border-border/40 pb-4">
        <h1 className="font-display text-3xl md:text-4xl font-bold flex items-center gap-2.5">
          <Heart className="h-7 w-7 text-primary fill-current" /> My Wishlist
        </h1>
        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1.5">
          Saved Luxury Pieces ({wishlistedProducts.length})
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {wishlistedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
