import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Clock,
  Package,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { resolveImage, SITE } from "@/lib/content";
import {
  fetchFeaturedProducts,
  fetchNewArrivals,
  fetchProducts,
  fetchTrendingProducts,
} from "@/lib/ecommerce-data";
import { ProductCard } from "@/components/ProductCard";
import { buildPageHead, faqSchema } from "@/lib/seo";

import lawnBanner from "@/assets/hero-lawn-summer.png";
import bridalBanner from "@/assets/hero-campaign-2026.png";
import festiveBanner from "@/assets/hero-festive-edit.png";
import casualBanner from "@/assets/hero-casual-comfort.png";

export const Route = createFileRoute("/")({
  head: () =>
    buildPageHead({
      title: `${SITE.name} — ${SITE.tagline}`,
      description: SITE.description,
      path: "/",
      keywords: "Pahraan, Pakistani women's fashion, lawn, bridal, luxury pret",
      jsonLd: faqSchema([
        {
          question: "Does Pahraan ship nationwide in Pakistan?",
          answer: "Yes. We deliver across Pakistan with standard and express courier options.",
        },
        {
          question: "What is your return policy?",
          answer: "Unworn pieces with tags may be returned within 7 days of delivery.",
        },
        {
          question: "Are products authentic Pahraan designs?",
          answer: "Every piece is curated or crafted for the Pahraan atelier aesthetic.",
        },
      ]),
    }),
  loader: async () => {
    const [featured, trending, newArrivals, all] = await Promise.all([
      fetchFeaturedProducts(),
      fetchTrendingProducts(),
      fetchNewArrivals(),
      fetchProducts(),
    ]);
    return { featured, trending, newArrivals, all };
  },
  component: Home,
});

const SHOP_CATEGORIES = [
  {
    slug: "luxury-pret",
    name: "Luxury Pret",
    image: "cat-party",
    blurb: "Ready-to-wear elegance for evenings and celebrations.",
  },
  {
    slug: "lawn-suits",
    name: "Lawn Collection",
    image: "cat-lawn",
    blurb: "Breathable prints for Pakistan summers.",
  },
  {
    slug: "casual-wear",
    name: "Casual Wear",
    image: "cat-university",
    blurb: "Everyday chic for campus and city days.",
  },
  {
    slug: "party-wear",
    name: "Party Wear",
    image: "cat-party",
    blurb: "Statement silhouettes that turn heads.",
  },
  {
    slug: "formal-wear",
    name: "Formal Wear",
    image: "cat-beige-dress",
    blurb: "Refined pieces for dinners and events.",
  },
  {
    slug: "bridal-wear",
    name: "Bridal Collection",
    image: "cat-bridal",
    blurb: "Heirloom couture in reds, golds and rose.",
  },
];

const COLLECTION_BANNERS = [
  {
    title: "Luxury Pret",
    subtitle: "Evening-ready polish",
    image: festiveBanner,
    search: { category: "luxury-pret" },
  },
  {
    title: "Summer Bloom",
    subtitle: "Lawn & light layers",
    image: lawnBanner,
    search: { category: "lawn-suits" },
  },
  {
    title: "Everyday Elegance",
    subtitle: "Soft everyday wear",
    image: casualBanner,
    search: { category: "casual-wear" },
  },
  {
    title: "Festive Edit",
    subtitle: "Celebration looks",
    image: festiveBanner,
    search: { category: "eid-collections" },
  },
  {
    title: "Casual Comfort",
    subtitle: "Easy luxury basics",
    image: casualBanner,
    search: { tag: "new-arrivals" },
  },
];

function useFlashCountdown(hours = 18) {
  const [endsAt] = useState(() => Date.now() + hours * 60 * 60 * 1000);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, endsAt - now);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1000);
  return { h, m, s };
}

function Home() {
  const { featured, trending, newArrivals, all } = Route.useLoaderData();
  const countdown = useFlashCountdown(18);
  const [parallax, setParallax] = useState(0);

  useEffect(() => {
    const onScroll = () => setParallax(Math.min(40, window.scrollY * 0.08));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of all) {
      map[p.category] = (map[p.category] || 0) + 1;
    }
    return map;
  }, [all]);

  const saleProducts = useMemo(
    () => all.filter((p) => p.compare_at_price && p.compare_at_price > p.price).slice(0, 4),
    [all],
  );

  const flashProduct = saleProducts[0] || featured[0] || newArrivals[0];

  return (
    <div className="font-body text-foreground bg-background pb-16 md:pb-0">
      {/* CONVERSION HERO — full dress on right, text on left */}
      <section className="relative min-h-[100svh] overflow-hidden bg-[#FFF9FB] md:min-h-[92vh]">
        <div
          className="absolute inset-0 will-change-transform"
          style={{ transform: `translate3d(0, ${parallax * 0.5}px, 0)` }}
        >
          <img
            src={bridalBanner}
            alt="Pahraan bridal collection — full dress"
            className="h-full w-full object-cover object-[88%_center] sm:object-[85%_center] md:object-right"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          {/* Soft text readability only — does not cover the dress on the right */}
          <div
            className="absolute inset-y-0 left-0 w-[70%] max-w-xl bg-gradient-to-r from-[#FFF9FB]/90 via-[#FFF9FB]/45 to-transparent md:w-[42%] md:max-w-none md:from-[#FFF9FB]/70 md:via-[#FFF9FB]/20"
            aria-hidden
          />
        </div>

        <div className="pointer-events-none absolute -left-16 top-28 h-36 w-36 rounded-full bg-secondary/25 blur-3xl animate-float" />

        <div className="container-page relative z-10 flex min-h-[100svh] flex-col justify-center py-24 md:min-h-[92vh] md:py-28">
          <div className="max-w-md animate-fade-up md:max-w-lg">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary shadow-soft backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Summer Collection 2026
            </span>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Where Pakistani Fashion Meets <span className="text-gradient">Timeless Elegance</span>
            </h1>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
              Discover lawn, luxury pret, and bridal couture crafted for the modern Pakistani woman
              — soft silhouettes, heritage embroidery, effortless polish.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-elegant transition hover:bg-accent"
              >
                Shop Collection
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/shop"
                search={{ tag: "new-arrivals" }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-foreground backdrop-blur transition hover:border-primary hover:text-primary"
              >
                Explore New Arrivals
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-2.5">
              {[
                { icon: Truck, label: "Free Shipping" },
                { icon: Package, label: "Cash on Delivery" },
                { icon: RotateCcw, label: "Easy Returns" },
                { icon: ShieldCheck, label: "Secure Checkout" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-white/85 px-3 py-1.5 text-[11px] font-semibold text-foreground/80 shadow-soft backdrop-blur"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-page py-20 md:py-24">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="animate-fade-up">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Shop by category
            </p>
            <h2 className="mt-2 font-display text-3xl text-foreground md:text-5xl">
              Curated closets
            </h2>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SHOP_CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/shop"
              search={{ category: c.slug }}
              className="group relative overflow-hidden rounded-3xl border border-border/40 shadow-soft transition hover:shadow-elegant"
            >
              <div className="aspect-[4/5] overflow-hidden bg-muted">
                <img
                  src={resolveImage(c.image)}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#F8BBD0]">
                  {categoryCounts[c.slug] || 0} pieces
                </p>
                <h3 className="mt-1 font-display text-2xl font-semibold">{c.name}</h3>
                <p className="mt-1 text-xs text-white/80 line-clamp-2">{c.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FLASH SALE */}
      {flashProduct && (
        <section className="border-y border-border/50 bg-blush py-16 md:py-20">
          <div className="container-page grid items-center gap-10 lg:grid-cols-2">
            <div className="relative overflow-hidden rounded-[2rem] border border-border/40 bg-white shadow-elegant">
              <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-soft animate-float">
                  Flash Sale
                </span>
                {flashProduct.compare_at_price && (
                  <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold text-primary shadow-soft">
                    {Math.round(
                      ((flashProduct.compare_at_price - flashProduct.price) /
                        flashProduct.compare_at_price) *
                        100,
                    )}
                    % OFF
                  </span>
                )}
              </div>
              <img
                src={resolveImage(flashProduct.images[0])}
                alt={flashProduct.title}
                className="aspect-[4/5] w-full object-cover md:aspect-[5/4]"
              />
            </div>

            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                <Clock className="h-3.5 w-3.5" /> Limited time
              </p>
              <h2 className="mt-3 font-display text-3xl text-foreground md:text-5xl">
                Summer Sale Drop
              </h2>
              <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
                Premium lawn and pret pieces at atelier prices — while stock lasts.
              </p>

              <div className="mt-6 flex gap-2">
                {[
                  ["Hrs", countdown.h],
                  ["Min", countdown.m],
                  ["Sec", countdown.s],
                ].map(([label, value]) => (
                  <div
                    key={label as string}
                    className="min-w-[4.5rem] rounded-2xl border border-border/60 bg-white px-3 py-3 text-center shadow-soft"
                  >
                    <div className="font-display text-2xl font-bold text-primary">
                      {String(value).padStart(2, "0")}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      {label as string}
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs font-semibold text-foreground/80">
                {flashProduct.title}
                {flashProduct.stock_status === "low_stock" && (
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                    Limited stock
                  </span>
                )}
              </p>

              <Link
                to="/shop"
                search={{ tag: "sale" }}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-elegant hover:bg-accent transition"
              >
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* NEW ARRIVALS */}
      <section className="container-page py-20 md:py-24">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Just dropped</p>
          <h2 className="mt-2 font-display text-3xl text-foreground md:text-5xl">New Arrivals</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Fresh lawn, pret, and festive pieces curated for the season.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(newArrivals.length ? newArrivals : featured).slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/shop"
            search={{ tag: "new-arrivals" }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-7 py-3 text-xs font-semibold shadow-soft transition hover:border-primary hover:text-primary"
          >
            View all new arrivals <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* FEATURED COLLECTIONS */}
      <section className="bg-blush/60 border-y border-border/40 py-16 md:py-20">
        <div className="container-page">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Collections</p>
            <h2 className="mt-2 font-display text-3xl text-foreground md:text-4xl">
              Featured edits
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {COLLECTION_BANNERS.map((banner) => (
              <Link
                key={banner.title}
                to="/shop"
                search={banner.search}
                className="group relative h-56 w-[78vw] shrink-0 snap-start overflow-hidden rounded-3xl border border-border/40 shadow-soft sm:w-[340px] md:h-64"
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#F8BBD0]">
                    {banner.subtitle}
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-semibold">{banner.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRENDING / EDITOR PICKS */}
      <section className="container-page py-20">
        <div className="mb-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Bestsellers</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">Trending now</h2>
          </div>
          <Link
            to="/shop"
            search={{ tag: "best-sellers" }}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Shop bestsellers →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(trending.length ? trending : featured).slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* TRUST + REVIEWS */}
      <section className="border-t border-border/40 bg-blush py-16">
        <div className="container-page">
          <div className="mb-10 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Star,
                title: "Loved by thousands",
                desc: "Verified buyers across Karachi, Lahore & Islamabad.",
              },
              {
                icon: Truck,
                title: "Nationwide delivery",
                desc: "Flat PKR 250 — free over PKR 5,000.",
              },
              {
                icon: ShieldCheck,
                title: "Secure payments",
                desc: "COD, bank transfer, and card-ready checkout.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-3 rounded-3xl border border-border/40 bg-white p-5 shadow-soft"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
