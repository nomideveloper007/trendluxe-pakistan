import { useEffect, useState } from "react";
import { Key, MonitorSmartphone, Shield, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { loadJson, saveJson } from "./account-utils";

type Props = {
  email?: string | null;
  userId?: string;
};

export function AccountSettings({ email, userId }: Props) {
  const key = `pahraan_2fa_${userId || "guest"}`;
  const [twoFactor, setTwoFactor] = useState(false);

  useEffect(() => {
    setTwoFactor(loadJson(key, false));
  }, [key]);

  const handlePasswordReset = async () => {
    if (!email) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast.success("Password reset email sent");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
    }
  };

  const devices = [
    {
      name: "This browser",
      detail: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 48) + "…" : "Current session",
      current: true,
    },
    {
      name: "iPhone · Safari",
      detail: "Karachi · Last active 2 days ago",
      current: false,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Security & Settings</h2>
        <p className="mt-1 text-xs text-muted-foreground">Keep your Pahraan account protected.</p>
      </div>

      <section className="rounded-3xl border border-border/60 bg-white p-5 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/25 text-primary">
              <Shield className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-bold">Two-factor authentication</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Placeholder — SMS / authenticator app coming soon.
              </p>
            </div>
          </div>
          <Switch
            checked={twoFactor}
            onCheckedChange={(v) => {
              setTwoFactor(v);
              saveJson(key, v);
              toast.message(v ? "2FA interest saved" : "2FA preference updated", {
                description: "Full verification will be available in a future release.",
              });
            }}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-border/60 bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/25 text-primary">
              <Key className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-bold">Change password</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                We&apos;ll email a secure reset link to {email}.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handlePasswordReset}
            className="rounded-full text-xs font-semibold cursor-pointer"
          >
            Send reset link
          </Button>
        </div>
      </section>

      <section className="rounded-3xl border border-border/60 bg-white p-5 shadow-soft">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold">
          <MonitorSmartphone className="h-4.5 w-4.5 text-primary" /> Login activity
        </h3>
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-border/40 bg-[#FFF9FB] px-4 py-3 text-xs">
            <p className="font-bold">Last sign-in</p>
            <p className="mt-1 text-muted-foreground">
              {new Date().toLocaleString()} · This device
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border/60 bg-white p-5 shadow-soft">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold">
          <Smartphone className="h-4.5 w-4.5 text-primary" /> Device management
        </h3>
        <div className="mt-4 space-y-3">
          {devices.map((device) => (
            <div
              key={device.name}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/40 px-4 py-3"
            >
              <div>
                <p className="text-xs font-bold">
                  {device.name}
                  {device.current && (
                    <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-700">
                      Current
                    </span>
                  )}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">{device.detail}</p>
              </div>
              {!device.current && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toast.success("Device signed out (placeholder)")}
                  className="rounded-full text-[10px] font-bold text-rose-600 cursor-pointer"
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
