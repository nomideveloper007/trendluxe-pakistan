export type AccountTab =
  | "home"
  | "profile"
  | "orders"
  | "wishlist"
  | "addresses"
  | "payments"
  | "returns"
  | "reviews"
  | "rewards"
  | "notifications"
  | "support"
  | "settings";

export const ACCOUNT_TABS: AccountTab[] = [
  "home",
  "profile",
  "orders",
  "wishlist",
  "addresses",
  "payments",
  "returns",
  "reviews",
  "rewards",
  "notifications",
  "support",
  "settings",
];

export function isAccountTab(value: unknown): value is AccountTab {
  return typeof value === "string" && ACCOUNT_TABS.includes(value as AccountTab);
}

export function greetingForHour(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function orderRef(id: string): string {
  return `PAH-${id.slice(0, 8).toUpperCase()}`;
}

export const ORDER_STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  returned: "bg-orange-50 text-orange-700 border-orange-200",
  refunded: "bg-orange-50 text-orange-700 border-orange-200",
};

export const ORDER_TIMELINE = ["pending", "processing", "shipped", "delivered"] as const;

export function timelineIndex(status: string): number {
  const idx = ORDER_TIMELINE.indexOf(status as (typeof ORDER_TIMELINE)[number]);
  if (status === "cancelled" || status === "returned" || status === "refunded") return -1;
  return Math.max(0, idx);
}

export type NotificationPrefs = {
  orders: boolean;
  sales: boolean;
  coupons: boolean;
  restock: boolean;
  newsletter: boolean;
};

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  orders: true,
  sales: true,
  coupons: true,
  restock: false,
  newsletter: true,
};

export function loadJson<T>(key: string, fallback: T): T {
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
      return { ...fallback, ...parsed };
    }
    return parsed;
  } catch {
    return fallback;
  }
}

export function saveJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function rewardsFromOrders(orders: { total?: number; status?: string }[]): {
  current: number;
  lifetime: number;
  tier: string;
  nextTierAt: number;
} {
  const delivered = orders.filter((o) => o.status === "delivered" || o.status === "shipped");
  const lifetimeSpend = delivered.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const lifetime = Math.floor(lifetimeSpend / 100);
  const redeemedRaw = loadJson<number>("pahraan_rewards_redeemed", 0);
  const redeemed = typeof redeemedRaw === "number" ? redeemedRaw : 0;
  const current = Math.max(0, lifetime - redeemed);
  let tier = "Blush";
  let nextTierAt = 500;
  if (lifetime >= 2000) {
    tier = "Couture";
    nextTierAt = 2000;
  } else if (lifetime >= 1000) {
    tier = "Pearl";
    nextTierAt = 2000;
  } else if (lifetime >= 500) {
    tier = "Rose";
    nextTierAt = 1000;
  }
  return { current, lifetime, tier, nextTierAt };
}

export type ReturnRequest = {
  id: string;
  orderId: string;
  reason: string;
  notes: string;
  status: "submitted" | "reviewing" | "approved" | "rejected" | "completed";
  createdAt: string;
};

export type SupportTicket = {
  id: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
};

export type PaymentPreference = "cod" | "easypaisa" | "jazzcash" | "bank" | "card";

export function printInvoice(order: any) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.write(`
    <html>
      <head>
        <title>Invoice - Order #${order.id}</title>
        <style>
          body { font-family: 'Poppins', sans-serif; padding: 40px; color: #2D2D2D; }
          h1 { font-family: 'Playfair Display', serif; color: #C2185B; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          th, td { padding: 12px; border-bottom: 1px solid #E5E7EB; text-align: left; }
          th { background-color: #FFF9FB; }
          .totals { text-align: right; margin-top: 30px; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>PAHRAAN</h1>
        <p>Order Date: ${new Date(order.created_at).toLocaleDateString()}</p>
        <p>Invoice reference: ${orderRef(order.id)}</p>
        <p>Customer: ${order.first_name} ${order.last_name} (${order.email})</p>
        <p>Shipping To: ${order.shipping_address?.address_line1}, ${order.shipping_address?.city}</p>
        <table>
          <thead>
            <tr><th>Item</th><th>Size / Color</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr>
          </thead>
          <tbody>
            ${(order.order_items || [])
              .map(
                (i: any) => `
              <tr>
                <td>${i.product_title}</td>
                <td>${i.size} / ${i.color}</td>
                <td>PKR ${Number(i.price).toLocaleString()}</td>
                <td>${i.quantity}</td>
                <td>PKR ${(Number(i.price) * i.quantity).toLocaleString()}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        <div class="totals">
          <p>Subtotal: PKR ${Number(order.subtotal).toLocaleString()}</p>
          <p>Discount: - PKR ${Number(order.discount_amount || 0).toLocaleString()}</p>
          <p>Shipping: PKR ${Number(order.shipping_cost).toLocaleString()}</p>
          <p>GST: PKR ${Number(order.tax_cost).toLocaleString()}</p>
          <p style="font-size: 1.2em; color: #C2185B;">Total: PKR ${Number(order.total).toLocaleString()}</p>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.print();
}
