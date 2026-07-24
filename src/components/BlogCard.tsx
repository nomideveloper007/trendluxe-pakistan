import { Link } from "@tanstack/react-router";
import type { BlogPost } from "@/lib/content";

export function BlogCard({ post }: { post: BlogPost }) {
  const date = new Date(post.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group grid gap-5 overflow-hidden rounded-2xl bg-surface p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant sm:grid-cols-[200px_1fr]"
    >
      <div className="aspect-square overflow-hidden rounded-xl">
        <img
          src={post.image}
          alt={post.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col justify-center">
        <div className="text-xs uppercase tracking-wider text-primary">
          {post.category.replace("-", " ")}
        </div>
        <h3 className="mt-2 font-display text-xl leading-snug text-foreground transition group-hover:text-primary">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
        <div className="mt-3 text-xs text-muted-foreground">
          {date} · {post.readMinutes} min read
        </div>
      </div>
    </Link>
  );
}
