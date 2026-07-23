import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Check,
  Feather,
  GitCompareArrows,
  Hand,
  Heart,
  Image as ImageIcon,
  Maximize2,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Scissors,
  Send,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  ThumbsUp,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  addProductReview,
  fetchProductBySlug,
  fetchProductReviews,
  fetchProducts,
  type Product,
} from "@/lib/ecommerce-data";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/lib/auth";
import { addFavorite, isFavorite, removeFavorite } from "@/lib/user-data";
import { ProductCard } from "@/components/ProductCard";
import { resolveImage } from "@/lib/content";

export const Route = createFileRoute("/shop_/$slug")({
  loader: async ({ params }) => ({ slug: params.slug }),
  component: ProductDetailPage,
});

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

type RecentItem = {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  brand: string;
};

function colorSwatch(color: string) {
  const c = color.toLowerCase();
  if (c === "white") return "#ffffff";
  if (c === "black") return "#111111";
  if (c === "red") return "#C2185B";
  if (c === "beige") return "#f5f5dc";
  if (c === "pink") return "#ffc0cb";
  if (c === "maroon") return "#800000";
  if (c === "gold") return "#d4af37";
  if (c === "teal") return "#008080";
  if (c === "blue") return "#3b82f6";
  if (c === "green") return "#16a34a";
  if (c === "lilac" || c === "lavender") return "#c8a2c8";
  return color;
}

function collectionLabel(category: string) {
  return `${category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")} Collection`;
}

function SizeGuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const rows = [
    ["XS", "32", "26", "35"],
    ["S", "34", "28", "37"],
    ["M", "36", "30", "39"],
    ["L", "39", "33", "42"],
    ["XL", "42", "36", "45"],
    ["XXL", "45", "39", "48"],
  ];
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-[20px] border border-[#F8BBD0]/40 bg-white shadow-elegant animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <h3 className="font-display text-xl font-semibold">Size Guide</h3>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-secondary/40 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">
          <p className="mb-4 text-xs text-muted-foreground">
            Measurements in inches. Choose the size closest to your body measurements for the best
            Pakistani boutique fit.
          </p>
          <div className="overflow-hidden rounded-2xl border border-border/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFF5F8] text-[10px] uppercase tracking-wider text-primary">
                <tr>
                  <th className="px-3 py-2.5 font-bold">Size</th>
                  <th className="px-3 py-2.5 font-bold">Chest</th>
                  <th className="px-3 py-2.5 font-bold">Waist</th>
                  <th className="px-3 py-2.5 font-bold">Hips</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row[0]} className="border-t border-border/40">
                    {row.map((cell) => (
                      <td key={cell} className="px-3 py-2.5 font-medium text-foreground">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Lightbox({
  images,
  index,
  onClose,
  onChange,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onChange: (i: number) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-black/90 animate-fade-in"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </button>
      <div
        className="flex flex-1 items-center justify-center p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={resolveImage(images[index])}
          alt=""
          className="max-h-[85vh] max-w-full object-contain rounded-2xl"
        />
      </div>
      <div className="flex justify-center gap-2 pb-6" onClick={(e) => e.stopPropagation()}>
        {images.map((img, i) => (
          <button
            key={img + i}
            type="button"
            onClick={() => onChange(i)}
            className={`h-14 w-12 overflow-hidden rounded-lg border-2 cursor-pointer ${
              i === index ? "border-primary" : "border-transparent opacity-70"
            }`}
          >
            <img src={resolveImage(img)} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductDetailPage() {
  const { slug } = Route.useLoaderData();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const productQ = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
  });
  const product = productQ.data;

  const reviewsQ = useQuery({
    queryKey: ["reviews", product?.id],
    queryFn: () => (product ? fetchProductReviews(product.id) : Promise.resolve([])),
    enabled: !!product,
  });
  const reviews = useMemo(() => reviewsQ.data ?? [], [reviewsQ.data]);

  const recommendationsQ = useQuery({
    queryKey: ["products-recommendations", product?.category],
    queryFn: () => fetchProducts({ category: product?.category }),
    enabled: !!product,
  });

  const allProductsQ = useQuery({
    queryKey: ["products", "fbt"],
    queryFn: () => fetchProducts(),
    enabled: !!product,
  });

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentItem[]>([]);
  const [openAccordion, setOpenAccordion] = useState("desc");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [reviewSort, setReviewSort] = useState<"newest" | "highest" | "lowest">("newest");
  const [helpfulIds, setHelpfulIds] = useState<Record<string, boolean>>({});

  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImage, setReviewImage] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const savedQ = useQuery({
    queryKey: ["favorite", "product", slug, user?.id],
    queryFn: () => (user ? isFavorite(user.id, "product", slug) : Promise.resolve(false)),
    enabled: !!user && !!product,
  });

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("not-signed-in");
      if (savedQ.data) await removeFavorite(user.id, "product", slug);
      else await addFavorite(user.id, "product", slug);
    },
    onSuccess: () => {
      savedQ.refetch();
      qc.invalidateQueries({ queryKey: ["favorites", user?.id] });
      toast.success(savedQ.data ? "Removed from wishlist" : "Saved to wishlist");
    },
    onError: (e: Error) => {
      if (e.message === "not-signed-in") {
        toast.info("Please sign in to save wishlist");
        navigate({ to: "/auth", search: {} });
      } else toast.error(e.message);
    },
  });

  useEffect(() => {
    if (!product) return;
    setSelectedSize(product.sizes[0] || "");
    setSelectedColor(product.colors[0] || "");
    setActiveImgIdx(0);
    setQuantity(1);

    const stored = localStorage.getItem("pahraan_recently_viewed");
    let list: RecentItem[] = stored ? JSON.parse(stored) : [];
    list = list.filter((item) => item.slug !== product.slug);
    list.unshift({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      image: product.images[0] || "",
      brand: product.brand,
    });
    const truncated = list.slice(0, 8);
    setRecentlyViewed(truncated);
    localStorage.setItem("pahraan_recently_viewed", JSON.stringify(truncated));
  }, [product]);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 520);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const related = useMemo(
    () => (recommendationsQ.data ?? []).filter((p) => p.id !== product?.id).slice(0, 8),
    [recommendationsQ.data, product?.id],
  );

  const frequentlyBought = useMemo(() => {
    const all = allProductsQ.data ?? [];
    if (!product) return [] as Product[];
    return all.filter((p) => p.id !== product.id && p.category !== product.category).slice(0, 3);
  }, [allProductsQ.data, product]);

  const sortedReviews = useMemo(() => {
    const list = [...reviews];
    if (reviewSort === "highest") list.sort((a, b) => b.rating - a.rating);
    else if (reviewSort === "lowest") list.sort((a, b) => a.rating - b.rating);
    else list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    return list;
  }, [reviews, reviewSort]);

  const ratingBars = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const r of reviews) {
      const idx = Math.min(5, Math.max(1, r.rating)) - 1;
      counts[idx] += 1;
    }
    const total = reviews.length || 1;
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: counts[star - 1],
      pct: (counts[star - 1] / total) * 100,
    }));
  }, [reviews]);

  if (productQ.isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Loading luxury piece...
          </span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-page flex flex-col items-center py-20 text-center">
        <h2 className="font-display text-3xl">Piece Not Found</h2>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          This fashion piece does not exist or has been archived.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-xs font-semibold text-white shadow-soft hover:bg-accent"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const hasDiscount = !!(product.compare_at_price && product.compare_at_price > product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;
  const savings = hasDiscount ? product.compare_at_price! - product.price : 0;
  const soldCount = Math.max(120, product.review_count * 87 + 340);

  const displaySizes =
    product.sizes.length > 0
      ? SIZE_ORDER.filter((s) => product.sizes.includes(s)).concat(
          product.sizes.filter((s) => !SIZE_ORDER.includes(s)),
        )
      : SIZE_ORDER;

  const galleryImages = product.images.length > 0 ? product.images : ["hero-fashion"];

  const handleColorSelect = (color: string, idx: number) => {
    setSelectedColor(color);
    if (galleryImages[idx]) setActiveImgIdx(idx);
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
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    if (!selectedSize || !selectedColor) {
      toast.error("Please select size and color");
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity);
    navigate({ to: "/checkout" });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: product.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied");
      }
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
    }
  };

  const handleCompare = () => {
    try {
      const raw = localStorage.getItem("pahraan_compare");
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(product.slug)) {
        list.push(product.slug);
        localStorage.setItem("pahraan_compare", JSON.stringify(list.slice(-4)));
      }
      toast.success("Added to compare");
    } catch {
      toast.info("Compare saved");
    }
  };

  const handleAddAllFbt = () => {
    addToCart(
      product,
      selectedSize || product.sizes[0] || "M",
      selectedColor || product.colors[0] || "Default",
      1,
    );
    for (const p of frequentlyBought) {
      addToCart(p, p.sizes[0] || "M", p.colors[0] || "Default", 1);
    }
    toast.success("Bundle added to cart");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim() || !reviewName.trim()) {
      toast.error("Please fill out name and review");
      return;
    }
    setSubmittingReview(true);
    try {
      await addProductReview({
        product_id: product.id,
        user_id: user?.id ?? null,
        display_name: reviewName,
        rating: reviewRating,
        title: reviewTitle || null,
        comment: reviewComment,
        images: reviewImage ? [reviewImage] : [],
        verified_purchase: !!user,
      });
      toast.success("Review submitted — thank you");
      setReviewName("");
      setReviewTitle("");
      setReviewComment("");
      setReviewImage("");
      reviewsQ.refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const deliveryMin = new Date();
  deliveryMin.setDate(deliveryMin.getDate() + 3);
  const deliveryMax = new Date();
  deliveryMax.setDate(deliveryMax.getDate() + 5);
  const deliveryRange = `${deliveryMin.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} – ${deliveryMax.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  const highlights = [
    { icon: Feather, label: "Premium Fabric" },
    { icon: Hand, label: "Hand Embroidery" },
    { icon: Sparkles, label: "Lightweight" },
    { icon: Package, label: "Breathable" },
    { icon: Scissors, label: "Comfort Fit" },
    { icon: BadgeCheck, label: "Made in Pakistan" },
    { icon: Check, label: "Premium Stitching" },
    { icon: Star, label: "Luxury Finish" },
  ];

  return (
    <div className="bg-background font-body text-foreground animate-fade-in">
      <div className="container-page py-8 pb-36 md:pb-16">
        <nav className="mb-6 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-primary">
            Shop
          </Link>
          <span>/</span>
          <span className="truncate text-primary max-w-[200px]">{product.title}</span>
        </nav>

        {/* Main 60 / 40 */}
        <div className="grid items-start gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-10">
          {/* Gallery */}
          <div className="flex gap-3 lg:gap-4">
            {galleryImages.length > 1 && (
              <div className="hidden w-16 shrink-0 flex-col gap-2 md:flex lg:w-[72px]">
                {galleryImages.map((img, i) => (
                  <button
                    key={img + i}
                    type="button"
                    onClick={() => setActiveImgIdx(i)}
                    className={`aspect-[3/4] overflow-hidden rounded-xl border-2 transition cursor-pointer ${
                      activeImgIdx === i
                        ? "border-primary shadow-soft"
                        : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={resolveImage(img)}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
                <div className="mt-1 rounded-xl border border-dashed border-border/70 bg-[#FFF9FB] p-2 text-center">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    360°
                  </p>
                  <p className="mt-0.5 text-[8px] text-muted-foreground">Soon</p>
                </div>
                {product.video_url && (
                  <a
                    href={product.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-border/60 bg-white p-2 text-center text-[9px] font-bold uppercase tracking-wider text-primary hover:border-primary"
                  >
                    Video
                  </a>
                )}
              </div>
            )}

            <div className="relative min-w-0 flex-1">
              <div className="group relative aspect-[3/4] overflow-hidden rounded-[20px] border border-[#F8BBD0]/35 bg-[#FFF5F8] shadow-soft">
                <img
                  key={activeImgIdx}
                  src={resolveImage(galleryImages[activeImgIdx])}
                  alt={product.title}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 animate-fade-in"
                />
                {hasDiscount && (
                  <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-soft">
                    {discountPercent}% OFF
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-foreground shadow-soft transition hover:text-primary cursor-pointer"
                  aria-label="Full screen gallery"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
                <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-[10px] font-medium text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                  Hover to zoom · Click for fullscreen
                </p>
              </div>

              {galleryImages.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto md:hidden">
                  {galleryImages.map((img, i) => (
                    <button
                      key={img + i}
                      type="button"
                      onClick={() => setActiveImgIdx(i)}
                      className={`h-16 w-14 shrink-0 overflow-hidden rounded-xl border-2 cursor-pointer ${
                        activeImgIdx === i ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img src={resolveImage(img)} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Purchase panel */}
          <div className="space-y-5 lg:sticky lg:top-24">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                {collectionLabel(product.category)}
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-foreground md:text-4xl">
                {product.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                <span>
                  SKU: <strong className="text-foreground">{product.sku}</strong>
                </span>
                <span>·</span>
                <span>
                  Brand: <strong className="text-foreground">{product.brand}</strong>
                </span>
                <span>·</span>
                <span
                  className={
                    product.stock_status === "out_of_stock"
                      ? "font-semibold text-destructive"
                      : product.stock_status === "low_stock"
                        ? "font-semibold text-amber-600"
                        : "font-semibold text-emerald-600"
                  }
                >
                  {product.stock_status === "out_of_stock"
                    ? "Out of Stock"
                    : product.stock_status === "low_stock"
                      ? "Only a few left"
                      : "In Stock"}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.round(product.rating) ? "fill-current" : ""}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold">
                  {product.rating.toFixed(1)}{" "}
                  <span className="font-normal text-muted-foreground">
                    ({product.review_count} Reviews)
                  </span>
                </span>
                <span className="rounded-full bg-primary/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  {soldCount.toLocaleString()}+ Sold
                </span>
              </div>
            </div>

            <div className="rounded-[20px] border border-[#F8BBD0]/35 bg-white p-4 shadow-soft">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-display text-3xl font-bold text-primary">
                  PKR {product.price.toLocaleString()}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-muted-foreground line-through">
                      PKR {product.compare_at_price!.toLocaleString()}
                    </span>
                    <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
              {hasDiscount && (
                <p className="mt-1.5 text-sm font-semibold text-emerald-600">
                  You Save PKR {savings.toLocaleString()}
                </p>
              )}
              <p className="mt-2 text-[11px] text-muted-foreground">
                Installments coming soon — pay in easy monthly plans.
              </p>
            </div>

            {/* Colors */}
            {product.colors.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Color</span>
                  <span className="capitalize text-primary">{selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((col, idx) => (
                    <button
                      key={col}
                      type="button"
                      title={col}
                      onClick={() => handleColorSelect(col, idx)}
                      className={`h-9 w-9 rounded-full border-2 transition cursor-pointer ${
                        selectedColor === col
                          ? "border-primary ring-2 ring-primary/20 scale-105"
                          : "border-border hover:border-primary/50"
                      }`}
                      style={{ backgroundColor: colorSwatch(col) }}
                      aria-label={col}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            <div>
              <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <span>Size</span>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-primary hover:underline cursor-pointer"
                >
                  Size Guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {displaySizes.map((sz) => {
                  const available = product.sizes.length === 0 || product.sizes.includes(sz);
                  return (
                    <button
                      key={sz}
                      type="button"
                      disabled={!available}
                      onClick={() => available && setSelectedSize(sz)}
                      className={`h-11 min-w-11 rounded-full border px-3 text-xs font-bold transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through ${
                        selectedSize === sz
                          ? "border-primary bg-primary text-white shadow-soft"
                          : "border-border bg-white text-foreground hover:border-primary"
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Qty + CTAs */}
            <div className="space-y-3 border-t border-border/40 pt-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-12 items-center rounded-full border border-border bg-[#FFF9FB] px-1.5">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="grid h-9 w-9 place-items-center rounded-full hover:bg-white cursor-pointer"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="grid h-9 w-9 place-items-center rounded-full hover:bg-white cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock_status === "out_of_stock"}
                className={`flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-bold uppercase tracking-wider text-white shadow-elegant transition cursor-pointer disabled:opacity-50 ${
                  added ? "bg-emerald-600" : "bg-primary hover:bg-accent"
                }`}
              >
                {added ? (
                  <>
                    <Check className="h-4.5 w-4.5" /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4.5 w-4.5" /> Add to Cart
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={product.stock_status === "out_of_stock"}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-primary bg-white text-sm font-bold uppercase tracking-wider text-primary transition hover:bg-primary hover:text-white cursor-pointer disabled:opacity-50"
              >
                <Zap className="h-4 w-4" /> Buy Now
              </button>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => toggleFavorite.mutate()}
                  className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-2.5 text-[11px] font-semibold transition cursor-pointer ${
                    savedQ.data
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-foreground/80 hover:border-primary hover:text-primary"
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${savedQ.data ? "fill-current" : ""}`} /> Wishlist
                </button>
                <button
                  type="button"
                  onClick={handleCompare}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-3 py-2.5 text-[11px] font-semibold text-foreground/80 transition hover:border-primary hover:text-primary cursor-pointer"
                >
                  <GitCompareArrows className="h-3.5 w-3.5" /> Compare
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-3 py-2.5 text-[11px] font-semibold text-foreground/80 transition hover:border-primary hover:text-primary cursor-pointer"
                >
                  <Share2 className="h-3.5 w-3.5" /> Share
                </button>
              </div>
            </div>

            {/* Delivery cards */}
            <div className="grid gap-2.5 sm:grid-cols-2">
              {[
                { icon: Truck, title: "Free Shipping", desc: "Over PKR 5,000" },
                { icon: Package, title: "Cash on Delivery", desc: "Pay at doorstep" },
                { icon: RotateCcw, title: "Easy Returns", desc: "7-day exchanges" },
                { icon: ShieldCheck, title: "Secure Checkout", desc: "Encrypted & safe" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex gap-2.5 rounded-2xl border border-border/50 bg-white p-3 shadow-soft"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Highlights */}
        <section className="mt-14">
          <h2 className="font-display text-2xl font-semibold">Product Highlights</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {highlights.map((h) => (
              <div
                key={h.label}
                className="flex items-center gap-2.5 rounded-2xl border border-[#F8BBD0]/30 bg-white px-3 py-3 shadow-soft"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#FFF5F8] text-primary">
                  <h.icon className="h-4 w-4" />
                </span>
                <span className="text-xs font-semibold text-foreground">{h.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Accordions */}
        <section className="mt-12 overflow-hidden rounded-[20px] border border-border/50 bg-white shadow-soft">
          {[
            {
              id: "desc",
              title: "Product Description",
              content: (
                <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                  <p>{product.description}</p>
                  <ul className="grid gap-1.5 sm:grid-cols-2">
                    <li>
                      <strong className="text-foreground">Fabric:</strong>{" "}
                      {product.fabric || "Premium lawn"}
                    </li>
                    <li>
                      <strong className="text-foreground">Embroidery:</strong>{" "}
                      {product.embroidery || "Hand-finished detailing"}
                    </li>
                    <li>
                      <strong className="text-foreground">Occasion:</strong> Everyday to festive
                      styling
                    </li>
                    <li>
                      <strong className="text-foreground">Fit:</strong> Comfort boutique fit
                    </li>
                    <li>
                      <strong className="text-foreground">Season:</strong> Year-round elegance
                    </li>
                    <li>
                      <strong className="text-foreground">Styling:</strong> Pair with gold jewelry
                      &amp; khussa
                    </li>
                  </ul>
                </div>
              ),
            },
            {
              id: "care",
              title: "Care Instructions",
              content: (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Hand wash separately in cold water</li>
                  <li>• Do not bleach</li>
                  <li>• Iron inside out on medium heat</li>
                  <li>• Dry in shade — avoid direct sun</li>
                  <li>• Dry clean recommended for heavy embroidery &amp; silk dupattas</li>
                </ul>
              ),
            },
            {
              id: "ship",
              title: "Shipping & Returns",
              content: (
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Estimated delivery:</strong> {deliveryRange}{" "}
                    across Pakistan (PKR 250 flat · free over PKR 5,000).
                  </p>
                  <p>
                    <strong className="text-foreground">Returns:</strong> Easy 7-day returns on
                    unused pieces with tags attached.
                  </p>
                  <p>
                    <strong className="text-foreground">Exchanges:</strong> Size exchanges available
                    within 7 days (bridal couture excluded).
                  </p>
                </div>
              ),
            },
          ].map((sec) => (
            <div key={sec.id} className="border-b border-border/40 last:border-0">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === sec.id ? "" : sec.id)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-xs font-bold uppercase tracking-widest text-foreground/85 hover:text-primary cursor-pointer"
              >
                {sec.title}
                <span className="text-lg leading-none">{openAccordion === sec.id ? "−" : "+"}</span>
              </button>
              {openAccordion === sec.id && (
                <div className="px-5 pb-5 animate-fade-in">{sec.content}</div>
              )}
            </div>
          ))}
        </section>

        {/* Reviews */}
        <section className="mt-16 border-t border-border/50 pt-12">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Reviews</p>
              <h2 className="mt-1 font-display text-3xl font-semibold">Customer Love</h2>
            </div>
            <select
              value={reviewSort}
              onChange={(e) => setReviewSort(e.target.value as typeof reviewSort)}
              className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold outline-none focus:border-primary"
            >
              <option value="newest">Newest</option>
              <option value="highest">Highest rated</option>
              <option value="lowest">Lowest rated</option>
            </select>
          </div>

          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.4fr]">
            <div className="space-y-6">
              <div className="rounded-[20px] border border-[#F8BBD0]/35 bg-white p-5 shadow-soft">
                <div className="flex items-center gap-3">
                  <span className="font-display text-5xl font-bold text-primary">
                    {product.rating.toFixed(1)}
                  </span>
                  <div>
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(product.rating) ? "fill-current" : ""
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Based on {reviews.length} reviews
                    </p>
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  {ratingBars.map((bar) => (
                    <div key={bar.star} className="flex items-center gap-2 text-[11px]">
                      <span className="w-6 font-semibold">{bar.star}★</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#FFF5F8]">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${bar.pct}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-muted-foreground">{bar.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form
                onSubmit={handleReviewSubmit}
                className="space-y-3.5 rounded-[20px] border border-border/50 bg-white p-5 shadow-soft"
              >
                <h3 className="font-display text-lg font-semibold">Write a Review</h3>
                <div className="flex gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setReviewRating(stars)}
                      className="cursor-pointer transition hover:scale-110"
                    >
                      <Star className={`h-6 w-6 ${stars <= reviewRating ? "fill-current" : ""}`} />
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Your name"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Headline (optional)"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs outline-none focus:border-primary"
                />
                <textarea
                  placeholder="Share fabric quality, fit, and styling notes..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xs outline-none focus:border-primary"
                />
                <div className="flex items-center gap-2 rounded-xl border border-dashed border-border/80 bg-[#FFF9FB] p-2">
                  <ImageIcon className="h-4 w-4 shrink-0 text-primary" />
                  <input
                    type="url"
                    placeholder="Photo URL (optional)"
                    value={reviewImage}
                    onChange={(e) => setReviewImage(e.target.value)}
                    className="flex-1 bg-transparent text-[11px] outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex w-full items-center justify-center gap-1.5 rounded-full bg-primary py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-accent cursor-pointer disabled:opacity-60"
                >
                  <Send className="h-3.5 w-3.5" /> Submit Review
                </button>
              </form>
            </div>

            <div className="max-h-[640px] space-y-4 overflow-y-auto pr-1">
              {sortedReviews.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-border bg-white py-14 text-center text-sm italic text-muted-foreground shadow-soft">
                  Be the first to review this Pahraan piece.
                </div>
              ) : (
                sortedReviews.map((rev) => (
                  <article
                    key={rev.id}
                    className="rounded-[20px] border border-border/40 bg-white p-5 shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{rev.display_name}</p>
                        <div className="mt-1 flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < rev.rating ? "fill-current" : ""}`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {rev.verified_purchase && (
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                        <BadgeCheck className="h-3 w-3" /> Verified Purchase
                      </span>
                    )}
                    {rev.title && (
                      <p className="mt-2 text-xs font-bold text-foreground">{rev.title}</p>
                    )}
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {rev.comment}
                    </p>
                    {rev.images?.length > 0 && (
                      <div className="mt-3 flex gap-2">
                        {rev.images.map((imgUrl, i) => (
                          <div
                            key={i}
                            className="h-16 w-16 overflow-hidden rounded-xl border border-border"
                          >
                            <img
                              src={imgUrl}
                              alt="Customer photo"
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setHelpfulIds((prev) => ({ ...prev, [rev.id]: !prev[rev.id] }))
                      }
                      className={`mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold transition cursor-pointer ${
                        helpfulIds[rev.id]
                          ? "text-primary"
                          : "text-muted-foreground hover:text-primary"
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      {helpfulIds[rev.id] ? "Marked helpful" : "Helpful"}
                    </button>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Frequently bought together */}
        {frequentlyBought.length > 0 && (
          <section className="mt-16 border-t border-border/50 pt-12">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">
                  Complete the look
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold md:text-3xl">
                  Frequently Bought Together
                </h2>
              </div>
              <button
                type="button"
                onClick={handleAddAllFbt}
                className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-accent cursor-pointer"
              >
                Add All to Cart
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              <div className="w-44 shrink-0 overflow-hidden rounded-[20px] border border-primary/20 bg-white p-3 shadow-soft sm:w-52">
                <div className="aspect-[3/4] overflow-hidden rounded-xl bg-muted">
                  <img
                    src={resolveImage(product.images[0])}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mt-2 line-clamp-2 font-display text-sm font-semibold">
                  {product.title}
                </p>
                <p className="text-xs font-bold text-primary">
                  PKR {product.price.toLocaleString()}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  This item
                </p>
              </div>
              {frequentlyBought.map((p, i) => (
                <div key={p.id} className="flex shrink-0 items-center gap-4">
                  <span className="text-xl font-display text-primary">+</span>
                  <Link
                    to="/shop/$slug"
                    params={{ slug: p.slug }}
                    className="w-44 overflow-hidden rounded-[20px] border border-border/40 bg-white p-3 shadow-soft transition hover:shadow-elegant sm:w-52"
                  >
                    <div className="aspect-[3/4] overflow-hidden rounded-xl bg-muted">
                      <img
                        src={resolveImage(p.images[0])}
                        alt={p.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="mt-2 line-clamp-2 font-display text-sm font-semibold">
                      {p.title}
                    </p>
                    <p className="text-xs font-bold text-primary">PKR {p.price.toLocaleString()}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground capitalize">
                      {i === 0 ? "Dupatta / Accent" : i === 1 ? "Accessories" : "Style add-on"}
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16 border-t border-border/50 pt-12">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                Same collection
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold md:text-3xl">
                Related Products
              </h2>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-2 snap-x">
              {related.map((prod) => (
                <div key={prod.id} className="w-[260px] shrink-0 snap-start sm:w-[280px]">
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recently viewed */}
        {recentlyViewed.filter((p) => p.id !== product.id).length > 0 && (
          <section className="mt-16 border-t border-border/50 pt-12">
            <div className="mb-6 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">History</p>
                <h2 className="mt-1 font-display text-2xl font-semibold">Recently Viewed</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("pahraan_recently_viewed");
                  setRecentlyViewed([]);
                }}
                className="text-xs font-semibold text-destructive hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {recentlyViewed
                .filter((p) => p.id !== product.id)
                .map((p) => (
                  <Link
                    key={p.slug}
                    to="/shop/$slug"
                    params={{ slug: p.slug }}
                    className="w-36 shrink-0 overflow-hidden rounded-[20px] border border-border/40 bg-white p-2.5 shadow-soft transition hover:shadow-elegant sm:w-40"
                  >
                    <div className="aspect-[3/4] overflow-hidden rounded-xl bg-muted">
                      <img
                        src={resolveImage(p.image)}
                        alt={p.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="mt-2 line-clamp-2 font-display text-xs font-semibold">
                      {p.title}
                    </p>
                    <p className="text-[11px] font-bold text-primary">
                      PKR {p.price.toLocaleString()}
                    </p>
                  </Link>
                ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky mobile purchase bar */}
      {showSticky && (
        <div className="fixed inset-x-0 bottom-16 z-40 border-t border-border/60 bg-white/95 p-3 backdrop-blur-xl md:hidden pb-[calc(0.75rem+env(safe-area-inset-bottom))] animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold text-primary">
                PKR {product.price.toLocaleString()}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                Size: <strong className="text-foreground">{selectedSize || "—"}</strong>
                {selectedColor ? ` · ${selectedColor}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock_status === "out_of_stock"}
              className="h-11 rounded-full bg-primary px-4 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-accent cursor-pointer disabled:opacity-50"
            >
              Add to Cart
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={product.stock_status === "out_of_stock"}
              className="h-11 rounded-full border border-primary px-3 text-[11px] font-bold uppercase tracking-wider text-primary cursor-pointer disabled:opacity-50"
            >
              Buy
            </button>
          </div>
        </div>
      )}

      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
      {lightboxOpen && (
        <Lightbox
          images={galleryImages}
          index={activeImgIdx}
          onClose={() => setLightboxOpen(false)}
          onChange={setActiveImgIdx}
        />
      )}
    </div>
  );
}
