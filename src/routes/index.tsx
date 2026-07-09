import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { categories, trends, blogPosts, heroImage, SITE } from "@/lib/content";
import { TrendCard } from "@/components/TrendCard";
import { BlogCard } from "@/components/BlogCard";
import { AdSlot } from "@/components/AdSlot";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const featured = trends.slice(0, 3);
  const trending = trends.slice(3, 7);
  const latestPosts = blogPosts.slice(0, 3);
  const gallery = trends.slice(0, 6);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero">
        <div className="container-page grid gap-12 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-surface/60 px-4 py-1.5 text-xs font-medium tracking-wide text-primary backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Fresh · Pakistani · Curated
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Where <span className="text-gradient">Pakistani style</span> finds its voice.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              {SITE.name} is the destination for lawn drops, bridal couture, everyday elegance
              and the trends shaping how Pakistani women dress today.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/trends"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground shadow-elegant transition hover:bg-accent"
              >
                Explore trends
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-7 py-3.5 text-sm font-medium transition hover:border-primary hover:text-primary"
              >
                Read the journal
              </Link>
            </div>
            <div className="mt-10 flex gap-8">
              {[
                { k: "12+", v: "Trends" },
                { k: "8", v: "Categories" },
                { k: "10+", v: "Editorials" },
              ].map((s) => (
                <div key={s.v}>
                  <div className="font-display text-3xl text-foreground">{s.k}</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-6 -left-6 h-40 w-40 rounded-full bg-secondary/60 blur-3xl" />
            <div className="absolute -bottom-6 -right-6 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />
            <div className="relative overflow-hidden rounded-3xl shadow-elegant">
              <img
                src={heroImage}
                alt="Pakistani lawn suit editorial"
                width={1600}
                height={1200}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-page py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary">Discover</p>
            <h2 className="mt-2 font-display text-4xl text-foreground md:text-5xl">Browse categories</h2>
          </div>
          <Link to="/trends" className="hidden text-sm text-primary hover:underline md:inline">
            All trends →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/trends"
              hash={c.slug}
              className="group relative overflow-hidden rounded-2xl shadow-soft transition hover:shadow-elegant"
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <div className="font-display text-xl">{c.name}</div>
                <div className="mt-1 text-xs opacity-80 line-clamp-2">{c.blurb}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="container-page">
        <AdSlot variant="top-banner" />
      </div>

      {/* FEATURED TRENDS */}
      <section className="bg-blush py-20">
        <div className="container-page">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary">Editor's Picks</p>
              <h2 className="mt-2 font-display text-4xl text-foreground md:text-5xl">
                Featured this month
              </h2>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {featured.map((t, i) => (
              <TrendCard key={t.slug} trend={t} priority={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING */}
      <section className="container-page py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
              <TrendingUp className="h-3.5 w-3.5" /> Trending this week
            </p>
            <h2 className="mt-2 font-display text-4xl text-foreground md:text-5xl">
              What everyone is styling
            </h2>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trending.map((t) => <TrendCard key={t.slug} trend={t} />)}
        </div>
      </section>

      {/* BLOG */}
      <section className="bg-blush py-20">
        <div className="container-page">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary">Journal</p>
              <h2 className="mt-2 font-display text-4xl text-foreground md:text-5xl">
                From the editors
              </h2>
            </div>
            <Link to="/blog" className="hidden text-sm text-primary hover:underline md:inline">
              All articles →
            </Link>
          </div>
          <div className="grid gap-5">
            {latestPosts.map((p) => <BlogCard key={p.slug} post={p} />)}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="container-page py-20">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-widest text-primary">@trendlibas</p>
          <h2 className="mt-2 font-display text-4xl text-foreground md:text-5xl">
            The inspiration feed
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Follow along for daily fashion moments.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
          {gallery.map((t) => (
            <Link
              key={t.slug}
              to="/trends/$slug"
              params={{ slug: t.slug }}
              className="group aspect-square overflow-hidden rounded-xl"
            >
              <img
                src={t.image}
                alt={t.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
