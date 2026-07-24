import { Link } from "@tanstack/react-router";
import {
  CheckCircle,
  Package,
  Printer,
  RotateCcw,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  ORDER_STATUS_STYLES,
  ORDER_TIMELINE,
  orderRef,
  printInvoice,
  timelineIndex,
} from "./account-utils";

type Props = {
  orders: any[];
  loading?: boolean;
  selectedId?: string | null;
  onSelect: (id: string | null) => void;
};

export function AccountOrders({ orders, loading, selectedId, onSelect }: Props) {
  const selected = orders.find((o) => o.id === selectedId) ?? null;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36 rounded-3xl" />
        ))}
      </div>
    );
  }

  if (selected) {
    return <OrderDetail order={selected} onBack={() => onSelect(null)} />;
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border/80 bg-white p-10 text-center shadow-soft animate-fade-in">
        <ShoppingBag className="mx-auto h-8 w-8 text-primary/60" />
        <h3 className="mt-4 font-display text-xl font-bold">No orders yet</h3>
        <p className="mx-auto mt-2 max-w-sm text-xs text-muted-foreground leading-relaxed">
          Browse our catalogs to discover exclusive Pakistani apparel.
        </p>
        <Link
          to="/shop"
          className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-soft hover:bg-accent"
        >
          Go to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">My Orders</h2>
        <p className="mt-1 text-xs text-muted-foreground">Track, reorder, and download invoices.</p>
      </div>

      <div className="hidden overflow-hidden rounded-3xl border border-border/60 bg-white shadow-soft md:block">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FFF9FB] text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {orders.map((order) => (
              <tr key={order.id} className="transition hover:bg-secondary/5">
                <td className="px-4 py-4 font-bold">{orderRef(order.id)}</td>
                <td className="px-4 py-4 text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-4">{(order.order_items || []).length}</td>
                <td className="px-4 py-4 font-semibold text-primary">
                  PKR {Number(order.total).toLocaleString()}
                </td>
                <td className="px-4 py-4">
                  <OrderActions order={order} onView={() => onSelect(order.id)} compact />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-3xl border border-border/60 bg-white p-4 shadow-soft transition hover:border-primary/15"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold">{orderRef(order.id)}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {(order.order_items || []).length} item
                {(order.order_items || []).length === 1 ? "" : "s"}
              </span>
              <span className="font-bold text-primary">
                PKR {Number(order.total).toLocaleString()}
              </span>
            </div>
            <div className="mt-3 border-t border-border/40 pt-3">
              <OrderActions order={order} onView={() => onSelect(order.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
        ORDER_STATUS_STYLES[status] || "bg-gray-50 border-gray-200 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

function OrderActions({
  order,
  onView,
  compact,
}: {
  order: any;
  onView: () => void;
  compact?: boolean;
}) {
  const canCancel = ["pending", "processing"].includes(order.status);

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${compact ? "justify-end" : ""}`}>
      <Button
        size="sm"
        variant="outline"
        onClick={onView}
        className="h-8 rounded-full px-3 text-[10px] font-bold cursor-pointer"
      >
        Details
      </Button>
      {order.tracking_number && (
        <Button
          size="sm"
          variant="outline"
          onClick={() => toast.message(`Tracking: ${order.tracking_number}`)}
          className="h-8 rounded-full px-3 text-[10px] font-bold cursor-pointer"
        >
          <Truck className="mr-1 h-3 w-3" /> Track
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => printInvoice(order)}
        className="h-8 rounded-full px-2 text-[10px] font-bold cursor-pointer"
        title="Invoice"
      >
        <Printer className="h-3.5 w-3.5" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => toast.success("Items ready to reorder — open the shop to continue.")}
        className="h-8 rounded-full px-2 text-[10px] font-bold cursor-pointer"
        title="Reorder"
      >
        <RotateCcw className="h-3.5 w-3.5" />
      </Button>
      {canCancel && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            toast.message("Cancel request noted", {
              description: "Our atelier will confirm within 2 business hours.",
            })
          }
          className="h-8 rounded-full px-2 text-[10px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
          title="Cancel"
        >
          <XCircle className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

function OrderDetail({ order, onBack }: { order: any; onBack: () => void }) {
  const idx = timelineIndex(order.status);
  const shipping = order.shipping_address || {};
  const billing = order.billing_address || shipping;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            ← Back to orders
          </button>
          <h2 className="mt-2 font-display text-2xl font-bold">{orderRef(order.id)}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Placed {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          <Button
            onClick={() => printInvoice(order)}
            className="rounded-full bg-primary text-xs font-semibold text-white hover:bg-accent cursor-pointer"
          >
            <Printer className="mr-1.5 h-3.5 w-3.5" /> Download Invoice
          </Button>
        </div>
      </div>

      {idx >= 0 && (
        <div className="rounded-3xl border border-border/60 bg-white p-6 shadow-soft">
          <h3 className="font-display text-lg font-bold">Order Timeline</h3>
          <div className="relative mt-8">
            <div className="absolute left-0 right-0 top-3 h-0.5 bg-border" />
            <div
              className="absolute left-0 top-3 h-0.5 bg-primary transition-all duration-500"
              style={{ width: `${(idx / (ORDER_TIMELINE.length - 1)) * 100}%` }}
            />
            <div className="relative grid grid-cols-4 gap-2">
              {ORDER_TIMELINE.map((step, i) => {
                const active = i <= idx;
                return (
                  <div key={step} className="flex flex-col items-center text-center">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white transition ${
                        active
                          ? "border-primary text-primary"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {active ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Package className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <p
                      className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${
                        active ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {step}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {order.tracking_number && (
            <div className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
              <Truck className="h-4 w-4" /> Tracking: {order.tracking_number}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-border/60 bg-white p-5 shadow-soft">
          <h3 className="font-display text-lg font-bold">Order Summary</h3>
          <div className="mt-4 divide-y divide-border/40">
            {(order.order_items || []).map((item: any) => (
              <div
                key={item.id || `${item.product_title}-${item.size}`}
                className="flex justify-between py-3 text-xs"
              >
                <div>
                  <p className="font-bold">{item.product_title}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground capitalize">
                    {item.size} · {item.color} · Qty {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">
                  PKR {(Number(item.price) * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1 border-t border-border/40 pt-3 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>PKR {Number(order.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>PKR {Number(order.shipping_cost).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span>PKR {Number(order.tax_cost).toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-1 text-sm font-bold text-primary">
              <span>Total</span>
              <span>PKR {Number(order.total).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-border/60 bg-white p-5 shadow-soft">
            <h3 className="font-display text-lg font-bold">Shipping Address</h3>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">
                {shipping.first_name || order.first_name} {shipping.last_name || order.last_name}
              </span>
              <br />
              {shipping.address_line1}
              {shipping.address_line2 ? `, ${shipping.address_line2}` : ""}
              <br />
              {shipping.city}
              {shipping.state ? `, ${shipping.state}` : ""} {shipping.postal_code || ""}
              <br />
              {order.phone}
            </p>
          </div>
          <div className="rounded-3xl border border-border/60 bg-white p-5 shadow-soft">
            <h3 className="font-display text-lg font-bold">Billing & Payment</h3>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">
                {billing.first_name || order.first_name} {billing.last_name || order.last_name}
              </span>
              <br />
              {billing.address_line1 || shipping.address_line1}
              <br />
              {billing.city || shipping.city}
            </p>
            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-primary">
              {(order.payment_method || "cod").replace("_", " ")} ·{" "}
              {order.payment_status || "pending"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
