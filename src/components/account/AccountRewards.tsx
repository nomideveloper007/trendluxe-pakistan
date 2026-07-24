import { useMemo, useState } from "react";
import { Gift, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { loadJson, rewardsFromOrders, saveJson } from "./account-utils";

const REWARDS = [
  { points: 200, title: "PKR 500 off", detail: "On orders above PKR 5,000" },
  { points: 500, title: "Free express shipping", detail: "Nationwide courier upgrade" },
  { points: 1000, title: "PKR 2,000 atelier credit", detail: "Valid on full-price pieces" },
  { points: 2000, title: "Private styling session", detail: "Virtual consultation with Pahraan" },
];

export function AccountRewards({ orders }: { orders: any[] }) {
  const [redeemed, setRedeemed] = useState(() => {
    const raw = loadJson<number>("pahraan_rewards_redeemed", 0);
    return typeof raw === "number" ? raw : 0;
  });

  const base = useMemo(() => rewardsFromOrders(orders), [orders]);
  const lifetime = base.lifetime;
  const current = Math.max(0, lifetime - redeemed);
  const { tier, nextTierAt } = base;
  const progress = Math.min(100, Math.round((lifetime / nextTierAt) * 100));

  const redeem = (cost: number, title: string) => {
    if (current < cost) {
      toast.error("Not enough points yet");
      return;
    }
    const next = redeemed + cost;
    setRedeemed(next);
    saveJson("pahraan_rewards_redeemed", next);
    toast.success(`${title} reserved`, {
      description: "A coupon will be emailed within 24 hours.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Reward Points</h2>
        <p className="mt-1 text-xs text-muted-foreground">Earn elegance with every purchase.</p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary via-primary to-accent p-6 text-white shadow-elegant md:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
              {tier} Member
            </p>
            <p className="mt-2 font-display text-5xl font-bold">{current}</p>
            <p className="mt-1 text-sm text-white/85">Current points</p>
          </div>
          <div className="rounded-2xl bg-white/15 px-4 py-3 text-right backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">Lifetime</p>
            <p className="mt-1 font-display text-2xl font-bold">{lifetime}</p>
          </div>
        </div>
        <div className="mt-6">
          <div className="mb-2 flex justify-between text-[11px] text-white/80">
            <span>Progress to next tier</span>
            <span>
              {lifetime} / {nextTierAt}
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-white/20 [&>div]:bg-white" />
        </div>
      </div>

      <div>
        <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
          <Sparkles className="h-4.5 w-4.5 text-primary" /> Redeemable Rewards
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {REWARDS.map((reward) => (
            <div
              key={reward.title}
              className="flex flex-col rounded-3xl border border-border/60 bg-white p-5 shadow-soft transition hover:border-primary/20"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/25 text-primary">
                  <Gift className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-sm font-bold">{reward.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{reward.detail}</p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-primary">
                    {reward.points} points
                  </p>
                </div>
              </div>
              <Button
                onClick={() => redeem(reward.points, reward.title)}
                disabled={current < reward.points}
                className="mt-4 rounded-full bg-primary text-xs font-semibold text-white hover:bg-accent disabled:opacity-40 cursor-pointer"
              >
                Redeem
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
