import { useState } from "react";
import { Camera, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { loadJson, orderRef, saveJson, type ReturnRequest } from "./account-utils";

const REASONS = [
  "Wrong size",
  "Color not as expected",
  "Fabric / quality concern",
  "Damaged in transit",
  "Changed my mind",
  "Other",
];

export function AccountReturns({ orders, userId }: { orders: any[]; userId?: string }) {
  const key = `pahraan_returns_${userId || "guest"}`;
  const [requests, setRequests] = useState<ReturnRequest[]>(() =>
    loadJson(key, [] as ReturnRequest[]),
  );
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState(REASONS[0]);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const eligible = orders.filter((o) => ["delivered", "shipped"].includes(o.status));

  const submit = () => {
    if (!orderId) {
      toast.error("Select an order");
      return;
    }
    const next: ReturnRequest[] = [
      {
        id: `ret-${Date.now()}`,
        orderId,
        reason,
        notes,
        status: "submitted",
        createdAt: new Date().toISOString(),
      },
      ...requests,
    ];
    setRequests(next);
    saveJson(key, next);
    setOpen(false);
    setNotes("");
    setPhotos([]);
    toast.success("Return request submitted");
  };

  const statusStyle: Record<ReturnRequest["status"], string> = {
    submitted: "bg-amber-50 text-amber-700 border-amber-200",
    reviewing: "bg-blue-50 text-blue-700 border-blue-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Returns & Exchanges</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Request a return within 7 days of delivery.
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="rounded-full bg-primary text-xs font-semibold text-white hover:bg-accent cursor-pointer"
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Request return
        </Button>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-3xl border border-dashed bg-white py-12 text-center text-xs text-muted-foreground shadow-soft">
          No return requests yet.
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="rounded-3xl border border-border/60 bg-white p-5 shadow-soft"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold">{orderRef(req.orderId)}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {req.reason} · {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                  {req.notes && (
                    <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                      {req.notes}
                    </p>
                  )}
                </div>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusStyle[req.status]}`}
                >
                  {req.status}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Tracking
                </p>
                <div className="mt-2 flex gap-2">
                  {["submitted", "reviewing", "approved", "completed"].map((step, i) => {
                    const order = ["submitted", "reviewing", "approved", "completed"];
                    const current = order.indexOf(
                      req.status === "rejected" ? "reviewing" : req.status,
                    );
                    const active = i <= current;
                    return (
                      <div
                        key={step}
                        className={`h-1.5 flex-1 rounded-full ${active ? "bg-primary" : "bg-border"}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display">Request a Return</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Order
              </label>
              <select
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-primary"
              >
                <option value="">Select order</option>
                {eligible.map((o) => (
                  <option key={o.id} value={o.id}>
                    {orderRef(o.id)} · {new Date(o.created_at).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-primary"
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional details..."
              className="w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-primary"
            />
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-[#FFF9FB] py-6 text-[11px] font-semibold text-muted-foreground">
              <Camera className="h-5 w-5 text-primary" />
              Upload photos
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files) return;
                  setPhotos(
                    Array.from(files)
                      .slice(0, 4)
                      .map((f) => URL.createObjectURL(f)),
                  );
                }}
              />
            </label>
            {photos.length > 0 && (
              <div className="flex gap-2">
                {photos.map((src) => (
                  <img key={src} src={src} alt="" className="h-14 w-14 rounded-xl object-cover" />
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={submit}
              className="rounded-full bg-primary text-xs font-semibold text-white hover:bg-accent cursor-pointer"
            >
              Submit request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
