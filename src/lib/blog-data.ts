import { supabase } from "@/integrations/supabase/client";
import { resolveImage, type BlogPost } from "@/lib/content";

type Row = {
  id: string;
  slug: string;
  title: string;
  category: string;
  image_key: string;
  excerpt: string;
  content: unknown;
  read_minutes: number | null;
  published_at: string | null;
  created_at: string;
};

function toStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

export function normalizePost(r: Row): BlogPost {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category,
    image: resolveImage(r.image_key),
    excerpt: r.excerpt,
    content: toStringArray(r.content),
    date: r.published_at ?? r.created_at,
    readMinutes: r.read_minutes ?? 5,
  };
}

const SELECT =
  "id,slug,title,category,image_key,excerpt,content,read_minutes,published_at,created_at";

export async function fetchAllPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(SELECT)
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return ((data as Row[] | null) ?? []).map(normalizePost);
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(SELECT)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizePost(data as Row) : null;
}

export async function fetchPostsBySlugs(slugs: string[]): Promise<BlogPost[]> {
  if (slugs.length === 0) return [];
  const { data, error } = await supabase
    .from("blog_posts")
    .select(SELECT)
    .in("slug", slugs)
    .eq("published", true);
  if (error) throw error;
  return ((data as Row[] | null) ?? []).map(normalizePost);
}
