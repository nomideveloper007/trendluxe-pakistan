import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { fetchAdminProducts } from "@/lib/admin-data";
import { categories as siteCategories } from "@/lib/content";
import { exportCsv, loadAdminJson, saveAdminJson } from "../admin-utils";

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  banner: string;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
  visible: boolean;
};

type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string;
  productIds: string[];
  featured: boolean;
};

const defaultCategories = (): Category[] =>
  siteCategories.map((c, i) => ({
    id: `cat-${c.slug}`,
    name: c.name,
    slug: c.slug,
    parentId: null,
    banner: "",
    seoTitle: c.name,
    seoDescription: `${c.name} collection at Pahraan`,
    sortOrder: i,
    visible: true,
  }));

export function AdminCategoriesPanel() {
  const [items, setItems] = useState<Category[]>(() =>
    loadAdminJson("pahraan_admin_categories", defaultCategories()),
  );

  useEffect(() => saveAdminJson("pahraan_admin_categories", items), [items]);

  const add = () => {
    const name = prompt("Category name");
    if (!name) return;
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    setItems((prev) => [
      ...prev,
      {
        id: `cat-${Date.now()}`,
        name,
        slug,
        parentId: null,
        banner: "",
        seoTitle: name,
        seoDescription: "",
        sortOrder: prev.length,
        visible: true,
      },
    ]);
    toast.success("Category added");
  };

  return (
    <AdminPanelShell
      title="Categories"
      subtitle="Unlimited categories, subcategories, banners & SEO."
      action={
        <Button
          onClick={add}
          className="rounded-full bg-primary text-xs text-white hover:bg-accent cursor-pointer"
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> Add Category
        </Button>
      }
    >
      <div className="space-y-3">
        {items
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((cat) => (
            <div
              key={cat.id}
              className="rounded-3xl border border-border/60 bg-[var(--admin-panel,#fff)] p-4 shadow-soft"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">{cat.name}</p>
                  <p className="text-[10px] text-muted-foreground">/{cat.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {cat.visible ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                    Visible
                    <Switch
                      checked={cat.visible}
                      onCheckedChange={(v) =>
                        setItems((prev) =>
                          prev.map((c) => (c.id === cat.id ? { ...c, visible: v } : c)),
                        )
                      }
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((c) => c.id !== cat.id))}
                    className="rounded-full p-2 text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <Input
                  value={cat.banner}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((c) => (c.id === cat.id ? { ...c, banner: e.target.value } : c)),
                    )
                  }
                  placeholder="Category banner URL"
                  className="rounded-xl text-xs"
                />
                <Input
                  value={cat.seoTitle}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((c) => (c.id === cat.id ? { ...c, seoTitle: e.target.value } : c)),
                    )
                  }
                  placeholder="SEO title"
                  className="rounded-xl text-xs"
                />
                <Input
                  type="number"
                  value={cat.sortOrder}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((c) =>
                        c.id === cat.id ? { ...c, sortOrder: Number(e.target.value) } : c,
                      ),
                    )
                  }
                  placeholder="Sort order"
                  className="rounded-xl text-xs"
                />
              </div>
              <Input
                value={cat.seoDescription}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((c) =>
                      c.id === cat.id ? { ...c, seoDescription: e.target.value } : c,
                    ),
                  )
                }
                placeholder="SEO description"
                className="mt-2 rounded-xl text-xs"
              />
              <div className="mt-2">
                <select
                  value={cat.parentId || ""}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((c) =>
                        c.id === cat.id ? { ...c, parentId: e.target.value || null } : c,
                      ),
                    )
                  }
                  className="rounded-xl border border-border bg-transparent px-3 py-2 text-xs"
                >
                  <option value="">No parent (top-level)</option>
                  {items
                    .filter((c) => c.id !== cat.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        Subcategory of {c.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          ))}
      </div>
    </AdminPanelShell>
  );
}

export function AdminCollectionsPanel() {
  const productsQ = useQuery({ queryKey: ["admin-products"], queryFn: fetchAdminProducts });
  const [items, setItems] = useState<Collection[]>(() =>
    loadAdminJson("pahraan_admin_collections", [
      {
        id: "col-featured",
        name: "Featured",
        slug: "featured",
        description: "Homepage featured edits",
        productIds: [],
        featured: true,
      },
      {
        id: "col-new",
        name: "New Arrivals",
        slug: "new-arrivals",
        description: "Latest drops",
        productIds: [],
        featured: true,
      },
    ] as Collection[]),
  );

  useEffect(() => saveAdminJson("pahraan_admin_collections", items), [items]);

  return (
    <AdminPanelShell
      title="Collections"
      subtitle="Curate merchandising collections for storefront modules."
      action={
        <Button
          onClick={() => {
            const name = prompt("Collection name");
            if (!name) return;
            setItems((prev) => [
              ...prev,
              {
                id: `col-${Date.now()}`,
                name,
                slug: name.toLowerCase().replace(/\s+/g, "-"),
                description: "",
                productIds: [],
                featured: false,
              },
            ]);
          }}
          className="rounded-full bg-primary text-xs text-white hover:bg-accent cursor-pointer"
        >
          <Plus className="mr-1 h-3.5 w-3.5" /> New Collection
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((col) => (
          <div
            key={col.id}
            className="rounded-3xl border border-border/60 bg-[var(--admin-panel,#fff)] p-5 shadow-soft"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-lg font-bold">{col.name}</p>
                <p className="text-[11px] text-muted-foreground">{col.description || col.slug}</p>
              </div>
              <Switch
                checked={col.featured}
                onCheckedChange={(v) =>
                  setItems((prev) => prev.map((c) => (c.id === col.id ? { ...c, featured: v } : c)))
                }
              />
            </div>
            <select
              multiple
              className="mt-3 h-32 w-full rounded-2xl border border-border bg-transparent p-2 text-xs"
              value={col.productIds}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
                setItems((prev) =>
                  prev.map((c) => (c.id === col.id ? { ...c, productIds: selected } : c)),
                );
              }}
            >
              {(productsQ.data ?? []).map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            <p className="mt-2 text-[10px] text-muted-foreground">
              {col.productIds.length} products · hold Cmd/Ctrl to multi-select
            </p>
          </div>
        ))}
      </div>
    </AdminPanelShell>
  );
}

export function AdminCustomersPanel() {
  const usersQ = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { fetchAdminUsers, fetchAdminOrders } = await import("@/lib/admin-data");
      const [users, orders] = await Promise.all([fetchAdminUsers(), fetchAdminOrders()]);
      return { users, orders };
    },
  });

  const rows = useMemo(() => {
    const users = usersQ.data?.users ?? [];
    const orders = usersQ.data?.orders ?? [];
    return users.map((u) => {
      const userOrders = orders.filter((o: any) => o.user_id === u.id || o.email);
      const spend = userOrders.reduce((s: number, o: any) => s + Number(o.total || 0), 0);
      const meta = loadAdminJson(`pahraan_customer_meta_${u.id}`, {
        vip: false,
        blocked: false,
        notes: "",
        points: Math.floor(spend / 100),
      });
      return { ...u, spend, orderCount: userOrders.length, meta };
    });
  }, [usersQ.data]);

  const toggleMeta = (id: string, patch: Record<string, unknown>) => {
    const key = `pahraan_customer_meta_${id}`;
    const cur = loadAdminJson(key, { vip: false, blocked: false, notes: "", points: 0 });
    saveAdminJson(key, { ...cur, ...patch });
    toast.success("Customer updated");
    usersQ.refetch();
  };

  return (
    <AdminPanelShell
      title="Customers"
      subtitle="Profiles, spend, VIP flags, and export."
      action={
        <Button
          variant="outline"
          className="rounded-full text-xs cursor-pointer"
          onClick={() =>
            exportCsv(
              "pahraan-customers.csv",
              rows.map((r) => ({
                id: r.id,
                name: r.display_name,
                role: r.role,
                spend: r.spend,
                orders: r.orderCount,
                vip: r.meta.vip,
                blocked: r.meta.blocked,
              })),
            )
          }
        >
          Export Customers
        </Button>
      }
    >
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-[var(--admin-panel,#fff)] shadow-soft">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/15 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Spend</th>
              <th className="px-4 py-3">Points</th>
              <th className="px-4 py-3">Flags</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">
                  <p className="font-bold">{r.display_name || "Member"}</p>
                  <p className="text-[10px] text-muted-foreground">{r.id.slice(0, 8)}…</p>
                </td>
                <td className="px-4 py-3">{r.orderCount}</td>
                <td className="px-4 py-3 font-semibold text-primary">
                  PKR {r.spend.toLocaleString()}
                </td>
                <td className="px-4 py-3">{r.meta.points}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleMeta(r.id, { vip: !r.meta.vip })}
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold cursor-pointer ${
                        r.meta.vip ? "bg-primary text-white" : "bg-secondary/30"
                      }`}
                    >
                      VIP
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleMeta(r.id, { blocked: !r.meta.blocked })}
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold cursor-pointer ${
                        r.meta.blocked ? "bg-rose-600 text-white" : "bg-secondary/30"
                      }`}
                    >
                      Block
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Input
                    defaultValue={r.meta.notes}
                    onBlur={(e) => toggleMeta(r.id, { notes: e.target.value })}
                    placeholder="Notes"
                    className="h-8 rounded-xl text-[11px]"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPanelShell>
  );
}

export function AdminPanelShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
