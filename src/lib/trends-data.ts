import { supabase } from "@/integrations/supabase/client";
import { resolveImage, type Trend } from "@/lib/content";

type Row = {
  id: string;
  slug: string;
  title: string;
  category_slug: string;
  image_key: string;
  gallery_keys: unknown;
  excerpt: string;
  content: unknown;
  tips: unknown;
  tags: string[] | null;
  views_seed: number | null;
  likes_seed: number | null;
  published_at: string | null;
  created_at: string;
};

function toStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

export function normalizeTrend(r: Row): Trend {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category_slug,
    image: resolveImage(r.image_key),
    gallery: toStringArray(r.gallery_keys).map(resolveImage),
    excerpt: r.excerpt,
    content: toStringArray(r.content),
    tips: toStringArray(r.tips),
    tags: r.tags ?? [],
    views: r.views_seed ?? 0,
    likes: r.likes_seed ?? 0,
    date: r.published_at ?? r.created_at,
  };
}

const SELECT =
  "id,slug,title,category_slug,image_key,gallery_keys,excerpt,content,tips,tags,views_seed,likes_seed,published_at,created_at";

export async function fetchAllTrends(): Promise<Trend[]> {
  const { data, error } = await supabase
    .from("trends")
    .select(SELECT)
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return ((data as Row[] | null) ?? []).map(normalizeTrend);
}

export async function fetchTrendBySlug(slug: string): Promise<Trend | null> {
  const { data, error } = await supabase
    .from("trends")
    .select(SELECT)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeTrend(data as Row) : null;
}

export async function fetchTrendsBySlugs(slugs: string[]): Promise<Trend[]> {
  if (slugs.length === 0) return [];
  const { data, error } = await supabase
    .from("trends")
    .select(SELECT)
    .in("slug", slugs)
    .eq("published", true);
  if (error) throw error;
  return ((data as Row[] | null) ?? []).map(normalizeTrend);
}
