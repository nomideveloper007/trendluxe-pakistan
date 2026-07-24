import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
};

/**
 * Drop-in image helper: lazy load, async decode, blur-up placeholder.
 * Does not change layout/colors — only loading behavior.
 */
export function OptimizedImage({
  src,
  alt,
  className = "",
  width,
  height,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const missingAlt = !alt?.trim();

  return (
    <img
      src={src}
      alt={alt || "Pahraan fashion"}
      width={width}
      height={height}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      onLoad={() => setLoaded(true)}
      data-missing-alt={missingAlt ? "true" : undefined}
      className={`${className} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-60 blur-[2px]"}`}
    />
  );
}
