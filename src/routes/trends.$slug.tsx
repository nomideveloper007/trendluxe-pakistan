import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Heart, Share2, Eye, Calendar, ArrowLeft } from "lucide-react";
import { getTrend, getCategory, relatedTrends, SITE } from "@/lib/content";
import { TrendCard } from "@/components/TrendCard";
import { AdSlot } from "@/components/AdSlot";
import { LikeButton } from "@/components/LikeButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { toast } from "sonner";

export const Route = createFileRoute("/trends/$slug")({
  loader: ({ params }) => {
    const trend = getTrend(params.slug);
    if (!trend) throw notFound();
    return { trend };
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
  const { trend } = Route.useLoaderData();
  const cat = getCategory(trend.category);
  const related = relatedTrends(trend);

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
        <div className="text-xs uppercase tracking-widest text-primary">{cat?.name}</div>
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
        <div className="overflow-hidden rounded-3xl shadow-elegant">
          <img src={trend.image} alt={trend.title} className="h-full w-full object-cover" />
        </div>
      </div>

      {/* Action bar */}
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

          {trend.gallery.length > 1 && (
            <div className="mt-12">
              <h3 className="mb-4 font-display text-2xl">Gallery</h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {trend.gallery.map((src: string, i: number) => (
                  <div key={i} className="overflow-hidden rounded-xl">
                    <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </div>
                ))}
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

      {related.length > 0 && (
        <section className="container-page mt-24">
          <h2 className="mb-8 font-display text-3xl">You might also love</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => <TrendCard key={r.slug} trend={r} />)}
          </div>
        </section>
      )}
    </article>
  );
}

function ActionButton({ active, icon, label, onClick }: { active?: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface text-foreground hover:border-primary hover:text-primary"
      }`}
    >
      {icon} {label}
    </button>
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
