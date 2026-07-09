/**
 * AdSlot — placeholder container for Google AdSense units.
 * Wire actual <ins class="adsbygoogle" ...> when AdSense is approved.
 * Layouts are AdSense-policy friendly: labelled, not deceptive, spaced from content.
 */
export function AdSlot({
  variant = "in-article",
  className = "",
}: {
  variant?: "top-banner" | "sidebar" | "in-article" | "footer";
  className?: string;
}) {
  const dims = {
    "top-banner": "h-24 md:h-28",
    sidebar: "aspect-[3/5]",
    "in-article": "h-40",
    footer: "h-32",
  }[variant];

  return (
    <div
      aria-label="Advertisement"
      className={`my-8 grid w-full place-items-center rounded-2xl border border-dashed border-border bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground ${dims} ${className}`}
    >
      Advertisement
    </div>
  );
}
