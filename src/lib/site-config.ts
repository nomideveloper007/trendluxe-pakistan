import { SITE } from "@/lib/content";

/** Absolute site origin for canonical / OG / sitemap */
export function getSiteUrl(): string {
  const fromEnv =
    (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_SITE_URL) ||
    process.env.VITE_SITE_URL ||
    process.env.SITE_URL ||
    "";
  if (fromEnv) return String(fromEnv).replace(/\/$/, "");
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "https://pahraan.com";
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export type AnalyticsIds = {
  ga4?: string;
  gtm?: string;
  searchConsole?: string;
  metaPixel?: string;
  pinterest?: string;
  tiktok?: string;
  clarity?: string;
};

export const DEFAULT_ANALYTICS: AnalyticsIds = {
  ga4: "",
  gtm: "",
  searchConsole: "",
  metaPixel: "",
  pinterest: "",
  tiktok: "",
  clarity: "",
};

function env(key: string): string {
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.[key]) {
    return String((import.meta as any).env[key]);
  }
  if (typeof process !== "undefined" && process.env?.[key]) {
    return String(process.env[key]);
  }
  return "";
}

export function loadAnalyticsIds(): AnalyticsIds {
  const fromEnv: AnalyticsIds = {
    ga4: env("VITE_GA4_ID"),
    gtm: env("VITE_GTM_ID"),
    searchConsole: env("VITE_GSC_VERIFICATION"),
    metaPixel: env("VITE_META_PIXEL_ID"),
    pinterest: env("VITE_PINTEREST_TAG"),
    tiktok: env("VITE_TIKTOK_PIXEL"),
    clarity: env("VITE_CLARITY_ID"),
  };
  if (typeof window === "undefined") return { ...DEFAULT_ANALYTICS, ...fromEnv };
  try {
    const raw = localStorage.getItem("pahraan_analytics_ids");
    const stored = raw ? JSON.parse(raw) : {};
    return { ...DEFAULT_ANALYTICS, ...fromEnv, ...stored };
  } catch {
    return { ...DEFAULT_ANALYTICS, ...fromEnv };
  }
}

export function saveAnalyticsIds(ids: AnalyticsIds) {
  if (typeof window === "undefined") return;
  localStorage.setItem("pahraan_analytics_ids", JSON.stringify(ids));
}

export const SITE_DEFAULTS = {
  name: SITE.name,
  tagline: SITE.tagline,
  description: SITE.description,
  locale: "en_PK",
  currency: "PKR",
  themeColor: "#C2185B",
  defaultOgImage: "/favicon.png",
};
