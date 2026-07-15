import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BookOpen,
  Inbox,
  LayoutDashboard,
  Mail,
  MessageCircle,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Users,
  UserCheck,
  UserX,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Globe,
  LogOut,
  Download,
  Heart,
  Bookmark,
  Search,
  LayoutGrid,
  Table,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SITE, categories, blogCategories, imageKeyOptions, resolveImage } from "@/lib/content";
import {
  deleteMessage,
  deletePost,
  deleteSubscriber,
  deleteTrend,
  fetchAdminOverview,
  fetchAdminPosts,
  fetchAdminTrends,
  fetchContactMessages,
  fetchNewsletterSubscribers,
  markMessageHandled,
  upsertPost,
  upsertTrend,
  fetchAdminUsers,
  updateUserRole,
  type AdminPost,
  type AdminTrend,
  type AdminUser,
} from "@/lib/admin-data";
import {
  deleteComment,
  fetchAllCommentsAdmin,
  setCommentStatus,
} from "@/lib/comments-data";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;
    if (!uid) throw redirect({ to: "/auth" });
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .eq("role", "admin")
      .maybeSingle();
    if (!data) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: `Admin Workspace — ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { session } = useAuth();

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "trends", label: "Trends", icon: Sparkles },
    { id: "blog", label: "Blog Journal", icon: BookOpen },
    { id: "comments", label: "Comments", icon: MessageCircle },
    { id: "newsletter", label: "Newsletter", icon: Mail },
    { id: "messages", label: "Inbox Messages", icon: Inbox },
    { id: "users", label: "Users & Roles", icon: Users },
  ];

  const { data: overview } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: fetchAdminOverview,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <div className="flex h-screen bg-[#FFF9FB] overflow-hidden font-body text-foreground">
      {/* Sidebar */}
      <aside className="w-68 border-r border-border/80 bg-white/90 backdrop-blur-xl flex flex-col shrink-0">
        {/* Brand logo header */}
        <div className="h-16 px-6 border-b border-border/80 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-xl font-bold tracking-wider text-primary">PAHRAAN</span>
            <Badge variant="outline" className="text-[10px] text-primary/80 border-primary/20 bg-primary/5 uppercase">Admin</Badge>
          </Link>
        </div>

        {/* Logged in admin profile */}
        <div className="p-4 border-b border-border/60">
          <div className="flex items-center gap-3 bg-secondary/15 rounded-2xl p-3.5">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center font-display font-semibold text-primary">
              {session?.user?.email?.slice(0, 2).toUpperCase() || "AD"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">Active Session</p>
              <p className="text-xs font-semibold truncate text-foreground/80 mt-0.5">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Sidebar Nav links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            let badge = null;
            if (item.id === "messages" && overview?.openMessages && overview.openMessages > 0) {
              badge = (
                <span className="ml-auto shrink-0 bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground rounded-full">
                  {overview.openMessages}
                </span>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-foreground/80 hover:bg-secondary/25 hover:text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {badge}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer links */}
        <div className="p-4 border-t border-border/80 flex flex-col gap-2">
          <Link
            to="/"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground transition"
          >
            <Globe className="h-4 w-4" />
            <span>Go to Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium text-destructive hover:bg-destructive/10 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Panel Top Header bar */}
        <header className="h-16 border-b border-border/80 bg-white/40 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <span>Workspace</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="capitalize text-foreground font-semibold">{activeTab}</span>
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            Pahraan Management Engine · {new Date().toLocaleDateString()}
          </div>
        </header>

        {/* Scrollable Workspace panel content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-5xl">
            {activeTab === "overview" && <OverviewTab overview={overview} />}
            {activeTab === "trends" && <TrendsTab />}
            {activeTab === "blog" && <BlogTab />}
            {activeTab === "newsletter" && <NewsletterTab />}
            {activeTab === "messages" && <MessagesTab />}
            {activeTab === "comments" && <CommentsTab />}
            {activeTab === "users" && <UsersTab />}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------------- SHARED WIDGETS ---------------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{label}</Label>
      {children}
    </div>
  );
}

function ImagePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const resolved = resolveImage(value);
  return (
    <div className="grid gap-3 border border-border/40 rounded-2xl bg-secondary/5 p-4">
      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{label}</Label>
      <div className="grid gap-4 md:grid-cols-3 items-start">
        <div className="md:col-span-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Select from options or enter URL"
            list="image-keys"
          />
          <datalist id="image-keys">
            {imageKeyOptions.map((k) => (
              <option key={k} value={k} />
            ))}
          </datalist>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Type or pick a preset code (e.g. `hero-fashion`) or insert an absolute image link.
          </p>
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-muted flex items-center justify-center shadow-soft">
          {value ? (
            <img src={resolved} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-muted-foreground">No image loaded</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ListBuilder({
  label,
  values,
  onChange,
  placeholder = "Add item...",
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [newVal, setNewVal] = useState("");

  const handleAdd = () => {
    if (!newVal.trim()) return;
    onChange([...values, newVal.trim()]);
    setNewVal("");
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= values.length) return;
    const updated = [...values];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;
    onChange(updated);
  };

  return (
    <div className="grid gap-3 border border-border/40 rounded-2xl bg-secondary/5 p-4">
      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{label}</Label>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={newVal}
          onChange={(e) => setNewVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button type="button" onClick={handleAdd} size="sm" className="bg-primary hover:bg-accent text-white">
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
        {values.map((val, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-border/60 shadow-soft text-sm text-foreground/90 transition hover:border-primary/30"
          >
            <span className="flex-1 break-words leading-relaxed">{val}</span>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-secondary/15"
                disabled={idx === 0}
                onClick={() => handleMove(idx, -1)}
              >
                <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-secondary/15"
                disabled={idx === values.length - 1}
                onClick={() => handleMove(idx, 1)}
              >
                <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleRemove(idx)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {values.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-3 italic">No items added yet.</p>
        )}
      </div>
    </div>
  );
}

/* ---------------- OVERVIEW ---------------- */

function OverviewTab({ overview: propOverview }: { overview?: any }) {
  const { data: queryOverview } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: fetchAdminOverview,
    initialData: propOverview,
  });
  const data = queryOverview || propOverview;

  const stats = [
    { label: "Trends", value: data?.trends ?? 0, desc: "Total visual trendboards", color: "from-[#C2185B]/5 to-[#A01048]/10 text-primary border-primary/20", icon: Sparkles },
    { label: "Blog Posts", value: data?.posts ?? 0, desc: "Published and draft articles", color: "from-blue-500/5 to-indigo-500/10 text-blue-700 border-blue-200", icon: BookOpen },
    { label: "Subscribers", value: data?.subscribers ?? 0, desc: "Active newsletter readers", color: "from-emerald-500/5 to-teal-500/10 text-emerald-700 border-emerald-200", icon: Mail },
    { label: "Open Messages", value: data?.openMessages ?? 0, desc: "Awaiting customer response", color: "from-amber-500/5 to-orange-500/10 text-amber-700 border-amber-200", icon: Inbox },
    { label: "Total Likes", value: data?.likes ?? 0, desc: "User likes on trends", color: "from-rose-500/5 to-pink-500/10 text-rose-700 border-rose-200", icon: Heart },
    { label: "Total Saved", value: data?.favorites ?? 0, desc: "Bookmarked articles & trends", color: "from-purple-500/5 to-fuchsia-500/10 text-purple-700 border-purple-200", icon: Bookmark },
    { label: "Comments", value: data?.comments ?? 0, desc: "User engagement threads", color: "from-cyan-500/5 to-blue-500/10 text-cyan-700 border-cyan-200", icon: MessageCircle },
    { label: "Total Users", value: data?.users ?? 0, desc: "Registered member profiles", color: "from-slate-500/5 to-neutral-500/10 text-slate-700 border-slate-200", icon: Users },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-widest text-primary font-semibold">Overview</p>
        <h1 className="mt-1 font-display text-4xl text-gradient">System Diagnostics</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Real-time metrics, engagement statistics, and community indicators for Pahraan.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br ${s.color} p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</span>
                  <div className="mt-2 font-display text-4xl font-semibold text-foreground">{s.value}</div>
                </div>
                <div className="rounded-2xl bg-white p-3 shadow-soft text-primary border border-border/20 shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground font-medium leading-relaxed">{s.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- TRENDS ---------------- */

const emptyTrend: AdminTrend = {
  id: "",
  slug: "",
  title: "",
  category_slug: categories[0]?.slug ?? "",
  image_key: imageKeyOptions[0] ?? "hero-fashion",
  gallery_keys: [],
  excerpt: "",
  content: [],
  tips: [],
  tags: [],
  views_seed: 0,
  likes_seed: 0,
  published: true,
  published_at: new Date().toISOString(),
  updated_at: "",
};

function TrendsTab() {
  const qc = useQueryClient();
  const listQ = useQuery({ queryKey: ["admin-trends"], queryFn: fetchAdminTrends });
  const [editing, setEditing] = useState<AdminTrend | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

  const del = useMutation({
    ariaLabel: "Delete Trend",
    mutationFn: (id: string) => deleteTrend(id),
    onSuccess: () => {
      toast.success("Trend deleted");
      qc.invalidateQueries({ queryKey: ["admin-trends"] });
      qc.invalidateQueries({ queryKey: ["trends", "published"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function startNew() {
    setEditing({ ...emptyTrend });
    setOpen(true);
  }
  function startEdit(t: AdminTrend) {
    setEditing({ ...t });
    setOpen(true);
  }

  const filtered = (listQ.data ?? []).filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl">Visual Trends ({filtered.length})</h2>
          <p className="text-xs text-muted-foreground mt-1">Manage content lookbooks, style guides and category filters.</p>
        </div>
        <Button onClick={startNew} className="bg-primary hover:bg-accent text-white rounded-full px-5 py-2">
          <Plus className="mr-2 h-4 w-4" /> New Trend
        </Button>
      </div>

      {/* Filter and viewMode toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter trends by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 rounded-full border-border bg-white"
          />
        </div>
        <div className="flex items-center border border-border bg-white rounded-full p-1 shadow-soft">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "grid"
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Grid
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "table"
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Table className="h-3.5 w-3.5" /> Table
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
          {filtered.map((t) => (
            <AdminTrendCard
              key={t.id}
              trend={t}
              onEdit={() => startEdit(t)}
              onDelete={() => confirm("Delete this trend?") && del.mutate(t.id)}
            />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-sm text-muted-foreground italic py-16">
              No trends matching your search query.
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border/80 bg-white shadow-soft animate-fade-in">
          <table className="w-full text-sm">
            <thead className="bg-secondary/25 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">Title</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Last Updated</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const imgUrl = resolveImage(t.image_key);
                return (
                  <tr key={t.id} className="border-t border-border/60 hover:bg-secondary/5 transition">
                    <td className="px-5 py-3.5 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border/40 bg-muted shadow-soft">
                          <img src={imgUrl} alt={t.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground truncate max-w-sm md:max-w-md">{t.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-xs md:max-w-sm">{t.excerpt}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">/{t.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="outline" className="border-border/80 bg-[#FFF9FB]/50">
                        {categories.find((c) => c.slug === t.category_slug)?.name ?? t.category_slug}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      {t.published ? (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none">Published</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground">Draft</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {new Date(t.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button variant="ghost" size="icon" onClick={() => startEdit(t)} className="hover:bg-secondary/20 mr-1">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirm("Delete this trend?") && del.mutate(t.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-muted-foreground italic">
                    No trends matching your search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-3xl p-6">
          {editing && (
            <TrendForm
              initial={editing}
              onDone={() => {
                setOpen(false);
                qc.invalidateQueries({ queryKey: ["admin-trends"] });
                qc.invalidateQueries({ queryKey: ["trends", "published"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminTrendCard({
  trend,
  onEdit,
  onDelete,
}: {
  trend: AdminTrend;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const imgUrl = resolveImage(trend.image_key);
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white border border-border/80 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant flex flex-col h-full">
      {/* Image container */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <img src={imgUrl} alt={trend.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/90 text-primary hover:bg-white text-[10px] uppercase font-semibold border-none shadow-soft">
            {categories.find((c) => c.slug === trend.category_slug)?.name ?? trend.category_slug}
          </Badge>
        </div>
        {!trend.published && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
            <Badge variant="secondary" className="bg-black/60 text-white border-none uppercase text-[10px] tracking-wider font-semibold">Draft</Badge>
          </div>
        )}
      </div>

      {/* Info details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground line-clamp-1 leading-snug">
            {trend.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {trend.excerpt}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 gap-2">
          <span className="text-[10px] text-muted-foreground font-mono truncate">
            /{trend.slug}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-full border-border/60 hover:bg-secondary/15"
              onClick={onEdit}
            >
              <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-full border-destructive/20 text-destructive hover:bg-destructive/10"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendForm({ initial, onDone }: { initial: AdminTrend; onDone: () => void }) {
  const [f, setF] = useState<AdminTrend>(initial);
  const isEdit = !!initial.id;

  const save = useMutation({
    mutationFn: async () => {
      if (!f.slug || !f.title || !f.excerpt) throw new Error("Slug, title and excerpt are required");
      await upsertTrend({
        id: f.id || undefined,
        slug: f.slug.trim(),
        title: f.title.trim(),
        category_slug: f.category_slug,
        image_key: f.image_key.trim(),
        gallery_keys: f.gallery_keys,
        excerpt: f.excerpt.trim(),
        content: f.content,
        tips: f.tips,
        tags: f.tags,
        views_seed: f.views_seed,
        likes_seed: f.likes_seed,
        published: f.published,
        published_at: f.published_at,
      });
    },
    onSuccess: () => {
      toast.success(isEdit ? "Trend updated successfully" : "Trend created successfully");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">{isEdit ? "Modify Lookbook Trend" : "New Visual Trend"}</DialogTitle>
      </DialogHeader>
      
      <div className="grid gap-5 py-2">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title">
            <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Sage & Rose: The Palette Of The Season" />
          </Field>
          <Field label="Slug">
            <Input
              value={f.slug}
              onChange={(e) => setF({ ...f, slug: e.target.value })}
              placeholder="e.g. sage-and-rose-palette"
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Category">
            <Select value={f.category_slug} onValueChange={(v) => setF({ ...f, category_slug: v })}>
              <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Publish Date">
            <Input
              type="date"
              value={f.published_at ? f.published_at.slice(0, 10) : ""}
              onChange={(e) =>
                setF({
                  ...f,
                  published_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                })
              }
            />
          </Field>
        </div>

        {/* cover image visual picker */}
        <ImagePicker label="Cover Image" value={f.image_key} onChange={(val) => setF({ ...f, image_key: val })} />

        <Field label="Excerpt Summary">
          <Textarea
            rows={2}
            value={f.excerpt}
            onChange={(e) => setF({ ...f, excerpt: e.target.value })}
            placeholder="A short summary of this trend for lists and search indexing..."
          />
        </Field>

        {/* List builders */}
        <ListBuilder
          label="Content Paragraphs"
          values={f.content}
          onChange={(val) => setF({ ...f, content: val })}
          placeholder="Enter a new content paragraph..."
        />

        <ListBuilder
          label="Style Tips"
          values={f.tips}
          onChange={(val) => setF({ ...f, tips: val })}
          placeholder="Enter a style tip..."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <ListBuilder
            label="Tags"
            values={f.tags}
            onChange={(val) => setF({ ...f, tags: val })}
            placeholder="Enter tag (e.g. pastel)..."
          />
          <ListBuilder
            label="Gallery Images (preset keys or URLs)"
            values={f.gallery_keys}
            onChange={(val) => setF({ ...f, gallery_keys: val })}
            placeholder="Enter preset key or URL..."
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Views (initial seed counter)">
            <Input
              type="number"
              value={f.views_seed}
              onChange={(e) => setF({ ...f, views_seed: Number(e.target.value) })}
            />
          </Field>
          <Field label="Likes (initial seed counter)">
            <Input
              type="number"
              value={f.likes_seed}
              onChange={(e) => setF({ ...f, likes_seed: Number(e.target.value) })}
            />
          </Field>
        </div>

        <div className="flex items-center gap-3 bg-secondary/10 p-4 rounded-2xl border border-border/40">
          <Switch checked={f.published} onCheckedChange={(v) => setF({ ...f, published: v })} />
          <div className="grid">
            <span className="text-sm font-semibold text-foreground">Publishing Visibility</span>
            <span className="text-xs text-muted-foreground">
              {f.published ? "Active - visible to website visitors" : "Inactive - hidden drafts"}
            </span>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button onClick={() => save.mutate()} disabled={save.isPending} className="bg-primary hover:bg-accent text-white w-full rounded-full">
          {save.isPending ? "Syncing data..." : isEdit ? "Update Trendboard" : "Create Trendboard"}
        </Button>
      </DialogFooter>
    </div>
  );
}

/* ---------------- BLOG ---------------- */

const emptyPost: AdminPost = {
  id: "",
  slug: "",
  title: "",
  category: blogCategories[0],
  image_key: imageKeyOptions[0] ?? "blog-editorial",
  excerpt: "",
  content: [],
  read_minutes: 5,
  published: true,
  published_at: new Date().toISOString(),
  updated_at: "",
};

function BlogTab() {
  const qc = useQueryClient();
  const listQ = useQuery({ queryKey: ["admin-posts"], queryFn: fetchAdminPosts });
  const [editing, setEditing] = useState<AdminPost | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

  const del = useMutation({
    ariaLabel: "Delete Post",
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => {
      toast.success("Blog post deleted");
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
      qc.invalidateQueries({ queryKey: ["blog", "published"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = (listQ.data ?? []).filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl animate-fade-in">Blog Journal Editorials ({filtered.length})</h2>
          <p className="text-xs text-muted-foreground mt-1">Publish news features, guides, styling advice and editor reviews.</p>
        </div>
        <Button onClick={() => { setEditing({ ...emptyPost }); setOpen(true); }} className="bg-primary hover:bg-accent text-white rounded-full px-5 py-2">
          <Plus className="mr-2 h-4 w-4" /> New Article
        </Button>
      </div>

      {/* Filter and viewMode toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter blog posts by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 rounded-full border-border bg-white"
          />
        </div>
        <div className="flex items-center border border-border bg-white rounded-full p-1 shadow-soft">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "grid"
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Grid
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "table"
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Table className="h-3.5 w-3.5" /> Table
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid gap-6 md:grid-cols-2 animate-fade-in">
          {filtered.map((p) => (
            <AdminBlogCard
              key={p.id}
              post={p}
              onEdit={() => {
                setEditing({ ...p });
                setOpen(true);
              }}
              onDelete={() => confirm("Delete this article?") && del.mutate(p.id)}
            />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-sm text-muted-foreground italic py-16">
              No articles matching your search query.
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-border/80 bg-white shadow-soft animate-fade-in">
          <table className="w-full text-sm">
            <thead className="bg-secondary/25 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">Title</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Last Updated</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const imgUrl = resolveImage(p.image_key);
                return (
                  <tr key={p.id} className="border-t border-border/60 hover:bg-secondary/5 transition">
                    <td className="px-5 py-3.5 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border/40 bg-muted shadow-soft">
                          <img src={imgUrl} alt={p.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground truncate max-w-sm md:max-w-md">{p.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-xs md:max-w-sm">{p.excerpt}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">/{p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 capitalize">
                      <Badge variant="outline" className="border-border/80 bg-[#FFF9FB]/50">
                        {p.category.replace("-", " ")}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      {p.published ? (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none">Published</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground">Draft</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {new Date(p.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing({ ...p }); setOpen(true); }} className="hover:bg-secondary/20 mr-1">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirm("Delete this article?") && del.mutate(p.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-muted-foreground italic">
                    No articles matching your search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto rounded-3xl p-6">
          {editing && (
            <PostForm
              initial={editing}
              onDone={() => {
                setOpen(false);
                qc.invalidateQueries({ queryKey: ["admin-posts"] });
                qc.invalidateQueries({ queryKey: ["blog", "published"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminBlogCard({
  post,
  onEdit,
  onDelete,
}: {
  post: AdminPost;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const imgUrl = resolveImage(post.image_key);
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white border border-border/80 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant flex flex-col md:flex-row md:items-stretch h-full">
      {/* Visual Image container */}
      <div className="relative aspect-video md:aspect-square md:w-40 shrink-0 overflow-hidden bg-muted">
        <img src={imgUrl} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {!post.published && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
            <Badge variant="secondary" className="bg-black/60 text-white border-none uppercase text-[10px] tracking-wider font-semibold">Draft</Badge>
          </div>
        )}
      </div>

      {/* Details info */}
      <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary truncate">
              {post.category.replace("-", " ")}
            </span>
            <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
              {post.read_minutes} min read
            </span>
          </div>
          <h3 className="mt-2 font-display text-base font-semibold text-foreground line-clamp-1 leading-snug">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 gap-2">
          <span className="text-[10px] text-muted-foreground font-mono truncate">
            /{post.slug}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-full border-border/60 hover:bg-secondary/15"
              onClick={onEdit}
            >
              <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-full border-destructive/20 text-destructive hover:bg-destructive/10"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostForm({ initial, onDone }: { initial: AdminPost; onDone: () => void }) {
  const [f, setF] = useState<AdminPost>(initial);
  const isEdit = !!initial.id;

  const save = useMutation({
    mutationFn: async () => {
      if (!f.slug || !f.title || !f.excerpt) throw new Error("Slug, title and excerpt are required");
      await upsertPost({
        id: f.id || undefined,
        slug: f.slug.trim(),
        title: f.title.trim(),
        category: f.category,
        image_key: f.image_key.trim(),
        excerpt: f.excerpt.trim(),
        content: f.content,
        read_minutes: f.read_minutes,
        published: f.published,
        published_at: f.published_at,
      });
    },
    onSuccess: () => {
      toast.success(isEdit ? "Article updated successfully" : "Article created successfully");
      onDone();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="font-display text-2xl">{isEdit ? "Edit Editorial Post" : "Compose Editorial Post"}</DialogTitle>
      </DialogHeader>
      
      <div className="grid gap-5 py-2">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Article Title">
            <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Building A Capsule Wardrobe: The Pakistani Edit" />
          </Field>
          <Field label="URL Slug">
            <Input
              value={f.slug}
              onChange={(e) => setF({ ...f, slug: e.target.value })}
              placeholder="e.g. capsule-wardrobe-pakistani-woman"
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Category Group">
            <Select value={f.category} onValueChange={(v) => setF({ ...f, category: v })}>
              <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                {blogCategories.map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">
                    {c.replace("-", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Publish Date">
            <Input
              type="date"
              value={f.published_at ? f.published_at.slice(0, 10) : ""}
              onChange={(e) =>
                setF({
                  ...f,
                  published_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                })
              }
            />
          </Field>
        </div>

        {/* image selector */}
        <ImagePicker label="Cover Image" value={f.image_key} onChange={(val) => setF({ ...f, image_key: val })} />

        <Field label="Brief Summary Excerpt">
          <Textarea
            rows={2}
            value={f.excerpt}
            onChange={(e) => setF({ ...f, excerpt: e.target.value })}
            placeholder="A short snippet that highlights what the article is about..."
          />
        </Field>

        <ListBuilder
          label="Body Content paragraphs"
          values={f.content}
          onChange={(val) => setF({ ...f, content: val })}
          placeholder="Type paragraph and press Add..."
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Estimated Read Time (Minutes)">
            <Input
              type="number"
              value={f.read_minutes}
              onChange={(e) => setF({ ...f, read_minutes: Number(e.target.value) })}
            />
          </Field>
          
          <div className="flex items-center gap-3 bg-secondary/10 p-4 rounded-2xl border border-border/40 mt-6 md:mt-0">
            <Switch checked={f.published} onCheckedChange={(v) => setF({ ...f, published: v })} />
            <div className="grid">
              <span className="text-sm font-semibold text-foreground">Publication Status</span>
              <span className="text-xs text-muted-foreground">
                {f.published ? "Visible on site" : "Draft - hidden"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button onClick={() => save.mutate()} disabled={save.isPending} className="bg-primary hover:bg-accent text-white w-full rounded-full">
          {save.isPending ? "Syncing data..." : isEdit ? "Update Article" : "Publish Article"}
        </Button>
      </DialogFooter>
    </div>
  );
}

/* ---------------- NEWSLETTER ---------------- */

function NewsletterTab() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-subs"], queryFn: fetchNewsletterSubscribers });
  
  const del = useMutation({
    mutationFn: (id: string) => deleteSubscriber(id),
    onSuccess: () => {
      toast.success("Subscriber removed");
      qc.invalidateQueries({ queryKey: ["admin-subs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleExportCSV = () => {
    const list = q.data ?? [];
    if (list.length === 0) {
      toast.error("No subscribers to export");
      return;
    }
    const headers = "ID,Email,Created At\n";
    const rows = list
      .map((s) => `"${s.id}","${s.email}","${new Date(s.created_at).toISOString()}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `subscribers-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file downloaded");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl">Newsletter Subscribers ({q.data?.length ?? 0})</h2>
          <p className="text-xs text-muted-foreground mt-1">Manage user emails that opted-in to receive magazine notifications.</p>
        </div>
        <Button onClick={handleExportCSV} className="bg-primary hover:bg-accent text-white rounded-full px-5 py-2">
          <Download className="mr-2 h-4 w-4" /> Export CSV List
        </Button>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-border/80 bg-white shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-secondary/25 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5">Email Address</th>
              <th className="px-5 py-3.5">Opt-In Date</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(q.data ?? []).map((s) => (
              <tr key={s.id} className="border-t border-border/60 hover:bg-secondary/5 transition">
                <td className="px-5 py-3.5 font-medium text-foreground">{s.email}</td>
                <td className="px-5 py-3.5 text-muted-foreground">
                  {new Date(s.created_at).toLocaleString()}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => confirm("Remove subscriber?") && del.mutate(s.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {(!q.data || q.data.length === 0) && (
              <tr>
                <td colSpan={3} className="px-5 py-16 text-center text-muted-foreground italic">
                  No active subscribers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- MESSAGES ---------------- */

function MessagesTab() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-messages"], queryFn: fetchContactMessages });
  
  const mark = useMutation({
    mutationFn: ({ id, handled }: { id: string; handled: boolean }) => markMessageHandled(id, handled),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-messages"] });
      qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteMessage(id),
    onSuccess: () => {
      toast.success("Message deleted");
      qc.invalidateQueries({ queryKey: ["admin-messages"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Inbox Messages ({q.data?.length ?? 0})</h2>
        <p className="text-xs text-muted-foreground mt-1">Review contact requests, reader inquiries, and collaboration requests.</p>
      </div>

      <div className="space-y-4">
        {(q.data ?? []).map((m) => (
          <div
            key={m.id}
            className={`rounded-3xl border p-5 shadow-soft transition-all duration-300 ${
              m.handled ? "border-border bg-white/50 opacity-70" : "border-primary/20 bg-white"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-base text-foreground">{m.subject}</span>
                  {m.handled ? (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">Handled</Badge>
                  ) : (
                    <Badge className="bg-primary text-white border-none">New</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  From: <span className="font-semibold text-foreground/80">{m.name}</span> · {m.email} · {new Date(m.created_at).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => mark.mutate({ id: m.id, handled: !m.handled })}
                  className="rounded-full border-border/80 text-foreground hover:bg-secondary/15"
                >
                  {m.handled ? "Mark Unhandled" : "Mark Handled"}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => confirm("Delete this message?") && del.mutate(m.id)}
                  className="text-destructive hover:bg-destructive/10 rounded-full h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed border-t border-border/40 pt-3">{m.message}</p>
          </div>
        ))}
        {(!q.data || q.data.length === 0) && (
          <div className="rounded-3xl border border-dashed border-border/80 bg-white py-16 text-center text-muted-foreground italic">
            Inbox is completely empty.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- COMMENTS ---------------- */

function CommentsTab() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-comments"], queryFn: fetchAllCommentsAdmin });
  
  const setStatus = useMutation({
    mutationFn: (vars: { id: string; status: "visible" | "hidden" }) => setCommentStatus(vars.id, vars.status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-comments"] });
      qc.invalidateQueries({ queryKey: ["comments"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: () => {
      toast.success("Comment deleted");
      qc.invalidateQueries({ queryKey: ["admin-comments"] });
      qc.invalidateQueries({ queryKey: ["comments"] });
      qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = q.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Moderated Comments ({rows.length})</h2>
        <p className="text-xs text-muted-foreground mt-1">Approve, hide or delete comment threads under lookbooks and editorials.</p>
      </div>

      <div className="space-y-4">
        {rows.map((c) => (
          <div
            key={c.id}
            className={`rounded-3xl border p-5 shadow-soft transition-all duration-300 ${
              c.status === "hidden" ? "border-border bg-white/40 opacity-70" : "border-border bg-white"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {c.author?.display_name || "Anonymous reader"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    commented on {c.target_type === "trend" ? "trend" : "editorial"}{" "}
                    <span className="font-semibold text-foreground">{c.target_title ?? c.target_id}</span>
                  </span>
                  {c.status === "hidden" && (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">Hidden</Badge>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{new Date(c.created_at).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setStatus.mutate({ id: c.id, status: c.status === "hidden" ? "visible" : "hidden" })
                  }
                  className="rounded-full border-border/80 hover:bg-secondary/15"
                >
                  {c.status === "hidden" ? (
                    <>
                      <Eye className="mr-1 h-3.5 w-3.5" /> Approve
                    </>
                  ) : (
                    <>
                      <EyeOff className="mr-1 h-3.5 w-3.5" /> Hide
                    </>
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => confirm("Delete this comment permanently?") && del.mutate(c.id)}
                  className="text-destructive hover:bg-destructive/10 rounded-full h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed border-t border-border/40 pt-3">{c.body}</p>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border/80 bg-white py-16 text-center text-muted-foreground italic">
            No reader comments registered.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- USERS & ROLES ---------------- */

function UsersTab() {
  const qc = useQueryClient();
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
  });

  const toggleRole = useMutation({
    ariaLabel: "Toggle Admin Role",
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: "admin" | "user" }) => {
      await updateUserRole(userId, newRole);
    },
    onSuccess: () => {
      toast.success("User role updated successfully");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return <div className="py-20 text-center text-muted-foreground italic animate-pulse">Loading registered profiles...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Users & Roles ({users.length})</h2>
        <p className="text-xs text-muted-foreground mt-1">Manage system administrators, moderator roles, and view user metadata profiles.</p>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-border/80 bg-white shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-secondary/25 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5">User Profile</th>
              <th className="px-5 py-3.5">User UUID</th>
              <th className="px-5 py-3.5">Date Registered</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border/60 hover:bg-secondary/5 transition">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center font-display text-sm font-semibold text-primary shadow-soft">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt={u.display_name ?? ""} className="h-full w-full object-cover" />
                      ) : (
                        u.display_name?.slice(0, 2).toUpperCase() || "U"
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate">{u.display_name || "Anonymous Reader"}</div>
                      {u.bio && <div className="text-xs text-muted-foreground truncate max-w-xs mt-0.5 leading-relaxed">{u.bio}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{u.id}</td>
                <td className="px-5 py-3.5 text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-3.5">
                  {u.role === "admin" ? (
                    <Badge className="bg-primary text-white border-none">Admin</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">User</Badge>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
                  {u.role === "admin" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/10"
                      onClick={() =>
                        confirm("Revoke admin privileges for this user?") &&
                        toggleRole.mutate({ userId: u.id, newRole: "user" })
                      }
                    >
                      <UserX className="mr-1 h-3.5 w-3.5" /> Revoke Admin
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() =>
                        confirm("Grant admin privileges to this user?") &&
                        toggleRole.mutate({ userId: u.id, newRole: "admin" })
                      }
                    >
                      <UserCheck className="mr-1 h-3.5 w-3.5" /> Make Admin
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-muted-foreground italic">
                  No registered profiles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
