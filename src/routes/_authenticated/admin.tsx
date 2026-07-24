import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/content";
import { useAuth } from "@/lib/auth";
import {
  fetchAdminCoupons,
  fetchAdminOrders,
  fetchAdminOverview,
  fetchAdminPosts,
  fetchAdminProducts,
  fetchAdminTrends,
  fetchAdminUsers,
} from "@/lib/admin-data";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminDashboardHome } from "@/components/admin/panels/AdminDashboardHome";
import {
  AdminCategoriesPanel,
  AdminCollectionsPanel,
  AdminCustomersPanel,
} from "@/components/admin/panels/AdminCatalogPanels";
import {
  AdminAnalyticsPanel,
  AdminHomepagePanel,
  AdminMarketingPanel,
  AdminMediaPanel,
  AdminNotificationsPanel,
  AdminReportsPanel,
  AdminRolesPanel,
  AdminSecurityPanel,
  AdminSettingsPanel,
  AdminStaffPanel,
} from "@/components/admin/panels/AdminOpsPanels";
import {
  AdminBackupMonitoringPanel,
  AdminEmailNotificationsPanel,
  AdminTrackingPanel,
} from "@/components/admin/panels/AdminProdOpsPanels";
import { AdminProductsPanel } from "@/components/admin/panels/AdminProductsPanel";
import {
  BlogTab,
  CommentsTab,
  CouponsTab,
  InventoryTab,
  MessagesTab,
  NewsletterTab,
  OrdersTab,
  ReviewsTab,
  TrendsTab,
  UsersTab,
} from "@/components/admin/legacy/AdminLegacyTabs";
import { isAdminTab, type AdminTab } from "@/components/admin/admin-utils";

type AdminSearch = { tab?: AdminTab };

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): AdminSearch => ({
    tab: isAdminTab(search.tab) ? search.tab : undefined,
  }),
  beforeLoad: async () => {
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;
    if (!uid) throw redirect({ to: "/auth", search: { redirect: "/admin" } });
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
  const { session } = useAuth();
  const navigate = Route.useNavigate();
  const { tab: tabParam } = Route.useSearch();
  const active: AdminTab = tabParam ?? "dashboard";

  const overviewQ = useQuery({ queryKey: ["admin-overview"], queryFn: fetchAdminOverview });
  const productsQ = useQuery({ queryKey: ["admin-products"], queryFn: fetchAdminProducts });
  const ordersQ = useQuery({ queryKey: ["admin-orders"], queryFn: fetchAdminOrders });
  const usersQ = useQuery({ queryKey: ["admin-users"], queryFn: fetchAdminUsers });
  const couponsQ = useQuery({ queryKey: ["admin-coupons"], queryFn: fetchAdminCoupons });
  const postsQ = useQuery({ queryKey: ["admin-posts"], queryFn: fetchAdminPosts });
  const trendsQ = useQuery({ queryKey: ["admin-trends"], queryFn: fetchAdminTrends });

  const setTab = (tab: AdminTab) => {
    navigate({ to: "/admin", search: { tab }, replace: true });
  };

  const searchIndex = useMemo(() => {
    const items: { type: string; label: string; tab: AdminTab; id?: string }[] = [
      ...ADMIN_NAV_SEARCH,
      ...(productsQ.data ?? []).map((p: any) => ({
        type: "product",
        label: p.title,
        tab: "products" as const,
        id: p.id,
      })),
      ...(ordersQ.data ?? []).map((o: any) => ({
        type: "order",
        label: `${o.first_name} ${o.last_name} · ${o.id?.slice?.(0, 8)}`,
        tab: "orders" as const,
        id: o.id,
      })),
      ...(usersQ.data ?? []).map((u) => ({
        type: "customer",
        label: u.display_name || u.id.slice(0, 8),
        tab: "customers" as const,
        id: u.id,
      })),
      ...(couponsQ.data ?? []).map((c: any) => ({
        type: "coupon",
        label: c.code,
        tab: "coupons" as const,
        id: c.id,
      })),
      ...(postsQ.data ?? []).map((p) => ({
        type: "blog",
        label: p.title,
        tab: "blog" as const,
        id: p.id,
      })),
      ...(trendsQ.data ?? []).map((t) => ({
        type: "trend",
        label: t.title,
        tab: "trends" as const,
        id: t.id,
      })),
    ];
    return items;
  }, [productsQ.data, ordersQ.data, usersQ.data, couponsQ.data, postsQ.data, trendsQ.data]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  return (
    <AdminShell
      active={active}
      onNavigate={setTab}
      email={session?.user?.email}
      openMessages={overviewQ.data?.openMessages}
      onLogout={handleLogout}
      searchIndex={searchIndex}
    >
      {active === "dashboard" && (
        <AdminDashboardHome overview={overviewQ.data} onNavigate={setTab} />
      )}
      {active === "products" && <AdminProductsPanel />}
      {active === "categories" && <AdminCategoriesPanel />}
      {active === "collections" && <AdminCollectionsPanel />}
      {active === "orders" && <OrdersTab />}
      {active === "customers" && <AdminCustomersPanel />}
      {active === "inventory" && <InventoryTab />}
      {active === "coupons" && <CouponsTab />}
      {active === "reviews" && <ReviewsTab />}
      {active === "marketing" && <AdminMarketingPanel />}
      {active === "analytics" && <AdminAnalyticsPanel />}
      {active === "tracking" && <AdminTrackingPanel />}
      {active === "media" && <AdminMediaPanel />}
      {active === "homepage" && <AdminHomepagePanel />}
      {active === "blog" && <BlogTab />}
      {active === "trends" && <TrendsTab />}
      {active === "notifications" && <AdminNotificationsPanel />}
      {active === "emails" && <AdminEmailNotificationsPanel />}
      {active === "reports" && <AdminReportsPanel />}
      {active === "settings" && <AdminSettingsPanel />}
      {active === "backup" && <AdminBackupMonitoringPanel />}
      {active === "staff" && (
        <div className="space-y-6">
          <AdminStaffPanel />
          <UsersTab />
        </div>
      )}
      {active === "roles" && <AdminRolesPanel />}
      {active === "security" && <AdminSecurityPanel />}
      {active === "comments" && <CommentsTab />}
      {active === "messages" && <MessagesTab />}
      {active === "newsletter" && <NewsletterTab />}
    </AdminShell>
  );
}

const ADMIN_NAV_SEARCH: { type: string; label: string; tab: AdminTab }[] = [
  { type: "page", label: "Dashboard", tab: "dashboard" },
  { type: "page", label: "Products", tab: "products" },
  { type: "page", label: "Categories", tab: "categories" },
  { type: "page", label: "Collections", tab: "collections" },
  { type: "page", label: "Orders", tab: "orders" },
  { type: "page", label: "Customers", tab: "customers" },
  { type: "page", label: "Inventory", tab: "inventory" },
  { type: "page", label: "Coupons", tab: "coupons" },
  { type: "page", label: "Reviews", tab: "reviews" },
  { type: "page", label: "Marketing", tab: "marketing" },
  { type: "page", label: "Analytics", tab: "analytics" },
  { type: "page", label: "Media Library", tab: "media" },
  { type: "page", label: "Homepage Builder", tab: "homepage" },
  { type: "page", label: "Blog", tab: "blog" },
  { type: "page", label: "Reports", tab: "reports" },
  { type: "page", label: "Website Settings", tab: "settings" },
  { type: "page", label: "Security", tab: "security" },
];
