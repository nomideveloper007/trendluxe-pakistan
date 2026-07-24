export type EmailTemplateId =
  | "welcome"
  | "order_confirmation"
  | "payment_confirmation"
  | "shipping_update"
  | "delivered"
  | "return_request"
  | "password_reset"
  | "newsletter"
  | "coupon_campaign";

export type NotificationChannel = "email" | "whatsapp" | "push" | "sms";

export type NotificationPrefs = Record<
  EmailTemplateId,
  { email: boolean; whatsapp: boolean; push: boolean; sms: boolean }
>;

export const EMAIL_TEMPLATES: {
  id: EmailTemplateId;
  name: string;
  subject: string;
  body: string;
}[] = [
  {
    id: "welcome",
    name: "Welcome Email",
    subject: "Welcome to Pahraan",
    body: "Dear {{name}}, welcome to the Pahraan atelier. Explore our latest collections.",
  },
  {
    id: "order_confirmation",
    name: "Order Confirmation",
    subject: "Order {{order_id}} confirmed",
    body: "Thank you {{name}}. Your order {{order_id}} totaling {{total}} is confirmed.",
  },
  {
    id: "payment_confirmation",
    name: "Payment Confirmation",
    subject: "Payment received for {{order_id}}",
    body: "We received your payment of {{total}} for order {{order_id}}.",
  },
  {
    id: "shipping_update",
    name: "Shipping Update",
    subject: "Your Pahraan order is on the way",
    body: "Order {{order_id}} shipped via {{courier}}. Tracking: {{tracking}}.",
  },
  {
    id: "delivered",
    name: "Delivered Order",
    subject: "Delivered — how does it feel?",
    body: "Order {{order_id}} was delivered. We’d love your review.",
  },
  {
    id: "return_request",
    name: "Return Request",
    subject: "Return request received",
    body: "We received your return request for {{order_id}}. Our team will update you soon.",
  },
  {
    id: "password_reset",
    name: "Password Reset",
    subject: "Reset your Pahraan password",
    body: "Use this link to reset your password: {{reset_url}}",
  },
  {
    id: "newsletter",
    name: "Newsletter",
    subject: "{{subject}}",
    body: "{{content}}",
  },
  {
    id: "coupon_campaign",
    name: "Coupon Campaign",
    subject: "A gift from Pahraan: {{code}}",
    body: "Enjoy {{discount}} with code {{code}}. Valid until {{expiry}}.",
  },
];

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  welcome: { email: true, whatsapp: false, push: false, sms: false },
  order_confirmation: { email: true, whatsapp: true, push: false, sms: false },
  payment_confirmation: { email: true, whatsapp: false, push: false, sms: false },
  shipping_update: { email: true, whatsapp: true, push: false, sms: true },
  delivered: { email: true, whatsapp: false, push: false, sms: false },
  return_request: { email: true, whatsapp: false, push: false, sms: false },
  password_reset: { email: true, whatsapp: false, push: false, sms: false },
  newsletter: { email: true, whatsapp: false, push: false, sms: false },
  coupon_campaign: { email: true, whatsapp: false, push: false, sms: false },
};

export function loadNotificationPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_PREFS;
  try {
    const raw = localStorage.getItem("pahraan_notification_prefs");
    return raw
      ? { ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(raw) }
      : DEFAULT_NOTIFICATION_PREFS;
  } catch {
    return DEFAULT_NOTIFICATION_PREFS;
  }
}

export function saveNotificationPrefs(prefs: NotificationPrefs) {
  if (typeof window === "undefined") return;
  localStorage.setItem("pahraan_notification_prefs", JSON.stringify(prefs));
}

export function renderTemplate(body: string, vars: Record<string, string>) {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}
