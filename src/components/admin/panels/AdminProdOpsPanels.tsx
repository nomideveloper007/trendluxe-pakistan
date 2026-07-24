import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  DEFAULT_ANALYTICS,
  loadAnalyticsIds,
  saveAnalyticsIds,
  type AnalyticsIds,
} from "@/lib/site-config";
import {
  DEFAULT_NOTIFICATION_PREFS,
  EMAIL_TEMPLATES,
  loadNotificationPrefs,
  saveNotificationPrefs,
  type NotificationPrefs,
} from "@/lib/email-templates";
import { AdminPanelShell } from "@/components/admin/panels/AdminCatalogPanels";
import { loadAdminJson, saveAdminJson } from "@/components/admin/admin-utils";

export function AdminTrackingPanel() {
  const [ids, setIds] = useState<AnalyticsIds>(DEFAULT_ANALYTICS);

  useEffect(() => {
    setIds(loadAnalyticsIds());
  }, []);

  const save = () => {
    saveAnalyticsIds(ids);
    toast.success("Tracking IDs saved — reload storefront to apply");
  };

  const fields: { key: keyof AnalyticsIds; label: string; hint: string }[] = [
    { key: "ga4", label: "Google Analytics 4", hint: "G-XXXXXXXX" },
    { key: "gtm", label: "Google Tag Manager", hint: "GTM-XXXXXXX" },
    { key: "searchConsole", label: "Search Console verification", hint: "meta verification token" },
    { key: "metaPixel", label: "Meta Pixel", hint: "Pixel ID" },
    { key: "pinterest", label: "Pinterest Tag", hint: "Tag ID" },
    { key: "tiktok", label: "TikTok Pixel", hint: "Pixel ID" },
    { key: "clarity", label: "Microsoft Clarity", hint: "Project ID" },
  ];

  return (
    <AdminPanelShell
      title="Analytics & Tracking"
      subtitle="Manage GA4, GTM, Search Console, Meta, Pinterest, TikTok & Clarity without code changes."
      action={
        <Button
          onClick={save}
          className="rounded-full bg-primary text-xs text-white cursor-pointer"
        >
          Save tracking IDs
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((f) => (
          <div
            key={f.key}
            className="space-y-2 rounded-3xl border border-border/60 bg-[var(--admin-panel,#fff)] p-4 shadow-soft"
          >
            <label className="text-xs font-bold">{f.label}</label>
            <Input
              value={ids[f.key] || ""}
              onChange={(e) => setIds((prev) => ({ ...prev, [f.key]: e.target.value.trim() }))}
              placeholder={f.hint}
              className="rounded-xl text-xs"
              autoComplete="off"
            />
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px] text-muted-foreground">
        Env vars (`VITE_GA4_ID`, etc.) act as defaults. Admin values override them on this device.
      </p>
    </AdminPanelShell>
  );
}

export function AdminEmailNotificationsPanel() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIFICATION_PREFS);
  const [selected, setSelected] = useState(EMAIL_TEMPLATES[0].id);

  useEffect(() => {
    setPrefs(loadNotificationPrefs());
  }, []);

  const template = EMAIL_TEMPLATES.find((t) => t.id === selected)!;

  const persist = (next: NotificationPrefs) => {
    setPrefs(next);
    saveNotificationPrefs(next);
    toast.success("Notification preference saved");
  };

  return (
    <AdminPanelShell
      title="Email & Notifications"
      subtitle="Configurable templates + channel toggles (email, WhatsApp, push, SMS)."
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-2 lg:col-span-2">
          {EMAIL_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelected(t.id)}
              className={`w-full rounded-2xl border px-3 py-2.5 text-left text-xs font-semibold cursor-pointer ${
                selected === t.id
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border/60 bg-[var(--admin-panel,#fff)]"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
        <div className="space-y-4 rounded-3xl border border-border/60 bg-[var(--admin-panel,#fff)] p-5 shadow-soft lg:col-span-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Subject
            </p>
            <p className="mt-1 text-sm font-semibold">{template.subject}</p>
          </div>
          <Textarea value={template.body} readOnly rows={5} className="rounded-2xl text-xs" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["email", "whatsapp", "push", "sms"] as const).map((channel) => (
              <label
                key={channel}
                className="flex items-center justify-between rounded-2xl border border-border/50 px-3 py-2 text-[11px] font-bold capitalize"
              >
                {channel}
                <Switch
                  checked={prefs[selected][channel]}
                  onCheckedChange={(v) =>
                    persist({
                      ...prefs,
                      [selected]: { ...prefs[selected], [channel]: v },
                    })
                  }
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </AdminPanelShell>
  );
}

export function AdminBackupMonitoringPanel() {
  const [logs, setLogs] = useState(() =>
    loadAdminJson("pahraan_activity_logs", [
      {
        id: "1",
        at: new Date().toISOString(),
        message: "Admin panel loaded",
        level: "info",
      },
    ] as { id: string; at: string; message: string; level: string }[]),
  );

  const createBackup = () => {
    const snapshot = {
      at: new Date().toISOString(),
      settings: loadAdminJson("pahraan_admin_settings", {}),
      analytics: loadAnalyticsIds(),
      notifications: loadNotificationPrefs(),
    };
    const points = loadAdminJson("pahraan_restore_points", [] as (typeof snapshot)[]);
    const next = [snapshot, ...points].slice(0, 14);
    saveAdminJson("pahraan_restore_points", next);
    const entry = {
      id: String(Date.now()),
      at: snapshot.at,
      message: "Manual restore point created",
      level: "info",
    };
    const nextLogs = [entry, ...logs].slice(0, 50);
    setLogs(nextLogs);
    saveAdminJson("pahraan_activity_logs", nextLogs);
    toast.success("Restore point saved (local)");
  };

  return (
    <AdminPanelShell
      title="Backup & Monitoring"
      subtitle="Daily backup hooks, restore points, error & activity logs."
      action={
        <Button
          onClick={createBackup}
          className="rounded-full bg-primary text-xs text-white cursor-pointer"
        >
          Create restore point
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-border/60 bg-[var(--admin-panel,#fff)] p-5 shadow-soft">
          <h3 className="font-display text-lg font-bold">Scheduled jobs</h3>
          <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
            <li>Daily backup snapshot — placeholder (wire cron / Cloudflare Workers)</li>
            <li>Failed job monitoring — placeholder queue</li>
            <li>Performance sampling — Core Web Vitals via Clarity/GA4</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-border/60 bg-[var(--admin-panel,#fff)] p-5 shadow-soft">
          <h3 className="font-display text-lg font-bold">Activity log</h3>
          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className="rounded-2xl border border-border/40 px-3 py-2 text-[11px]"
              >
                <p className="font-semibold">{log.message}</p>
                <p className="text-muted-foreground">{new Date(log.at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminPanelShell>
  );
}
