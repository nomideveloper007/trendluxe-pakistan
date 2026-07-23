import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Apple,
  Banknote,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  Gift,
  Landmark,
  Loader2,
  Lock,
  MapPin,
  Package,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Truck,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/lib/auth";
import {
  createOrder,
  createUserAddress,
  fetchUserAddresses,
  type OrderInput,
} from "@/lib/ecommerce-data";
import { LuxurySelect } from "@/components/LuxurySelect";
import { resolveImage } from "@/lib/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({
    meta: [
      { title: "Checkout — Pahraan" },
      { name: "description", content: "Secure luxury checkout for Pahraan women's fashion." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type StepId = "information" | "shipping" | "payment" | "review";

const STEPS: { id: StepId; label: string; number: number }[] = [
  { id: "information", label: "Information", number: 1 },
  { id: "shipping", label: "Shipping", number: 2 },
  { id: "payment", label: "Payment", number: 3 },
  { id: "review", label: "Review", number: 4 },
];

const PROVINCES = [
  { value: "Sindh", label: "Sindh" },
  { value: "Punjab", label: "Punjab" },
  { value: "KPK", label: "Khyber Pakhtunkhwa" },
  { value: "Balochistan", label: "Balochistan" },
  { value: "Federal", label: "Islamabad Capital Territory" },
  { value: "AJK", label: "Azad Jammu & Kashmir" },
  { value: "Gilgit", label: "Gilgit-Baltistan" },
];

const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Cash on Delivery",
    desc: "Pay in cash when your order arrives",
    icon: Banknote,
    ready: true,
  },
  {
    id: "easypaisa",
    label: "EasyPaisa",
    desc: "Pay via EasyPaisa mobile wallet",
    icon: Wallet,
    ready: true,
  },
  {
    id: "jazzcash",
    label: "JazzCash",
    desc: "Pay via JazzCash mobile wallet",
    icon: Wallet,
    ready: true,
  },
  {
    id: "bank",
    label: "Bank Transfer",
    desc: "Direct transfer to Pahraan account",
    icon: Landmark,
    ready: true,
  },
  {
    id: "card",
    label: "Visa / Mastercard",
    desc: "Secure card payment",
    icon: CreditCard,
    ready: true,
  },
  {
    id: "stripe",
    label: "Stripe",
    desc: "Coming soon",
    icon: CreditCard,
    ready: false,
  },
  {
    id: "paypal",
    label: "PayPal",
    desc: "Coming soon",
    icon: Wallet,
    ready: false,
  },
  {
    id: "apple_pay",
    label: "Apple Pay",
    desc: "Coming soon",
    icon: Apple,
    ready: false,
  },
  {
    id: "google_pay",
    label: "Google Pay",
    desc: "Coming soon",
    icon: Sparkles,
    ready: false,
  },
] as const;

const GIFT_WRAP_FEE = 350;
const LUXURY_PACK_FEE = 500;

const inputBase =
  "w-full rounded-2xl border bg-[#FFF9FB] px-4 py-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function isValidPkPhone(v: string) {
  const cleaned = v.replace(/[\s-]/g, "");
  return /^(?:\+92|0)?3\d{9}$/.test(cleaned);
}

function Field({
  id,
  label,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
      >
        {label}
        {required ? <span className="text-primary"> *</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-[11px] font-semibold text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ProgressBar({ step, onGo }: { step: StepId; onGo: (s: StepId) => void }) {
  const currentIdx = STEPS.findIndex((s) => s.id === step);
  return (
    <nav aria-label="Checkout progress" className="mb-8">
      <ol className="flex items-center justify-between gap-1 sm:gap-2">
        {STEPS.map((s, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <li key={s.id} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                onClick={() => {
                  if (i <= currentIdx) onGo(s.id);
                }}
                disabled={i > currentIdx}
                className={cn(
                  "group flex flex-col items-center gap-1.5 sm:flex-row sm:gap-2",
                  i > currentIdx ? "cursor-not-allowed opacity-45" : "cursor-pointer",
                )}
                aria-current={active ? "step" : undefined}
              >
                <span
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-full border text-xs font-bold transition duration-300",
                    done && "border-primary bg-primary text-white",
                    active &&
                      "border-primary bg-white text-primary shadow-elegant ring-4 ring-primary/10",
                    !done && !active && "border-border bg-white text-muted-foreground",
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : s.number}
                </span>
                <span
                  className={cn(
                    "hidden text-[10px] font-bold uppercase tracking-wider sm:block",
                    active || done ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 ? (
                <div
                  className={cn(
                    "mx-1 h-0.5 flex-1 rounded-full transition-all duration-500 sm:mx-3",
                    i < currentIdx ? "bg-primary" : "bg-border",
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function TrustBadges() {
  const items = [
    { icon: Lock, label: "Secure Checkout" },
    { icon: Truck, label: "Fast Shipping" },
    { icon: RotateCcw, label: "Easy Returns" },
    { icon: ShieldCheck, label: "Safe Payment" },
    { icon: Star, label: "Premium Quality" },
  ];
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {items.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="flex items-center gap-2 rounded-2xl border border-[#F8BBD0]/40 bg-[#FFF9FB] px-3 py-2.5 text-[10px] font-semibold text-foreground/80"
        >
          <Icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
          {label}
        </li>
      ))}
    </ul>
  );
}

function OrderSuccess({
  orderId,
  email,
  firstName,
  deliveryEta,
  paymentMethod,
  isGuest,
}: {
  orderId: string;
  email: string;
  firstName: string;
  deliveryEta: string;
  paymentMethod: string;
  isGuest: boolean;
}) {
  const shareOrder = async () => {
    const text = `I just ordered from Pahraan! Order #${orderId}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Pahraan Order", text, url: window.location.origin });
      } else {
        await navigator.clipboard.writeText(`${text} — ${window.location.origin}`);
        toast.success("Order details copied");
      }
    } catch {
      /* user cancelled */
    }
  };

  const downloadInvoice = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invoice ${orderId}</title>
      <style>body{font-family:Georgia,serif;max-width:640px;margin:40px auto;color:#2a1a1f}
      h1{color:#C2185B} .meta{color:#666;font-size:14px}</style></head>
      <body><h1>Pahraan</h1><p class="meta">Invoice for order <strong>${orderId}</strong></p>
      <p>Dear ${firstName}, thank you for shopping with Pahraan.</p>
      <p>Email: ${email}<br/>Payment: ${paymentMethod}<br/>Estimated delivery: ${deliveryEta}</p>
      <p class="meta">This is a provisional invoice. A detailed receipt will follow by email.</p>
      </body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pahraan-invoice-${orderId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container-page py-16 max-w-2xl animate-fade-in font-body text-foreground">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div className="relative grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-600 shadow-elegant">
            <CheckCircle2 className="h-10 w-10" />
          </div>
        </div>
        <h1 className="mt-8 font-display text-3xl md:text-4xl font-bold">
          Thank you for shopping with Pahraan!
        </h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
          Your order is confirmed. A confirmation has been sent to{" "}
          <strong className="text-foreground">{email}</strong>.
        </p>

        <div className="mt-8 w-full rounded-[28px] border border-[#F8BBD0]/45 bg-white p-6 text-left shadow-soft space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/40 pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Order Number
              </p>
              <p className="mt-1 font-display text-xl font-bold text-primary">{orderId}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Estimated Delivery
              </p>
              <p className="mt-1 text-sm font-semibold">{deliveryEta}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Payment method:{" "}
            <strong className="text-foreground uppercase tracking-wide">
              {paymentMethod.replace(/_/g, " ")}
            </strong>
          </p>
        </div>

        <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={downloadInvoice}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition hover:border-primary hover:text-primary cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" /> Download Invoice
          </button>
          <Link
            to="/profile"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition hover:border-primary hover:text-primary"
          >
            <Package className="h-3.5 w-3.5" /> Track Order
          </Link>
          <button
            type="button"
            onClick={shareOrder}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition hover:border-primary hover:text-primary cursor-pointer sm:col-span-2"
          >
            <Share2 className="h-3.5 w-3.5" /> Share Order
          </button>
        </div>

        {isGuest ? (
          <div className="mt-8 w-full rounded-[24px] border border-dashed border-primary/30 bg-blush px-5 py-5 text-left">
            <p className="font-display text-lg font-semibold">Create your Pahraan account</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Save addresses, track orders, and unlock early access to new collections.
            </p>
            <Link
              to="/auth"
              search={{ redirect: "/profile" }}
              className="mt-4 inline-flex rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-elegant hover:bg-accent"
            >
              Create Account
            </Link>
          </div>
        ) : null}

        <Link
          to="/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-elegant hover:bg-accent"
        >
          Continue Shopping <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function CheckoutPage() {
  const formId = useId();
  const { user } = useAuth();
  const {
    cart,
    cartSubtotal,
    productDiscount,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    discountAmount,
    taxCost,
    giftNote,
    setGiftNote,
    clearCart,
  } = useCart();

  const [step, setStep] = useState<StepId>("information");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attempted, setAttempted] = useState(false);
  const submittingRef = useRef(false);

  // Contact
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emailUpdates, setEmailUpdates] = useState(true);

  // Address
  const [country] = useState("Pakistan");
  const [province, setProvince] = useState("Sindh");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [saveAddress, setSaveAddress] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Delivery & payment
  const [deliveryMethod, setDeliveryMethod] = useState<"flat_rate" | "express" | "pickup">(
    "flat_rate",
  );
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [walletPhone, setWalletPhone] = useState("");

  // Gift & coupon
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponMsg, setCouponMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [giftWrap, setGiftWrap] = useState(false);
  const [luxuryPack, setLuxuryPack] = useState(false);
  const [localGiftMessage, setLocalGiftMessage] = useState(giftNote || "");
  const [orderNotes, setOrderNotes] = useState("");

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [successMeta, setSuccessMeta] = useState<{ eta: string; payment: string } | null>(null);

  const addressesQ = useQuery({
    queryKey: ["user-addresses", user?.id],
    queryFn: () => (user ? fetchUserAddresses(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  useEffect(() => {
    if (!addressesQ.data?.length) return;
    const def = addressesQ.data.find((a) => a.is_default) || addressesQ.data[0];
    setSelectedAddressId(def.id);
    setFirstName(def.first_name);
    setLastName(def.last_name);
    setPhone(def.phone);
    setAddressLine1(def.address_line1);
    setAddressLine2(def.address_line2 || "");
    setCity(def.city);
    setProvince(def.state);
    setPostalCode(def.postal_code);
  }, [addressesQ.data]);

  useEffect(() => {
    setLocalGiftMessage(giftNote || "");
  }, [giftNote]);

  const freeShipping = cartSubtotal >= 5000 || appliedCoupon?.discount_type === "free_shipping";

  const shippingCost = useMemo(() => {
    if (deliveryMethod === "pickup") return 0;
    if (deliveryMethod === "express") return 500;
    return freeShipping ? 0 : 250;
  }, [deliveryMethod, freeShipping]);

  const giftFees = (giftWrap ? GIFT_WRAP_FEE : 0) + (luxuryPack ? LUXURY_PACK_FEE : 0);
  const finalTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost + taxCost + giftFees);

  const deliveryEta = useMemo(() => {
    if (deliveryMethod === "express") return "Arrives in 1–2 business days";
    if (deliveryMethod === "pickup") return "Ready for pickup in 1–2 business days";
    return "Arrives in 2–4 business days";
  }, [deliveryMethod]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "First name is required";
    if (!lastName.trim()) e.lastName = "Last name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!isValidEmail(email)) e.email = "Enter a valid email address";
    if (!phone.trim()) e.phone = "Phone number is required";
    else if (!isValidPkPhone(phone)) e.phone = "Use a valid Pakistan mobile (03XXXXXXXXX)";
    if (!addressLine1.trim()) e.addressLine1 = "Street address is required";
    if (!city.trim()) e.city = "City is required";
    if (!area.trim()) e.area = "Area is required";
    if (!province) e.province = "Province is required";
    if ((paymentMethod === "easypaisa" || paymentMethod === "jazzcash") && walletPhone) {
      if (!isValidPkPhone(walletPhone)) e.walletPhone = "Enter a valid wallet number";
    }
    if (!acceptedTerms) e.terms = "Please accept the Terms & Privacy Policy";
    return e;
  }, [
    firstName,
    lastName,
    email,
    phone,
    addressLine1,
    city,
    area,
    province,
    paymentMethod,
    walletPhone,
    acceptedTerms,
  ]);

  const showError = (key: string) => (attempted || touched[key] ? errors[key] : undefined);

  const markTouched = (key: string) => setTouched((t) => ({ ...t, [key]: true }));

  const validateStep = (s: StepId): boolean => {
    setAttempted(true);
    if (s === "information") {
      return !errors.firstName && !errors.lastName && !errors.email && !errors.phone;
    }
    if (s === "shipping") {
      return !errors.addressLine1 && !errors.city && !errors.area && !errors.province;
    }
    if (s === "payment") {
      return !errors.walletPhone;
    }
    return Object.keys(errors).length === 0;
  };

  const goNext = () => {
    const idx = STEPS.findIndex((x) => x.id === step);
    if (!validateStep(step)) {
      toast.error("Please complete the highlighted fields");
      return;
    }
    if (idx < STEPS.length - 1) {
      setAttempted(false);
      setStep(STEPS[idx + 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    const idx = STEPS.findIndex((x) => x.id === step);
    if (idx > 0) {
      setAttempted(false);
      setStep(STEPS[idx - 1].id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const applySavedAddress = (id: string) => {
    const addr = addressesQ.data?.find((a) => a.id === id);
    if (!addr) return;
    setSelectedAddressId(id);
    setFirstName(addr.first_name);
    setLastName(addr.last_name);
    setPhone(addr.phone);
    setAddressLine1(addr.address_line1);
    setAddressLine2(addr.address_line2 || "");
    setCity(addr.city);
    setProvince(addr.state);
    setPostalCode(addr.postal_code);
  };

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      if (submittingRef.current) throw new Error("Order is already being processed");
      submittingRef.current = true;

      if (cart.length === 0) throw new Error("Your bag is empty");
      if (!validateStep("review")) throw new Error("Please complete all required fields");

      const shippingAddressObj = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        address_line1: addressLine1.trim(),
        address_line2: addressLine2.trim() || undefined,
        area: area.trim(),
        city: city.trim(),
        province,
        postal_code: postalCode.trim(),
        country,
        email_updates: emailUpdates,
        gift_wrap: giftWrap,
        luxury_packaging: luxuryPack,
      };

      const orderInput: OrderInput = {
        user_id: user?.id,
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
        shipping_address: shippingAddressObj,
        billing_address: shippingAddressObj,
        delivery_method: deliveryMethod,
        shipping_cost: shippingCost,
        tax_cost: taxCost,
        discount_amount: discountAmount,
        subtotal: cartSubtotal,
        total: finalTotal,
        coupon_code: appliedCoupon?.code,
        payment_method: paymentMethod,
        payment_status:
          paymentMethod === "card" || paymentMethod === "stripe" ? "pending" : "pending",
        order_notes: orderNotes.trim() || undefined,
        gift_note: localGiftMessage.trim() || undefined,
        items: cart.map((item) => ({
          product_id: item.productId,
          product_title: item.product.title,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.product.price,
        })),
      };

      const id = await createOrder(orderInput);

      if (user && saveAddress) {
        await createUserAddress({
          user_id: user.id,
          label: "Home",
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
          address_line1: addressLine1.trim(),
          address_line2: addressLine2.trim() || null,
          city: city.trim(),
          state: province,
          postal_code: postalCode.trim() || "",
          country,
          is_default: true,
        });
      }

      if (localGiftMessage.trim()) setGiftNote(localGiftMessage.trim());

      return id;
    },
    onSuccess: (id) => {
      setSuccessMeta({ eta: deliveryEta, payment: paymentMethod });
      setOrderId(id);
      clearCart();
      toast.success("Order placed successfully");
    },
    onError: (e: Error) => {
      submittingRef.current = false;
      toast.error(e.message || "Failed to place order");
    },
  });

  const handleApplyCoupon = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!couponInput.trim()) return;
      setCouponApplying(true);
      setCouponMsg(null);
      const ok = await applyCouponCode(couponInput.trim());
      setCouponApplying(false);
      if (ok) {
        setCouponInput("");
        setCouponMsg({ type: "ok", text: "Coupon applied successfully" });
      } else {
        setCouponMsg({ type: "err", text: "Invalid or expired coupon" });
      }
    },
    [applyCouponCode, couponInput],
  );

  if (cart.length === 0 && !orderId) {
    return (
      <div className="container-page py-24 text-center animate-fade-in font-body flex flex-col items-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-[#FFF5F8] text-primary shadow-soft">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold">Your bag is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add something beautiful before checkout.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex rounded-full bg-primary px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-elegant hover:bg-accent"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (orderId && successMeta) {
    return (
      <OrderSuccess
        orderId={orderId}
        email={email}
        firstName={firstName}
        deliveryEta={successMeta.eta}
        paymentMethod={successMeta.payment}
        isGuest={!user}
      />
    );
  }

  const summaryBlock = (
    <div className="space-y-5">
      <h2 className="font-display text-lg font-bold border-b border-border/40 pb-3">
        Order Summary
      </h2>

      <ul className="max-h-52 space-y-0 divide-y divide-border/40 overflow-y-auto pr-1">
        {cart.map((item) => (
          <li key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3 py-3">
            <div className="h-16 w-12 shrink-0 overflow-hidden rounded-xl bg-muted border border-border/50">
              <img
                src={resolveImage(item.product.images[0])}
                alt={item.product.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{item.product.title}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {item.size} · {item.color} · Qty {item.quantity}
              </p>
            </div>
            <p className="shrink-0 text-xs font-bold tabular-nums">
              PKR {(item.product.price * item.quantity).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>

      {/* Coupon */}
      <div className="rounded-2xl border border-border/60 bg-[#FFF9FB] overflow-hidden">
        <button
          type="button"
          onClick={() => setCouponOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left cursor-pointer"
          aria-expanded={couponOpen}
        >
          <span className="text-xs font-bold uppercase tracking-wider">Have a coupon?</span>
          <ChevronDown className={cn("h-4 w-4 transition", couponOpen && "rotate-180")} />
        </button>
        {couponOpen ? (
          <form
            onSubmit={handleApplyCoupon}
            className="border-t border-border/40 px-4 pb-4 pt-3 space-y-2 animate-fade-in"
          >
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value);
                  setCouponMsg(null);
                }}
                placeholder="Enter code"
                className={cn(inputBase, "py-2.5 text-xs")}
                aria-label="Coupon code"
              />
              <button
                type="submit"
                disabled={couponApplying}
                className="shrink-0 rounded-full bg-primary px-4 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-accent disabled:opacity-60 cursor-pointer"
              >
                {couponApplying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
              </button>
            </div>
            {couponMsg ? (
              <p
                className={cn(
                  "flex items-center gap-1 text-[11px] font-semibold",
                  couponMsg.type === "ok" ? "text-emerald-600" : "text-destructive",
                )}
              >
                {couponMsg.type === "ok" ? <Check className="h-3 w-3" /> : null}
                {couponMsg.text}
              </p>
            ) : null}
            {appliedCoupon ? (
              <button
                type="button"
                onClick={() => {
                  removeCoupon();
                  setCouponMsg(null);
                }}
                className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
              >
                Remove “{appliedCoupon.code}”
              </button>
            ) : null}
          </form>
        ) : null}
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-semibold text-foreground tabular-nums">
            PKR {cartSubtotal.toLocaleString()}
          </span>
        </div>
        {productDiscount > 0 ? (
          <div className="flex justify-between text-emerald-700">
            <span>Discount</span>
            <span className="tabular-nums">− PKR {productDiscount.toLocaleString()}</span>
          </div>
        ) : null}
        {discountAmount > 0 ? (
          <div className="flex justify-between text-primary">
            <span>Coupon{appliedCoupon ? ` (${appliedCoupon.code})` : ""}</span>
            <span className="tabular-nums">− PKR {discountAmount.toLocaleString()}</span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span>Shipping</span>
          <span className="font-semibold text-foreground tabular-nums">
            {shippingCost === 0 ? "Free" : `PKR ${shippingCost.toLocaleString()}`}
          </span>
        </div>
        {giftFees > 0 ? (
          <div className="flex justify-between">
            <span>Gift options</span>
            <span className="font-semibold text-foreground tabular-nums">
              PKR {giftFees.toLocaleString()}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span>Estimated tax</span>
          <span className="font-semibold text-foreground tabular-nums">
            PKR {taxCost.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between border-t border-border/40 pt-3">
          <span className="font-display text-base font-bold text-foreground">Grand Total</span>
          <span className="font-display text-lg font-bold text-primary tabular-nums transition-all duration-300">
            PKR {finalTotal.toLocaleString()}
          </span>
        </div>
      </div>

      <TrustBadges />
    </div>
  );

  return (
    <div className="min-h-[70vh] bg-background font-body text-foreground animate-fade-in">
      <div className="container-page py-8 md:py-12 pb-36 lg:pb-12">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
              Pahraan
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Secure Checkout</h1>
          </div>
          {!user ? (
            <Link
              to="/auth"
              search={{ redirect: "/checkout" }}
              className="rounded-full border border-border bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition hover:border-primary hover:text-primary"
            >
              Returning customer? Sign in
            </Link>
          ) : (
            <p className="text-xs text-muted-foreground">
              Signed in as <strong className="text-foreground">{user.email}</strong>
            </p>
          )}
        </div>

        <ProgressBar step={step} onGo={setStep} />

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] items-start">
          <div className="space-y-5">
            {/* STEP: Information */}
            {step === "information" ? (
              <section
                className="rounded-[28px] border border-[#F8BBD0]/40 bg-white p-5 sm:p-7 shadow-soft space-y-5 animate-fade-in"
                aria-labelledby={`${formId}-info`}
              >
                <h2 id={`${formId}-info`} className="font-display text-xl font-semibold">
                  Contact Information
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="co-first" label="First Name" required error={showError("firstName")}>
                    <input
                      id="co-first"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onBlur={() => markTouched("firstName")}
                      autoComplete="given-name"
                      className={cn(inputBase, showError("firstName") && "border-destructive")}
                      aria-invalid={!!showError("firstName")}
                    />
                  </Field>
                  <Field id="co-last" label="Last Name" required error={showError("lastName")}>
                    <input
                      id="co-last"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onBlur={() => markTouched("lastName")}
                      autoComplete="family-name"
                      className={cn(inputBase, showError("lastName") && "border-destructive")}
                      aria-invalid={!!showError("lastName")}
                    />
                  </Field>
                  <Field id="co-email" label="Email" required error={showError("email")}>
                    <input
                      id="co-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => markTouched("email")}
                      autoComplete="email"
                      className={cn(inputBase, showError("email") && "border-destructive")}
                      aria-invalid={!!showError("email")}
                    />
                  </Field>
                  <Field id="co-phone" label="Phone Number" required error={showError("phone")}>
                    <input
                      id="co-phone"
                      type="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onBlur={() => markTouched("phone")}
                      placeholder="03XXXXXXXXX"
                      autoComplete="tel"
                      className={cn(inputBase, showError("phone") && "border-destructive")}
                      aria-invalid={!!showError("phone")}
                    />
                  </Field>
                </div>
                <label className="flex items-start gap-3 text-xs text-foreground/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailUpdates}
                    onChange={(e) => setEmailUpdates(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <span>Receive order updates via Email</span>
                </label>
                {!user ? (
                  <p className="rounded-2xl bg-blush px-4 py-3 text-[11px] text-muted-foreground leading-relaxed">
                    Guest checkout is available — no account required. You can create one after
                    placing your order.
                  </p>
                ) : null}
              </section>
            ) : null}

            {/* STEP: Shipping */}
            {step === "shipping" ? (
              <section
                className="rounded-[28px] border border-[#F8BBD0]/40 bg-white p-5 sm:p-7 shadow-soft space-y-5 animate-fade-in"
                aria-labelledby={`${formId}-ship`}
              >
                <h2 id={`${formId}-ship`} className="font-display text-xl font-semibold">
                  Shipping Address
                </h2>

                {user && (addressesQ.data?.length ?? 0) > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Saved addresses
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {addressesQ.data!.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => applySavedAddress(a.id)}
                          className={cn(
                            "min-w-[160px] shrink-0 rounded-2xl border px-3 py-3 text-left text-xs transition cursor-pointer",
                            selectedAddressId === a.id
                              ? "border-primary bg-primary/5 shadow-soft"
                              : "border-border hover:border-primary/40",
                          )}
                        >
                          <p className="font-semibold">{a.label || "Address"}</p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-2">
                            {a.address_line1}, {a.city}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="co-country" label="Country" required>
                    <input
                      id="co-country"
                      value={country}
                      readOnly
                      className={cn(inputBase, "bg-muted/40")}
                    />
                  </Field>
                  <Field id="co-province" label="Province" required error={showError("province")}>
                    <LuxurySelect
                      value={province}
                      onValueChange={setProvince}
                      options={PROVINCES}
                      placeholder="Select province"
                    />
                  </Field>
                  <Field id="co-city" label="City" required error={showError("city")}>
                    <input
                      id="co-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      onBlur={() => markTouched("city")}
                      autoComplete="address-level2"
                      className={cn(inputBase, showError("city") && "border-destructive")}
                    />
                  </Field>
                  <Field id="co-area" label="Area" required error={showError("area")}>
                    <input
                      id="co-area"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      onBlur={() => markTouched("area")}
                      placeholder="e.g. DHA Phase 5"
                      className={cn(inputBase, showError("area") && "border-destructive")}
                    />
                  </Field>
                </div>

                <Field
                  id="co-street"
                  label="Street Address"
                  required
                  error={showError("addressLine1")}
                >
                  <input
                    id="co-street"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    onBlur={() => markTouched("addressLine1")}
                    autoComplete="street-address"
                    placeholder="House / building, street name"
                    className={cn(inputBase, showError("addressLine1") && "border-destructive")}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="co-apt" label="Apartment (optional)">
                    <input
                      id="co-apt"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Floor, suite, unit"
                      className={inputBase}
                    />
                  </Field>
                  <Field id="co-postal" label="Postal Code">
                    <input
                      id="co-postal"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      autoComplete="postal-code"
                      className={inputBase}
                    />
                  </Field>
                </div>

                {/* Maps placeholder */}
                <div className="rounded-2xl border border-dashed border-[#F8BBD0]/70 bg-[#FFF9FB] px-4 py-5">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-semibold">Google Maps location picker</p>
                      <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                        Pin your exact location for faster delivery — coming soon. Your typed
                        address is enough for now.
                      </p>
                    </div>
                  </div>
                </div>

                {user ? (
                  <label className="flex items-start gap-3 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveAddress}
                      onChange={(e) => setSaveAddress(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-primary"
                    />
                    <span>Save address for future orders</span>
                  </label>
                ) : null}

                <div className="border-t border-border/40 pt-5 space-y-3">
                  <h3 className="font-display text-base font-semibold">Delivery Options</h3>
                  {[
                    {
                      id: "flat_rate" as const,
                      label: "Standard Delivery",
                      desc: "Arrives in 2–4 business days",
                      cost: freeShipping ? "FREE" : "PKR 250",
                      icon: Truck,
                    },
                    {
                      id: "express" as const,
                      label: "Express Delivery",
                      desc: "Arrives in 1–2 business days",
                      cost: "PKR 500",
                      icon: Sparkles,
                    },
                    {
                      id: "pickup" as const,
                      label: "Store Pickup",
                      desc: "Coming soon — Karachi & Lahore studios",
                      cost: "FREE",
                      icon: Store,
                      disabled: true,
                    },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const selected = deliveryMethod === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={opt.disabled}
                        onClick={() => !opt.disabled && setDeliveryMethod(opt.id)}
                        className={cn(
                          "flex w-full items-start justify-between gap-3 rounded-2xl border p-4 text-left transition duration-300 cursor-pointer",
                          selected
                            ? "border-primary bg-primary/5 shadow-soft scale-[1.01]"
                            : "border-border hover:border-primary/40",
                          opt.disabled && "opacity-50 cursor-not-allowed hover:border-border",
                        )}
                      >
                        <div className="flex gap-3">
                          <span
                            className={cn(
                              "mt-0.5 grid h-5 w-5 place-items-center rounded-full border transition",
                              selected ? "border-primary bg-primary" : "border-muted-foreground",
                            )}
                          >
                            {selected ? <Check className="h-3 w-3 text-white" /> : null}
                          </span>
                          <div>
                            <p className="text-xs font-bold flex items-center gap-1.5">
                              <Icon className="h-3.5 w-3.5 text-primary" /> {opt.label}
                              {opt.disabled ? (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-semibold text-muted-foreground">
                                  Soon
                                </span>
                              ) : null}
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">{opt.desc}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-primary shrink-0">{opt.cost}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {/* STEP: Payment */}
            {step === "payment" ? (
              <section
                className="rounded-[28px] border border-[#F8BBD0]/40 bg-white p-5 sm:p-7 shadow-soft space-y-5 animate-fade-in"
                aria-labelledby={`${formId}-pay`}
              >
                <h2 id={`${formId}-pay`} className="font-display text-xl font-semibold">
                  Payment Method
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {PAYMENT_METHODS.map((pay) => {
                    const Icon = pay.icon;
                    const selected = paymentMethod === pay.id;
                    return (
                      <button
                        key={pay.id}
                        type="button"
                        disabled={!pay.ready}
                        onClick={() => pay.ready && setPaymentMethod(pay.id)}
                        className={cn(
                          "relative flex items-start gap-3 rounded-2xl border p-4 text-left transition duration-300 cursor-pointer",
                          selected
                            ? "border-primary bg-primary/5 shadow-elegant scale-[1.02]"
                            : "border-border hover:border-primary/40 hover:-translate-y-0.5",
                          !pay.ready &&
                            "opacity-50 cursor-not-allowed hover:translate-y-0 hover:border-border",
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition",
                            selected
                              ? "border-primary bg-white text-primary"
                              : "border-border bg-[#FFF9FB] text-foreground/70",
                          )}
                        >
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold">{pay.label}</p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">{pay.desc}</p>
                        </div>
                        {!pay.ready ? (
                          <span className="absolute right-2 top-2 rounded-full bg-muted px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                            Soon
                          </span>
                        ) : null}
                        {selected ? (
                          <span className="absolute bottom-2 right-2 text-primary">
                            <Check className="h-4 w-4" />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                {(paymentMethod === "easypaisa" || paymentMethod === "jazzcash") && (
                  <div className="rounded-2xl border border-border bg-[#FFF9FB] p-4 space-y-3 animate-fade-in">
                    <p className="text-xs font-bold capitalize">{paymentMethod} account</p>
                    <Field
                      id="co-wallet"
                      label="Mobile wallet number"
                      error={showError("walletPhone")}
                    >
                      <input
                        id="co-wallet"
                        type="tel"
                        value={walletPhone}
                        onChange={(e) => setWalletPhone(e.target.value)}
                        placeholder="03XXXXXXXXX"
                        className={cn(inputBase, showError("walletPhone") && "border-destructive")}
                      />
                    </Field>
                    <p className="text-[11px] text-muted-foreground">
                      You&apos;ll receive a confirmation prompt on your phone to approve payment.
                    </p>
                  </div>
                )}

                {paymentMethod === "bank" && (
                  <div className="rounded-2xl border border-border bg-[#FFF9FB] p-4 text-[11px] text-muted-foreground space-y-1.5 animate-fade-in leading-relaxed">
                    <p className="text-xs font-bold text-foreground">Bank transfer details</p>
                    <p>
                      Bank: <strong className="text-foreground">Bank Alfalah Limited</strong>
                    </p>
                    <p>
                      Title: <strong className="text-foreground">Pahraan Couture Pvt Ltd</strong>
                    </p>
                    <p>
                      Account: <strong className="text-foreground">5510-9901-2291</strong>
                    </p>
                    <p>
                      IBAN: <strong className="text-foreground">PK80ALFH551099012291</strong>
                    </p>
                    <p className="pt-1 text-primary font-semibold">
                      Email your transfer slip to billing@pahraan.com with your order number.
                    </p>
                  </div>
                )}

                {paymentMethod === "card" && (
                  <div className="rounded-2xl border border-border bg-[#FFF9FB] p-4 space-y-3 animate-fade-in">
                    <p className="text-xs font-bold">Card details</p>
                    <input
                      placeholder="Name on card"
                      className={inputBase}
                      autoComplete="cc-name"
                    />
                    <input
                      placeholder="Card number"
                      className={inputBase}
                      autoComplete="cc-number"
                      inputMode="numeric"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="MM / YY" className={inputBase} autoComplete="cc-exp" />
                      <input placeholder="CVC" className={inputBase} autoComplete="cc-csc" />
                    </div>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Encrypted — card data is not stored on our
                      servers.
                    </p>
                  </div>
                )}

                {/* Saved payment methods placeholder */}
                {user ? (
                  <div className="rounded-2xl border border-dashed border-border px-4 py-3 text-[11px] text-muted-foreground">
                    Saved payment methods — coming soon for returning customers.
                  </div>
                ) : null}

                {/* Gift options */}
                <div className="border-t border-border/40 pt-5 space-y-3">
                  <h3 className="font-display text-base font-semibold flex items-center gap-2">
                    <Gift className="h-4 w-4 text-primary" /> Gift Options
                  </h3>
                  <label className="flex items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3 text-xs cursor-pointer hover:border-primary/40 transition">
                    <span>
                      <strong>Gift wrapping</strong>
                      <span className="block text-[10px] text-muted-foreground mt-0.5">
                        Elegant wrap · PKR {GIFT_WRAP_FEE}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={giftWrap}
                      onChange={(e) => setGiftWrap(e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3 text-xs cursor-pointer hover:border-primary/40 transition">
                    <span>
                      <strong>Luxury packaging</strong>
                      <span className="block text-[10px] text-muted-foreground mt-0.5">
                        Signature box & tissue · PKR {LUXURY_PACK_FEE}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={luxuryPack}
                      onChange={(e) => setLuxuryPack(e.target.checked)}
                      className="h-4 w-4 accent-primary"
                    />
                  </label>
                  <Field id="co-gift-msg" label="Gift message">
                    <textarea
                      id="co-gift-msg"
                      rows={3}
                      value={localGiftMessage}
                      onChange={(e) => setLocalGiftMessage(e.target.value)}
                      placeholder="A short note for someone special…"
                      className={cn(inputBase, "resize-none")}
                      maxLength={200}
                    />
                  </Field>
                </div>
              </section>
            ) : null}

            {/* STEP: Review */}
            {step === "review" ? (
              <section
                className="rounded-[28px] border border-[#F8BBD0]/40 bg-white p-5 sm:p-7 shadow-soft space-y-5 animate-fade-in"
                aria-labelledby={`${formId}-review`}
              >
                <h2 id={`${formId}-review`} className="font-display text-xl font-semibold">
                  Review & Place Order
                </h2>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      title: "Contact",
                      body: `${firstName} ${lastName}\n${email}\n${phone}`,
                      go: "information" as StepId,
                    },
                    {
                      title: "Shipping",
                      body: `${addressLine1}${addressLine2 ? `, ${addressLine2}` : ""}\n${area}, ${city}\n${province}, ${country}`,
                      go: "shipping" as StepId,
                    },
                    {
                      title: "Delivery",
                      body: `${deliveryMethod === "express" ? "Express" : deliveryMethod === "pickup" ? "Store Pickup" : "Standard"}\n${deliveryEta}`,
                      go: "shipping" as StepId,
                    },
                    {
                      title: "Payment",
                      body:
                        PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label || paymentMethod,
                      go: "payment" as StepId,
                    },
                  ].map((card) => (
                    <div
                      key={card.title}
                      className="rounded-2xl border border-border/60 bg-[#FFF9FB] p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {card.title}
                        </p>
                        <button
                          type="button"
                          onClick={() => setStep(card.go)}
                          className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="mt-2 whitespace-pre-line text-xs font-semibold leading-relaxed">
                        {card.body}
                      </p>
                    </div>
                  ))}
                </div>

                <Field id="co-notes" label="Order notes (optional)">
                  <textarea
                    id="co-notes"
                    rows={3}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Delivery instructions, preferred time window…"
                    className={cn(inputBase, "resize-none")}
                  />
                </Field>

                <label
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-xs cursor-pointer transition",
                    showError("terms") ? "border-destructive bg-destructive/5" : "border-border",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);
                      markTouched("terms");
                    }}
                    className="mt-0.5 h-4 w-4 accent-primary"
                    aria-invalid={!!showError("terms")}
                  />
                  <span>
                    I agree to the{" "}
                    <Link to="/about" className="font-semibold text-primary hover:underline">
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link to="/about" className="font-semibold text-primary hover:underline">
                      Privacy Policy
                    </Link>
                    .
                    {showError("terms") ? (
                      <span className="mt-1 block text-[11px] font-semibold text-destructive">
                        {errors.terms}
                      </span>
                    ) : null}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => placeOrderMutation.mutate()}
                  disabled={!acceptedTerms || placeOrderMutation.isPending || submittingRef.current}
                  className="hidden lg:flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-xs font-bold uppercase tracking-wider text-white shadow-elegant transition hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {placeOrderMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5" /> Complete Order · PKR{" "}
                      {finalTotal.toLocaleString()}
                    </>
                  )}
                </button>
              </section>
            ) : null}

            {/* Step nav */}
            <div className="flex items-center justify-between gap-3 pt-1">
              {step !== "information" ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider transition hover:border-primary hover:text-primary cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
              ) : (
                <Link
                  to="/cart"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider transition hover:border-primary hover:text-primary"
                >
                  <ChevronLeft className="h-4 w-4" /> Bag
                </Link>
              )}
              {step !== "review" ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-elegant hover:bg-accent cursor-pointer"
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>

          {/* Desktop sticky summary */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-[28px] border border-[#F8BBD0]/40 bg-white p-6 shadow-soft">
              {summaryBlock}
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile sticky summary + checkout CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#F8BBD0]/40 bg-white/95 backdrop-blur-md shadow-[0_-10px_40px_-12px_rgba(194,24,91,0.15)] lg:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => setMobileSummaryOpen((v) => !v)}
          className="flex w-full items-center justify-between px-5 pt-3 text-left cursor-pointer"
          aria-expanded={mobileSummaryOpen}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {mobileSummaryOpen ? "Hide summary" : "Order summary"}
          </span>
          <span className="flex items-center gap-2">
            <span className="font-display text-base font-bold text-primary tabular-nums">
              PKR {finalTotal.toLocaleString()}
            </span>
            <ChevronDown className={cn("h-4 w-4 transition", mobileSummaryOpen && "rotate-180")} />
          </span>
        </button>
        {mobileSummaryOpen ? (
          <div className="max-h-[45vh] overflow-y-auto px-5 pb-3 pt-2 animate-fade-in">
            {summaryBlock}
          </div>
        ) : null}
        <div className="px-5 pb-3 pt-2">
          {step === "review" ? (
            <button
              type="button"
              onClick={() => placeOrderMutation.mutate()}
              disabled={!acceptedTerms || placeOrderMutation.isPending || submittingRef.current}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-elegant disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {placeOrderMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5" /> Complete Order
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-elegant cursor-pointer"
            >
              Continue to {STEPS[STEPS.findIndex((s) => s.id === step) + 1]?.label}
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
