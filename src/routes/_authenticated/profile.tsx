import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fetchFavorites, fetchProfile, updateProfile } from "@/lib/user-data";
import { getBlogPost, getTrend, SITE } from "@/lib/content";
import { TrendCard } from "@/components/TrendCard";
import { BlogCard } from "@/components/BlogCard";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: `Your profile — ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const profileQ = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => (user ? fetchProfile(user.id) : Promise.resolve(null)),
    enabled: !!user,
  });
  const favQ = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: () => (user ? fetchFavorites(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (profileQ.data) {
      setDisplayName(profileQ.data.display_name ?? "");
      setBio(profileQ.data.bio ?? "");
      setAvatarUrl(profileQ.data.avatar_url ?? "");
    }
  }, [profileQ.data]);

  const save = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await updateProfile(user.id, { display_name: displayName, bio, avatar_url: avatarUrl });
    },
    onSuccess: () => {
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function onSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const savedTrends = (favQ.data ?? []).filter((f) => f.item_type === "trend").map((f) => getTrend(f.item_slug)).filter(Boolean);
  const savedPosts = (favQ.data ?? []).filter((f) => f.item_type === "blog").map((f) => getBlogPost(f.item_slug)).filter(Boolean);

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-gradient">Your profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <button
          onClick={onSignOut}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2 text-sm font-medium hover:border-primary hover:text-primary"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[360px_1fr]">
        <section className="rounded-3xl bg-surface p-6 shadow-soft">
          <h2 className="font-display text-xl">Edit profile</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-blush text-lg font-medium text-primary">
                {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : (displayName || user?.email || "?")[0]?.toUpperCase()}
              </div>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Avatar image URL"
                className="flex-1 rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name"
              maxLength={60}
              className="w-full rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
            />
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A few words about your style"
              maxLength={280}
              rows={3}
              className="w-full rounded-2xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={() => save.mutate()}
              disabled={save.isPending}
              className="w-full rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-accent disabled:opacity-60"
            >
              {save.isPending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl">Saved trends</h2>
          {savedTrends.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              You haven't saved any trends yet. <Link to="/trends" className="text-primary hover:underline">Browse trends →</Link>
            </p>
          ) : (
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              {savedTrends.map((t) => <TrendCard key={t!.slug} trend={t!} />)}
            </div>
          )}

          <h2 className="mt-14 font-display text-2xl">Saved articles</h2>
          {savedPosts.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Nothing saved yet. <Link to="/blog" className="text-primary hover:underline">Read the journal →</Link>
            </p>
          ) : (
            <div className="mt-5 grid gap-5">
              {savedPosts.map((p) => <BlogCard key={p!.slug} post={p!} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
