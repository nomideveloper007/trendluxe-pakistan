import { Link } from "@tanstack/react-router";
import { Heart, Share2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/ecommerce-data";
import { useCart } from "@/hooks/useCart";
import { removeFavorite } from "@/lib/user-data";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Props = {
  products: Product[];
  loading?: boolean;
  userId?: string;
};

export function AccountWishlist({ products, loading, userId }: Props) {
  const { addToCart } = useCart();
  const qc = useQueryClient();

  const removeMut = useMutation({
    mutationFn: async (slug: string) => {
      if (!userId) return;
      await removeFavorite(userId, "product", slug);
    },
    onSuccess: () => {
      toast.success("Removed from wishlist");
      qc.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const moveAllToCart = () => {
    let added = 0;
    for (const product of products) {
      if (product.stock_status === "out_of_stock") continue;
      const size = product.sizes[0] || "M";
      const color = product.colors[0] || "Default";
      addToCart(product, size, color, 1);
      added += 1;
    }
    toast.success(added ? `${added} item${added === 1 ? "" : "s"} added to cart` : "No available items");
  };

  const shareWishlist = async () => {
    const url = `${window.location.origin}/wishlist`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "My Pahraan Wishlist", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Wishlist link copied");
      }
    } catch {
      toast.message("Share cancelled");
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Wishlist</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {products.length} saved piece{products.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={shareWishlist}
            className="rounded-full text-xs font-semibold cursor-pointer"
          >
            <Share2 className="mr-1.5 h-3.5 w-3.5" /> Share Wishlist
          </Button>
          {products.length > 0 && (
            <Button
              onClick={moveAllToCart}
              className="rounded-full bg-primary text-xs font-semibold text-white hover:bg-accent cursor-pointer"
            >
              <ShoppingBag className="mr-1.5 h-3.5 w-3.5" /> Move all to Cart
            </Button>
          )}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-white p-10 text-center shadow-soft">
          <Heart className="mx-auto h-8 w-8 text-primary/60" />
          <h3 className="mt-4 font-display text-xl font-bold">Your wishlist is empty</h3>
          <p className="mx-auto mt-2 max-w-sm text-xs text-muted-foreground">
            Tap the heart on any piece to save it here.
          </p>
          <Link
            to="/shop"
            className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-soft hover:bg-accent"
          >
            Browse Shop
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <div key={product.id} className="group relative">
              <ProductCard product={product} />
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    const size = product.sizes[0] || "M";
                    const color = product.colors[0] || "Default";
                    addToCart(product, size, color, 1);
                    toast.success("Moved to cart");
                  }}
                  className="flex-1 rounded-full bg-primary text-[10px] font-bold text-white hover:bg-accent cursor-pointer"
                >
                  Move to Cart
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeMut.mutate(product.slug)}
                  className="rounded-full text-[10px] font-bold cursor-pointer"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
