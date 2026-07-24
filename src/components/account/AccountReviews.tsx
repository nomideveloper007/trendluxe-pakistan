import { useState } from "react";
import { Star, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { loadJson, saveJson } from "./account-utils";

type ReviewDraft = {
  id: string;
  productTitle: string;
  orderId: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  createdAt: string;
};

type Props = {
  orders: any[];
  userId?: string;
};

export function AccountReviews({ orders, userId }: Props) {
  const key = `pahraan_reviews_${userId || "guest"}`;
  const [reviews, setReviews] = useState<ReviewDraft[]>(() => loadJson(key, [] as ReviewDraft[]));
  const [open, setOpen] = useState(false);
  const [productTitle, setProductTitle] = useState("");
  const [orderId, setOrderId] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const deliveredItems = orders
    .filter((o) => o.status === "delivered")
    .flatMap((o) =>
      (o.order_items || []).map((item: any) => ({
        orderId: o.id,
        title: item.product_title as string,
      })),
    );

  const reviewedTitles = new Set(reviews.map((r) => r.productTitle));
  const pending = deliveredItems.filter((i) => !reviewedTitles.has(i.title));

  const openReview = (item?: { orderId: string; title: string }) => {
    setProductTitle(item?.title || "");
    setOrderId(item?.orderId || "");
    setRating(5);
    setTitle("");
    setComment("");
    setImages([]);
    setOpen(true);
  };

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files)
      .slice(0, 4)
      .map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...urls].slice(0, 4));
  };

  const submit = () => {
    if (!productTitle || !comment.trim()) {
      toast.error("Please add a product and review comment");
      return;
    }
    const next: ReviewDraft[] = [
      {
        id: `rev-${Date.now()}`,
        productTitle,
        orderId,
        rating,
        title,
        comment,
        images,
        createdAt: new Date().toISOString(),
      },
      ...reviews,
    ];
    setReviews(next);
    saveJson(key, next);
    setOpen(false);
    toast.success("Review submitted — thank you");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Reviews</h2>
          <p className="mt-1 text-xs text-muted-foreground">Share your Pahraan experience.</p>
        </div>
        <Button
          onClick={() => openReview()}
          className="rounded-full bg-primary text-xs font-semibold text-white hover:bg-accent cursor-pointer"
        >
          Write Review
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-border/60 bg-white p-5 shadow-soft">
          <h3 className="font-display text-lg font-bold">Pending reviews</h3>
          {pending.length === 0 ? (
            <p className="mt-4 text-xs text-muted-foreground">No pending reviews.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {pending.slice(0, 6).map((item) => (
                <div
                  key={`${item.orderId}-${item.title}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border/40 bg-[#FFF9FB] px-4 py-3"
                >
                  <p className="text-xs font-bold">{item.title}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openReview(item)}
                    className="h-8 rounded-full text-[10px] font-bold cursor-pointer"
                  >
                    Review
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-border/60 bg-white p-5 shadow-soft">
          <h3 className="font-display text-lg font-bold">Your reviews</h3>
          {reviews.length === 0 ? (
            <p className="mt-4 text-xs text-muted-foreground">You haven&apos;t reviewed any pieces yet.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-border/40 p-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < review.rating ? "fill-primary text-primary" : "text-border"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-xs font-bold">{review.productTitle}</p>
                  {review.title && <p className="mt-1 text-xs font-semibold">{review.title}</p>}
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    {review.comment}
                  </p>
                  {review.images.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {review.images.map((src) => (
                        <img
                          key={src}
                          src={src}
                          alt=""
                          className="h-14 w-14 rounded-xl object-cover border border-border/50"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display">Write a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Product
              </label>
              <input
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                list="pending-products"
                className="w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-primary"
              />
              <datalist id="pending-products">
                {deliveredItems.map((i) => (
                  <option key={`${i.orderId}-${i.title}`} value={i.title} />
                ))}
              </datalist>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Rating
              </label>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className="cursor-pointer"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        i < rating ? "fill-primary text-primary" : "text-border"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Review title"
              className="w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-primary"
            />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="How did the piece feel, fit, and photograph?"
              className="w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-primary"
            />
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-[#FFF9FB] py-6 text-[11px] font-semibold text-muted-foreground hover:border-primary/30">
              <Upload className="h-4 w-4 text-primary" />
              Upload images
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => onFiles(e.target.files)}
              />
            </label>
            {images.length > 0 && (
              <div className="flex gap-2">
                {images.map((src) => (
                  <img key={src} src={src} alt="" className="h-14 w-14 rounded-xl object-cover" />
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={submit}
              className="rounded-full bg-primary text-xs font-semibold text-white hover:bg-accent cursor-pointer"
            >
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
