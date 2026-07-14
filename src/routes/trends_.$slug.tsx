import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Heart, Share2, Eye, Calendar, ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { getCategory, SITE, type Trend } from "@/lib/content";
import { fetchTrendBySlug, fetchAllTrends } from "@/lib/trends-data";
import { TrendCard } from "@/components/TrendCard";
import { AdSlot } from "@/components/AdSlot";
import { LikeButton } from "@/components/LikeButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Comments } from "@/components/Comments";
import { toast } from "sonner";

export const Route = createFileRoute("/trends_/$slug")({
  loader: async ({ params }) => {
    const trend = await fetchTrendBySlug(params.slug);
    if (!trend) throw notFound();
    const all = await fetchAllTrends();
    const related = all.filter((x) => x.slug !== trend.slug && x.category === trend.category).slice(0, 3);
    return { trend, related };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Trend not found" }, { name: "robots", content: "noindex" }] };
    }
    const { trend } = loaderData;
    const cat = getCategory(trend.category);
    return {
      meta: [
        { title: `${trend.title} — ${SITE.name}` },
        { name: "description", content: trend.excerpt },
        { property: "og:title", content: trend.title },
        { property: "og:description", content: trend.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:image", content: trend.image },
        { property: "og:url", content: `/trends/${params.slug}` },
        { name: "twitter:image", content: trend.image },
        { name: "keywords", content: [...trend.tags, cat?.name, "Pakistani fashion"].filter(Boolean).join(", ") },
      ],
      links: [{ rel: "canonical", href: `/trends/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: trend.title,
            description: trend.excerpt,
            image: trend.image,
            datePublished: trend.date,
            author: { "@type": "Organization", name: SITE.name },
            publisher: { "@type": "Organization", name: SITE.name },
            articleSection: cat?.name,
          }),
        },
      ],
    };
  },
  component: TrendDetail,
  notFoundComponent: TrendNotFound,
});

function TrendDetail() {
  const { trend, related } = Route.useLoaderData();
  const cat = getCategory(trend.category);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const allImages = useMemo(() => {
    const list = [trend.image];
    trend.gallery.forEach((g) => {
      if (g && !list.includes(g)) {
        list.push(g);
      }
    });
    return list;
  }, [trend.image, trend.gallery]);

  const showPrev = () => {
    setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const showNext = () => {
    setLightboxIndex((prev) => (prev + 1) % allImages.length);
  };

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "Escape") setIsLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, allImages]);

  async function onShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try { await navigator.share({ title: trend.title, text: trend.excerpt, url }); } catch {/* noop */}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    }
  }

  return (
    <article className="pb-20">
      <div className="container-page pt-8">
        <Link to="/trends" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to trends
        </Link>
      </div>

      <header className="container-page pt-8 text-center">
        <Link
          to="/trends"
          hash={cat?.slug}
          className="text-xs uppercase tracking-widest text-primary hover:underline"
        >
          {cat?.name}
        </Link>
        <h1 className="mx-auto mt-3 max-w-3xl font-display text-4xl leading-tight text-foreground md:text-6xl">
          {trend.title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">{trend.excerpt}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" />{new Date(trend.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          <span className="inline-flex items-center gap-1.5"><Eye className="h-4 w-4" />{trend.views.toLocaleString()} views</span>
          <span className="inline-flex items-center gap-1.5"><Heart className="h-4 w-4" />{trend.likes} loves</span>
        </div>
      </header>

      <div className="container-page mt-10">
        <button
          onClick={() => {
            setLightboxIndex(0);
            setIsLightboxOpen(true);
          }}
          className="group relative block w-full overflow-hidden rounded-3xl shadow-elegant cursor-zoom-in text-left focus:outline-none"
        >
          <img
            src={trend.image}
            alt={trend.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
          />
          <div className="absolute inset-0 bg-black/10 opacity-0 transition group-hover:opacity-100 flex items-center justify-center">
            <span className="rounded-full bg-surface/90 px-4 py-2 text-sm font-medium text-foreground shadow-soft flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-primary" /> View Fullscreen
            </span>
          </div>
        </button>
      </div>

      <div className="container-page mt-6 flex flex-wrap justify-center gap-2">
        <LikeButton trendSlug={trend.slug} baseLikes={trend.likes} />
        <FavoriteButton itemType="trend" itemSlug={trend.slug} />
        <button
          onClick={onShare}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
        >
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>

      <div className="container-page mt-16 grid gap-12 lg:grid-cols-[1fr_320px]">
        <div className="mx-auto max-w-2xl">
          {trend.content.map((para: string, i: number) => (
            <p key={i} className="mb-5 text-lg leading-relaxed text-foreground/90">
              {para}
            </p>
          ))}

          <AdSlot variant="in-article" />

          {trend.tips.length > 0 && (
            <div className="mt-4 rounded-2xl bg-blush p-8">
              <div className="text-xs uppercase tracking-widest text-primary">Style Notes</div>
              <h3 className="mt-2 font-display text-2xl">How to wear it</h3>
              <ul className="mt-4 space-y-3">
                {trend.tips.map((tip: string, i: number) => (
                  <li key={i} className="flex gap-3 text-foreground/90">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {trend.gallery.length > 1 && (
            <div className="mt-12">
              <h3 className="mb-4 font-display text-2xl">Gallery</h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {trend.gallery.map((src: string, i: number) => {
                  const indexInAll = allImages.indexOf(src);
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setLightboxIndex(indexInAll >= 0 ? indexInAll : 0);
                        setIsLightboxOpen(true);
                      }}
                      className="group relative block w-full overflow-hidden rounded-xl aspect-[4/5] text-left focus:outline-none cursor-zoom-in"
                    >
                      <img
                        src={src}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/15 opacity-0 transition group-hover:opacity-100 flex items-center justify-center">
                        <Eye className="h-5 w-5 text-white/90" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-2">
            {trend.tags.map((t: string) => (
              <span key={t} className="rounded-full bg-secondary/60 px-3 py-1 text-xs text-secondary-foreground">
                #{t}
              </span>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <AdSlot variant="sidebar" />
          <div className="rounded-2xl bg-surface p-6 shadow-soft">
            <div className="text-xs uppercase tracking-widest text-primary">Get inspired</div>
            <h4 className="mt-2 font-display text-xl">Weekly trend digest</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              The best of Pakistani fashion, straight to your inbox.
            </p>
            <Link to="/" className="mt-4 inline-block rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-accent">
              Subscribe
            </Link>
          </div>
        </aside>
      </div>

      {trend.id && <Comments targetType="trend" targetId={trend.id} />}

      {related.length > 0 && (
        <section className="container-page mt-24">
          <h2 className="mb-8 font-display text-3xl">You might also love</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r: Trend) => <TrendCard key={r.slug} trend={r} />)}
          </div>
        </section>
      )}

      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
          {/* Close button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute right-6 top-6 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 focus:outline-none"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Prev button */}
          {allImages.length > 1 && (
            <button
              onClick={showPrev}
              className="absolute left-6 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 focus:outline-none"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Main Image Container */}
          <div className="relative max-h-[85vh] max-w-[90vw] overflow-hidden flex items-center justify-center">
            <img
              src={allImages[lightboxIndex]}
              alt="Fullscreen gallery item"
              className="max-h-[80vh] max-w-[85vw] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
            />
          </div>

          {/* Next button */}
          {allImages.length > 1 && (
            <button
              onClick={showNext}
              className="absolute right-6 z-10 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 focus:outline-none"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Counter indicator */}
          <div className="absolute bottom-6 text-sm text-white/60 font-medium">
            {lightboxIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </article>
  );
}

function TrendNotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-4xl">Trend not found</h1>
      <p className="mt-3 text-muted-foreground">The trend you're looking for doesn't exist.</p>
      <Link to="/trends" className="mt-6 inline-block rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
        Back to trends
      </Link>
    </div>
  );
}
