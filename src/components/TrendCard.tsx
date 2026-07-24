import { Link } from "@tanstack/react-router";
import { Heart, Eye } from "lucide-react";
import type { Trend } from "@/lib/content";
import { getCategory } from "@/lib/content";

export function TrendCard({ trend, priority = false }: { trend: Trend; priority?: boolean }) {
  const cat = getCategory(trend.category);
  return (
    <Link
      to="/trends/$slug"
      params={{ slug: trend.slug }}
      className="group block overflow-hidden rounded-2xl bg-surface shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-elegant"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={trend.image}
          alt={trend.title}
          loading={priority ? "eager" : "lazy"}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-surface/90 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
          {cat?.name}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl leading-snug text-foreground transition group-hover:text-primary">
          {trend.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{trend.excerpt}</p>
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {trend.views.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {trend.likes}
          </span>
        </div>
      </div>
    </Link>
  );
}
