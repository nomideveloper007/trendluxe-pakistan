import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Download,
  ImagePlus,
  LayoutTemplate,
  Megaphone,
  MoveDown,
  MoveUp,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { fetchAdminOverview, fetchAdminOrders } from "@/lib/admin-data";
import { exportCsv, loadAdminJson, money, saveAdminJson } from "../admin-utils";
import { AdminPanelShell } from "./AdminCatalogPanels";

export function AdminMarketingPanel() {
  const [campaigns, setCampaigns] = useState(() =>
    loadAdminJson("pahraan_admin_campaigns", [
      { id: "1", name: "Eid Flash Sale", channel: "email", status: "draft" },
      { id: "2", name: "Abandoned Cart Reminder", channel: "email", status: "active" },
      { id: "3", name: "VIP Early Access SMS", channel: "sms", status: "placeholder" },
    ]),
  );

  useEffect(() => saveAdminJson("pahraan_admin_campaigns", campaigns), [campaigns]);

  return (
    <AdminPanelShell
      title="Marketing"
      subtitle="Newsletter, campaigns, abandoned cart, referrals, rewards & gift cards."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Newsletter", "Sync with Newsletter tab"],
          ["Push Notifications", "Browser push placeholder"],
          ["SMS", "Jazz / Telenor gateway placeholder"],
          ["Abandoned Cart", "Recover unfinished checkouts"],
          ["Referral Program", "Invite & earn credits"],
          ["Reward Points", "Manage earn & burn rules"],
          ["Gift Cards", "Issue digital gift cards"],
          ["Email Campaigns", "Segmented atelier sends"],
        ].map(([title, desc]) => (
          <div
            key={title}
            className="rounded-3xl border border-border/60 bg-[var(--admin-panel,#fff)] p-4 shadow-soft"
          >
            <Megaphone className="h-4 w-4 text-primary" />
            <p className="mt-3 text-sm font-bold">{title}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-border/60 bg-[var(--admin-panel,#fff)] p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">Campaigns</h3>
          <Button
            size="sm"
            className="rounded-full bg-primary text-xs text-white cursor-pointer"
            onClick={() => {
              const name = prompt("Campaign name");
              if (!name) return;
              setCampaigns((prev: any[]) => [
                ...prev,
                { id: String(Date.now()), name, channel: "email", status: "draft" },
              ]);
            }}
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> New
          </Button>
        </div>
        <div className="space-y-2">
          {campaigns.map((c: any) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-2xl border border-border/40 px-3 py-2 text-xs"
            >
              <div>
                <p className="font-bold">{c.name}</p>
                <p className="text-[10px] uppercase text-muted-foreground">
                  {c.channel} · {c.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCampaigns((prev: any[]) => prev.filter((x) => x.id !== c.id))}
                className="text-rose-600 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminPanelShell>
  );
}

export function AdminAnalyticsPanel() {
  const overviewQ = useQuery({ queryKey: ["admin-overview"], queryFn: fetchAdminOverview });
  const ordersQ = useQuery({ queryKey: ["admin-orders"], queryFn: fetchAdminOrders });
  const o = overviewQ.data;

  const aov = useMemo(() => {
    const orders = ordersQ.data ?? [];
    if (!orders.length) return 0;
    const sum = orders.reduce((s: number, x: any) => s + Number(x.total || 0), 0);
    return Math.round(sum / orders.length);
  }, [ordersQ.data]);

  const metrics = [
    ["Revenue", money(o?.totalRevenue ?? 0)],
    ["Sales (Month)", money(o?.monthlySales ?? 0)],
    ["Customers", String(o?.users ?? 0)],
    ["Top Products", String(o?.products ?? 0)],
    ["Avg Order Value", money(aov)],
    ["Conversion Rate", `${o?.conversionRate ?? 0}%`],
    ["Cart Abandonment", "—"],
    ["Repeat Customers", "—"],
    ["Coupon Usage", "Track in Coupons"],
    ["Best Categories", "From product tags"],
  ];

  return (
    <AdminPanelShell
      title="Analytics"
      subtitle="Revenue, traffic proxies, and conversion health."
      action={
        <Button
          variant="outline"
          className="rounded-full text-xs cursor-pointer"
          onClick={() =>
            exportCsv("pahraan-analytics.csv", [
              {
                revenue: o?.totalRevenue ?? 0,
                monthly: o?.monthlySales ?? 0,
                orders: o?.orders ?? 0,
                customers: o?.users ?? 0,
                aov,
                conversion: o?.conversionRate ?? 0,
              },
            ])
          }
        >
          <Download className="mr-1 h-3.5 w-3.5" /> Export Report
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map(([label, value]) => (
          <div
            key={label}
            className="rounded-3xl border border-border/60 bg-[var(--admin-panel,#fff)] p-4 shadow-soft"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="mt-2 font-display text-xl font-bold text-primary">{value}</p>
          </div>
        ))}
      </div>
    </AdminPanelShell>
  );
}

export function AdminReportsPanel() {
  const [range, setRange] = useState("monthly");
  const ordersQ = useQuery({ queryKey: ["admin-orders"], queryFn: fetchAdminOrders });

  const exportReport = (fmt: "csv" | "pdf" | "excel") => {
    const rows = (ordersQ.data ?? []).map((o: any) => ({
      id: o.id,
      date: o.created_at,
      customer: `${o.first_name} ${o.last_name}`,
      total: o.total,
      status: o.status,
    }));
    if (fmt === "csv" || fmt === "excel") {
      exportCsv(`pahraan-report-${range}.csv`, rows);
      toast.success(`${fmt.toUpperCase()} export ready`);
    } else {
      window.print();
      toast.success("Use browser print dialog for PDF");
    }
  };

  return (
    <AdminPanelShell title="Reports" subtitle="Daily, weekly, monthly, yearly & custom exports.">
      <div className="flex flex-wrap gap-2">
        {["daily", "weekly", "monthly", "yearly", "custom"].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={`rounded-full px-4 py-2 text-xs font-bold capitalize cursor-pointer ${
              range === r ? "bg-primary text-white" : "border border-border bg-[var(--admin-panel,#fff)]"
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button className="rounded-full text-xs cursor-pointer" onClick={() => exportReport("csv")}>
          Export CSV
        </Button>
        <Button
          variant="outline"
          className="rounded-full text-xs cursor-pointer"
          onClick={() => exportReport("excel")}
        >
          Export Excel
        </Button>
        <Button
          variant="outline"
          className="rounded-full text-xs cursor-pointer"
          onClick={() => exportReport("pdf")}
        >
          Export PDF
        </Button>
      </div>
      <div className="mt-6 overflow-hidden rounded-3xl border border-border/60 bg-[var(--admin-panel,#fff)] shadow-soft">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/15 text-[10px] font-bold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {(ordersQ.data ?? []).slice(0, 25).map((o: any) => (
              <tr key={o.id}>
                <td className="px-4 py-3 font-mono text-[10px]">{o.id.slice(0, 8)}</td>
                <td className="px-4 py-3">
                  {o.first_name} {o.last_name}
                </td>
                <td className="px-4 py-3 font-bold text-primary">{money(o.total)}</td>
                <td className="px-4 py-3 capitalize">{o.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPanelShell>
  );
}

type HomeSection = { id: string; type: string; enabled: boolean; label: string };

export function AdminHomepagePanel() {
  const [sections, setSections] = useState<HomeSection[]>(() =>
    loadAdminJson("pahraan_admin_homepage", [
      { id: "1", type: "hero", enabled: true, label: "Hero Banner" },
      { id: "2", type: "collections", enabled: true, label: "Collections" },
      { id: "3", type: "featured", enabled: true, label: "Featured Products" },
      { id: "4", type: "flash", enabled: false, label: "Flash Sale" },
      { id: "5", type: "new", enabled: true, label: "New Arrivals" },
      { id: "6", type: "testimonials", enabled: true, label: "Testimonials" },
      { id: "7", type: "instagram", enabled: true, label: "Instagram Feed" },
      { id: "8", type: "newsletter", enabled: true, label: "Newsletter" },
      { id: "9", type: "footer", enabled: true, label: "Footer" },
    ]),
  );
  const [banners, setBanners] = useState(() =>
    loadAdminJson("pahraan_admin_banners", {
      desktop: "",
      tablet: "",
      mobile: "",
      start: "",
      end: "",
    }),
  );

  useEffect(() => saveAdminJson("pahraan_admin_homepage", sections), [sections]);
  useEffect(() => saveAdminJson("pahraan_admin_banners", banners), [banners]);

  const move = (index: number, dir: -1 | 1) => {
    const next = [...sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
  };

  return (
    <AdminPanelShell
      title="Homepage Builder"
      subtitle="Drag-order sections, schedule banners, preview modules."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2 rounded-3xl border border-border/60 bg-[var(--admin-panel,#fff)] p-5 shadow-soft">
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
            <LayoutTemplate className="h-4 w-4 text-primary" /> Sections
          </h3>
          {sections.map((s, i) => (
            <div
              key={s.id}
              className="flex items-center gap-2 rounded-2xl border border-border/40 px-3 py-2 text-xs"
            >
              <Switch
                checked={s.enabled}
                onCheckedChange={(v) =>
                  setSections((prev) =>
                    prev.map((x) => (x.id === s.id ? { ...x, enabled: v } : x)),
                  )
                }
              />
              <span className="flex-1 font-semibold">{s.label}</span>
              <button type="button" onClick={() => move(i, -1)} className="cursor-pointer">
                <MoveUp className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => move(i, 1)} className="cursor-pointer">
                <MoveDown className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-3 rounded-3xl border border-border/60 bg-[var(--admin-panel,#fff)] p-5 shadow-soft">
          <h3 className="font-display text-lg font-bold">Banner Management</h3>
          {(["desktop", "tablet", "mobile"] as const).map((key) => (
            <div key={key} className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {key} banner URL
              </label>
              <Input
                value={(banners as any)[key]}
                onChange={(e) => setBanners((b: any) => ({ ...b, [key]: e.target.value }))}
                className="rounded-xl text-xs"
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Schedule Start
              </label>
              <Input
                type="datetime-local"
                value={banners.start}
                onChange={(e) => setBanners((b: any) => ({ ...b, start: e.target.value }))}
                className="rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Schedule End
              </label>
              <Input
                type="datetime-local"
                value={banners.end}
                onChange={(e) => setBanners((b: any) => ({ ...b, end: e.target.value }))}
                className="rounded-xl text-xs"
              />
            </div>
          </div>
          <Button
            variant="outline"
            className="rounded-full text-xs cursor-pointer"
            onClick={() => toast.message("Preview saved — open storefront to review")}
          >
            Preview
          </Button>
        </div>
      </div>
    </AdminPanelShell>
  );
}

export function AdminMediaPanel() {
  const [assets, setAssets] = useState(() =>
    loadAdminJson("pahraan_admin_media", [] as { id: string; name: string; url: string; alt: string; folder: string }[]),
  );
  const [q, setQ] = useState("");

  useEffect(() => saveAdminJson("pahraan_admin_media", assets), [assets]);

  const filtered = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(q.toLowerCase()) ||
      a.alt.toLowerCase().includes(q.toLowerCase()) ||
      a.folder.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AdminPanelShell
      title="Media Library"
      subtitle="Images, videos, folders, alt text, bulk upload."
      action={
        <Button
          className="rounded-full bg-primary text-xs text-white cursor-pointer"
          onClick={() => {
            const url = prompt("Image / video URL");
            if (!url) return;
            setAssets((prev) => [
              {
                id: String(Date.now()),
                name: url.split("/").pop() || "asset",
                url,
                alt: "",
                folder: "General",
              },
              ...prev,
            ]);
            toast.success("Asset added (compression placeholder)");
          }}
        >
          <ImagePlus className="mr-1 h-3.5 w-3.5" /> Bulk Upload
        </Button>
      }
    >
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search media…"
        className="mb-4 max-w-md rounded-full text-xs"
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {filtered.map((asset) => (
          <div
            key={asset.id}
            className="overflow-hidden rounded-3xl border border-border/60 bg-[var(--admin-panel,#fff)] shadow-soft"
          >
            <div className="aspect-square bg-secondary/20">
              {asset.url.match(/\.(mp4|webm)$/i) ? (
                <div className="grid h-full place-items-center text-xs text-muted-foreground">Video</div>
              ) : (
                <img src={asset.url} alt={asset.alt} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="space-y-2 p-3">
              <p className="truncate text-xs font-bold">{asset.name}</p>
              <Input
                value={asset.alt}
                onChange={(e) =>
                  setAssets((prev) =>
                    prev.map((a) => (a.id === asset.id ? { ...a, alt: e.target.value } : a)),
                  )
                }
                placeholder="Alt text"
                className="h-8 rounded-xl text-[11px]"
              />
              <Input
                value={asset.folder}
                onChange={(e) =>
                  setAssets((prev) =>
                    prev.map((a) => (a.id === asset.id ? { ...a, folder: e.target.value } : a)),
                  )
                }
                placeholder="Folder"
                className="h-8 rounded-xl text-[11px]"
              />
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="py-12 text-center text-xs text-muted-foreground">No media assets yet.</p>
      )}
    </AdminPanelShell>
  );
}

export function AdminNotificationsPanel() {
  const [prefs, setPrefs] = useState(() =>
    loadAdminJson("pahraan_admin_notif", {
      newOrder: true,
      paymentFailed: true,
      lowStock: true,
      review: true,
      returnRequest: true,
      system: true,
    }),
  );
  useEffect(() => saveAdminJson("pahraan_admin_notif", prefs), [prefs]);

  const rows = [
    ["newOrder", "New Order"],
    ["paymentFailed", "Payment Failed"],
    ["lowStock", "Low Stock"],
    ["review", "Customer Review"],
    ["returnRequest", "Return Request"],
    ["system", "System Alerts"],
  ] as const;

  return (
    <AdminPanelShell title="Notifications" subtitle="Ops alerts for the atelier team.">
      <div className="divide-y divide-border/40 overflow-hidden rounded-3xl border border-border/60 bg-[var(--admin-panel,#fff)] shadow-soft">
        {rows.map(([key, label]) => (
          <div key={key} className="flex items-center justify-between px-5 py-4 text-sm">
            <span className="font-semibold">{label}</span>
            <Switch
              checked={(prefs as any)[key]}
              onCheckedChange={(v) => setPrefs((p: any) => ({ ...p, [key]: v }))}
            />
          </div>
        ))}
      </div>
    </AdminPanelShell>
  );
}

export function AdminSettingsPanel() {
  const [settings, setSettings] = useState(() =>
    loadAdminJson("pahraan_admin_settings", {
      siteName: "Pahraan",
      logo: "",
      favicon: "",
      seoTitle: "Pahraan — Pakistani Fashion",
      seoDescription: "",
      maintenance: false,
      currency: "PKR",
      language: "en",
      contactEmail: "hello@pahraan.com",
      contactPhone: "+92 21 1234 5678",
      instagram: "",
      facebook: "",
      whatsapp: "",
      taxRate: "5",
      shippingFlat: "250",
    }),
  );

  useEffect(() => {
    const t = setTimeout(() => {
      saveAdminJson("pahraan_admin_settings", settings);
    }, 400);
    return () => clearTimeout(t);
  }, [settings]);

  const set = (key: string, value: string | boolean) =>
    setSettings((s: any) => ({ ...s, [key]: value }));

  return (
    <AdminPanelShell
      title="Website Settings"
      subtitle="General, SEO, payments, shipping, taxes, templates — autosaves."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="General">
          <Field label="Site Name" value={settings.siteName} onChange={(v) => set("siteName", v)} />
          <Field label="Logo URL" value={settings.logo} onChange={(v) => set("logo", v)} />
          <Field label="Favicon URL" value={settings.favicon} onChange={(v) => set("favicon", v)} />
          <label className="flex items-center justify-between text-xs font-semibold">
            Maintenance Mode
            <Switch checked={settings.maintenance} onCheckedChange={(v) => set("maintenance", v)} />
          </label>
        </Card>
        <Card title="SEO">
          <Field label="SEO Title" value={settings.seoTitle} onChange={(v) => set("seoTitle", v)} />
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            SEO Description
          </label>
          <Textarea
            value={settings.seoDescription}
            onChange={(e) => set("seoDescription", e.target.value)}
            className="rounded-2xl text-xs"
          />
        </Card>
        <Card title="Payments & Shipping">
          <p className="text-[11px] text-muted-foreground">
            COD · EasyPaisa · JazzCash · Bank Transfer (configure storefront checkout).
          </p>
          <Field
            label="Flat Shipping (PKR)"
            value={settings.shippingFlat}
            onChange={(v) => set("shippingFlat", v)}
          />
          <Field label="Tax Rate %" value={settings.taxRate} onChange={(v) => set("taxRate", v)} />
          <Field label="Currency" value={settings.currency} onChange={(v) => set("currency", v)} />
        </Card>
        <Card title="Contact & Social">
          <Field
            label="Email"
            value={settings.contactEmail}
            onChange={(v) => set("contactEmail", v)}
          />
          <Field
            label="Phone"
            value={settings.contactPhone}
            onChange={(v) => set("contactPhone", v)}
          />
          <Field label="Instagram" value={settings.instagram} onChange={(v) => set("instagram", v)} />
          <Field label="WhatsApp" value={settings.whatsapp} onChange={(v) => set("whatsapp", v)} />
        </Card>
        <Card title="Templates & Keys">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Email / SMS templates, API keys, backup & restore placeholders are ready for provider
            wiring. Language: {settings.language}.
          </p>
          <Button
            variant="outline"
            className="rounded-full text-xs cursor-pointer"
            onClick={() => toast.success("Settings snapshot saved locally")}
          >
            Backup Now
          </Button>
        </Card>
      </div>
    </AdminPanelShell>
  );
}

export function AdminStaffPanel() {
  return (
    <AdminPanelShell title="Staff Management" subtitle="Admin, Manager, Editor, Support, Warehouse.">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {["Admin", "Manager", "Editor", "Support", "Warehouse", "Custom Role"].map((role) => (
          <div
            key={role}
            className="rounded-3xl border border-border/60 bg-[var(--admin-panel,#fff)] p-5 shadow-soft"
          >
            <p className="font-display text-lg font-bold">{role}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Assign staff from Users & Roles. Custom roles use the permission matrix.
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Tip: open <strong>Roles & Permissions</strong> for the matrix, and existing{" "}
        <strong>Users</strong> tab via Staff → promote admins.
      </p>
    </AdminPanelShell>
  );
}

export function AdminRolesPanel() {
  const perms = [
    "products",
    "orders",
    "customers",
    "inventory",
    "coupons",
    "content",
    "settings",
    "staff",
  ];
  const roles = ["Admin", "Manager", "Editor", "Support", "Warehouse"];
  const [matrix, setMatrix] = useState(() =>
    loadAdminJson(
      "pahraan_admin_roles",
      Object.fromEntries(
        roles.map((r) => [r, Object.fromEntries(perms.map((p) => [p, r === "Admin"]))]),
      ),
    ),
  );

  useEffect(() => saveAdminJson("pahraan_admin_roles", matrix), [matrix]);

  return (
    <AdminPanelShell title="Roles & Permissions" subtitle="Permission matrix + activity log placeholder.">
      <div className="overflow-x-auto rounded-3xl border border-border/60 bg-[var(--admin-panel,#fff)] shadow-soft">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead className="bg-secondary/15 text-[10px] font-bold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Role</th>
              {perms.map((p) => (
                <th key={p} className="px-3 py-3 capitalize">
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {roles.map((role) => (
              <tr key={role}>
                <td className="px-4 py-3 font-bold">{role}</td>
                {perms.map((p) => (
                  <td key={p} className="px-3 py-3">
                    <Switch
                      checked={!!(matrix as any)[role]?.[p]}
                      onCheckedChange={(v) =>
                        setMatrix((m: any) => ({
                          ...m,
                          [role]: { ...m[role], [p]: v },
                        }))
                      }
                      disabled={role === "Admin"}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 rounded-3xl border border-dashed border-border/70 p-4 text-xs text-muted-foreground">
        Activity logs: staff actions will stream here once audit logging is connected.
      </div>
    </AdminPanelShell>
  );
}

export function AdminSecurityPanel() {
  const [twoFa, setTwoFa] = useState(() => loadAdminJson("pahraan_admin_2fa", false));
  useEffect(() => saveAdminJson("pahraan_admin_2fa", twoFa), [twoFa]);

  return (
    <AdminPanelShell title="Security" subtitle="2FA, login logs, IP rules, sessions, audit.">
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Two-factor Authentication">
          <label className="flex items-center justify-between text-xs font-semibold">
            Enable 2FA placeholder
            <Switch checked={twoFa} onCheckedChange={setTwoFa} />
          </label>
        </Card>
        <Card title="Admin Login Logs">
          <p className="text-[11px] text-muted-foreground">
            {new Date().toLocaleString()} · Current session · This browser
          </p>
        </Card>
        <Card title="IP Restrictions">
          <Textarea placeholder="Allowlist IPs (one per line)" className="rounded-2xl text-xs" />
        </Card>
        <Card title="Session / CSRF / Rate Limit">
          <ul className="space-y-1 text-[11px] text-muted-foreground">
            <li>Session management: browser cookies via Supabase Auth</li>
            <li>CSRF protection: same-site cookies</li>
            <li>Rate limiting: edge/provider placeholder</li>
            <li>Audit logs & backup scheduler: coming soon</li>
          </ul>
        </Card>
      </div>
    </AdminPanelShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-3xl border border-border/60 bg-[var(--admin-panel,#fff)] p-5 shadow-soft">
      <h3 className="font-display text-lg font-bold">{title}</h3>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="rounded-xl text-xs" />
    </div>
  );
}
