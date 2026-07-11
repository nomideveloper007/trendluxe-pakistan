import { supabase } from "@/integrations/supabase/client";

export type AdminTrend = {
  id: string;
  slug: string;
  title: string;
  category_slug: string;
  image_key: string;
  gallery_keys: string[];
  excerpt: string;
  content: string[];
  tips: string[];
  tags: string[];
  views_seed: number;
  likes_seed: number;
  published: boolean;
  published_at: string | null;
  updated_at: string;
};

export type AdminPost = {
  id: string;
  slug: string;
  title: string;
  category: string;
  image_key: string;
  excerpt: string;
  content: string[];
  read_minutes: number;
  published: boolean;
  published_at: string | null;
  updated_at: string;
};

function arr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

export async function fetchAdminTrends(): Promise<AdminTrend[]> {
  const { data, error } = await supabase
    .from("trends")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    category_slug: r.category_slug,
    image_key: r.image_key,
    gallery_keys: arr(r.gallery_keys),
    excerpt: r.excerpt,
    content: arr(r.content),
    tips: arr(r.tips),
    tags: r.tags ?? [],
    views_seed: r.views_seed ?? 0,
    likes_seed: r.likes_seed ?? 0,
    published: r.published,
    published_at: r.published_at,
    updated_at: r.updated_at,
  }));
}

export type TrendInput = Omit<AdminTrend, "id" | "updated_at">;
export async function upsertTrend(input: TrendInput & { id?: string }) {
  const payload = {
    slug: input.slug,
    title: input.title,
    category_slug: input.category_slug,
    image_key: input.image_key,
    gallery_keys: input.gallery_keys,
    excerpt: input.excerpt,
    content: input.content,
    tips: input.tips,
    tags: input.tags,
    views_seed: input.views_seed,
    likes_seed: input.likes_seed,
    published: input.published,
    published_at: input.published_at,
  };
  if (input.id) {
    const { error } = await supabase.from("trends").update(payload).eq("id", input.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("trends").insert(payload);
    if (error) throw error;
  }
}

export async function deleteTrend(id: string) {
  const { error } = await supabase.from("trends").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchAdminPosts(): Promise<AdminPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category,
    image_key: r.image_key,
    excerpt: r.excerpt,
    content: arr(r.content),
    read_minutes: r.read_minutes ?? 5,
    published: r.published,
    published_at: r.published_at,
    updated_at: r.updated_at,
  }));
}

export type PostInput = Omit<AdminPost, "id" | "updated_at">;
export async function upsertPost(input: PostInput & { id?: string }) {
  const payload = {
    slug: input.slug,
    title: input.title,
    category: input.category,
    image_key: input.image_key,
    excerpt: input.excerpt,
    content: input.content,
    read_minutes: input.read_minutes,
    published: input.published,
    published_at: input.published_at,
  };
  if (input.id) {
    const { error } = await supabase.from("blog_posts").update(payload).eq("id", input.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("blog_posts").insert(payload);
    if (error) throw error;
  }
}

export async function deletePost(id: string) {
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchNewsletterSubscribers() {
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id,email,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function deleteSubscriber(id: string) {
  const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchContactMessages() {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id,name,email,subject,message,handled,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function markMessageHandled(id: string, handled: boolean) {
  const { error } = await supabase.from("contact_messages").update({ handled }).eq("id", id);
  if (error) throw error;
}

export async function deleteMessage(id: string) {
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchAdminOverview() {
  const [trends, posts, subs, msgs, likes, favs] = await Promise.all([
    supabase.from("trends").select("id", { count: "exact", head: true }),
    supabase.from("blog_posts").select("id", { count: "exact", head: true }),
    supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("handled", false),
    supabase.from("trend_likes").select("id", { count: "exact", head: true }),
    supabase.from("favorites").select("id", { count: "exact", head: true }),
  ]);
  return {
    trends: trends.count ?? 0,
    posts: posts.count ?? 0,
    subscribers: subs.count ?? 0,
    openMessages: msgs.count ?? 0,
    likes: likes.count ?? 0,
    favorites: favs.count ?? 0,
  };
}
