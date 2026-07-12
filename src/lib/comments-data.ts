import { supabase } from "@/integrations/supabase/client";

export type CommentTarget = "trend" | "post";
export type CommentStatus = "visible" | "hidden";

export type Comment = {
  id: string;
  user_id: string;
  target_type: CommentTarget;
  target_id: string;
  body: string;
  status: CommentStatus;
  created_at: string;
  updated_at: string;
  author?: {
    display_name: string | null;
    avatar_url: string | null;
  };
};

async function attachAuthors(rows: Omit<Comment, "author">[]): Promise<Comment[]> {
  const ids = Array.from(new Set(rows.map((r) => r.user_id)));
  if (ids.length === 0) return rows;
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", ids);
  const map = new Map((data ?? []).map((p) => [p.id, p]));
  return rows.map((r) => ({
    ...r,
    author: {
      display_name: map.get(r.user_id)?.display_name ?? null,
      avatar_url: map.get(r.user_id)?.avatar_url ?? null,
    },
  }));
}

export async function fetchComments(
  targetType: CommentTarget,
  targetId: string,
): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("id,user_id,target_type,target_id,body,status,created_at,updated_at")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return attachAuthors((data ?? []) as Omit<Comment, "author">[]);
}

export async function addComment(input: {
  userId: string;
  targetType: CommentTarget;
  targetId: string;
  body: string;
}) {
  const body = input.body.trim();
  if (body.length < 1 || body.length > 2000) {
    throw new Error("Comment must be between 1 and 2000 characters.");
  }
  const { error } = await supabase.from("comments").insert({
    user_id: input.userId,
    target_type: input.targetType,
    target_id: input.targetId,
    body,
  });
  if (error) throw error;
}

export async function updateOwnComment(id: string, body: string) {
  const trimmed = body.trim();
  if (trimmed.length < 1 || trimmed.length > 2000) {
    throw new Error("Comment must be between 1 and 2000 characters.");
  }
  const { error } = await supabase.from("comments").update({ body: trimmed }).eq("id", id);
  if (error) throw error;
}

export async function deleteComment(id: string) {
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw error;
}

/* -------- Admin moderation -------- */

export type AdminComment = Comment & {
  target_slug?: string;
  target_title?: string;
};

export async function fetchAllCommentsAdmin(): Promise<AdminComment[]> {
  const { data, error } = await supabase
    .from("comments")
    .select("id,user_id,target_type,target_id,body,status,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  const rows = await attachAuthors((data ?? []) as Omit<Comment, "author">[]);

  const trendIds = rows.filter((r) => r.target_type === "trend").map((r) => r.target_id);
  const postIds = rows.filter((r) => r.target_type === "post").map((r) => r.target_id);
  const [trends, posts] = await Promise.all([
    trendIds.length
      ? supabase.from("trends").select("id,slug,title").in("id", trendIds)
      : Promise.resolve({ data: [] as { id: string; slug: string; title: string }[] }),
    postIds.length
      ? supabase.from("blog_posts").select("id,slug,title").in("id", postIds)
      : Promise.resolve({ data: [] as { id: string; slug: string; title: string }[] }),
  ]);
  const tMap = new Map((trends.data ?? []).map((t) => [t.id, t]));
  const pMap = new Map((posts.data ?? []).map((p) => [p.id, p]));
  return rows.map((r) => {
    const meta = r.target_type === "trend" ? tMap.get(r.target_id) : pMap.get(r.target_id);
    return { ...r, target_slug: meta?.slug, target_title: meta?.title };
  });
}

export async function setCommentStatus(id: string, status: CommentStatus) {
  const { error } = await supabase.from("comments").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function fetchCommentsCount(): Promise<number> {
  const { count, error } = await supabase
    .from("comments")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}
