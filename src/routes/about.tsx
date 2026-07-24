import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Heart, Users } from "lucide-react";
import { SITE, heroImage } from "@/lib/content";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About — ${SITE.name}` },
      {
        name: "description",
        content: `About ${SITE.name} — a fashion inspiration platform celebrating Pakistani women's style.`,
      },
      { property: "og:title", content: `About — ${SITE.name}` },
      {
        property: "og:description",
        content: `About ${SITE.name} — a fashion inspiration platform celebrating Pakistani women's style.`,
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <section className="bg-hero py-16 md:py-24">
        <div className="container-page grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary">Our Story</p>
            <h1 className="mt-3 font-display text-5xl leading-tight text-foreground md:text-6xl">
              Fashion inspiration, <span className="text-gradient">for us, by us.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              {SITE.name} began as a love letter to Pakistani fashion — the lawn drops we wait all
              year for, the heirloom lehengas, the effortless kurta-and-jeans of everyday life.
              We're building the destination where all of it lives.
            </p>
          </div>
          <div className="relative overflow-hidden rounded-3xl shadow-elegant">
            <img
              src={heroImage}
              alt="Pakistani fashion editorial"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-4xl">What we believe</h2>
          <p className="mt-4 text-muted-foreground">
            Style is personal, but inspiration is shared. Every woman deserves a place to discover,
            save and celebrate the fashion that speaks to her.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "Curated, not scraped",
              body: "Every trend and article is hand-picked and written by our editors — no algorithmic clutter.",
            },
            {
              icon: Heart,
              title: "Made for you",
              body: "Built around how Pakistani women actually shop, style and celebrate.",
            },
            {
              icon: Users,
              title: "A living community",
              body: "Save favourites, follow trends and shape what we cover next.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl bg-surface p-8 shadow-soft">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-blush py-20">
        <div className="container-page mx-auto max-w-3xl text-center">
          <h2 className="font-display text-4xl">The team</h2>
          <p className="mt-4 text-muted-foreground">
            A small, women-led editorial team based between Karachi, Lahore and London, with
            contributors across Pakistan. We're building {SITE.name} slowly and deliberately — the
            way great fashion is made.
          </p>
        </div>
      </section>
    </div>
  );
}
