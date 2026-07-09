import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { blogPosts, SITE } from "@/lib/content";
import { BlogCard } from "@/components/BlogCard";
import { AdSlot } from "@/components/AdSlot";

const cats = ["all", "styling-guides", "how-to", "occasion", "features", "beauty"] as const;

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: `Journal — ${SITE.name}` },
      { name: "description", content: "Fashion editorials, styling guides and features on Pakistani women's fashion." },
      { property: "og:title", content: `Journal — ${SITE.name}` },
      { property: "og:description", content: "Fashion editorials and styling guides on Pakistani women's fashion." },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogPage,
});

function BlogPage() {
  const [cat, setCat] = useState<(typeof cats)[number]>("all");
  const filtered = useMemo(
    () => (cat === "all" ? blogPosts : blogPosts.filter((p) => p.category === cat)),
    [cat],
  );
  return (
    <div>
      <section className="bg-hero py-16 md:py-20">
        <div className="container-page text-center">
          <p className="text-xs uppercase tracking-widest text-primary">Journal</p>
          <h1 className="mt-3 font-display text-5xl text-foreground md:text-6xl">The Editorial</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Deep dives, styling guides and features from the {SITE.name} team.
          </p>
        </div>
      </section>

      <section className="container-page py-10">
        <div className="flex flex-wrap justify-center gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full border px-4 py-2 text-sm capitalize transition ${
                cat === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface hover:border-primary hover:text-primary"
              }`}
            >
              {c.replace("-", " ")}
            </button>
          ))}
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="grid gap-5">
          {filtered.map((p) => <BlogCard key={p.slug} post={p} />)}
        </div>
        <AdSlot variant="footer" />
      </section>
    </div>
  );
}
