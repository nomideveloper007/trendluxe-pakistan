import { createFileRoute, redirect } from "@tanstack/react-router";

/** SEO-friendly alias: /collections/:slug → /shop?category= */
export const Route = createFileRoute("/collections/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/shop",
      search: { category: params.slug },
      replace: true,
    });
  },
});
