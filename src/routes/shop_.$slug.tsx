import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Heart, ShoppingBag, Truck, RotateCcw, Share2, Plus, Minus, Check, Image as ImageIcon, Send } from "lucide-react";
import { toast } from "sonner";
import { fetchProductBySlug, fetchProducts, fetchProductReviews, addProductReview } from "@/lib/ecommerce-data";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/lib/auth";
import { isFavorite, addFavorite, removeFavorite } from "@/lib/user-data";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { resolveImage } from "@/lib/content";

export const Route = createFileRoute("/shop_/$slug")({
  loader: async ({ params }) => {
    return { slug: params.slug };
  },
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { slug } = Route.useLoaderData();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const { addToCart } = useCart();

  // Queries
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
  const reviews = reviewsQ.data ?? [];

  const recommendationsQ = useQuery({
    queryKey: ["products-recommendations", product?.category],
    queryFn: () => fetchProducts({ category: product?.category }),
    enabled: !!product,
  });
  const recommendations = (recommendationsQ.data ?? [])
    .filter((p) => p.id !== product?.id)
    .slice(0, 4);

  // States
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  // Accordion active tab
  const [activeAccordion, setActiveAccordion] = useState<string>("desc");

  // Review form states
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImage, setReviewImage] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Wishlist Queries & Mutations
  const savedQ = useQuery({
    queryKey: ["favorite", "product", slug, user?.id],
    queryFn: () => (user ? isFavorite(user.id, "product", slug) : Promise.resolve(false)),
    enabled: !!user && !!product,
  });

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("not-signed-in");
      if (savedQ.data) {
        await removeFavorite(user.id, "product", slug);
      } else {
        await addFavorite(user.id, "product", slug);
      }
    },
    onSuccess: () => {
      savedQ.refetch();
      qc.invalidateQueries({ queryKey: ["favorites", user?.id] });
      toast.success(savedQ.data ? "Removed from wishlist" : "Saved to your wishlist");
    },
    onError: (e: Error) => {
      if (e.message === "not-signed-in") {
        toast.info("Please sign in to save wishlist");
        navigate({ to: "/auth" });
      } else {
        toast.error(e.message);
      }
    },
  });

  // Track Recently Viewed
  useEffect(() => {
    if (product) {
      // Set defaults
      setSelectedSize(product.sizes[0] || "");
      setSelectedColor(product.colors[0] || "");
      setActiveImgIdx(0);
      setQuantity(1);

      // Log Recently Viewed
      const stored = localStorage.getItem("pahraan_recently_viewed");
      let list = stored ? JSON.parse(stored) : [];
      list = list.filter((item: any) => item.slug !== product.slug);
      list.unshift({
        id: product.id,
        slug: product.slug,
        title: product.title,
        price: product.price,
        image: product.images[0] || "",
        brand: product.brand,
      });
      const truncated = list.slice(0, 6);
      setRecentlyViewed(truncated);
      localStorage.setItem("pahraan_recently_viewed", JSON.stringify(truncated));
    }
  }, [product]);

  // Load recently viewed on mount
  useEffect(() => {
    const stored = localStorage.getItem("pahraan_recently_viewed");
    if (stored) {
      setRecentlyViewed(JSON.parse(stored));
    }
  }, []);

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
      <div className="container-page py-20 text-center flex flex-col items-center">
        <h2 className="font-display text-3xl">Piece Not Found</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">
          The fashion piece you are looking for does not exist or has been archived.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex bg-primary hover:bg-accent text-white px-6 py-3 rounded-full text-xs font-semibold shadow-soft hover:shadow-elegant transition"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
    navigate({ to: "/cart" });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim() || !reviewName.trim()) {
      toast.error("Please fill out name and review comment");
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
      toast.success("Review submitted! Thank you for your feedback.");
      setReviewName("");
      setReviewTitle("");
      setReviewComment("");
      setReviewImage("");
      reviewsQ.refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  // Estimated delivery dates (standard 3-5 days in Pakistan)
  const deliveryMin = new Date();
  deliveryMin.setDate(deliveryMin.getDate() + 3);
  const deliveryMax = new Date();
  deliveryMax.setDate(deliveryMax.getDate() + 5);
  const deliveryRangeString = `${deliveryMin.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${deliveryMax.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  return (
    <div className="container-page py-10 font-body text-foreground animate-fade-in bg-background">
      {/* Breadcrumbs */}
      <nav className="flex gap-2 items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-primary">Shop</Link>
        <span>/</span>
        <span className="text-primary truncate max-w-[200px]">{product.title}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2 items-start">
        {/* LEFT COLUMN: MULTIPLE IMAGE GALLERY */}
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-muted aspect-[3/4] shadow-soft group">
            {product.images.length > 0 ? (
              <div className="h-full w-full overflow-hidden relative cursor-zoom-in">
                <img
                  src={resolveImage(product.images[activeImgIdx])}
                  alt={product.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-115"
                />
              </div>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                No images available
              </div>
            )}

            {/* Discount overlay */}
            {hasDiscount && (
              <span className="absolute left-4.5 top-4.5 z-20 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-soft">
                {discountPercent}% Off
              </span>
            )}
          </div>

          {/* Thumbnails Row */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto py-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImgIdx(i)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition cursor-pointer hover:border-primary/60 shadow-soft ${
                    activeImgIdx === i ? "border-primary scale-102" : "border-transparent"
                  }`}
                >
                  <img src={resolveImage(img)} alt="product thumb" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DETAILS */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                {product.brand}
              </span>
              <span
                className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                  product.stock_status === "in_stock"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : product.stock_status === "low_stock"
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-destructive/20 bg-destructive/5 text-destructive"
                }`}
              >
                {product.stock_status.replace("_", " ")}
              </span>
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold mt-2 text-foreground leading-tight">
              {product.title}
            </h1>

            {/* Star Rating summary */}
            <div className="flex items-center gap-1.5 mt-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(product.rating) ? "fill-current" : ""
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-foreground">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({product.review_count} customer reviews)
              </span>
            </div>

            {/* Pricing */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-display text-3xl font-bold text-primary">
                PKR {product.price.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-base text-muted-foreground line-through">
                  PKR {product.compare_at_price!.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Size selector */}
          {product.sizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span>Select Size</span>
                <span className="text-primary font-bold">{selectedSize}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`h-10 w-12 rounded-xl border text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                      selectedSize === sz
                        ? "border-primary bg-primary text-white shadow-soft"
                        : "border-border hover:border-primary text-foreground hover:text-primary bg-white"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color selector */}
          {product.colors.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span>Select Color</span>
                <span className="text-primary font-bold capitalize">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((col) => (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer capitalize ${
                      selectedColor === col
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-white text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-border"
                      style={{
                        backgroundColor:
                          col.toLowerCase() === "white"
                            ? "#ffffff"
                            : col.toLowerCase() === "black"
                              ? "#000000"
                              : col.toLowerCase() === "red"
                                ? "#C2185B"
                                : col.toLowerCase() === "beige"
                                  ? "#f5f5dc"
                                  : col,
                      }}
                    />
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA add to cart buttons */}
          <div className="flex flex-wrap gap-3 pt-3 border-t border-border/40">
            {/* Quantity */}
            <div className="flex h-12 items-center rounded-full border border-border bg-secondary/10 px-1.5 shrink-0">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-9 w-9 rounded-full font-bold hover:bg-white/80 transition flex items-center justify-center"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-10 text-center font-bold text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="h-9 w-9 rounded-full font-bold hover:bg-white/80 transition flex items-center justify-center"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={product.stock_status === "out_of_stock"}
              className="flex-1 h-12 bg-primary hover:bg-accent text-white rounded-full font-semibold shadow-soft hover:shadow-elegant flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <ShoppingBag className="h-4.5 w-4.5" /> Add to Cart
            </Button>

            <Button
              onClick={handleBuyNow}
              disabled={product.stock_status === "out_of_stock"}
              variant="outline"
              className="flex-1 h-12 border-primary text-primary hover:bg-primary hover:text-white rounded-full font-semibold shadow-soft hover:shadow-elegant flex items-center justify-center cursor-pointer text-sm"
            >
              Buy Now
            </Button>

            <button
              onClick={() => toggleFavorite.mutate()}
              disabled={toggleFavorite.isPending}
              className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border shadow-soft transition hover:scale-105 active:scale-95 ${
                savedQ.data
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-white text-muted-foreground hover:text-primary hover:border-primary"
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`h-5 w-5 ${savedQ.data ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={handleShare}
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-border bg-white text-muted-foreground hover:text-foreground hover:border-foreground shadow-soft transition hover:scale-105"
              title="Share Link"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          {/* Delivery Estimation badges */}
          <div className="grid gap-3.5 border border-border/40 rounded-2xl bg-secondary/5 p-4.5 text-xs text-muted-foreground leading-relaxed mt-4">
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Estimated Delivery</p>
                <p className="mt-0.5">Estimated arrival in Pakistan: <span className="font-bold text-primary">{deliveryRangeString}</span> (Flat Rate Shipping PKR 250, free over 5K)</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-t border-border/40 pt-3">
              <RotateCcw className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Hassle-Free Returns</p>
                <p className="mt-0.5">Complimentary returns or exchanges within 14 days of delivery. (Except bridal wear)</p>
              </div>
            </div>
          </div>

          {/* Custom Accordion Specifications */}
          <div className="border border-border/40 rounded-2xl overflow-hidden shadow-soft">
            {[
              { id: "desc", title: "Description & Details", content: product.description },
              { id: "fabric", title: "Fabric & Material Details", content: `Material details: ${product.fabric || "Premium Pakistani summer lawn cotton"}. Embellished with: ${product.embroidery || "Minimal chikan lace inserts"}. Hand wash only.` },
              { id: "care", title: "Care Instructions", content: "Dry clean only for silk, velvet and organza dupattas. Lawn suits should be washed separately in cold water with mild detergent. Do not bleach or tumble dry. Medium hot iron." },
              { id: "sizes", title: "Size Guide Instructions", content: "All dimensions are in inches. XS: Chest 32, Waist 26, Hips 35. S: Chest 34, Waist 28, Hips 37. M: Chest 36, Waist 30, Hips 39. L: Chest 39, Waist 33, Hips 42. XL: Chest 42, Waist 36, Hips 45." }
            ].map((sec) => (
              <div key={sec.id} className="border-b border-border/40 last:border-0 bg-white">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === sec.id ? "" : sec.id)}
                  className="w-full flex items-center justify-between p-4.5 text-xs uppercase tracking-widest font-bold text-foreground/80 hover:text-primary transition-all text-left"
                >
                  {sec.title}
                  <span className="text-lg">{activeAccordion === sec.id ? "−" : "+"}</span>
                </button>
                {activeAccordion === sec.id && (
                  <div className="px-4.5 pb-4.5 text-xs text-muted-foreground leading-relaxed animate-fade-in whitespace-pre-line">
                    {sec.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CUSTOMER REVIEWS SECTION */}
      <section className="mt-16 border-t border-border/60 pt-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.8fr]">
          {/* Review Aggregates & Submit Form */}
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Customer Reviews</h2>
              <div className="flex items-center gap-2 mt-3">
                <span className="font-display text-4xl font-extrabold text-primary">
                  {product.rating.toFixed(1)}
                </span>
                <div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4.5 w-4.5 ${
                          i < Math.round(product.rating) ? "fill-current" : ""
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-0.5">
                    Based on {reviews.length} feedback reviews
                  </p>
                </div>
              </div>
            </div>

            {/* Write review form */}
            <form onSubmit={handleReviewSubmit} className="rounded-3xl border border-border/80 bg-white p-5 shadow-soft space-y-4">
              <h3 className="font-display text-base font-semibold">Share your feedback</h3>
              <div className="space-y-3.5">
                {/* Rating selection stars */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest block mb-1.5">Rating</span>
                  <div className="flex gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        key={stars}
                        type="button"
                        onClick={() => setReviewRating(stars)}
                        className="transition hover:scale-110 cursor-pointer"
                      >
                        <Star className={`h-6 w-6 ${stars <= reviewRating ? "fill-current" : ""}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  <input
                    type="text"
                    placeholder="Your display name"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs outline-none focus:border-primary transition"
                  />
                  <input
                    type="text"
                    placeholder="Review headline (optional)"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs outline-none focus:border-primary transition"
                  />
                  <textarea
                    placeholder="Tell us what you love about this piece, the fabric quality, sizing, and embroidery details..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    required
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xs outline-none focus:border-primary transition"
                  />
                  <div className="flex items-center gap-2 border border-dashed border-border/80 rounded-xl p-2 bg-secondary/5">
                    <ImageIcon className="h-4.5 w-4.5 text-primary shrink-0" />
                    <input
                      type="url"
                      placeholder="Add an image URL of your look..."
                      value={reviewImage}
                      onChange={(e) => setReviewImage(e.target.value)}
                      className="flex-1 bg-transparent text-[10px] outline-none text-foreground"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-primary hover:bg-accent text-white rounded-full py-5 text-xs font-semibold shadow-soft flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Send className="h-3 w-3" /> Submit Review
                </Button>
              </div>
            </form>
          </div>

          {/* Reviews List */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {reviews.length === 0 ? (
              <div className="py-12 border border-dashed border-border rounded-3xl text-center text-xs text-muted-foreground bg-white shadow-soft italic">
                Be the first to review this Pahraan luxury piece!
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="rounded-3xl border border-border/40 bg-white p-5 shadow-soft space-y-3 transition hover:border-primary/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{rev.display_name}</p>
                      {/* Rating stars */}
                      <div className="flex text-amber-400 mt-1">
                        {[...Array(5)].map((_, i) => (
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

                  {rev.title && <p className="font-bold text-xs text-foreground">{rev.title}</p>}
                  <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>

                  {/* Review photos */}
                  {rev.images && rev.images.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {rev.images.map((imgUrl, i) => (
                        <div key={i} className="h-16 w-16 overflow-hidden rounded-lg border border-border">
                          <img src={imgUrl} alt="review snap" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {rev.verified_purchase && (
                    <span className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <Check className="h-2 w-2" /> Verified Buyer
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* RECOMMENDED PRODUCTS SECTION */}
      {recommendations.length > 0 && (
        <section className="mt-16 border-t border-border/60 pt-12">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-widest text-primary font-bold">Recommendations</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-foreground">You May Also Love</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recommendations.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* RECENTLY VIEWED PRODUCTS SECTION */}
      {recentlyViewed.length > 1 && (
        <section className="mt-16 border-t border-border/60 pt-12">
          <div className="mb-8 flex justify-between items-end">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary font-bold">History</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-foreground">Recently Viewed</h2>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("pahraan_recently_viewed");
                setRecentlyViewed([]);
              }}
              className="text-xs font-semibold text-destructive hover:underline cursor-pointer"
            >
              Clear History
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {recentlyViewed
              .filter((p) => p.id !== product.id)
              .map((p) => (
                <Link
                  key={p.slug}
                  to="/shop/$slug"
                  params={{ slug: p.slug }}
                  className="group flex flex-col items-center bg-white border border-border/40 rounded-2xl p-3 text-center hover:shadow-soft transition-all duration-300"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-muted shadow-soft">
                    <img
                      src={resolveImage(p.image)}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h4 className="font-display font-semibold text-xs text-foreground mt-2 truncate w-full group-hover:text-primary">
                    {p.title}
                  </h4>
                  <p className="text-xs font-bold text-primary mt-1">PKR {p.price.toLocaleString()}</p>
                </Link>
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
