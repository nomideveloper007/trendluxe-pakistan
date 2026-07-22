import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, ArrowUpDown, RefreshCw, Star, Sparkles } from "lucide-react";
import { fetchProducts } from "@/lib/ecommerce-data";
import { ProductCard } from "@/components/ProductCard";
import { SITE } from "@/lib/content";

// Define search parameters type for filters & sorting
type ShopSearch = {
  category?: string;
  tag?: string;
  search?: string;
};

export const Route = createFileRoute("/shop/")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => {
    return {
      category: search.category as string | undefined,
      tag: search.tag as string | undefined,
      search: search.search as string | undefined,
    };
  },
  component: ShopIndexPage,
});

const FABRICS = ["Cotton", "Lawn", "Silk", "Organza", "Velvet", "Georgette", "Chiffon"];
const EMBROIDERIES = ["None", "Chikankari Shadow Work", "Tilla & Zardozi Handwork", "Tilla & Sitara Work", "Gold Kora & Pearl Handwork", "Shadow Thread Embroidery"];
const COLORS = ["White", "Black", "Pink", "Red", "Blue", "Teal", "Lilac", "Lavender", "Beige", "Green", "Maroon", "Gold"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const CATEGORIES = [
  { slug: "all", name: "All Products" },
  { slug: "lawn-suits", name: "Lawn Collection" },
  { slug: "pret-wear", name: "Pret Wear" },
  { slug: "casual-wear", name: "Casual Wear" },
  { slug: "formal-wear", name: "Formal Wear" },
  { slug: "luxury-pret", name: "Luxury Pret" },
  { slug: "bridal-wear", name: "Bridal Wear" },
  { slug: "eid-collections", name: "Eid Collection" }
];

function ShopIndexPage() {
  const searchParams = Route.useSearch();

  // Local filter states
  const [category, setCategory] = useState<string>(searchParams.category || "all");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedFabric, setSelectedFabric] = useState<string>("");
  const [selectedEmbroidery, setSelectedEmbroidery] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [sorting, setSorting] = useState<string>("newest");
  const [search, setSearch] = useState<string>(searchParams.search || "");
  const [showInStockOnly, setShowInStockOnly] = useState<boolean>(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState<boolean>(false);

  // Fetch products with React Query
  const productsQ = useQuery({
    queryKey: [
      "products",
      category,
      selectedSize,
      selectedColor,
      selectedFabric,
      selectedEmbroidery,
      maxPrice,
      sorting,
      search,
      searchParams.tag
    ],
    queryFn: () =>
      fetchProducts({
        category: category === "all" ? undefined : category,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
        fabric: selectedFabric || undefined,
        embroidery: selectedEmbroidery || undefined,
        maxPrice: maxPrice || undefined,
        sorting,
        search: search || undefined,
        tag: searchParams.tag || undefined,
      }),
  });

  const handleResetFilters = () => {
    setCategory("all");
    setSelectedSize("");
    setSelectedColor("");
    setSelectedFabric("");
    setSelectedEmbroidery("");
    setMaxPrice(200000);
    setSorting("newest");
    setSearch("");
    setShowInStockOnly(false);
  };

  const unfilteredProducts = productsQ.data ?? [];
  const products = showInStockOnly
    ? unfilteredProducts.filter((p) => p.stock_status !== "out_of_stock")
    : unfilteredProducts;

  const activeFiltersCount = [
    selectedSize ? 1 : 0,
    selectedColor ? 1 : 0,
    selectedFabric ? 1 : 0,
    selectedEmbroidery ? 1 : 0,
    maxPrice < 200000 ? 1 : 0,
    search ? 1 : 0,
    showInStockOnly ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="container-page py-10 font-body text-foreground animate-fade-in bg-background">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-secondary/15 via-[#FFF9FB] to-primary/5 border border-border p-8 md:p-12 shadow-soft mb-8">
        <div className="absolute top-0 right-0 h-48 w-48 bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-xl relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 border border-primary/15 text-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="h-3 w-3 fill-primary" /> Premium Pakistani Wear
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mt-3 text-foreground">
            The Pahraan Atelier
          </h1>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Discover curated lawn prints, signature pret wear, and mastercrafted bridal couture designed to reflect the quiet luxury of traditional details.
          </p>
        </div>
      </div>

      {/* Categories Horizontal Scroll Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4.5 mb-6 scrollbar-none border-b border-border/40">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setCategory(cat.slug)}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-xs font-semibold tracking-wide transition cursor-pointer ${
              category === cat.slug
                ? "bg-primary text-white shadow-soft"
                : "bg-white border border-border text-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Filters Control Utility Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4 mb-6 text-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
            className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-bold transition cursor-pointer ${
              isFiltersExpanded
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-white text-foreground hover:border-primary hover:text-primary"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {isFiltersExpanded ? "Hide Filters" : "Show Filters"}
            {activeFiltersCount > 0 && (
              <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-primary text-[9px] font-extrabold text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" /> Clear Filters
            </button>
          )}
        </div>

        <p className="text-xs text-muted-foreground font-semibold">
          Showing <span className="text-foreground font-bold">{products.length}</span> luxury apparel items
          {searchParams.tag && (
            <span className="ml-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold">
              Tag: {searchParams.tag}
            </span>
          )}
        </p>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={sorting}
            onChange={(e) => setSorting(e.target.value)}
            className="rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold outline-none focus:border-primary transition cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="price_low_high">Price: Low to High</option>
            <option value="price_high_low">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="popularity">Popularity</option>
          </select>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {isFiltersExpanded && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 bg-secondary/5 border border-border/40 rounded-3xl p-6 mb-8 animate-fade-in text-xs">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Search Collection</label>
            <input
              type="text"
              placeholder="Search SKU or dress title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-border bg-white px-4.5 py-2.5 outline-none focus:border-primary transition"
            />
          </div>

          {/* Sizes */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Size Selection</label>
            <div className="flex flex-wrap gap-1">
              {SIZES.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(selectedSize === sz ? "" : sz)}
                  className={`h-7.5 w-7.5 rounded-xl border text-[10px] font-extrabold transition flex items-center justify-center cursor-pointer ${
                    selectedSize === sz
                      ? "border-primary bg-primary text-white shadow-soft"
                      : "border-border hover:border-primary text-foreground bg-white"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Fabric */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Fabric Type</label>
            <select
              value={selectedFabric}
              onChange={(e) => setSelectedFabric(e.target.value)}
              className="w-full rounded-full border border-border bg-white px-3 py-2.5 outline-none focus:border-primary transition cursor-pointer"
            >
              <option value="">All Fabrics</option>
              {FABRICS.map((fab) => (
                <option key={fab} value={fab}>{fab}</option>
              ))}
            </select>
          </div>

          {/* Embroidery */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Embroidery Details</label>
            <select
              value={selectedEmbroidery}
              onChange={(e) => setSelectedEmbroidery(e.target.value)}
              className="w-full rounded-full border border-border bg-white px-3 py-2.5 outline-none focus:border-primary transition cursor-pointer"
            >
              <option value="">All Embroideries</option>
              {EMBROIDERIES.map((emb) => (
                <option key={emb} value={emb}>{emb}</option>
              ))}
            </select>
          </div>

          {/* Colors */}
          <div className="space-y-2 sm:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Color Palette</label>
            <div className="flex flex-wrap gap-1">
              {COLORS.map((col) => (
                <button
                  key={col}
                  onClick={() => setSelectedColor(selectedColor === col ? "" : col)}
                  className={`px-3 py-1.5 rounded-full border text-[9px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    selectedColor === col
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-white text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full border border-border"
                    style={{
                      backgroundColor:
                        col.toLowerCase() === "white"
                          ? "#ffffff"
                          : col.toLowerCase() === "black"
                            ? "#000000"
                            : col.toLowerCase() === "pink"
                              ? "#F8BBD0"
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

          {/* Price Range */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Price Limit</span>
              <span className="text-primary font-bold">PKR {maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="2000"
              max="200000"
              step="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary bg-secondary/20 rounded-lg appearance-none h-1.5 cursor-pointer"
            />
          </div>

          {/* Stock Availability */}
          <div className="flex items-center justify-between sm:pl-4 self-end h-full">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">In Stock Only</span>
            <input
              type="checkbox"
              checked={showInStockOnly}
              onChange={(e) => setShowInStockOnly(e.target.checked)}
              className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary/20 accent-primary cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* PRODUCTS LIST GRID */}
      <div>
        {/* Products Grid */}
        {productsQ.isLoading ? (
          <div className="grid h-96 place-items-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Loading collections...
              </span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 bg-white p-12 text-center max-w-md mx-auto shadow-soft my-12 flex flex-col items-center">
            <span className="rounded-full bg-secondary/15 p-4 text-primary shrink-0">
              <SlidersHorizontal className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">No matches found</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed max-w-xs">
              We couldn't find any premium couture matching your current selection. Try resetting filters or search query.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-6 inline-flex items-center gap-1.5 bg-primary hover:bg-accent text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-soft hover:shadow-elegant transition cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
