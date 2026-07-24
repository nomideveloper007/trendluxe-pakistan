import {
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  ClipboardList,
  FolderTree,
  Gift,
  Globe,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Mail,
  Megaphone,
  MessageSquare,
  Package,
  Settings,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  Users,
  Warehouse,
  type LucideIcon,
} from "lucide-react";

export type AdminTab =
  | "dashboard"
  | "products"
  | "categories"
  | "collections"
  | "orders"
  | "customers"
  | "inventory"
  | "coupons"
  | "reviews"
  | "marketing"
  | "analytics"
  | "media"
  | "homepage"
  | "blog"
  | "trends"
  | "notifications"
  | "reports"
  | "settings"
  | "staff"
  | "roles"
  | "security"
  | "comments"
  | "messages"
  | "newsletter"
  | "tracking"
  | "emails"
  | "backup";

export const ADMIN_TABS: AdminTab[] = [
  "dashboard",
  "products",
  "categories",
  "collections",
  "orders",
  "customers",
  "inventory",
  "coupons",
  "reviews",
  "marketing",
  "analytics",
  "media",
  "homepage",
  "blog",
  "trends",
  "notifications",
  "reports",
  "settings",
  "staff",
  "roles",
  "security",
  "comments",
  "messages",
  "newsletter",
  "tracking",
  "emails",
  "backup",
];

export function isAdminTab(v: unknown): v is AdminTab {
  return typeof v === "string" && ADMIN_TABS.includes(v as AdminTab);
}

export type AdminNavItem = {
  id: AdminTab;
  label: string;
  icon: LucideIcon;
  group: string;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Overview" },
  { id: "products", label: "Products", icon: Package, group: "Catalog" },
  { id: "categories", label: "Categories", icon: FolderTree, group: "Catalog" },
  { id: "collections", label: "Collections", icon: Sparkles, group: "Catalog" },
  { id: "inventory", label: "Inventory", icon: Warehouse, group: "Catalog" },
  { id: "orders", label: "Orders", icon: ShoppingBag, group: "Sales" },
  { id: "customers", label: "Customers", icon: Users, group: "Sales" },
  { id: "coupons", label: "Coupons", icon: Tag, group: "Sales" },
  { id: "reviews", label: "Reviews", icon: Star, group: "Sales" },
  { id: "marketing", label: "Marketing", icon: Megaphone, group: "Growth" },
  { id: "analytics", label: "Analytics", icon: BarChart3, group: "Growth" },
  { id: "tracking", label: "Tracking IDs", icon: BarChart3, group: "Growth" },
  { id: "reports", label: "Reports", icon: ClipboardList, group: "Growth" },
  { id: "media", label: "Media Library", icon: ImageIcon, group: "Content" },
  { id: "homepage", label: "Homepage Builder", icon: LayoutTemplate, group: "Content" },
  { id: "blog", label: "Blog", icon: BookOpen, group: "Content" },
  { id: "trends", label: "Trends", icon: Sparkles, group: "Content" },
  { id: "comments", label: "Comments", icon: MessageSquare, group: "Content" },
  { id: "newsletter", label: "Newsletter", icon: Mail, group: "Content" },
  { id: "messages", label: "Inbox", icon: Mail, group: "Content" },
  { id: "emails", label: "Email Templates", icon: Mail, group: "System" },
  { id: "notifications", label: "Notifications", icon: Bell, group: "System" },
  { id: "settings", label: "Website Settings", icon: Settings, group: "System" },
  { id: "backup", label: "Backup & Monitoring", icon: ClipboardList, group: "System" },
  { id: "staff", label: "Staff Management", icon: Users, group: "System" },
  { id: "roles", label: "Roles & Permissions", icon: Shield, group: "System" },
  { id: "security", label: "Security", icon: Shield, group: "System" },
];

export const LOGOUT_ICON = LogOut;
export const GLOBE_ICON = Globe;
export const BOXES_ICON = Boxes;
export const GIFT_ICON = Gift;

export function loadAdminJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    if (
      fallback &&
      typeof fallback === "object" &&
      !Array.isArray(fallback) &&
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return { ...fallback, ...(parsed as object) } as T;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

export function saveAdminJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function exportCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const v = row[h];
          const s = v == null ? "" : String(v);
          return `"${s.replace(/"/g, '""')}"`;
        })
        .join(","),
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function money(n: number) {
  return `PKR ${Number(n || 0).toLocaleString()}`;
}
