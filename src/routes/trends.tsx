import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { categories, SITE } from "@/lib/content";
import { fetchAllTrends } from "@/lib/trends-data";
import { TrendCard } from "@/components/TrendCard";
import { AdSlot } from "@/components/AdSlot";

export const Route = createFileRoute("/trends")({
  head: () => ({
    meta: [
      { title: `Trends — ${SITE.name}` },
      { name: "description", content: "Explore the trends shaping Pakistani women's fashion — lawn, bridal, party, abayas and more." },
      { property: "og:title", content: `Trends — ${SITE.name}` },
      { property: "og:description", content: "Explore the trends shaping Pakistani women's fashion." },
      { property: "og:url", content: "/trends" },
    ],
    links: [{ rel: "canonical", href: "/trends" }],
  }),
  loader: () => fetchAllTrends(),
  component: TrendsPage,
});

function TrendsPage() {
  const initial = Route.useLoaderData();
  const { data: trends = initial } = useQuery({
    queryKey: ["trends", "published"],
    queryFn: fetchAllTrends,
    initialData: initial,
  });

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | "all">("all");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return trends.filter((t) => {
      if (cat !== "all" && t.category !== cat) return false;
      if (!query) return true;
      return (
        t.title.toLowerCase().includes(query) ||
        t.excerpt.toLowerCase().includes(query) ||
        t.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }, [q, cat, trends]);

  return (
    <div>
      <section className="bg-hero py-16 md:py-20">
        <div className="container-page text-center">
          <p className="text-xs uppercase tracking-widest text-primary">Discover</p>
          <h1 className="mt-3 font-display text-5xl text-foreground md:text-6xl">
            Fashion trends
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Every silhouette, every season — the styles Pakistani women are wearing now.
          </p>

          <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-full border border-border bg-surface p-2 shadow-soft">
            <Search className="ml-2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search trends, tags, styles…"
              className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"
            />
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="flex flex-wrap justify-center gap-2">
          <FilterPill active={cat === "all"} onClick={() => setCat("all")}>All</FilterPill>
          {categories.map((c) => (
            <FilterPill key={c.slug} active={cat === c.slug} onClick={() => setCat(c.slug)}>
              {c.name}
            </FilterPill>
          ))}
        </div>
      </section>

      <section className="container-page pb-20">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
            No trends match your search yet.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((t) => <TrendCard key={t.slug} trend={t} />)}
          </div>
        )}

        <AdSlot variant="in-article" />

        <div className="mt-10 flex items-center justify-between rounded-2xl bg-blush p-6">
          <div>
            <div className="font-display text-xl">Looking for something specific?</div>
            <div className="text-sm text-muted-foreground">Browse by category or drop us a request.</div>
          </div>
          <Link to="/contact" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-accent">
            Get in touch
          </Link>
        </div>
      </section>
    </div>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface text-foreground hover:border-primary hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}
