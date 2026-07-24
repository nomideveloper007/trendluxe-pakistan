import {
  AlertTriangle,
  ArrowRight,
  Package,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { money, type AdminTab } from "../admin-utils";

type Overview = {
  totalRevenue?: number;
  todaySales?: number;
  monthlySales?: number;
  orders?: number;
  pendingOrders?: number;
  returnedOrders?: number;
  users?: number;
  products?: number;
  lowStock?: number;
  conversionRate?: number;
  salesSeries?: { label: string; sales: number; orders: number }[];
  recentOrders?: any[];
  lowStockItems?: any[];
  openMessages?: number;
  subscribers?: number;
};

export function AdminDashboardHome({
  overview,
  onNavigate,
}: {
  overview?: Overview | null;
  onNavigate: (tab: AdminTab) => void;
}) {
  const o = overview ?? {};
  const series = o.salesSeries ?? [];
  const maxSales = Math.max(1, ...series.map((s) => s.sales));

  const kpis = [
    { label: "Total Revenue", value: money(o.totalRevenue ?? 0), tab: "analytics" as const },
    { label: "Today's Sales", value: money(o.todaySales ?? 0), tab: "orders" as const },
    { label: "Monthly Sales", value: money(o.monthlySales ?? 0), tab: "analytics" as const },
    { label: "Total Orders", value: String(o.orders ?? 0), tab: "orders" as const },
    { label: "Pending Orders", value: String(o.pendingOrders ?? 0), tab: "orders" as const },
    { label: "Returned Orders", value: String(o.returnedOrders ?? 0), tab: "orders" as const },
    { label: "Active Customers", value: String(o.users ?? 0), tab: "customers" as const },
    { label: "Products", value: String(o.products ?? 0), tab: "products" as const },
    { label: "Low Stock Products", value: String(o.lowStock ?? 0), tab: "inventory" as const },
    { label: "Conversion Rate", value: `${o.conversionRate ?? 0}%`, tab: "analytics" as const },
  ];

  const traffic = [
    { source: "Direct", pct: 38 },
    { source: "Instagram", pct: 27 },
    { source: "Google", pct: 18 },
    { source: "Referral", pct: 12 },
    { source: "Email", pct: 5 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Pahraan atelier operations at a glance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["products", "Add Product"],
              ["orders", "View Orders"],
              ["coupons", "New Coupon"],
              ["homepage", "Edit Homepage"],
            ] as const
          ).map(([tab, label]) => (
            <Button
              key={tab}
              size="sm"
              variant="outline"
              onClick={() => onNavigate(tab)}
              className="rounded-full text-[10px] font-bold cursor-pointer"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <button
            key={kpi.label}
            type="button"
            onClick={() => onNavigate(kpi.tab)}
            className="rounded-3xl border border-border/60 bg-[var(--admin-panel,#fff)] p-4 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-primary/20 cursor-pointer"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {kpi.label}
            </p>
            <p className="mt-2 font-display text-2xl font-bold text-primary">{kpi.value}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="rounded-3xl border border-border/60 bg-[var(--admin-panel,#fff)] p-5 shadow-soft xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <TrendingUp className="h-4 w-4 text-primary" /> Sales Chart
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Last 7 days
            </span>
          </div>
          <div className="flex h-48 items-end gap-2">
            {series.length === 0 ? (
              <p className="w-full self-center text-center text-xs text-muted-foreground">
                No sales data yet
              </p>
            ) : (
              series.map((point) => (
                <div key={point.label} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-primary to-secondary transition"
                    style={{ height: `${Math.max(8, (point.sales / maxSales) * 100)}%` }}
                    title={money(point.sales)}
                  />
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {point.label}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-border/60 bg-[var(--admin-panel,#fff)] p-5 shadow-soft">
          <h2 className="font-display text-lg font-bold">Revenue Chart</h2>
          <div className="mt-4 space-y-3">
            {[
              { label: "Today", value: o.todaySales ?? 0 },
              { label: "This Month", value: o.monthlySales ?? 0 },
              { label: "Lifetime", value: o.totalRevenue ?? 0 },
            ].map((row) => (
              <div key={row.label}>
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-bold">{money(row.value)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary/30">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.min(100, ((row.value || 0) / Math.max(1, o.totalRevenue || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Panel title="Recent Orders" icon={ShoppingBag} action={() => onNavigate("orders")}>
          {(o.recentOrders ?? []).length === 0 ? (
            <Empty text="No orders yet" />
          ) : (
            <div className="space-y-2">
              {(o.recentOrders ?? []).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-2xl border border-border/40 px-3 py-2 text-xs"
                >
                  <div>
                    <p className="font-bold">
                      {order.first_name} {order.last_name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{order.status}</p>
                  </div>
                  <p className="font-bold text-primary">{money(order.total)}</p>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Low Stock Alerts" icon={AlertTriangle} action={() => onNavigate("inventory")}>
          {(o.lowStockItems ?? []).length === 0 ? (
            <Empty text="Inventory healthy" />
          ) : (
            <div className="space-y-2">
              {(o.lowStockItems ?? []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs"
                >
                  <div>
                    <p className="font-bold">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground">{item.sku}</p>
                  </div>
                  <span className="font-bold text-amber-700">{item.quantity} left</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Traffic Sources" icon={Users}>
          <div className="space-y-2">
            {traffic.map((t) => (
              <div key={t.source} className="text-xs">
                <div className="mb-1 flex justify-between">
                  <span>{t.source}</span>
                  <span className="font-bold">{t.pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary/30">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
            <p className="pt-2 text-[10px] text-muted-foreground">
              Placeholder analytics — connect analytics provider for live traffic.
            </p>
          </div>
        </Panel>

        <Panel title="Top Selling Products" icon={Package} action={() => onNavigate("products")}>
          <Empty text="Rankings populate as orders grow" />
        </Panel>

        <Panel title="Latest Reviews" icon={Star} action={() => onNavigate("reviews")}>
          <Empty text="Moderate new product reviews" />
        </Panel>

        <Panel title="Recent Customers" icon={Users} action={() => onNavigate("customers")}>
          <div className="space-y-2 text-xs">
            <p className="text-muted-foreground">{o.users ?? 0} profiles registered</p>
            <p className="text-muted-foreground">{o.subscribers ?? 0} newsletter subscribers</p>
            <p className="text-muted-foreground">{o.openMessages ?? 0} open inbox messages</p>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon: typeof Package;
  action?: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border/60 bg-[var(--admin-panel,#fff)] p-5 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-base font-bold">
          <Icon className="h-4 w-4 text-primary" /> {title}
        </h3>
        {action && (
          <button type="button" onClick={action} className="text-primary cursor-pointer">
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-6 text-center text-xs text-muted-foreground">{text}</p>;
}
