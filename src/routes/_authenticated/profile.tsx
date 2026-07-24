import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Menu, Shield } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fetchFavorites, fetchProfile } from "@/lib/user-data";
import { fetchProducts, fetchUserAddresses, fetchUserOrders } from "@/lib/ecommerce-data";
import { SITE } from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import { AccountSidebar, AccountMobileNav } from "@/components/account/AccountSidebar";
import { AccountHome } from "@/components/account/AccountHome";
import { AccountOrders } from "@/components/account/AccountOrders";
import { AccountWishlist } from "@/components/account/AccountWishlist";
import { AccountAddresses } from "@/components/account/AccountAddresses";
import { AccountPayments } from "@/components/account/AccountPayments";
import { AccountProfile } from "@/components/account/AccountProfile";
import { AccountRewards } from "@/components/account/AccountRewards";
import { AccountNotifications } from "@/components/account/AccountNotifications";
import { AccountReviews } from "@/components/account/AccountReviews";
import { AccountReturns } from "@/components/account/AccountReturns";
import { AccountSupport } from "@/components/account/AccountSupport";
import { AccountSettings } from "@/components/account/AccountSettings";
import { isAccountTab, type AccountTab } from "@/components/account/account-utils";

type ProfileSearch = {
  tab?: AccountTab;
  order?: string;
};

export const Route = createFileRoute("/_authenticated/profile")({
  validateSearch: (search: Record<string, unknown>): ProfileSearch => ({
    tab: isAccountTab(search.tab) ? search.tab : undefined,
    order: typeof search.order === "string" ? search.order : undefined,
  }),
  head: () => ({
    meta: [{ title: `My Account — ${SITE.name}` }, { name: "robots", content: "noindex" }],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const search = Route.useSearch();
  const tab: AccountTab = search.tab ?? "home";
  const order = search.order;
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const ordersQ = useQuery({
    queryKey: ["user-orders", user?.id],
    queryFn: () => (user ? fetchUserOrders(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const addressesQ = useQuery({
    queryKey: ["user-addresses", user?.id],
    queryFn: () => (user ? fetchUserAddresses(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const productsQ = useQuery({
    queryKey: ["products-account-wishlist"],
    queryFn: () => fetchProducts(),
  });

  const displayName =
    profileQ.data?.display_name ||
    (user?.user_metadata as { display_name?: string } | undefined)?.display_name ||
    user?.email?.split("@")[0] ||
    "Member";

  const productSlugs = useMemo(
    () => (favQ.data ?? []).filter((f) => f.item_type === "product").map((f) => f.item_slug),
    [favQ.data],
  );

  const wishlistProducts = useMemo(
    () => (productsQ.data ?? []).filter((p) => productSlugs.includes(p.slug)),
    [productsQ.data, productSlugs],
  );

  const orders = ordersQ.data ?? [];

  const setTab = (next: AccountTab, orderId?: string | null) => {
    navigate({
      to: "/profile",
      search: {
        tab: next,
        ...(orderId ? { order: orderId } : {}),
      },
      replace: true,
    });
  };

  async function onSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: { redirect: undefined }, replace: true });
    window.location.reload();
  }

  return (
    <div className="container-page py-6 pb-28 font-body text-foreground animate-fade-in lg:py-10 lg:pb-10">
      <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 text-xs font-bold shadow-soft cursor-pointer"
        >
          <Menu className="h-4 w-4 text-primary" /> Menu
        </button>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">My Account</p>
          <p className="text-sm font-semibold">{displayName}</p>
        </div>
      </div>

      <div className="flex gap-6 lg:gap-8">
        <AccountSidebar
          active={tab}
          onNavigate={(t) => setTab(t)}
          onLogout={onSignOut}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        <div className="min-w-0 flex-1 space-y-5">
          {isAdmin && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-primary/20 bg-primary/5 px-4 py-3">
              <Badge className="border-none bg-primary text-white">
                <Shield className="mr-1.5 h-3 w-3" /> Admin
              </Badge>
              <Link to="/admin" className="text-xs font-bold text-primary hover:underline">
                Open admin dashboard →
              </Link>
            </div>
          )}

          {tab === "home" && (
            <AccountHome
              displayName={displayName}
              orders={orders}
              wishlistCount={wishlistProducts.length}
              loading={ordersQ.isLoading || favQ.isLoading}
              onNavigate={setTab}
            />
          )}
          {tab === "orders" && (
            <AccountOrders
              orders={orders}
              loading={ordersQ.isLoading}
              selectedId={order ?? null}
              onSelect={(id) => setTab("orders", id)}
            />
          )}
          {tab === "wishlist" && (
            <AccountWishlist
              products={wishlistProducts}
              loading={favQ.isLoading || productsQ.isLoading}
              userId={user?.id}
            />
          )}
          {tab === "addresses" && (
            <AccountAddresses
              addresses={addressesQ.data ?? []}
              loading={addressesQ.isLoading}
              userId={user?.id}
            />
          )}
          {tab === "payments" && <AccountPayments userId={user?.id} />}
          {tab === "profile" && (
            <AccountProfile
              userId={user?.id}
              email={user?.email}
              displayName={profileQ.data?.display_name ?? displayName}
              bio={profileQ.data?.bio ?? ""}
              avatarUrl={profileQ.data?.avatar_url ?? ""}
            />
          )}
          {tab === "rewards" && <AccountRewards orders={orders} />}
          {tab === "notifications" && <AccountNotifications userId={user?.id} />}
          {tab === "reviews" && <AccountReviews orders={orders} userId={user?.id} />}
          {tab === "returns" && <AccountReturns orders={orders} userId={user?.id} />}
          {tab === "support" && <AccountSupport userId={user?.id} />}
          {tab === "settings" && <AccountSettings email={user?.email} userId={user?.id} />}
        </div>
      </div>

      <AccountMobileNav active={tab} onNavigate={setTab} />
    </div>
  );
}
