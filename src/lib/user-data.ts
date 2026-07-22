import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, patch: Partial<Profile>) {
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: patch.display_name ?? null,
      avatar_url: patch.avatar_url ?? null,
      bio: patch.bio ?? null,
    })
    .eq("id", userId);
  if (error) throw error;
}

export async function fetchFavorites(userId: string) {
  const { data, error } = await supabase
    .from("favorites")
    .select("item_type, item_slug, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addFavorite(userId: string, itemType: "trend" | "blog" | "product", itemSlug: string) {
  const { error } = await supabase.from("favorites").insert({ user_id: userId, item_type: itemType, item_slug: itemSlug });
  if (error && error.code !== "23505") throw error;
}

export async function removeFavorite(userId: string, itemType: "trend" | "blog" | "product", itemSlug: string) {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("item_type", itemType)
    .eq("item_slug", itemSlug);
  if (error) throw error;
}

export async function isFavorite(userId: string, itemType: "trend" | "blog" | "product", itemSlug: string) {
  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("item_type", itemType)
    .eq("item_slug", itemSlug)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function fetchTrendLikeCount(trendSlug: string) {
  const { count, error } = await supabase
    .from("trend_likes")
    .select("id", { count: "exact", head: true })
    .eq("trend_slug", trendSlug);
  if (error) throw error;
  return count ?? 0;
}

export async function fetchUserLikedTrend(userId: string, trendSlug: string) {
  const { data, error } = await supabase
    .from("trend_likes")
    .select("id")
    .eq("user_id", userId)
    .eq("trend_slug", trendSlug)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function likeTrend(userId: string, trendSlug: string) {
  const { error } = await supabase.from("trend_likes").insert({ user_id: userId, trend_slug: trendSlug });
  if (error && error.code !== "23505") throw error;
}

export async function unlikeTrend(userId: string, trendSlug: string) {
  const { error } = await supabase
    .from("trend_likes")
    .delete()
    .eq("user_id", userId)
    .eq("trend_slug", trendSlug);
  if (error) throw error;
}

export async function fetchIsAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function subscribeToNewsletter(email: string) {
  const { error } = await supabase.from("newsletter_subscribers").insert({ email });
  if (error && error.code !== "23505") throw error;
}

export async function sendContactMessage(payload: { name: string; email: string; subject: string; message: string }) {
  const { error } = await supabase.from("contact_messages").insert(payload);
  if (error) throw error;
}
