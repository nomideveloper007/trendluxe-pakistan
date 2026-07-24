import { useEffect, useState } from "react";
import { Building2, CreditCard, Landmark, Smartphone, Wallet } from "lucide-react";
import { toast } from "sonner";
import { loadJson, saveJson, type PaymentPreference } from "./account-utils";

const METHODS: {
  id: PaymentPreference;
  title: string;
  description: string;
  icon: typeof Wallet;
  available: boolean;
}[] = [
  {
    id: "cod",
    title: "Cash on Delivery",
    description: "Pay when your Pahraan parcel arrives.",
    icon: Wallet,
    available: true,
  },
  {
    id: "easypaisa",
    title: "EasyPaisa",
    description: "Instant mobile wallet checkout.",
    icon: Smartphone,
    available: true,
  },
  {
    id: "jazzcash",
    title: "JazzCash",
    description: "Fast JazzCash transfer at checkout.",
    icon: Smartphone,
    available: true,
  },
  {
    id: "bank",
    title: "Bank Transfer",
    description: "Direct deposit to Pahraan atelier account.",
    icon: Landmark,
    available: true,
  },
  {
    id: "card",
    title: "Credit / Debit Card",
    description: "Coming soon — secure card payments.",
    icon: CreditCard,
    available: false,
  },
];

export function AccountPayments({ userId }: { userId?: string }) {
  const storageKey = `pahraan_payment_pref_${userId || "guest"}`;
  const [preferred, setPreferred] = useState<PaymentPreference>("cod");

  useEffect(() => {
    const stored = loadJson<PaymentPreference | { preferred?: PaymentPreference }>(storageKey, "cod");
    setPreferred(typeof stored === "string" ? stored : stored.preferred || "cod");
  }, [storageKey]);

  const select = (id: PaymentPreference, available: boolean) => {
    if (!available) {
      toast.message("Card payments coming soon");
      return;
    }
    setPreferred(id);
    saveJson(storageKey, id);
    toast.success("Preferred payment method saved");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Payment Methods</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Choose how you prefer to pay for future orders.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {METHODS.map(({ id, title, description, icon: Icon, available }) => {
          const active = preferred === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => select(id, available)}
              className={`rounded-3xl border p-5 text-left shadow-soft transition cursor-pointer ${
                active
                  ? "border-primary bg-primary/5 shadow-elegant"
                  : "border-border/60 bg-white hover:border-primary/20"
              } ${!available ? "opacity-70" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                    active ? "bg-primary text-white" : "bg-secondary/25 text-primary"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {!available && (
                  <span className="rounded-full bg-secondary/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                    Soon
                  </span>
                )}
                {active && available && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                    Preferred
                  </span>
                )}
              </div>
              <p className="mt-4 text-sm font-bold text-foreground">{title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{description}</p>
            </button>
          );
        })}
      </div>

      <div className="rounded-3xl border border-dashed border-border/70 bg-[#FFF9FB] p-5 text-xs text-muted-foreground">
        <div className="flex items-start gap-3">
          <Building2 className="mt-0.5 h-4 w-4 text-primary" />
          <p>
            Card vaulting and saved EasyPaisa / JazzCash numbers will appear here in a future update.
            Your preference is stored securely on this device for checkout convenience.
          </p>
        </div>
      </div>
    </div>
  );
}
