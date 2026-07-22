import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowRight, Sparkles, Star, ShieldCheck, Award, Truck, ChevronLeft, ChevronRight } from "lucide-react";
import { categories, heroImage, SITE } from "@/lib/content";
import { fetchFeaturedProducts, fetchTrendingProducts, fetchNewArrivals } from "@/lib/ecommerce-data";
import { ProductCard } from "@/components/ProductCard";

import lawnBanner from "@/assets/lawn_banner.png";
import bridalBanner from "@/assets/bridal_banner.png";
import festiveBanner from "@/assets/festive_banner.png";
import casualBanner from "@/assets/casual_banner.png";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [featured, trending, newArrivals] = await Promise.all([
      fetchFeaturedProducts(),
      fetchTrendingProducts(),
      fetchNewArrivals()
    ]);
    return { featured, trending, newArrivals };
  },
  component: Home,
});

const HERO_SLIDES = [
  {
    tag: "Premium Pakistani Wear",
    title: "Where quiet luxury meets heritage.",
    titleHighlight: "quiet luxury",
    desc: "Explore Pahraan's curated designer lawn collections, premium ready-to-wear pret, and mastercrafted bridal couture. Bespoke elegance for the modern woman.",
    image: lawnBanner,
    buttonText: "Shop Storefront",
    buttonLink: "/shop",
    buttonSearch: {},
    stats: [
      { k: "1,500+", v: "Happy Buyers" },
      { k: "Premium", v: "Lawn & Silk" },
      { k: "Flat Rate", v: "Pak Delivery" },
    ]
  },
  {
    tag: "Signature Bridal Couture",
    title: "Exquisite craftsmanship, bespoke fit.",
    titleHighlight: "bespoke fit",
    desc: "Experience the timeless grandeur of gold kora and pearl handwork on custom-fitted heavy velvet lehengas and wedding couture.",
    image: bridalBanner,
    buttonText: "Shop Bridal Couture",
    buttonLink: "/shop",
    buttonSearch: { category: "bridal-wear" },
    stats: [
      { k: "Custom", v: "Tailoring" },
      { k: "Handwork", v: "Tilla & Kora" },
      { k: "Free", v: "Luxury Packing" },
    ]
  },
  {
    tag: "Luxury Festive Wear",
    title: "Enchanting shades for celebrations.",
    titleHighlight: "celebrations",
    desc: "Step into seasonal festivities with our hand-worked raw silk ensembles, shadow thread embroidery, and tilla sitara luxury pret sets.",
    image: festiveBanner,
    buttonText: "Shop Luxury Pret",
    buttonLink: "/shop",
    buttonSearch: { category: "luxury-pret" },
    stats: [
      { k: "Raw Silk", v: "Festive wear" },
      { k: "Shadow", v: "Work tilla" },
      { k: "Fast", v: "Nationwide Shipping" },
    ]
  },
  {
    tag: "Everyday Chic Lawn",
    title: "Comfortable elegance for daily life.",
    titleHighlight: "daily life",
    desc: "Discover premium unstitched two-piece and three-piece lawn suits tailored for your everyday workplace and casual styling statements.",
    image: casualBanner,
    buttonText: "Shop Casual Lawn",
    buttonLink: "/shop",
    buttonSearch: { category: "casual-wear" },
    stats: [
      { k: "100% Pure", v: "Premium Cotton" },
      { k: "Lightweight", v: "Breathable" },
      { k: "Unstitched", v: "Designer Sets" },
    ]
  }
];

function Home() {
  const { featured, trending, newArrivals } = Route.useLoaderData();
  const [activeTab, setActiveTab] = useState<"new" | "featured" | "trending">("new");
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play timer for hero slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500); // Transitions every 5.5 seconds
    return () => clearInterval(timer);
  }, []);

  const displayProducts = 
    activeTab === "new" 
      ? newArrivals 
      : activeTab === "featured" 
        ? featured 
        : trending;

  const tabTitle = 
    activeTab === "new"
      ? "Just Dropped"
      : activeTab === "featured"
        ? "Editor's Pick"
        : "Trending Right Now";

  const tabSubtitle = 
    activeTab === "new"
      ? "Our latest unstitched and ready-to-wear drops, crafted from premium lawn and silks."
      : activeTab === "featured"
        ? "Hand-picked luxury couture featuring mastercraft tilla, kora, and Sitara handwork."
        : "The seasonal favorites flying off the shelves across Lahore, Karachi, and Islamabad.";

  return (
    <div className="font-body text-foreground bg-background">
      {/* FULL-BLEED HERO CAROUSEL */}
      <section className="group relative w-full h-[580px] md:h-[680px] overflow-hidden bg-black">
        {/* Slides Container */}
        <div className="relative w-full h-full">
          {HERO_SLIDES.map((s, idx) => {
            const isActive = idx === currentSlide;
            return (
              <div
                key={idx}
                className={`absolute inset-0 w-full h-full transition-all duration-1000 ${
                  isActive 
                    ? "opacity-100 scale-100 z-10 pointer-events-auto" 
                    : "opacity-0 scale-105 z-0 pointer-events-none"
                }`}
              >
                {/* Background image */}
                <img
                  src={s.image}
                  alt={s.title}
                  loading={idx === 0 ? "eager" : "lazy"}
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
                
                {/* Overlay gradient mask */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25 md:from-black/80 md:via-black/40 md:to-transparent" />
                
                {/* Content Overlay */}
                <div className="container-page h-full flex flex-col justify-center relative z-10 text-white select-none">
                  <div className="max-w-2xl">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#F8BBD0]/30 bg-black/45 px-4 py-1.5 text-xs font-semibold tracking-wider text-[#F8BBD0] backdrop-blur">
                      <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" /> {s.tag}
                    </span>
                    <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white">
                      {s.title.split(s.titleHighlight)[0]}
                      <span className="text-[#F8BBD0]">{s.titleHighlight}</span>
                      {s.title.split(s.titleHighlight)[1]}
                    </h1>
                    <p className="mt-6 text-sm sm:text-base md:text-lg text-white/90 leading-relaxed max-w-lg">
                      {s.desc}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4">
                      <Link
                        to={s.buttonLink as any}
                        search={s.buttonSearch}
                        className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-elegant transition hover:bg-accent cursor-pointer"
                      >
                        {s.buttonText}
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </Link>
                      <Link
                        to="/about"
                        className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 hover:bg-white/20 hover:border-white px-8 py-4 text-xs font-bold uppercase tracking-wider text-white backdrop-blur transition"
                      >
                        Our Story
                      </Link>
                    </div>
                    
                    {/* Stats banner row */}
                    <div className="mt-12 flex gap-8 border-t border-white/15 pt-6">
                      {s.stats.map((st) => (
                        <div key={st.v}>
                          <div className="font-display text-2xl sm:text-3xl font-bold text-white">{st.k}</div>
                          <div className="text-[9px] uppercase tracking-widest text-[#F8BBD0] mt-0.5 font-extrabold">{st.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel slide actions (Previous / Next arrows overlay) */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full border border-white/20 bg-black/35 hover:bg-primary text-white flex items-center justify-center backdrop-blur transition opacity-0 group-hover:opacity-100 md:opacity-50 hover:scale-105 cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full border border-white/20 bg-black/35 hover:bg-primary text-white flex items-center justify-center backdrop-blur transition opacity-0 group-hover:opacity-100 md:opacity-50 hover:scale-105 cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlide 
                  ? "w-7.5 bg-primary" 
                  : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* SHOP BY CATEGORIES SECTION */}
      <section className="container-page py-24">
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary font-bold">Curated Closets</p>
            <h2 className="mt-2 font-display text-4xl text-foreground md:text-5xl">Browse Categories</h2>
          </div>
          <Link to="/shop" className="text-sm text-primary hover:underline font-semibold shrink-0">
            View All Categories →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/shop"
              search={{ category: c.slug }}
              className="group relative overflow-hidden rounded-2xl shadow-soft transition hover:shadow-elegant border border-border/30 cursor-pointer"
            >
              <div className="aspect-[4/5] overflow-hidden bg-muted">
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <span className="inline-block bg-[#F8BBD0]/10 border border-[#F8BBD0]/20 rounded-full px-2.5 py-0.5 text-[9px] uppercase font-bold tracking-wider mb-2">
                  Atelier Drop
                </span>
                <div className="font-display text-2xl font-bold">{c.name}</div>
                <div className="mt-1.5 text-xs opacity-90 line-clamp-2 leading-relaxed font-light">{c.blurb}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TRUST FACTORS SECTION */}
      <section className="bg-blush border-y border-border/40 py-12 my-6">
        <div className="container-page grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Award,
              title: "Heritage Mastercraft",
              desc: "100% hand-crafted tilla, zardozi work, and sitara details designed on premium unstitched fabrics.",
            },
            {
              icon: ShieldCheck,
              title: "Bespoke Size Options",
              desc: "From XS to XXL, we offer size charts tailored to Pakistani fit parameters with premium stitch options.",
            },
            {
              icon: Truck,
              title: "Nationwide Safe Delivery",
              desc: "Flat-rate PKR 250 delivery across Pakistan. Free shipping on all cart totals over PKR 5,000.",
            },
          ].map((t, idx) => (
            <div key={idx} className="flex gap-4 items-start">
              <span className="p-3 bg-white rounded-2xl text-primary shadow-soft shrink-0 border border-primary/5">
                <t.icon className="h-5 w-5" />
              </span>
              <div>
                <h4 className="font-display font-bold text-base text-foreground">{t.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ATELIER CATALOG TABS SECTION */}
      <section className="container-page py-20">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-primary font-bold">
            <Sparkles className="h-3.5 w-3.5 fill-primary" /> Curated Catalog
          </span>
          <h2 className="mt-2 font-display text-4xl text-foreground md:text-5xl">Featured Collections</h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Switch between our collections to find premium lawn ensembles, wedding bridal lehengas, and designer pret wear.
          </p>

          {/* Interactive Collection Selector tabs */}
          <div className="flex items-center justify-center gap-2 mt-8 border-b border-border/40 max-w-md mx-auto pb-0.5">
            {[
              { id: "new", label: "New Arrivals" },
              { id: "featured", label: "Editor's picks" },
              { id: "trending", label: "Trending" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 text-xs font-semibold tracking-wider uppercase transition cursor-pointer relative ${
                  activeTab === tab.id
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Context detail */}
        <div className="mb-8 text-center max-w-xl mx-auto">
          <span className="text-[10px] uppercase font-bold tracking-widest text-primary/80 bg-primary/5 border border-primary/10 px-3 py-1 rounded-full">
            {tabTitle}
          </span>
          <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed italic">{tabSubtitle}</p>
        </div>

        {/* Dynamic Display Grid */}
        {displayProducts.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-16 bg-white border border-dashed rounded-3xl shadow-soft">
            No products loaded for this collection.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayProducts.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white hover:border-primary px-8 py-3.5 text-xs font-semibold text-foreground hover:text-primary transition shadow-soft cursor-pointer"
          >
            Explore Complete Catalog ({newArrivals.length + featured.length} items) <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="bg-blush border-t border-border/40 py-20">
        <div className="container-page">
          <div className="mb-12 text-center">
            <p className="text-xs uppercase tracking-widest text-primary font-bold">Reviews</p>
            <h2 className="mt-2 font-display text-4xl text-foreground md:text-5xl">Atelier Stories</h2>
            <p className="text-xs text-muted-foreground mt-2">What verified buyers are saying about Pahraan's fabrics and fit.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Amna Khan",
                city: "Karachi",
                stars: 5,
                title: "Premium Fabric Quality",
                comment: "The embroidered lawn is extremely soft, light, and premium. Best for Karachi summers. Sizing guide is 100% accurate.",
              },
              {
                name: "Sana Ahmed",
                city: "Lahore",
                stars: 5,
                title: "Bespoke Bridal Couture",
                comment: "Ordered a custom bridal velvet lehenga. The hand-worked tilla detail is stunning. Arrived on time with safe wooden packaging.",
              },
              {
                name: "Zainab Malik",
                city: "Islamabad",
                stars: 4,
                title: "Fast Shipping & Packaging",
                comment: "Highly impressed by the flat-rate delivery speed. Ordered on Sunday and arrived in Islamabad by Tuesday evening. Very elegant boxes.",
              },
            ].map((testi, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-border/50 shadow-soft flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex text-amber-400">
                    {Array.from({ length: testi.stars }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <h4 className="font-bold text-sm text-foreground">{testi.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">"{testi.comment}"</p>
                </div>
                <div className="mt-6 pt-3 border-t border-border/30 flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>{testi.name}</span>
                  <span className="text-primary">{testi.city}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
