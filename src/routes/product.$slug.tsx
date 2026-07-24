import { createFileRoute, redirect } from "@tanstack/react-router";

/** SEO-friendly alias: /product/:slug → /shop/:slug */
export const Route = createFileRoute("/product/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/shop/$slug",
      params: { slug: params.slug },
      replace: true,
    });
  },
});
