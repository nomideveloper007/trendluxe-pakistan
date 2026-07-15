import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { LogOut, Shield, Heart, Bookmark, User, PenTool, Sparkles, Plus, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fetchFavorites, fetchProfile, updateProfile } from "@/lib/user-data";
import { fetchTrendsBySlugs } from "@/lib/trends-data";
import { fetchPostsBySlugs } from "@/lib/blog-data";
import { bootstrapAdmin } from "@/lib/admin.functions";
import { SITE } from "@/lib/content";
import { TrendCard } from "@/components/TrendCard";
import { BlogCard } from "@/components/BlogCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: `Your Profile — ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

const avatarTemplates = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
];

function ProfilePage() {
  const { user, isAdmin, refreshAdmin } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const bootstrap = useServerFn(bootstrapAdmin);

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

  const trendSlugs = (favQ.data ?? []).filter((f) => f.item_type === "trend").map((f) => f.item_slug);
  const postSlugs = (favQ.data ?? []).filter((f) => f.item_type === "blog").map((f) => f.item_slug);

  const savedTrendsQ = useQuery({
    queryKey: ["favorites-trends", trendSlugs],
    queryFn: () => fetchTrendsBySlugs(trendSlugs),
    enabled: trendSlugs.length > 0,
  });
  const savedPostsQ = useQuery({
    queryKey: ["favorites-posts", postSlugs],
    queryFn: () => fetchPostsBySlugs(postSlugs),
    enabled: postSlugs.length > 0,
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
      toast.success("Profile details updated successfully");
      qc.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const claim = useMutation({
    mutationFn: async () => bootstrap(),
    onSuccess: async () => {
      toast.success("You're now the site admin ✨");
      await refreshAdmin();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function onSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
    window.location.reload();
  }

  const savedTrendsCount = trendSlugs.length;
  const savedBlogsCount = postSlugs.length;

  return (
    <div className="container-page py-10 animate-fade-in font-body text-foreground">
      {/* Visual profile header banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-secondary/15 via-[#FFF9FB] to-primary/5 border border-border p-6 md:p-8 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="flex flex-col sm:flex-row items-center gap-5 relative">
          {/* Avatar banner image */}
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center font-display text-2xl font-bold text-primary shadow-soft relative group">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              (displayName || user?.email || "?")[0]?.toUpperCase()
            )}
          </div>
          <div className="text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="font-display text-2xl md:text-3xl font-semibold">{displayName || "Anonymous User"}</h1>
              {isAdmin ? (
                <Badge className="bg-primary text-white border-none flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Admin
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-secondary/40 text-foreground">Member</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
            {bio && <p className="text-xs text-muted-foreground/90 mt-2 max-w-md leading-relaxed">{bio}</p>}
          </div>
        </div>

        {/* Header CTA action links */}
        <div className="flex flex-wrap gap-2.5 items-center justify-center md:justify-end relative">
          {isAdmin ? (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4.5 py-2.5 text-xs font-semibold text-primary hover:bg-primary/10 transition shadow-soft cursor-pointer"
            >
              <Shield className="h-4 w-4" /> Admin dashboard
            </Link>
          ) : (
            <button
              onClick={() => claim.mutate()}
              disabled={claim.isPending}
              title="Promotes your account to administrator if no admin is set yet"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4.5 py-2.5 text-xs font-semibold hover:border-primary hover:text-primary disabled:opacity-60 transition shadow-soft cursor-pointer animate-pulse"
            >
              <Shield className="h-4 w-4 text-primary" /> {claim.isPending ? "Claiming..." : "Claim admin privileges"}
            </button>
          )}
          <button
            onClick={onSignOut}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/10 transition shadow-soft cursor-pointer"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>

      {/* Stats counter diagnostics list */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white border border-border rounded-2xl p-4 shadow-soft">
          <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Saved Looks</p>
          <p className="text-2xl font-display font-semibold text-foreground mt-1">{savedTrendsCount}</p>
        </div>
        <div className="bg-white border border-border rounded-2xl p-4 shadow-soft">
          <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Saved Articles</p>
          <p className="text-2xl font-display font-semibold text-foreground mt-1">{savedBlogsCount}</p>
        </div>
        <div className="bg-white border border-border rounded-2xl p-4 shadow-soft">
          <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Account Role</p>
          <p className="text-xs font-semibold text-primary mt-2 uppercase tracking-wide">{isAdmin ? "Admin" : "Standard Reader"}</p>
        </div>
        <div className="bg-white border border-border rounded-2xl p-4 shadow-soft">
          <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Account Status</p>
          <p className="text-xs font-semibold text-emerald-600 mt-2 uppercase tracking-wide">Verified User</p>
        </div>
      </div>

      {/* Tabs list structure */}
      <Tabs defaultValue="collections" className="mt-10">
        <TabsList className="bg-secondary/15 border border-border/60 p-1 flex justify-start rounded-full max-w-sm mb-6 shadow-soft gap-1">
          <TabsTrigger value="collections" className="flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-all">
            <Bookmark className="h-3.5 w-3.5" /> Saved Collection
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-all">
            <User className="h-3.5 w-3.5" /> Edit Account
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Saved Collections */}
        <TabsContent value="collections" className="space-y-10 focus-visible:outline-none">
          {/* Saved Trends section */}
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="font-display text-xl font-semibold flex items-center gap-2 text-foreground">
                <Sparkles className="h-4.5 w-4.5 text-primary" /> Saved Trends & Styles
              </h2>
            </div>
            {savedTrendsCount === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="Your Trend collection is empty"
                description="Save lawn lookbooks, bridal drapes and Pakistani style combinations you love to see them grouped here."
                btnLabel="Browse Trends"
                btnLink="/trends"
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {(savedTrendsQ.data ?? []).map((t) => (
                  <TrendCard key={t.slug} trend={t} />
                ))}
              </div>
            )}
          </div>

          {/* Saved Articles section */}
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="font-display text-xl font-semibold flex items-center gap-2 text-foreground">
                <PenTool className="h-4.5 w-4.5 text-primary" /> Saved Journal Readings
              </h2>
            </div>
            {savedBlogsCount === 0 ? (
              <EmptyState
                icon={Bookmark}
                title="No saved articles yet"
                description="Save occasion guides, fabric matching tips, or fashion editorials from our journal editors."
                btnLabel="Read Journal"
                btnLink="/blog"
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {(savedPostsQ.data ?? []).map((p) => (
                  <BlogCard key={p.slug} post={p} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 2: Edit Account settings */}
        <TabsContent value="edit" className="focus-visible:outline-none">
          <div className="max-w-2xl bg-white border border-border rounded-3xl p-6 shadow-soft space-y-6">
            <h2 className="font-display text-xl font-semibold text-foreground">Update Profile Settings</h2>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 border border-border/40 bg-[#FFF9FB] p-5 rounded-2xl shadow-soft">
                <div className="h-16 w-16 overflow-hidden rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center font-display text-lg font-semibold text-primary shadow-soft shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (displayName || user?.email || "?")[0]?.toUpperCase()
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Avatar Image URL</Label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or template picker"
                    className="w-full rounded-full border border-border bg-white px-4 py-2 text-xs outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              {/* Avatar Templates Picker */}
              <div className="space-y-2.5">
                <Label className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1">
                  <Image className="h-3.5 w-3.5 text-primary" /> Or select a fashion avatar template:
                </Label>
                <div className="flex flex-wrap gap-2.5">
                  {avatarTemplates.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`h-11 w-11 rounded-full overflow-hidden border-2 transition cursor-pointer hover:scale-105 shadow-soft ${
                        avatarUrl === url ? "border-primary scale-105" : "border-transparent"
                      }`}
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Display Name</Label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your public fashion name"
                  maxLength={60}
                  className="w-full rounded-full border border-border bg-white px-5 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                  <Label>About Your Style (Bio)</Label>
                  <span>{bio.length}/280</span>
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="What is your favorite Pakistani style formula? e.g. Velvet Kurtas or Organza Dupattas..."
                  maxLength={280}
                  rows={3}
                  className="w-full rounded-2xl border border-border bg-white px-5 py-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                />
              </div>

              <Button
                onClick={() => save.mutate()}
                disabled={save.isPending}
                className="w-full bg-primary hover:bg-accent text-white rounded-full py-6 font-semibold shadow-soft hover:shadow-elegant"
              >
                {save.isPending ? "Syncing data..." : "Save changes"}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  btnLabel,
  btnLink,
}: {
  icon: any;
  title: string;
  description: string;
  btnLabel: string;
  btnLink: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border/80 bg-white p-8 md:p-12 text-center max-w-xl mx-auto shadow-soft animate-fade-in flex flex-col items-center">
      <div className="rounded-full bg-secondary/20 p-4 text-primary shrink-0">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed max-w-sm">{description}</p>
      <Link
        to={btnLink}
        className="mt-6 inline-flex items-center gap-1 bg-primary hover:bg-accent text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-soft hover:shadow-elegant transition"
      >
        <Plus className="h-3.5 w-3.5" /> {btnLabel}
      </Link>
    </div>
  );
}
