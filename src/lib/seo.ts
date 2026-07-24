import { absoluteUrl, getSiteUrl, SITE_DEFAULTS } from "@/lib/site-config";
import { SITE } from "@/lib/content";
import type { Product } from "@/lib/ecommerce-data";

export type PageSeoInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string;
  image?: string;
  type?: "website" | "article" | "product";
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

export function buildPageHead(input: PageSeoInput) {
  const url = absoluteUrl(input.path);
  const image = input.image
    ? input.image.startsWith("http")
      ? input.image
      : absoluteUrl(input.image)
    : absoluteUrl(SITE_DEFAULTS.defaultOgImage);
  const title = input.title.includes(SITE.name) ? input.title : `${input.title} — ${SITE.name}`;

  const scripts = [] as { type: string; children: string }[];
  const ld = input.jsonLd;
  if (ld) {
    const items = Array.isArray(ld) ? ld : [ld];
    for (const item of items) {
      scripts.push({ type: "application/ld+json", children: JSON.stringify(item) });
    }
  }

  return {
    meta: [
      { title },
      { name: "description", content: input.description },
      ...(input.keywords ? [{ name: "keywords", content: input.keywords }] : []),
      ...(input.noindex ? [{ name: "robots", content: "noindex,nofollow" }] : [{ name: "robots", content: "index,follow" }]),
      { property: "og:site_name", content: SITE.name },
      { property: "og:title", content: title },
      { property: "og:description", content: input.description },
      { property: "og:type", content: input.type || "website" },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:locale", content: SITE_DEFAULTS.locale },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: input.description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts,
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    description: SITE.description,
    url: getSiteUrl(),
    logo: absoluteUrl("/favicon.png"),
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Urdu"],
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: getSiteUrl(),
    description: SITE.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${getSiteUrl()}/shop?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productSchema(product: Product, imageUrl: string) {
  const availability =
    product.stock_status === "out_of_stock"
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.short_description || product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand || SITE.name },
    image: [imageUrl],
    url: absoluteUrl(`/shop/${product.slug}`),
    category: product.category,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/shop/${product.slug}`),
      priceCurrency: SITE_DEFAULTS.currency,
      price: product.price,
      availability,
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(product.review_count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.review_count,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function reviewSchema(reviews: {
  author: string;
  rating: number;
  body: string;
  date?: string;
}[]) {
  return reviews.map((r) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    author: { "@type": "Person", name: r.author },
    reviewRating: {
      "@type": "Rating",
      ratingValue: r.rating,
      bestRating: 5,
    },
    reviewBody: r.body,
    ...(r.date ? { datePublished: r.date } : {}),
  }));
}
