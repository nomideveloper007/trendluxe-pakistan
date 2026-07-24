import { Link } from "@tanstack/react-router";
import {
  Gift,
  Heart,
  Package,
  Truck,
  ArrowRight,
  ShoppingBag,
  MapPin,
  Star,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { greetingForHour, rewardsFromOrders, type AccountTab } from "./account-utils";

type Props = {
  displayName: string;
  orders: any[];
  wishlistCount: number;
  loading?: boolean;
  onNavigate: (tab: AccountTab) => void;
};

export function AccountHome({ displayName, orders, wishlistCount, loading, onNavigate }: Props) {
  const activeDeliveries = orders.filter((o) =>
    ["pending", "processing", "shipped"].includes(o.status),
  ).length;
  const rewards = rewardsFromOrders(orders);
  const recent = orders.slice(0, 3);

  const stats = [
    {
      label: "Orders",
      value: orders.length,
      icon: Package,
      tab: "orders" as const,
      hint: "Lifetime purchases",
    },
    {
      label: "Wishlist",
      value: wishlistCount,
      icon: Heart,
      tab: "wishlist" as const,
      hint: "Saved pieces",
    },
    {
      label: "Reward Points",
      value: rewards.current,
      icon: Gift,
      tab: "rewards" as const,
      hint: `${rewards.tier} tier`,
    },
    {
      label: "Active Deliveries",
      value: activeDeliveries,
      icon: Truck,
      tab: "orders" as const,
      hint: "In transit",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-28 w-full rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-r from-secondary/20 via-[#FFF9FB] to-primary/5 p-6 md:p-8 shadow-soft">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {greetingForHour()},
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
          {displayName || "Pahraan Member"}
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">Welcome back to Pahraan.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tab, hint }) => (
          <button
            key={label}
            type="button"
            onClick={() => onNavigate(tab)}
            className="group rounded-3xl border border-border/60 bg-white p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-elegant cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/25 text-primary transition group-hover:bg-primary group-hover:text-white">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition group-hover:text-primary" />
            </div>
            <p className="mt-4 font-display text-3xl font-bold text-foreground">{value}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-foreground">{label}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-3xl border border-border/60 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Recent Orders</h2>
            <button
              type="button"
              onClick={() => onNavigate("orders")}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              View all
            </button>
          </div>
          {recent.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <ShoppingBag className="h-8 w-8 text-primary/50" />
              <p className="mt-3 text-sm text-muted-foreground">No orders yet.</p>
              <Link
                to="/shop"
                className="mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-soft hover:bg-accent"
              >
                Explore the collection
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => onNavigate("orders")}
                  className="flex w-full items-center justify-between rounded-2xl border border-border/40 bg-[#FFF9FB] px-4 py-3 text-left transition hover:border-primary/20 cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      PAH-{String(order.id).slice(0, 8).toUpperCase()}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()} ·{" "}
                      {(order.order_items || []).length} item
                      {(order.order_items || []).length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-primary">
                      PKR {Number(order.total).toLocaleString()}
                    </p>
                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {order.status}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <button
            type="button"
            onClick={() => onNavigate("addresses")}
            className="flex w-full items-center gap-3 rounded-3xl border border-border/60 bg-white p-5 text-left shadow-soft transition hover:border-primary/20 cursor-pointer"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/25 text-primary">
              <MapPin className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-bold">Saved Addresses</p>
              <p className="text-[11px] text-muted-foreground">Manage delivery locations</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onNavigate("reviews")}
            className="flex w-full items-center gap-3 rounded-3xl border border-border/60 bg-white p-5 text-left shadow-soft transition hover:border-primary/20 cursor-pointer"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/25 text-primary">
              <Star className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-bold">Write a Review</p>
              <p className="text-[11px] text-muted-foreground">Share your Pahraan experience</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onNavigate("rewards")}
            className="flex w-full items-center gap-3 rounded-3xl border border-border/60 bg-gradient-to-br from-primary to-accent p-5 text-left text-white shadow-elegant transition hover:opacity-95 cursor-pointer"
          >
            <Gift className="h-5 w-5" />
            <div>
              <p className="text-sm font-bold">{rewards.current} points ready</p>
              <p className="text-[11px] text-white/80">{rewards.tier} member benefits</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
