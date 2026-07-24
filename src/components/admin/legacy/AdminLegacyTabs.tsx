import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BookOpen,
  Inbox,
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
  Download,
  Heart,
  Bookmark,
  Search,
  LayoutGrid,
  Table,
  ShoppingBag,
  Copy,
  PlusCircle,
  Star,
  Printer,
  Upload,
  Loader2,
} from "lucide-react";
import { SITE, categories, blogCategories, imageKeyOptions, resolveImage } from "@/lib/content";
import { uploadProductImage } from "@/lib/upload-product-image";
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
  fetchAdminProducts,
  upsertProduct,
  deleteProduct,
  fetchAdminOrders,
  updateOrderStatus,
  fetchAdminInventory,
  updateInventoryQty,
  fetchAdminCoupons,
  upsertCoupon,
  deleteCoupon,
  fetchAdminReviews,
  updateReviewStatus,
  deleteReview,
} from "@/lib/admin-data";
import { deleteComment, fetchAllCommentsAdmin, setCommentStatus } from "@/lib/comments-data";
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

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
        {label}
      </Label>
      {children}
    </div>
  );
}

export function ImagePicker({
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
      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
        {label}
      </Label>
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

export function ListBuilder({
  label,
  values,
  onChange,
  placeholder = "Add item...",
  allowUpload = false,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  /** Enable local/Supabase image file upload (for product galleries) */
  allowUpload?: boolean;
}) {
  const [newVal, setNewVal] = useState("");
  const [uploading, setUploading] = useState(false);

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

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadProductImage(file);
        urls.push(url);
      }
      onChange([...values, ...urls]);
      toast.success(urls.length === 1 ? "Image uploaded" : `${urls.length} images uploaded`);
    } catch (err: any) {
      toast.error(err?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const isImageValue = (val: string) =>
    val.startsWith("data:image/") || /^https?:\/\//i.test(val) || val.startsWith("/");

  return (
    <div className="grid gap-3 border border-border/40 rounded-2xl bg-secondary/5 p-4">
      <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
        {label}
      </Label>
      <div className="flex flex-wrap gap-2">
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
          className="min-w-[12rem] flex-1"
        />
        <Button
          type="button"
          onClick={handleAdd}
          size="sm"
          className="bg-primary hover:bg-accent text-white rounded-full cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
        {allowUpload && (
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3.5 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10">
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Uploading…" : "Upload"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                void handleUpload(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
      {allowUpload && (
        <p className="text-[10px] text-muted-foreground">
          Upload JPG, PNG, or WebP (max 4MB). You can still paste an image URL and click Add.
        </p>
      )}
      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
        {values.map((val, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-border/60 shadow-soft text-sm text-foreground/90 transition hover:border-primary/30"
          >
            {allowUpload && isImageValue(val) ? (
              <img
                src={val}
                alt=""
                className="h-12 w-10 shrink-0 rounded-lg object-cover border border-border"
              />
            ) : null}
            <span className="flex-1 break-all leading-relaxed text-xs">
              {val.startsWith("data:") ? "Uploaded image" : val}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-secondary/15 cursor-pointer"
                disabled={idx === 0}
                onClick={() => handleMove(idx, -1)}
              >
                <ArrowUp className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-secondary/15 cursor-pointer"
                disabled={idx === values.length - 1}
                onClick={() => handleMove(idx, 1)}
              >
                <ArrowDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                onClick={() => handleRemove(idx)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {values.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-3 italic">
            No items added yet.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------- OVERVIEW ---------------- */

export function OverviewTab({ overview: propOverview }: { overview?: any }) {
  const { data: queryOverview } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: fetchAdminOverview,
    initialData: propOverview,
  });
  const data = queryOverview || propOverview;

  const stats = [
    {
      label: "Trends",
      value: data?.trends ?? 0,
      desc: "Total visual trendboards",
      color: "from-[#C2185B]/5 to-[#A01048]/10 text-primary border-primary/20",
      icon: Sparkles,
    },
    {
      label: "Blog Posts",
      value: data?.posts ?? 0,
      desc: "Published and draft articles",
      color: "from-blue-500/5 to-indigo-500/10 text-blue-700 border-blue-200",
      icon: BookOpen,
    },
    {
      label: "Subscribers",
      value: data?.subscribers ?? 0,
      desc: "Active newsletter readers",
      color: "from-emerald-500/5 to-teal-500/10 text-emerald-700 border-emerald-200",
      icon: Mail,
    },
    {
      label: "Open Messages",
      value: data?.openMessages ?? 0,
      desc: "Awaiting customer response",
      color: "from-amber-500/5 to-orange-500/10 text-amber-700 border-amber-200",
      icon: Inbox,
    },
    {
      label: "Total Likes",
      value: data?.likes ?? 0,
      desc: "User likes on trends",
      color: "from-rose-500/5 to-pink-500/10 text-rose-700 border-rose-200",
      icon: Heart,
    },
    {
      label: "Total Saved",
      value: data?.favorites ?? 0,
      desc: "Bookmarked articles & trends",
      color: "from-purple-500/5 to-fuchsia-500/10 text-purple-700 border-purple-200",
      icon: Bookmark,
    },
    {
      label: "Comments",
      value: data?.comments ?? 0,
      desc: "User engagement threads",
      color: "from-cyan-500/5 to-blue-500/10 text-cyan-700 border-cyan-200",
      icon: MessageCircle,
    },
    {
      label: "Total Users",
      value: data?.users ?? 0,
      desc: "Registered member profiles",
      color: "from-slate-500/5 to-neutral-500/10 text-slate-700 border-slate-200",
      icon: Users,
    },
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
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </span>
                  <div className="mt-2 font-display text-4xl font-semibold text-foreground">
                    {s.value}
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-3 shadow-soft text-primary border border-border/20 shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground font-medium leading-relaxed">
                {s.desc}
              </p>
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

export function TrendsTab() {
  const qc = useQueryClient();
  const listQ = useQuery({ queryKey: ["admin-trends"], queryFn: fetchAdminTrends });
  const [editing, setEditing] = useState<AdminTrend | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

  const del = useMutation({
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
      t.slug.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl">Visual Trends ({filtered.length})</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage content lookbooks, style guides and category filters.
          </p>
        </div>
        <Button
          onClick={startNew}
          className="bg-primary hover:bg-accent text-white rounded-full px-5 py-2"
        >
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
                  <tr
                    key={t.id}
                    className="border-t border-border/60 hover:bg-secondary/5 transition"
                  >
                    <td className="px-5 py-3.5 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border/40 bg-muted shadow-soft">
                          <img src={imgUrl} alt={t.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground truncate max-w-sm md:max-w-md">
                            {t.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-xs md:max-w-sm">
                            {t.excerpt}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                            /{t.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="outline" className="border-border/80 bg-[#FFF9FB]/50">
                        {categories.find((c) => c.slug === t.category_slug)?.name ??
                          t.category_slug}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      {t.published ? (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none">
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground">
                          Draft
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {new Date(t.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(t)}
                        className="hover:bg-secondary/20 mr-1"
                      >
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

export function AdminTrendCard({
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
        <img
          src={imgUrl}
          alt={trend.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/90 text-primary hover:bg-white text-[10px] uppercase font-semibold border-none shadow-soft">
            {categories.find((c) => c.slug === trend.category_slug)?.name ?? trend.category_slug}
          </Badge>
        </div>
        {!trend.published && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
            <Badge
              variant="secondary"
              className="bg-black/60 text-white border-none uppercase text-[10px] tracking-wider font-semibold"
            >
              Draft
            </Badge>
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

export function TrendForm({ initial, onDone }: { initial: AdminTrend; onDone: () => void }) {
  const [f, setF] = useState<AdminTrend>(initial);
  const isEdit = !!initial.id;

  const save = useMutation({
    mutationFn: async () => {
      if (!f.slug || !f.title || !f.excerpt)
        throw new Error("Slug, title and excerpt are required");
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
        <DialogTitle className="font-display text-2xl">
          {isEdit ? "Modify Lookbook Trend" : "New Visual Trend"}
        </DialogTitle>
      </DialogHeader>

      <div className="grid gap-5 py-2">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title">
            <Input
              value={f.title}
              onChange={(e) => setF({ ...f, title: e.target.value })}
              placeholder="e.g. Sage & Rose: The Palette Of The Season"
            />
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
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
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
        <ImagePicker
          label="Cover Image"
          value={f.image_key}
          onChange={(val) => setF({ ...f, image_key: val })}
        />

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
        <Button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="bg-primary hover:bg-accent text-white w-full rounded-full"
        >
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

export function BlogTab() {
  const qc = useQueryClient();
  const listQ = useQuery({ queryKey: ["admin-posts"], queryFn: fetchAdminPosts });
  const [editing, setEditing] = useState<AdminPost | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

  const del = useMutation({
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
      p.slug.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl animate-fade-in">
            Blog Journal Editorials ({filtered.length})
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Publish news features, guides, styling advice and editor reviews.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing({ ...emptyPost });
            setOpen(true);
          }}
          className="bg-primary hover:bg-accent text-white rounded-full px-5 py-2"
        >
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
                  <tr
                    key={p.id}
                    className="border-t border-border/60 hover:bg-secondary/5 transition"
                  >
                    <td className="px-5 py-3.5 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border/40 bg-muted shadow-soft">
                          <img src={imgUrl} alt={p.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground truncate max-w-sm md:max-w-md">
                            {p.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-xs md:max-w-sm">
                            {p.excerpt}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                            /{p.slug}
                          </div>
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
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none">
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground">
                          Draft
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {new Date(p.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditing({ ...p });
                          setOpen(true);
                        }}
                        className="hover:bg-secondary/20 mr-1"
                      >
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

export function AdminBlogCard({
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
        <img
          src={imgUrl}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {!post.published && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
            <Badge
              variant="secondary"
              className="bg-black/60 text-white border-none uppercase text-[10px] tracking-wider font-semibold"
            >
              Draft
            </Badge>
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
          <span className="text-[10px] text-muted-foreground font-mono truncate">/{post.slug}</span>
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

export function PostForm({ initial, onDone }: { initial: AdminPost; onDone: () => void }) {
  const [f, setF] = useState<AdminPost>(initial);
  const isEdit = !!initial.id;

  const save = useMutation({
    mutationFn: async () => {
      if (!f.slug || !f.title || !f.excerpt)
        throw new Error("Slug, title and excerpt are required");
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
        <DialogTitle className="font-display text-2xl">
          {isEdit ? "Edit Editorial Post" : "Compose Editorial Post"}
        </DialogTitle>
      </DialogHeader>

      <div className="grid gap-5 py-2">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Article Title">
            <Input
              value={f.title}
              onChange={(e) => setF({ ...f, title: e.target.value })}
              placeholder="e.g. Building A Capsule Wardrobe: The Pakistani Edit"
            />
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
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
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
        <ImagePicker
          label="Cover Image"
          value={f.image_key}
          onChange={(val) => setF({ ...f, image_key: val })}
        />

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
        <Button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="bg-primary hover:bg-accent text-white w-full rounded-full"
        >
          {save.isPending ? "Syncing data..." : isEdit ? "Update Article" : "Publish Article"}
        </Button>
      </DialogFooter>
    </div>
  );
}

/* ---------------- NEWSLETTER ---------------- */

export function NewsletterTab() {
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
          <p className="text-xs text-muted-foreground mt-1">
            Manage user emails that opted-in to receive magazine notifications.
          </p>
        </div>
        <Button
          onClick={handleExportCSV}
          className="bg-primary hover:bg-accent text-white rounded-full px-5 py-2"
        >
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

export function MessagesTab() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-messages"], queryFn: fetchContactMessages });

  const mark = useMutation({
    mutationFn: ({ id, handled }: { id: string; handled: boolean }) =>
      markMessageHandled(id, handled),
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
        <h2 className="font-display text-2xl font-semibold">
          Inbox Messages ({q.data?.length ?? 0})
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Review contact requests, reader inquiries, and collaboration requests.
        </p>
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
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      Handled
                    </Badge>
                  ) : (
                    <Badge className="bg-primary text-white border-none">New</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  From: <span className="font-semibold text-foreground/80">{m.name}</span> ·{" "}
                  {m.email} · {new Date(m.created_at).toLocaleString()}
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
            <p className="mt-4 whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed border-t border-border/40 pt-3">
              {m.message}
            </p>
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

export function CommentsTab() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-comments"], queryFn: fetchAllCommentsAdmin });

  const setStatus = useMutation({
    mutationFn: (vars: { id: string; status: "visible" | "hidden" }) =>
      setCommentStatus(vars.id, vars.status),
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
        <p className="text-xs text-muted-foreground mt-1">
          Approve, hide or delete comment threads under lookbooks and editorials.
        </p>
      </div>

      <div className="space-y-4">
        {rows.map((c) => (
          <div
            key={c.id}
            className={`rounded-3xl border p-5 shadow-soft transition-all duration-300 ${
              c.status === "hidden"
                ? "border-border bg-white/40 opacity-70"
                : "border-border bg-white"
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
                    <span className="font-semibold text-foreground">
                      {c.target_title ?? c.target_id}
                    </span>
                  </span>
                  {c.status === "hidden" && (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      Hidden
                    </Badge>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(c.created_at).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setStatus.mutate({
                      id: c.id,
                      status: c.status === "hidden" ? "visible" : "hidden",
                    })
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
            <p className="mt-4 whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed border-t border-border/40 pt-3">
              {c.body}
            </p>
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

export function UsersTab() {
  const qc = useQueryClient();
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
  });

  const toggleRole = useMutation({
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
    return (
      <div className="py-20 text-center text-muted-foreground italic animate-pulse">
        Loading registered profiles...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold">Users & Roles ({users.length})</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Manage system administrators, moderator roles, and view user metadata profiles.
        </p>
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
                        <img
                          src={u.avatar_url}
                          alt={u.display_name ?? ""}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        u.display_name?.slice(0, 2).toUpperCase() || "U"
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate">
                        {u.display_name || "Anonymous Reader"}
                      </div>
                      {u.bio && (
                        <div className="text-xs text-muted-foreground truncate max-w-xs mt-0.5 leading-relaxed">
                          {u.bio}
                        </div>
                      )}
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
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      User
                    </Badge>
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

/* ---------------- PRODUCTS TAB ---------------- */

export function ProductsTab() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form states
  const [sku, setSku] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState(0);
  const [compPrice, setCompPrice] = useState<number | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [category, setCategory] = useState("lawn-suits");
  const [sizes, setSizes] = useState<string[]>(["XS", "S", "M", "L", "XL", "XXL"]);
  const [colors, setColors] = useState<string[]>([]);
  const [fabric, setFabric] = useState("");
  const [embroidery, setEmbroidery] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);

  // Loading admin products
  const productsQ = useQuery({
    queryKey: ["admin-products"],
    queryFn: fetchAdminProducts,
  });

  const upsertMut = useMutation({
    mutationFn: async () => {
      const payload = {
        id: editId || undefined,
        sku,
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        short_description: shortDesc,
        description: desc,
        price,
        compare_at_price: compPrice,
        images:
          imageUrls.length > 0
            ? imageUrls
            : [
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80",
              ],
        video_url: videoUrl || null,
        category,
        sizes,
        colors: colors.length > 0 ? colors : ["Default"],
        fabric: fabric || null,
        embroidery: embroidery || null,
        is_featured: isFeatured,
        is_trending: isTrending,
        is_new_arrival: isNewArrival,
        stock_status: "in_stock",
      };
      await upsertProduct(payload);
    },
    onSuccess: () => {
      toast.success(editId ? "Product updated" : "Product added");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      // Reset form
      setEditId(null);
      setSku("");
      setTitle("");
      setSlug("");
      setShortDesc("");
      setDesc("");
      setPrice(0);
      setCompPrice(null);
      setImageUrls([]);
      setVideoUrl("");
      setColors([]);
      setFabric("");
      setEmbroidery("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Product deleted successfully");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleEdit = (prod: any) => {
    setEditId(prod.id);
    setSku(prod.sku);
    setTitle(prod.title);
    setSlug(prod.slug);
    setShortDesc(prod.short_description);
    setDesc(prod.description);
    setPrice(prod.price);
    setCompPrice(prod.compare_at_price);
    setImageUrls(prod.images || []);
    setVideoUrl(prod.video_url || "");
    setCategory(prod.category);
    setSizes(prod.sizes || []);
    setColors(prod.colors || []);
    setFabric(prod.fabric || "");
    setEmbroidery(prod.embroidery || "");
    setIsFeatured(prod.is_featured);
    setIsTrending(prod.is_trending);
    setIsNewArrival(prod.is_new_arrival);
    setOpen(true);
  };

  const handleDuplicate = (prod: any) => {
    setEditId(null); // Save as new
    setSku(`${prod.sku}-COPY`);
    setTitle(`${prod.title} (Copy)`);
    setSlug(`${prod.slug}-copy`);
    setShortDesc(prod.short_description);
    setDesc(prod.description);
    setPrice(prod.price);
    setCompPrice(prod.compare_at_price);
    setImageUrls(prod.images || []);
    setVideoUrl(prod.video_url || "");
    setCategory(prod.category);
    setSizes(prod.sizes || []);
    setColors(prod.colors || []);
    setFabric(prod.fabric || "");
    setEmbroidery(prod.embroidery || "");
    setIsFeatured(prod.is_featured);
    setIsTrending(prod.is_trending);
    setIsNewArrival(prod.is_new_arrival);
    setOpen(true);
  };

  const handleSizeToggle = (sz: string) => {
    if (sizes.includes(sz)) {
      setSizes(sizes.filter((s) => s !== sz));
    } else {
      setSizes([...sizes, sz]);
    }
  };

  const products = productsQ.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Catalog Management</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage designer products and variants
          </p>
        </div>
        <Button
          onClick={() => {
            setEditId(null);
            setOpen(true);
          }}
          className="bg-primary hover:bg-accent text-white rounded-full text-xs font-semibold px-4.5 py-2 cursor-pointer shadow-soft"
        >
          <PlusCircle className="mr-1 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="rounded-3xl border border-border/80 bg-white overflow-hidden shadow-soft">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary/10 border-b border-border/80 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              <th className="px-5 py-4">Image & Title</th>
              <th className="px-5 py-4">SKU</th>
              <th className="px-5 py-4">Price</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-xs">
            {products.map((prod: any) => (
              <tr key={prod.id} className="hover:bg-secondary/5 transition">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.images?.[0] || ""}
                      alt=""
                      className="h-11 w-9 object-cover rounded-lg border border-border shadow-soft"
                    />
                    <div>
                      <div className="font-bold text-foreground">{prod.title}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{prod.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 font-mono text-muted-foreground">{prod.sku}</td>
                <td className="px-5 py-3 font-bold text-primary">
                  PKR {prod.price.toLocaleString()}
                </td>
                <td className="px-5 py-3 capitalize text-muted-foreground">
                  {prod.category.replace("-", " ")}
                </td>
                <td className="px-5 py-3 text-right space-x-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-secondary/20 text-muted-foreground hover:text-foreground"
                    onClick={() => handleEdit(prod)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-secondary/20 text-primary"
                    onClick={() => handleDuplicate(prod)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => confirm("Delete this product?") && deleteMut.mutate(prod.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT DIALOG FORM */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl rounded-3xl border border-border bg-white p-6 shadow-elegant max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">
              {editId ? "Edit Product" : "Create Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Product SKU *">
                <Input
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="PAH-LWN-101"
                  required
                />
              </Field>
              <Field label="Product Title *">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g. Rose Garden Kurta"
                  required
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Category *">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary"
                >
                  <option value="lawn-suits">Lawn Collection</option>
                  <option value="pret-wear">Pret Wear</option>
                  <option value="casual-wear">Casual Wear</option>
                  <option value="formal-wear">Formal Wear</option>
                  <option value="luxury-pret">Luxury Pret</option>
                  <option value="bridal-wear">Bridal Wear</option>
                  <option value="eid-collections">Eid Collection</option>
                </select>
              </Field>
              <Field label="Slug URL (optional)">
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="rose-garden-kurta"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Selling Price (PKR) *">
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  required
                />
              </Field>
              <Field label="Original Price (for discount display)">
                <Input
                  type="number"
                  value={compPrice || ""}
                  onChange={(e) => setCompPrice(e.target.value ? Number(e.target.value) : null)}
                />
              </Field>
            </div>

            <Field label="Short Description *">
              <Input
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Brief summary of item card..."
                required
              />
            </Field>

            <Field label="Full Description *">
              <Textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Elaborate details about styling, look and structure..."
                rows={3}
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Fabric Type">
                <Input
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  placeholder="Pure raw silk / Chiffon / Lawn"
                />
              </Field>
              <Field label="Embroidery Style">
                <Input
                  value={embroidery}
                  onChange={(e) => setEmbroidery(e.target.value)}
                  placeholder="Zardozi handcraft / None"
                />
              </Field>
            </div>

            {/* List builders */}
            <ListBuilder
              label="Image URLs"
              values={imageUrls}
              onChange={setImageUrls}
              placeholder="Insert Unsplash image link..."
              allowUpload
            />

            <div className="space-y-1.5">
              <Label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                Available Sizes
              </Label>
              <div className="flex gap-2">
                {["XS", "S", "M", "L", "XL", "XXL"].map((sz) => {
                  const selected = sizes.includes(sz);
                  return (
                    <button
                      type="button"
                      key={sz}
                      onClick={() => handleSizeToggle(sz)}
                      className={`h-8 w-10 rounded-lg border text-[10px] font-bold ${
                        selected ? "bg-primary border-primary text-white" : "border-border bg-white"
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            <ListBuilder
              label="Available Colors"
              values={colors}
              onChange={setColors}
              placeholder="E.g. Lilac, Peach, Emerald"
            />

            {/* Badges indicators */}
            <div className="grid grid-cols-3 gap-4 border-t border-border/40 pt-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="featured-cb" className="text-xs">
                  Featured Product
                </Label>
                <input
                  id="featured-cb"
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4.5 w-4.5"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="trending-cb" className="text-xs">
                  Trending Now
                </Label>
                <input
                  id="trending-cb"
                  type="checkbox"
                  checked={isTrending}
                  onChange={(e) => setIsTrending(e.target.checked)}
                  className="h-4.5 w-4.5"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="newarrival-cb" className="text-xs">
                  New Arrival
                </Label>
                <input
                  id="newarrival-cb"
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="h-4.5 w-4.5"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="rounded-full text-xs font-semibold px-4"
            >
              Cancel
            </Button>
            <Button
              onClick={() => upsertMut.mutate()}
              disabled={upsertMut.isPending}
              className="bg-primary hover:bg-accent text-white rounded-full text-xs font-semibold px-6 shadow-soft"
            >
              {upsertMut.isPending ? "Syncing..." : editId ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- ORDERS TAB ---------------- */

export function OrdersTab() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Status controls
  const [status, setStatus] = useState("pending");
  const [trackingNo, setTrackingNo] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  const ordersQ = useQuery({
    queryKey: ["admin-orders"],
    queryFn: fetchAdminOrders,
  });

  const updateMut = useMutation({
    mutationFn: async () => {
      if (!selectedOrder) return;
      await updateOrderStatus(selectedOrder.id, status, trackingNo, internalNotes);
    },
    onSuccess: () => {
      toast.success("Order status modified");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleOpenDetail = (order: any) => {
    setSelectedOrder(order);
    setStatus(order.status);
    setTrackingNo(order.tracking_number || "");
    setInternalNotes(order.order_notes || "");
    setOpen(true);
  };

  const handlePrintInvoice = (order: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - Order #${order.id}</title>
          <style>
            body { font-family: 'Poppins', sans-serif; padding: 40px; color: #2D2D2D; }
            h1 { font-family: 'Playfair Display', serif; color: #C2185B; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: left; }
            th { background-color: #FFF9FB; }
            .totals { text-align: right; margin-top: 30px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>PAHRAAN COUTURE</h1>
          <p>Order Date: ${new Date(order.created_at).toLocaleDateString()}</p>
          <p>Recipient: ${order.first_name} ${order.last_name} (${order.email})</p>
          <p>Address: ${order.shipping_address.address_line1}, ${order.shipping_address.city}</p>
          <table>
            <thead>
              <tr><th>Item</th><th>Detail</th><th>Qty</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              ${(order.order_items || [])
                .map(
                  (i: any) => `
                <tr>
                  <td>${i.product_title}</td>
                  <td>${i.size} / ${i.color}</td>
                  <td>${i.quantity}</td>
                  <td>PKR ${(i.price * i.quantity).toLocaleString()}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          <div class="totals">
            <p>Subtotal: PKR ${order.subtotal.toLocaleString()}</p>
            <p>Final Paid: PKR ${order.total.toLocaleString()}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const orders = ordersQ.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Order Management</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Review customer shipments and payment status
        </p>
      </div>

      <div className="rounded-3xl border border-border/80 bg-white overflow-hidden shadow-soft">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary/10 border-b border-border/80 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              <th className="px-5 py-4">Order ID</th>
              <th className="px-5 py-4">Customer</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Total</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-xs">
            {orders.map((ord: any) => (
              <tr
                key={ord.id}
                className="hover:bg-secondary/5 transition cursor-pointer"
                onClick={() => handleOpenDetail(ord)}
              >
                <td className="px-5 py-3 font-mono text-primary font-semibold">
                  {ord.id.slice(0, 8).toUpperCase()}
                </td>
                <td className="px-5 py-3">
                  <p className="font-semibold">
                    {ord.first_name} {ord.last_name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                    {ord.email}
                  </p>
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {new Date(ord.created_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-3 font-bold">PKR {ord.total.toLocaleString()}</td>
                <td className="px-5 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${
                      ord.status === "delivered"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : ord.status === "cancelled"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {ord.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-secondary/15 rounded-full"
                    onClick={() => handlePrintInvoice(ord)}
                  >
                    <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DETAIL MODAL & SHIPMENT CONTROLS */}
      {selectedOrder && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-md rounded-3xl border border-border bg-white p-6 shadow-elegant">
            <DialogHeader>
              <DialogTitle className="font-display text-lg font-bold">
                Order Details & Status
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="border border-border/40 rounded-2xl bg-secondary/5 p-4 space-y-1.5 text-muted-foreground">
                <p>
                  Order ID: <strong className="text-foreground">{selectedOrder.id}</strong>
                </p>
                <p>
                  Placed By:{" "}
                  <strong className="text-foreground">
                    {selectedOrder.first_name} {selectedOrder.last_name} ({selectedOrder.email})
                  </strong>
                </p>
                <p>
                  Phone: <strong className="text-foreground">{selectedOrder.phone}</strong>
                </p>
                <p>
                  Ship Address:{" "}
                  <strong className="text-foreground">
                    {selectedOrder.shipping_address.address_line1},{" "}
                    {selectedOrder.shipping_address.city}
                  </strong>
                </p>
                <p>
                  Payment:{" "}
                  <strong className="text-foreground uppercase">
                    {selectedOrder.payment_method} ({selectedOrder.payment_status})
                  </strong>
                </p>
              </div>

              {/* Items */}
              <div className="divide-y divide-border/40 max-h-40 overflow-y-auto">
                {(selectedOrder.order_items || []).map((item: any) => (
                  <div key={item.id} className="py-2.5 flex justify-between">
                    <div>
                      <p className="font-bold text-foreground">{item.product_title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">
                        {item.size} / {item.color} · Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold">
                      PKR {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Edit Status fields */}
              <div className="space-y-3.5 border-t border-border/40 pt-4">
                <Field label="Order Fulfillment Status">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </Field>

                <Field label="Courier Tracking Number">
                  <Input
                    value={trackingNo}
                    onChange={(e) => setTrackingNo(e.target.value)}
                    placeholder="TCS12998811"
                  />
                </Field>

                <Field label="Internal Order Notes">
                  <Input
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Gate verification pending..."
                  />
                </Field>
              </div>
            </div>

            <DialogFooter className="mt-4 gap-2">
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                className="rounded-full text-xs font-semibold px-4"
              >
                Cancel
              </Button>
              <Button
                onClick={() => updateMut.mutate()}
                disabled={updateMut.isPending}
                className="bg-primary hover:bg-accent text-white rounded-full text-xs font-semibold px-6 shadow-soft"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/* ---------------- INVENTORY TAB ---------------- */

export function InventoryTab() {
  const qc = useQueryClient();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const inventoryQ = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: fetchAdminInventory,
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, qty }: { id: string; qty: number }) => {
      await updateInventoryQty(id, qty);
    },
    onSuccess: () => {
      toast.success("Inventory stock level updated");
      qc.invalidateQueries({ queryKey: ["admin-inventory"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const inventory = inventoryQ.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Inventory Management</h2>
        <p className="text-xs text-muted-foreground mt-1">Adjust variant stock limits and levels</p>
      </div>

      <div className="rounded-3xl border border-border/80 bg-white overflow-hidden shadow-soft">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary/10 border-b border-border/80 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              <th className="px-5 py-4">Product Name</th>
              <th className="px-5 py-4">SKU</th>
              <th className="px-5 py-4">Size / Color</th>
              <th className="px-5 py-4">Quantity Stock</th>
              <th className="px-5 py-4 text-right">Adjustment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-xs">
            {inventory.map((item: any) => {
              const localVal =
                quantities[item.id] !== undefined ? quantities[item.id] : item.quantity;
              return (
                <tr key={item.id} className="hover:bg-secondary/5 transition">
                  <td className="px-5 py-3 font-semibold text-foreground">
                    {item.products?.title || "Unknown product"}
                  </td>
                  <td className="px-5 py-3 font-mono text-muted-foreground">
                    {item.products?.sku}
                  </td>
                  <td className="px-5 py-3 capitalize text-muted-foreground">
                    {item.size} / {item.color}
                  </td>
                  <td className="px-5 py-3 font-bold">
                    <span
                      className={`px-2 py-0.5 rounded-full ${item.quantity === 0 ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}
                    >
                      {item.quantity} In Stock
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex gap-2 items-center justify-end">
                      <input
                        type="number"
                        value={localVal}
                        onChange={(e) =>
                          setQuantities({ ...quantities, [item.id]: Number(e.target.value) })
                        }
                        className="w-16 rounded-xl border border-border bg-background px-2.5 py-1.5 text-center text-xs outline-none focus:border-primary"
                      />
                      <Button
                        size="sm"
                        className="bg-primary text-white rounded-xl text-[10px]"
                        onClick={() => updateMut.mutate({ id: item.id, qty: localVal })}
                        disabled={updateMut.isPending}
                      >
                        Update
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- COUPONS TAB ---------------- */

export function CouponsTab() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState("");
  const [discType, setDiscType] = useState("percentage");
  const [discValue, setDiscValue] = useState(0);
  const [minSpend, setMinSpend] = useState(0);
  const [limit, setLimit] = useState<number | null>(null);
  const [endDate, setEndDate] = useState("");

  const couponsQ = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: fetchAdminCoupons,
  });

  const upsertMut = useMutation({
    mutationFn: async () => {
      const payload = {
        id: editId || undefined,
        code,
        discount_type: discType,
        discount_value: discValue,
        min_purchase_amount: minSpend,
        usage_limit: limit,
        end_date: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      await upsertCoupon(payload);
    },
    onSuccess: () => {
      toast.success(editId ? "Coupon updated" : "Coupon generated");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
      // Reset form
      setEditId(null);
      setCode("");
      setDiscValue(0);
      setMinSpend(0);
      setLimit(null);
      setEndDate("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      toast.success("Coupon code deleted");
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const coupons = couponsQ.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Coupon Codes</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Manage marketing promotions and discounts
          </p>
        </div>
        <Button
          onClick={() => {
            setEditId(null);
            setOpen(true);
          }}
          className="bg-primary hover:bg-accent text-white rounded-full text-xs font-semibold px-4.5 py-2 cursor-pointer shadow-soft"
        >
          <Plus className="mr-1 h-4 w-4" /> Add Coupon
        </Button>
      </div>

      <div className="rounded-3xl border border-border/80 bg-white overflow-hidden shadow-soft">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary/10 border-b border-border/80 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              <th className="px-5 py-4">Coupon Code</th>
              <th className="px-5 py-4">Discount</th>
              <th className="px-5 py-4">Min Spend</th>
              <th className="px-5 py-4">Usages</th>
              <th className="px-5 py-4">Expiry</th>
              <th className="px-5 py-4 text-right">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-xs">
            {coupons.map((cp: any) => (
              <tr key={cp.id} className="hover:bg-secondary/5 transition">
                <td className="px-5 py-3 font-mono font-bold text-primary">{cp.code}</td>
                <td className="px-5 py-3 capitalize text-foreground">
                  {cp.discount_type === "percentage"
                    ? `${cp.discount_value}% Off`
                    : cp.discount_type === "fixed"
                      ? `PKR ${cp.discount_value} Off`
                      : "Free Shipping"}
                </td>
                <td className="px-5 py-3 font-medium">
                  PKR {cp.min_purchase_amount.toLocaleString()}
                </td>
                <td className="px-5 py-3 font-semibold text-muted-foreground">
                  {cp.usage_count} / {cp.usage_limit || "∞"}
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {new Date(cp.end_date).toLocaleDateString()}
                </td>
                <td className="px-5 py-3 text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => confirm("Delete this coupon?") && deleteMut.mutate(cp.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD COUPON DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-3xl border border-border bg-white p-6 shadow-elegant">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">
              Generate Coupon Code
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <Field label="Coupon Code Name *">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="SUMMER25"
                required
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Discount Type">
                <select
                  value={discType}
                  onChange={(e) => setDiscType(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary"
                >
                  <option value="percentage">Percentage %</option>
                  <option value="fixed">Fixed Price Amount</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </Field>
              <Field label="Discount Value *">
                <Input
                  type="number"
                  value={discValue}
                  onChange={(e) => setDiscValue(Number(e.target.value))}
                  required
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Minimum Spend threshold">
                <Input
                  type="number"
                  value={minSpend}
                  onChange={(e) => setMinSpend(Number(e.target.value))}
                />
              </Field>
              <Field label="Usage Limit count">
                <Input
                  type="number"
                  value={limit || ""}
                  onChange={(e) => setLimit(e.target.value ? Number(e.target.value) : null)}
                  placeholder="Unlimited"
                />
              </Field>
            </div>

            <Field label="Expiration Date *">
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </Field>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="rounded-full text-xs font-semibold px-4"
            >
              Cancel
            </Button>
            <Button
              onClick={() => upsertMut.mutate()}
              disabled={upsertMut.isPending}
              className="bg-primary hover:bg-accent text-white rounded-full text-xs font-semibold px-6 shadow-soft"
            >
              {upsertMut.isPending ? "Generating..." : "Generate Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- REVIEWS TAB ---------------- */

export function ReviewsTab() {
  const qc = useQueryClient();

  const reviewsQ = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: fetchAdminReviews,
  });

  const toggleMut = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: "visible" | "hidden" }) => {
      await updateReviewStatus(id, newStatus);
    },
    onSuccess: () => {
      toast.success("Review visibility altered");
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      toast.success("Review deleted");
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reviews = reviewsQ.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Feedback Reviews</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Moderate customer reviews and stars rating
        </p>
      </div>

      <div className="rounded-3xl border border-border/80 bg-white overflow-hidden shadow-soft">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary/10 border-b border-border/80 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              <th className="px-5 py-4">Product Name</th>
              <th className="px-5 py-4">Author</th>
              <th className="px-5 py-4">Stars</th>
              <th className="px-5 py-4">Comments</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-xs">
            {reviews.map((rev: any) => (
              <tr key={rev.id} className="hover:bg-secondary/5 transition">
                <td className="px-5 py-3">
                  <p className="font-bold">{rev.products?.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{rev.products?.sku}</p>
                </td>
                <td className="px-5 py-3 font-semibold text-foreground">{rev.display_name}</td>
                <td className="px-5 py-3">
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-current" />
                    ))}
                  </div>
                </td>
                <td
                  className="px-5 py-3 max-w-[200px] truncate text-muted-foreground"
                  title={rev.comment}
                >
                  {rev.comment}
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() =>
                      toggleMut.mutate({
                        id: rev.id,
                        newStatus: rev.status === "visible" ? "hidden" : "visible",
                      })
                    }
                    className={`px-3 py-1 rounded-full border text-[9px] font-bold uppercase cursor-pointer transition ${
                      rev.status === "visible"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {rev.status}
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => confirm("Delete this review?") && deleteMut.mutate(rev.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
