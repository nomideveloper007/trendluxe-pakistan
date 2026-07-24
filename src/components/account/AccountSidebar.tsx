import {
  Bell,
  CreditCard,
  Gift,
  Heart,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageSquare,
  Package,
  RefreshCw,
  Settings,
  Star,
  User,
  type LucideIcon,
} from "lucide-react";
import type { AccountTab } from "./account-utils";

export const SIDEBAR_ITEMS: { id: AccountTab; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "Dashboard", icon: LayoutDashboard },
  { id: "profile", label: "Profile", icon: User },
  { id: "orders", label: "My Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "payments", label: "Payment Methods", icon: CreditCard },
  { id: "returns", label: "Returns", icon: RefreshCw },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "rewards", label: "Reward Points", icon: Gift },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "support", label: "Support", icon: HelpCircle },
  { id: "settings", label: "Settings", icon: Settings },
];

type Props = {
  active: AccountTab;
  onNavigate: (tab: AccountTab) => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export function AccountSidebar({ active, onNavigate, onLogout, mobileOpen, onCloseMobile }: Props) {
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px] lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(100%,18rem)] flex-col border-r border-border/60 bg-white shadow-elegant transition-transform duration-300 lg:static lg:z-0 lg:w-64 lg:translate-x-0 lg:shadow-soft lg:rounded-3xl lg:border ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-border/50 px-5 py-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            My Account
          </p>
          <p className="mt-1 font-display text-lg font-bold text-foreground">Pahraan Atelier</p>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {SIDEBAR_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onNavigate(id);
                  onCloseMobile();
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-secondary/20 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            );
          })}
        </nav>

        <div className="sticky bottom-0 border-t border-border/50 bg-white p-3">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-[#FFF9FB] px-4 py-3 text-xs font-bold text-muted-foreground transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export function AccountMobileNav({
  active,
  onNavigate,
}: {
  active: AccountTab;
  onNavigate: (tab: AccountTab) => void;
}) {
  const items: { id: AccountTab; label: string; icon: LucideIcon }[] = [
    { id: "home", label: "Home", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: Package },
    { id: "wishlist", label: "Wish", icon: Heart },
    { id: "support", label: "Help", icon: MessageSquare },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="flex items-stretch">
        {items.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold tracking-wide transition cursor-pointer ${
              active === id ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
