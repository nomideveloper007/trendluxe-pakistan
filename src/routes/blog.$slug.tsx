import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getBlogPost, blogPosts, SITE } from "@/lib/content";
import { BlogCard } from "@/components/BlogCard";
import { AdSlot } from "@/components/AdSlot";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = getBlogPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Article not found" }, { name: "robots", content: "noindex" }] };
    }
    const { post } = loaderData;
    return {
      meta: [
        { title: `${post.title} — ${SITE.name}` },
        { name: "description", content: post.excerpt },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:type", content: "article" },
        { property: "og:image", content: post.image },
        { property: "og:url", content: `/blog/${params.slug}` },
        { name: "twitter:image", content: post.image },
      ],
      links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            image: post.image,
            datePublished: post.date,
            author: { "@type": "Organization", name: SITE.name },
            publisher: { "@type": "Organization", name: SITE.name },
          }),
        },
      ],
    };
  },
  component: BlogDetail,
});

function BlogDetail() {
  const { post } = Route.useLoaderData();
  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const date = new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <article className="pb-20">
      <div className="container-page pt-8">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to journal
        </Link>
      </div>

      <header className="container-page pt-8 text-center">
        <div className="text-xs uppercase tracking-widest text-primary">{post.category.replace("-", " ")}</div>
        <h1 className="mx-auto mt-3 max-w-3xl font-display text-4xl leading-tight md:text-5xl">
          {post.title}
        </h1>
        <div className="mt-4 text-sm text-muted-foreground">{date} · {post.readMinutes} min read</div>
      </header>

      <div className="container-page mt-10 overflow-hidden">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl shadow-elegant">
          <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
        </div>
      </div>

      <div className="container-page mx-auto mt-12 max-w-2xl">
        <p className="text-xl leading-relaxed text-foreground/90">{post.excerpt}</p>
        {post.content.map((p, i) => (
          <p key={i} className="mt-5 text-lg leading-relaxed text-foreground/90">{p}</p>
        ))}
        <AdSlot variant="in-article" />
      </div>

      <section className="container-page mt-20">
        <h2 className="mb-8 font-display text-3xl">Keep reading</h2>
        <div className="grid gap-5">
          {related.map((r) => <BlogCard key={r.slug} post={r} />)}
        </div>
      </section>
    </article>
  );
}
