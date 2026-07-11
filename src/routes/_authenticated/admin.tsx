import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BookOpen,
  Inbox,
  LayoutDashboard,
  Mail,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SITE, categories, blogCategories, imageKeyOptions } from "@/lib/content";
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
  type AdminPost,
  type AdminTrend,
} from "@/lib/admin-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
      { title: `Admin — ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div className="container-page py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-primary">Admin</p>
          <h1 className="mt-1 font-display text-4xl text-gradient">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage trends, journal articles, subscribers and inbound messages.
          </p>
        </div>
      </header>

      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="flex flex-wrap gap-2 bg-surface">
          <TabsTrigger value="overview"><LayoutDashboard className="mr-2 h-4 w-4" />Overview</TabsTrigger>
          <TabsTrigger value="trends"><Sparkles className="mr-2 h-4 w-4" />Trends</TabsTrigger>
          <TabsTrigger value="blog"><BookOpen className="mr-2 h-4 w-4" />Blog</TabsTrigger>
          <TabsTrigger value="newsletter"><Mail className="mr-2 h-4 w-4" />Newsletter</TabsTrigger>
          <TabsTrigger value="messages"><Inbox className="mr-2 h-4 w-4" />Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6"><OverviewTab /></TabsContent>
        <TabsContent value="trends" className="mt-6"><TrendsTab /></TabsContent>
        <TabsContent value="blog" className="mt-6"><BlogTab /></TabsContent>
        <TabsContent value="newsletter" className="mt-6"><NewsletterTab /></TabsContent>
        <TabsContent value="messages" className="mt-6"><MessagesTab /></TabsContent>
      </Tabs>
    </div>
  );
}

/* ---------------- OVERVIEW ---------------- */

function OverviewTab() {
  const { data } = useQuery({ queryKey: ["admin-overview"], queryFn: fetchAdminOverview });
  const stats = [
    { label: "Trends", value: data?.trends ?? 0 },
    { label: "Blog posts", value: data?.posts ?? 0 },
    { label: "Subscribers", value: data?.subscribers ?? 0 },
    { label: "Open messages", value: data?.openMessages ?? 0 },
    { label: "Total likes", value: data?.likes ?? 0 },
    { label: "Total saves", value: data?.favorites ?? 0 },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl bg-surface p-6 shadow-soft">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
          <div className="mt-2 font-display text-4xl text-foreground">{s.value}</div>
        </div>
      ))}
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

  const del = useMutation({
    mutationFn: (id: string) => deleteTrend(id),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-trends"] });
      qc.invalidateQueries({ queryKey: ["trends", "published"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function startNew() { setEditing({ ...emptyTrend }); setOpen(true); }
  function startEdit(t: AdminTrend) { setEditing({ ...t }); setOpen(true); }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl">Trends ({listQ.data?.length ?? 0})</h2>
        <Button onClick={startNew}><Plus className="mr-2 h-4 w-4" />New trend</Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(listQ.data ?? []).map((t) => (
              <tr key={t.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{t.title}<div className="text-xs text-muted-foreground">/{t.slug}</div></td>
                <td className="px-4 py-3">{categories.find((c) => c.slug === t.category_slug)?.name ?? t.category_slug}</td>
                <td className="px-4 py-3">{t.published ? <Badge>Published</Badge> : <Badge variant="secondary">Draft</Badge>}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(t.updated_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(t)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => confirm("Delete this trend?") && del.mutate(t.id)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {(!listQ.data || listQ.data.length === 0) && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No trends yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          {editing && <TrendForm initial={editing} onDone={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["admin-trends"] }); qc.invalidateQueries({ queryKey: ["trends", "published"] }); }} />}
        </DialogContent>
      </Dialog>
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
    onSuccess: () => { toast.success(isEdit ? "Trend updated" : "Trend created"); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit trend" : "New trend"}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-2">
        <div className="grid gap-2 md:grid-cols-2">
          <Field label="Title"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <Field label="Slug"><Input value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} placeholder="lowercase-with-dashes" /></Field>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <Field label="Category">
            <Select value={f.category_slug} onValueChange={(v) => setF({ ...f, category_slug: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Cover image (key or URL)">
            <Input value={f.image_key} onChange={(e) => setF({ ...f, image_key: e.target.value })} list="image-keys" />
            <datalist id="image-keys">
              {imageKeyOptions.map((k) => <option key={k} value={k} />)}
            </datalist>
          </Field>
        </div>
        <Field label="Excerpt"><Textarea rows={2} value={f.excerpt} onChange={(e) => setF({ ...f, excerpt: e.target.value })} /></Field>
        <Field label="Content (one paragraph per line)">
          <Textarea rows={6} value={f.content.join("\n")} onChange={(e) => setF({ ...f, content: e.target.value.split("\n").filter(Boolean) })} />
        </Field>
        <Field label="Style tips (one per line)">
          <Textarea rows={3} value={f.tips.join("\n")} onChange={(e) => setF({ ...f, tips: e.target.value.split("\n").filter(Boolean) })} />
        </Field>
        <div className="grid gap-2 md:grid-cols-2">
          <Field label="Tags (comma separated)">
            <Input value={f.tags.join(", ")} onChange={(e) => setF({ ...f, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
          </Field>
          <Field label="Gallery image keys (comma separated)">
            <Input value={f.gallery_keys.join(", ")} onChange={(e) => setF({ ...f, gallery_keys: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
          </Field>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          <Field label="Views (seed)"><Input type="number" value={f.views_seed} onChange={(e) => setF({ ...f, views_seed: Number(e.target.value) })} /></Field>
          <Field label="Likes (seed)"><Input type="number" value={f.likes_seed} onChange={(e) => setF({ ...f, likes_seed: Number(e.target.value) })} /></Field>
          <Field label="Publish date">
            <Input type="date" value={f.published_at ? f.published_at.slice(0, 10) : ""} onChange={(e) => setF({ ...f, published_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
          </Field>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={f.published} onCheckedChange={(v) => setF({ ...f, published: v })} />
          <span className="text-sm">{f.published ? "Published (visible on site)" : "Draft (hidden)"}</span>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? "Saving…" : isEdit ? "Save changes" : "Create trend"}</Button>
      </DialogFooter>
    </>
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

  const del = useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
      qc.invalidateQueries({ queryKey: ["blog", "published"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl">Blog posts ({listQ.data?.length ?? 0})</h2>
        <Button onClick={() => { setEditing({ ...emptyPost }); setOpen(true); }}><Plus className="mr-2 h-4 w-4" />New post</Button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(listQ.data ?? []).map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{p.title}<div className="text-xs text-muted-foreground">/{p.slug}</div></td>
                <td className="px-4 py-3 capitalize">{p.category.replace("-", " ")}</td>
                <td className="px-4 py-3">{p.published ? <Badge>Published</Badge> : <Badge variant="secondary">Draft</Badge>}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(p.updated_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing({ ...p }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => confirm("Delete this post?") && del.mutate(p.id)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {(!listQ.data || listQ.data.length === 0) && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No posts yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          {editing && <PostForm initial={editing} onDone={() => { setOpen(false); qc.invalidateQueries({ queryKey: ["admin-posts"] }); qc.invalidateQueries({ queryKey: ["blog", "published"] }); }} />}
        </DialogContent>
      </Dialog>
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
    onSuccess: () => { toast.success(isEdit ? "Post updated" : "Post created"); onDone(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit post" : "New post"}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-2">
        <div className="grid gap-2 md:grid-cols-2">
          <Field label="Title"><Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <Field label="Slug"><Input value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} /></Field>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <Field label="Category">
            <Select value={f.category} onValueChange={(v) => setF({ ...f, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {blogCategories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c.replace("-", " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Cover image (key or URL)">
            <Input value={f.image_key} onChange={(e) => setF({ ...f, image_key: e.target.value })} list="image-keys" />
          </Field>
        </div>
        <Field label="Excerpt"><Textarea rows={2} value={f.excerpt} onChange={(e) => setF({ ...f, excerpt: e.target.value })} /></Field>
        <Field label="Content (one paragraph per line)">
          <Textarea rows={8} value={f.content.join("\n")} onChange={(e) => setF({ ...f, content: e.target.value.split("\n").filter(Boolean) })} />
        </Field>
        <div className="grid gap-2 md:grid-cols-2">
          <Field label="Read minutes"><Input type="number" value={f.read_minutes} onChange={(e) => setF({ ...f, read_minutes: Number(e.target.value) })} /></Field>
          <Field label="Publish date">
            <Input type="date" value={f.published_at ? f.published_at.slice(0, 10) : ""} onChange={(e) => setF({ ...f, published_at: e.target.value ? new Date(e.target.value).toISOString() : null })} />
          </Field>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={f.published} onCheckedChange={(v) => setF({ ...f, published: v })} />
          <span className="text-sm">{f.published ? "Published (visible on site)" : "Draft (hidden)"}</span>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? "Saving…" : isEdit ? "Save changes" : "Create post"}</Button>
      </DialogFooter>
    </>
  );
}

/* ---------------- NEWSLETTER ---------------- */

function NewsletterTab() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-subs"], queryFn: fetchNewsletterSubscribers });
  const del = useMutation({
    mutationFn: (id: string) => deleteSubscriber(id),
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["admin-subs"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div>
      <h2 className="mb-4 font-display text-2xl">Subscribers ({q.data?.length ?? 0})</h2>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(q.data ?? []).map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{s.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => confirm("Remove subscriber?") && del.mutate(s.id)}><Trash2 className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}
            {(!q.data || q.data.length === 0) && (
              <tr><td colSpan={3} className="px-4 py-10 text-center text-muted-foreground">No subscribers yet.</td></tr>
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-messages"] }); qc.invalidateQueries({ queryKey: ["admin-overview"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteMessage(id),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-messages"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <h2 className="mb-4 font-display text-2xl">Contact messages ({q.data?.length ?? 0})</h2>
      <div className="space-y-3">
        {(q.data ?? []).map((m) => (
          <div key={m.id} className={`rounded-2xl border p-5 shadow-soft ${m.handled ? "border-border bg-secondary/30" : "border-primary/30 bg-surface"}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-medium">{m.subject}</div>
                <div className="text-xs text-muted-foreground">{m.name} · {m.email} · {new Date(m.created_at).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                {m.handled ? <Badge variant="secondary">Handled</Badge> : <Badge>New</Badge>}
                <Button size="sm" variant="outline" onClick={() => mark.mutate({ id: m.id, handled: !m.handled })}>
                  {m.handled ? "Mark unhandled" : "Mark handled"}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => confirm("Delete this message?") && del.mutate(m.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/90">{m.message}</p>
          </div>
        ))}
        {(!q.data || q.data.length === 0) && (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
            No messages yet.
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- SHARED ---------------- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
