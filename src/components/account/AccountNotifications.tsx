import { useEffect, useState } from "react";
import { Bell, Mail, Package, Percent, RefreshCw, Tag } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  DEFAULT_NOTIFICATION_PREFS,
  loadJson,
  saveJson,
  type NotificationPrefs,
} from "./account-utils";

const ROWS: {
  key: keyof NotificationPrefs;
  title: string;
  description: string;
  icon: typeof Bell;
}[] = [
  {
    key: "orders",
    title: "Orders",
    description: "Updates on packing, shipping, and delivery.",
    icon: Package,
  },
  {
    key: "sales",
    title: "Sales",
    description: "Early access to atelier sales and drops.",
    icon: Tag,
  },
  {
    key: "coupons",
    title: "Coupons",
    description: "Exclusive voucher codes for members.",
    icon: Percent,
  },
  {
    key: "restock",
    title: "Restock Alerts",
    description: "When wishlist pieces return to stock.",
    icon: RefreshCw,
  },
  {
    key: "newsletter",
    title: "Newsletter",
    description: "Editorial looks and seasonal stories.",
    icon: Mail,
  },
];

export function AccountNotifications({ userId }: { userId?: string }) {
  const key = `pahraan_notif_prefs_${userId || "guest"}`;
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIFICATION_PREFS);

  useEffect(() => {
    setPrefs(loadJson(key, DEFAULT_NOTIFICATION_PREFS));
  }, [key]);

  const toggle = (field: keyof NotificationPrefs, value: boolean) => {
    const next = { ...prefs, [field]: value };
    setPrefs(next);
    saveJson(key, next);
    toast.success("Notification preference saved");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Notifications</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Choose what Pahraan sends to your inbox.
        </p>
      </div>

      <div className="divide-y divide-border/50 overflow-hidden rounded-3xl border border-border/60 bg-white shadow-soft">
        {ROWS.map(({ key: field, title, description, icon: Icon }) => (
          <div key={field} className="flex items-center justify-between gap-4 p-5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/25 text-primary">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-sm font-bold">{title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
              </div>
            </div>
            <Switch
              checked={prefs[field]}
              onCheckedChange={(v) => toggle(field, v)}
              aria-label={title}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
