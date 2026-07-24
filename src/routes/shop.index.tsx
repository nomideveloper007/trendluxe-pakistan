import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown, RefreshCw, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { fetchProducts } from "@/lib/ecommerce-data";
import { ProductCard } from "@/components/ProductCard";
import { NewsletterForm } from "@/components/NewsletterForm";
import { LuxurySelect } from "@/components/LuxurySelect";
import { resolveImage } from "@/lib/content";
import { breadcrumbSchema, buildPageHead } from "@/lib/seo";

import lawnBanner from "@/assets/hero-lawn-summer.png";
import festiveBanner from "@/assets/hero-festive-edit.png";
import bridalBanner from "@/assets/hero-campaign-2026.png";
import casualBanner from "@/assets/hero-casual-comfort.png";

type ShopSearch = {
  category?: string;
  tag?: string;
  search?: string;
};

export const Route = createFileRoute("/shop/")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    category: search.category as string | undefined,
    tag: search.tag as string | undefined,
    search: search.search as string | undefined,
  }),
  head: () =>
    buildPageHead({
      title: `Shop Luxury Pakistani Fashion`,
      description:
        "Browse Pahraan lawn suits, bridal wear, party pret, and embroidered collections. Free nationwide shipping on select orders.",
      path: "/shop",
      keywords: "shop Pakistani fashion, lawn suits, bridal, pret, Pahraan",
      jsonLd: breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Shop", path: "/shop" },
      ]),
    }),
  component: ShopIndexPage,
});

const FABRICS = ["Cotton", "Lawn", "Silk", "Organza", "Velvet", "Georgette", "Chiffon"];
const EMBROIDERIES = [
  "None",
  "Chikankari Shadow Work",
  "Tilla & Zardozi Handwork",
  "Tilla & Sitara Work",
  "Gold Kora & Pearl Handwork",
  "Shadow Thread Embroidery",
];
const COLORS = [
  "White",
  "Black",
  "Pink",
  "Red",
  "Blue",
  "Teal",
  "Lilac",
  "Lavender",
  "Beige",
  "Green",
  "Maroon",
  "Gold",
];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const OCCASIONS = [
  { id: "", label: "All Occasions" },
  { id: "casual", label: "Casual" },
  { id: "party", label: "Party" },
  { id: "formal", label: "Formal" },
  { id: "bridal", label: "Bridal" },
  { id: "festive", label: "Festive" },
];

const CATEGORIES = [
  { slug: "all", name: "All" },
  { slug: "luxury-pret", name: "Luxury Pret" },
  { slug: "lawn-suits", name: "Lawn" },
  { slug: "casual-wear", name: "Casual Wear" },
  { slug: "formal-wear", name: "Formal Wear" },
  { slug: "party-wear", name: "Party Wear" },
  { slug: "bridal-wear", name: "Bridal" },
  { slug: "eid-collections", name: "Festive" },
  { slug: "pret-wear", name: "Ready To Wear" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popularity", label: "Best Selling" },
  { value: "price_low_high", label: "Price: Low to High" },
  { value: "price_high_low", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "popular", label: "Most Popular" },
];

const TRENDING = [
  { label: "Luxury Pret", search: { category: "luxury-pret" } },
  { label: "Pastel Lawn", search: { category: "lawn-suits" } },
  { label: "Bridal Wear", search: { category: "bridal-wear" } },
  { label: "Casual Collection", search: { category: "casual-wear" } },
  { label: "Summer Collection", search: { tag: "new-arrivals" } },
];

const CAMPAIGN_BANNERS = [
  {
    afterIndex: 3,
    title: "Summer Bloom",
    subtitle: "Light lawn & pastel elegance",
    image: lawnBanner,
    search: { category: "lawn-suits" },
  },
  {
    afterIndex: 7,
    title: "Festive Edit",
    subtitle: "Celebration-ready pret",
    image: festiveBanner,
    search: { category: "eid-collections" },
  },
  {
    afterIndex: 11,
    title: "Luxury Pret",
    subtitle: "Evening polish, boutique finish",
    image: bridalBanner,
    search: { category: "luxury-pret" },
  },
  {
    afterIndex: 15,
    title: "Wedding Collection",
    subtitle: "Bridal couture & heirloom reds",
    image: bridalBanner,
    search: { category: "bridal-wear" },
  },
];

const PAGE_SIZE = 8;

function colorDot(color: string) {
  const c = color.toLowerCase();
  if (c === "white") return "#ffffff";
  if (c === "black") return "#111111";
  if (c === "pink") return "#F8BBD0";
  if (c === "red") return "#C2185B";
  if (c === "beige") return "#f5f5dc";
  if (c === "maroon") return "#800000";
  if (c === "gold") return "#d4af37";
  if (c === "teal") return "#008080";
  if (c === "lilac" || c === "lavender") return "#c8a2c8";
  return color;
}

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[#F8BBD0]/30 bg-white shadow-soft animate-pulse">
      <div className="aspect-[3/4] bg-[#FFF5F8]" />
      <div className="space-y-3 p-4">
        <div className="h-2.5 w-20 rounded-full bg-secondary/40" />
        <div className="h-4 w-[80%] rounded-full bg-secondary/50" />
        <div className="h-3 w-1/2 rounded-full bg-secondary/30" />
        <div className="h-10 w-full rounded-full bg-secondary/25" />
      </div>
    </div>
  );
}

type RecentItem = {
  slug: string;
  title: string;
  price: number;
  image: string;
};

function ShopIndexPage() {
  const searchParams = Route.useSearch();

  const [category, setCategory] = useState(searchParams.category || "all");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedFabric, setSelectedFabric] = useState("");
  const [selectedEmbroidery, setSelectedEmbroidery] = useState("");
  const [selectedOccasion, setSelectedOccasion] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200000);
  const [sorting, setSorting] = useState("newest");
  const [search, setSearch] = useState(searchParams.search || "");
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  const [onlyNew, setOnlyNew] = useState(searchParams.tag === "new-arrivals");
  const [onlyBestSeller, setOnlyBestSeller] = useState(searchParams.tag === "best-sellers");
  const [minRating, setMinRating] = useState(0);
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentItem[]>([]);
  const [filterStuck, setFilterStuck] = useState(false);

  const filterBarRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCategory(searchParams.category || "all");
    if (searchParams.search) setSearch(searchParams.search);
    if (searchParams.tag === "new-arrivals") setOnlyNew(true);
    if (searchParams.tag === "best-sellers") setOnlyBestSeller(true);
    if (searchParams.tag === "sale") setOnlyDiscount(true);
  }, [searchParams.category, searchParams.search, searchParams.tag]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pahraan_recently_viewed");
      if (raw) {
        const list = JSON.parse(raw) as RecentItem[];
        setRecentlyViewed(list.slice(0, 8));
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const el = filterBarRef.current;
      if (!el) return;
      setFilterStuck(el.getBoundingClientRect().top <= 72);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const tagForFetch = useMemo(() => {
    if (onlyNew) return "new-arrivals";
    if (onlyBestSeller) return "best-sellers";
    if (onlyDiscount) return "sale";
    return searchParams.tag;
  }, [onlyNew, onlyBestSeller, onlyDiscount, searchParams.tag]);

  const productsQ = useQuery({
    queryKey: [
      "products",
      "shop",
      category,
      selectedSize,
      selectedColor,
      selectedFabric,
      selectedEmbroidery,
      minPrice,
      maxPrice,
      sorting,
      search,
      tagForFetch,
    ],
    queryFn: () =>
      fetchProducts({
        category: category === "all" ? undefined : category,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
        fabric: selectedFabric || undefined,
        embroidery: selectedEmbroidery || undefined,
        minPrice: minPrice > 0 ? minPrice : undefined,
        maxPrice: maxPrice < 200000 ? maxPrice : undefined,
        sorting: sorting === "popular" ? "popularity" : sorting,
        search: search || undefined,
        tag: tagForFetch || undefined,
      }),
  });

  const filteredProducts = useMemo(() => {
    let list = productsQ.data ?? [];
    if (showInStockOnly) list = list.filter((p) => p.stock_status !== "out_of_stock");
    if (onlyDiscount) {
      list = list.filter((p) => p.compare_at_price && p.compare_at_price > p.price);
    }
    if (onlyNew) list = list.filter((p) => p.is_new_arrival);
    if (onlyBestSeller) list = list.filter((p) => p.is_best_seller || p.is_trending);
    if (minRating > 0) list = list.filter((p) => p.rating >= minRating);
    if (selectedOccasion) {
      const map: Record<string, string[]> = {
        casual: ["casual-wear", "university-fashion", "lawn-suits"],
        party: ["party-wear", "pret-wear", "luxury-pret"],
        formal: ["formal-wear", "luxury-pret"],
        bridal: ["bridal-wear"],
        festive: ["eid-collections", "mehndi-outfits", "luxury-pret"],
      };
      const cats = map[selectedOccasion] || [];
      list = list.filter((p) => cats.includes(p.category));
    }
    return list;
  }, [
    productsQ.data,
    showInStockOnly,
    onlyDiscount,
    onlyNew,
    onlyBestSeller,
    minRating,
    selectedOccasion,
  ]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filteredProducts]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, filteredProducts.length));
        }
      },
      { rootMargin: "240px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, filteredProducts.length]);

  const handleResetFilters = useCallback(() => {
    setCategory("all");
    setSelectedSize("");
    setSelectedColor("");
    setSelectedFabric("");
    setSelectedEmbroidery("");
    setSelectedOccasion("");
    setMinPrice(0);
    setMaxPrice(200000);
    setSorting("newest");
    setSearch("");
    setShowInStockOnly(false);
    setOnlyDiscount(false);
    setOnlyNew(false);
    setOnlyBestSeller(false);
    setMinRating(0);
  }, []);

  const activeFiltersCount = [
    selectedSize,
    selectedColor,
    selectedFabric,
    selectedEmbroidery,
    selectedOccasion,
    minPrice > 0,
    maxPrice < 200000,
    search,
    showInStockOnly,
    onlyDiscount,
    onlyNew,
    onlyBestSeller,
    minRating > 0,
    category !== "all",
  ].filter(Boolean).length;

  const FilterPanel = ({ mobile = false }: { mobile?: boolean }) => (
    <div
      className={`grid gap-5 text-xs ${mobile ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-4"}`}
    >
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="SKU, title, fabric..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-border bg-white py-2.5 pl-9 pr-4 outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Size
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => setSelectedSize(selectedSize === sz ? "" : sz)}
              className={`flex h-8 min-w-8 items-center justify-center rounded-full border px-2 text-[10px] font-bold cursor-pointer ${
                selectedSize === sz
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white hover:border-primary"
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Fabric
        </label>
        <LuxurySelect
          value={selectedFabric}
          onValueChange={setSelectedFabric}
          placeholder="All Fabrics"
          options={[
            { value: "", label: "All Fabrics" },
            ...FABRICS.map((fab) => ({ value: fab, label: fab })),
          ]}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Embroidery
        </label>
        <LuxurySelect
          value={selectedEmbroidery}
          onValueChange={setSelectedEmbroidery}
          placeholder="All Embroideries"
          options={[
            { value: "", label: "All Embroideries" },
            ...EMBROIDERIES.map((emb) => ({ value: emb, label: emb })),
          ]}
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Occasion
        </label>
        <LuxurySelect
          value={selectedOccasion}
          onValueChange={setSelectedOccasion}
          placeholder="All Occasions"
          options={OCCASIONS.map((o) => ({ value: o.id, label: o.label }))}
        />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Color
        </label>
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((col) => (
            <button
              key={col}
              type="button"
              onClick={() => setSelectedColor(selectedColor === col ? "" : col)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[9px] font-bold cursor-pointer ${
                selectedColor === col
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border bg-white text-muted-foreground hover:text-foreground"
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full border border-border"
                style={{ backgroundColor: colorDot(col) }}
              />
              {col}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          <span>Price</span>
          <span className="text-primary">
            PKR {minPrice.toLocaleString()} – {maxPrice.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={200000}
          step={1000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <input
          type="range"
          min={0}
          max={200000}
          step={1000}
          value={minPrice}
          onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice))}
          className="w-full accent-primary"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Rating
        </label>
        <LuxurySelect
          value={String(minRating)}
          onValueChange={(v) => setMinRating(Number(v))}
          options={[
            { value: "0", label: "Any rating" },
            { value: "4", label: "4★ & up" },
            { value: "4.5", label: "4.5★ & up" },
          ]}
        />
      </div>

      <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-4">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Availability & badges
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            {
              label: "In Stock",
              on: showInStockOnly,
              toggle: () => setShowInStockOnly((v) => !v),
            },
            {
              label: "On Sale",
              on: onlyDiscount,
              toggle: () => setOnlyDiscount((v) => !v),
            },
            {
              label: "New Arrival",
              on: onlyNew,
              toggle: () => setOnlyNew((v) => !v),
            },
            {
              label: "Best Seller",
              on: onlyBestSeller,
              toggle: () => setOnlyBestSeller((v) => !v),
            },
          ].map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={chip.toggle}
              className={`rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                chip.on
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-foreground/80 hover:border-primary"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-background font-body text-foreground animate-fade-in pb-24 md:pb-0">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0">
          <img
            src={casualBanner}
            alt=""
            className="h-full w-full object-cover object-[70%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFF9FB] via-[#FFF9FB]/85 to-[#FFF9FB]/25" />
        </div>
        <div className="container-page relative py-12 md:py-16">
          <nav className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <span className="text-primary">Shop</span>
          </nav>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary shadow-soft backdrop-blur">
            <Sparkles className="h-3 w-3" /> Collections
          </span>
          <h1 className="mt-3 max-w-xl font-display text-3xl font-bold text-foreground md:text-5xl">
            Shop the Latest Collections
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
            Explore lawn, luxury pret, bridal couture and ready-to-wear — curated for the modern
            Pakistani wardrobe.
          </p>
        </div>
      </section>

      <div className="container-page py-8">
        {/* Categories */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => setCategory(cat.slug)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition cursor-pointer ${
                category === cat.slug
                  ? "bg-primary text-white shadow-soft"
                  : "border border-border bg-white text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Sticky filter bar */}
        <div
          ref={filterBarRef}
          className={`sticky top-16 z-30 -mx-1 mb-5 rounded-[20px] border px-3 py-3 transition-all duration-300 lg:top-[4.25rem] ${
            filterStuck
              ? "border-[#F8BBD0]/50 bg-white/95 shadow-elegant backdrop-blur-xl"
              : "border-border/40 bg-white/80 shadow-soft backdrop-blur"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setDesktopFiltersOpen((v) => !v)}
                className={`hidden items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition cursor-pointer md:inline-flex ${
                  desktopFiltersOpen
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-white hover:border-primary"
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" /> Clear Filters
                </button>
              )}

              <p className="text-xs font-semibold text-muted-foreground">
                <span className="text-foreground">{filteredProducts.length}</span> results
              </p>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
              <LuxurySelect
                value={sorting}
                onValueChange={setSorting}
                size="sm"
                className="w-[180px]"
                options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              />
            </div>
          </div>

          {/* Desktop expanded filters */}
          {desktopFiltersOpen && (
            <div className="mt-4 hidden border-t border-border/40 pt-4 md:block animate-fade-in">
              <FilterPanel />
            </div>
          )}
        </div>

        {/* Grid */}
        {productsQ.isLoading ? (
          <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="mx-auto my-16 flex max-w-md flex-col items-center rounded-[20px] border border-dashed border-border bg-white p-12 text-center shadow-soft">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-[#FFF5F8] text-primary">
              <Search className="h-7 w-7" />
            </div>
            <h3 className="mt-5 font-display text-2xl font-semibold">No products found.</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting filters or explore trending collections below.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-6 rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-accent cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {visibleProducts.map((product, index) => {
                const banner = CAMPAIGN_BANNERS.find((b) => b.afterIndex === index);
                return (
                  <div key={product.id} className="contents">
                    <ProductCard product={product} />
                    {banner && (
                      <Link
                        to="/shop"
                        search={banner.search}
                        onClick={() => {
                          if (banner.search.category) setCategory(banner.search.category);
                          if (banner.search.tag === "new-arrivals") setOnlyNew(true);
                        }}
                        className="col-span-2 md:col-span-3 lg:col-span-4 group relative my-2 h-44 overflow-hidden rounded-[20px] border border-[#F8BBD0]/30 shadow-soft sm:h-52 md:h-56"
                      >
                        <img
                          src={banner.image}
                          alt={banner.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />
                        <div className="absolute inset-y-0 left-0 flex flex-col justify-center p-6 md:p-10 text-white">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#F8BBD0]">
                            {banner.subtitle}
                          </p>
                          <h3 className="mt-1 font-display text-2xl font-semibold md:text-4xl">
                            {banner.title}
                          </h3>
                          <span className="mt-3 inline-flex text-xs font-semibold underline-offset-4 group-hover:underline">
                            Shop collection →
                          </span>
                        </div>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <div
                ref={loadMoreRef}
                className="mt-8 grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <ProductSkeleton key={`more-${i}`} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Trending searches */}
        <section className="mt-16 border-t border-border/40 pt-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Trending</p>
          <h2 className="mt-1 font-display text-2xl font-semibold">Popular Searches</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {TRENDING.map((t) => (
              <Link
                key={t.label}
                to="/shop"
                search={t.search}
                onClick={() => {
                  if ("category" in t.search && t.search.category) setCategory(t.search.category);
                  if ("tag" in t.search && t.search.tag === "new-arrivals") setOnlyNew(true);
                }}
                className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-foreground/80 transition hover:border-primary hover:text-primary"
              >
                {t.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Recently viewed */}
        {recentlyViewed.length > 0 && (
          <section className="mt-14">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">History</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">Recently Viewed</h2>
            <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
              {recentlyViewed.map((p) => (
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
                  <p className="mt-2 line-clamp-2 font-display text-xs font-semibold">{p.title}</p>
                  <p className="text-[11px] font-bold text-primary">
                    PKR {p.price.toLocaleString()}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Newsletter */}
        <section className="mt-16 overflow-hidden rounded-[20px] border border-[#F8BBD0]/40 bg-blush p-8 shadow-soft md:p-12">
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Newsletter</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-foreground">
                Stay Inspired with Pahraan
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Subscribe to receive new arrivals, exclusive offers and styling inspiration.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </section>
      </div>

      {/* Mobile sticky filter button */}
      <button
        type="button"
        onClick={() => setMobileFiltersOpen(true)}
        className="fixed bottom-20 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-foreground px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-elegant md:hidden cursor-pointer"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filters
        {activeFiltersCount > 0 && (
          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px]">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Mobile slide-up filter panel */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[24px] border border-border/50 bg-white p-5 pb-10 shadow-elegant animate-scale-in">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-xl font-semibold">Filters</h3>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full hover:bg-secondary/40 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <FilterPanel mobile />
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 rounded-full border border-border py-3 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 rounded-full bg-primary py-3 text-xs font-bold uppercase tracking-wider text-white cursor-pointer"
              >
                Show {filteredProducts.length} results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
