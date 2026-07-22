import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CheckCircle2, CreditCard, Landmark, Truck, Wallet, ShoppingBag, ShieldCheck } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/lib/auth";
import { createOrder, fetchUserAddresses, type OrderInput } from "@/lib/ecommerce-data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { resolveImage } from "@/lib/content";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { cart, cartSubtotal, appliedCoupon, discountAmount, taxCost, cartTotal, giftNote, clearCart } = useCart();

  useEffect(() => {
    if (!loading && !user) {
      toast.info("Please sign in to place an order");
      navigate({ to: "/auth", search: { redirect: "/checkout" } });
    }
  }, [user, loading, navigate]);

  // Address query
  const addressesQ = useQuery({
    queryKey: ["user-addresses", user?.id],
    queryFn: () => (user ? fetchUserAddresses(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  // State fields
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("Sindh");
  const [postalCode, setPostalCode] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billFirstName, setBillFirstName] = useState("");
  const [billLastName, setBillLastName] = useState("");
  const [billAddressLine1, setBillAddressLine1] = useState("");
  const [billCity, setBillCity] = useState("");
  const [billProvince, setBillProvince] = useState("Sindh");

  const [deliveryMethod, setDeliveryMethod] = useState("flat_rate"); // flat_rate, express, pickup
  const [paymentMethod, setPaymentMethod] = useState("cod"); // cod, stripe, paypal, easypaisa, jazzcash, bank

  // Order placement state
  const [orderId, setOrderId] = useState<string | null>(null);

  // Prefill logged-in user details
  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      if (addressesQ.data && addressesQ.data.length > 0) {
        const def = addressesQ.data.find((a) => a.is_default) || addressesQ.data[0];
        setFirstName(def.first_name);
        setLastName(def.last_name);
        setPhone(def.phone);
        setAddressLine1(def.address_line1);
        setAddressLine2(def.address_line2 || "");
        setCity(def.city);
        setProvince(def.state);
        setPostalCode(def.postal_code);
      }
    }
  }, [user, addressesQ.data]);

  // Shipping cost recalculations
  let shippingCost = 250;
  if (deliveryMethod === "pickup") {
    shippingCost = 0;
  } else if (deliveryMethod === "express") {
    shippingCost = 500;
  } else {
    // Flat rate
    shippingCost = cartSubtotal > 5000 || (appliedCoupon && appliedCoupon.discount_type === "free_shipping") ? 0 : 250;
  }
  const finalTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost + taxCost);

  // Mutation
  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please log in to place your order");
      if (cart.length === 0) throw new Error("Your bag is empty");
      if (!email || !firstName || !lastName || !phone || !addressLine1 || !city) {
        throw new Error("Please fill out all required shipping fields");
      }

      const shippingAddressObj = {
        first_name: firstName,
        last_name: lastName,
        phone,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city,
        province,
        postal_code: postalCode,
        country: "Pakistan",
      };

      const billingAddressObj = billingSameAsShipping
        ? shippingAddressObj
        : {
            first_name: billFirstName || firstName,
            last_name: billLastName || lastName,
            phone,
            address_line1: billAddressLine1 || addressLine1,
            city: billCity || city,
            province: billProvince || province,
            postal_code: postalCode,
            country: "Pakistan",
          };

      const orderInput: OrderInput = {
        user_id: user?.id ?? undefined,
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        shipping_address: shippingAddressObj,
        billing_address: billingAddressObj,
        delivery_method: deliveryMethod,
        shipping_cost: shippingCost,
        tax_cost: taxCost,
        discount_amount: discountAmount,
        subtotal: cartSubtotal,
        total: finalTotal,
        coupon_code: appliedCoupon?.code || undefined,
        payment_method: paymentMethod,
        payment_status: paymentMethod === "stripe" || paymentMethod === "paypal" ? "paid" : "pending",
        order_notes: orderNotes || undefined,
        gift_note: giftNote || undefined,
        items: cart.map((item) => ({
          product_id: item.productId,
          product_title: item.product.title,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          price: item.product.price,
        })),
      };

      return await createOrder(orderInput);
    },
    onSuccess: (id) => {
      setOrderId(id);
      clearCart();
      toast.success("Order placed successfully! ✨");
    },
    onError: (e: Error) => {
      toast.error(e.message || "Failed to place order. Try again.");
    },
  });

  // Success Confirmation Panel
  if (orderId) {
    return (
      <div className="container-page py-20 text-center max-w-xl animate-fade-in font-body text-foreground flex flex-col items-center">
        <div className="rounded-full bg-emerald-100 p-5 text-emerald-600 animate-pulse">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="mt-6 font-display text-3xl font-bold text-foreground">Order Confirmed!</h2>
        <p className="mt-2 text-sm text-primary uppercase font-bold tracking-widest">
          Order ID: {orderId}
        </p>
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
          Thank you for choosing Pahraan. We have received your order and sent a confirmation invoice to <strong className="text-foreground">{email}</strong>. Our team is preparing your designer pieces for dispatch.
        </p>
        <div className="mt-8 border border-border bg-white rounded-3xl p-6 text-left w-full shadow-soft space-y-4">
          <h4 className="font-display font-semibold text-sm border-b border-border/40 pb-2">Delivery Summary</h4>
          <div className="text-xs space-y-1.5 text-muted-foreground">
            <p>Recipient: <strong className="text-foreground">{firstName} {lastName}</strong></p>
            <p>Contact No: <strong className="text-foreground">{phone}</strong></p>
            <p>Address: <strong className="text-foreground">{addressLine1}, {city}</strong></p>
            <p>Payment Mode: <strong className="text-foreground uppercase">{paymentMethod.replace("-", " ")}</strong></p>
            <p className="font-bold text-primary mt-2">Estimated Arrival: 3-5 Business Days</p>
          </div>
        </div>
        <Link
          to="/shop"
          className="mt-8 inline-flex items-center gap-2 bg-primary hover:bg-accent text-white rounded-full px-8 py-3.5 text-xs font-semibold shadow-soft hover:shadow-elegant transition cursor-pointer"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10 font-body text-foreground animate-fade-in bg-background">
      <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">Secure Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] items-start">
        {/* CHECKOUT WIZARD FIELDS */}
        <div className="space-y-6">
          {/* SECTION 1: Customer Contact Info */}
          <div className="rounded-3xl border border-border bg-white p-6 shadow-soft space-y-4">
            <h3 className="font-display text-base font-bold border-b border-border/40 pb-2">
              1. Contact Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs outline-none focus:border-primary transition"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Mobile Phone Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03XXXXXXXXX"
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs outline-none focus:border-primary transition"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Shipping details */}
          <div className="rounded-3xl border border-border bg-white p-6 shadow-soft space-y-4">
            <h3 className="font-display text-base font-bold border-b border-border/40 pb-2">
              2. Shipping Address
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs outline-none focus:border-primary transition"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs outline-none focus:border-primary transition"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Street Address *</label>
              <input
                type="text"
                placeholder="House, Flat, Street Name"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                required
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs outline-none focus:border-primary transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Apartment, Suite, Unit (optional)</label>
              <input
                type="text"
                placeholder="Apartment number, building, floor"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs outline-none focus:border-primary transition"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">City *</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs outline-none focus:border-primary transition"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Province *</label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-primary transition"
                >
                  <option value="Sindh">Sindh</option>
                  <option value="Punjab">Punjab</option>
                  <option value="KPK">Khyber Pakhtunkhwa (KPK)</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="Federal">Islamabad Capital Territory</option>
                  <option value="AJK">Azad Jammu & Kashmir (AJK)</option>
                  <option value="Gilgit">Gilgit-Baltistan</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Postal Code</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs outline-none focus:border-primary transition"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Billing Address toggle */}
          <div className="rounded-3xl border border-border bg-white p-6 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h3 className="font-display text-base font-bold">3. Billing Address</h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                <input
                  type="checkbox"
                  checked={billingSameAsShipping}
                  onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                  className="accent-primary"
                  id="billing-same-id"
                />
                <label htmlFor="billing-same-id">Same as shipping</label>
              </div>
            </div>

            {!billingSameAsShipping && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Billing First Name *</label>
                    <input
                      type="text"
                      value={billFirstName}
                      onChange={(e) => setBillFirstName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs outline-none focus:border-primary transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Billing Last Name *</label>
                    <input
                      type="text"
                      value={billLastName}
                      onChange={(e) => setBillLastName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs outline-none focus:border-primary transition"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Billing Street Address *</label>
                  <input
                    type="text"
                    value={billAddressLine1}
                    onChange={(e) => setBillAddressLine1(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs outline-none focus:border-primary transition"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: Delivery Shipping Methods */}
          <div className="rounded-3xl border border-border bg-white p-6 shadow-soft space-y-4">
            <h3 className="font-display text-base font-bold border-b border-border/40 pb-2">
              4. Delivery Method
            </h3>
            <div className="grid gap-3">
              {[
                { id: "flat_rate", label: "Flat Rate Delivery", desc: "3-5 business days across Pakistan", cost: cartSubtotal > 5000 || (appliedCoupon && appliedCoupon.discount_type === "free_shipping") ? "FREE" : "PKR 250" },
                { id: "express", label: "Express Shipping", desc: "1-2 business days express delivery", cost: "PKR 500" },
                { id: "pickup", label: "Self-Pickup", desc: "Collect from Lahore or Karachi design studio", cost: "FREE" }
              ].map((del) => (
                <button
                  key={del.id}
                  type="button"
                  onClick={() => setDeliveryMethod(del.id)}
                  className={`flex items-start justify-between border rounded-2xl p-4 text-left transition hover:border-primary/40 cursor-pointer ${
                    deliveryMethod === del.id ? "border-primary bg-primary/5" : "border-border bg-white"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                      deliveryMethod === del.id ? "border-primary bg-primary text-white" : "border-muted-foreground"
                    }`}>
                      {deliveryMethod === del.id && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{del.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{del.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-primary">{del.cost}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 5: Payment method gateway triggers */}
          <div className="rounded-3xl border border-border bg-white p-6 shadow-soft space-y-4">
            <h3 className="font-display text-base font-bold border-b border-border/40 pb-2">
              5. Payment Method
            </h3>
            <div className="grid gap-3">
              {[
                { id: "cod", label: "Cash on Delivery (COD)", icon: Truck, desc: "Pay in cash upon doorstep delivery" },
                { id: "stripe", label: "Credit / Debit Card (Stripe)", icon: CreditCard, desc: "Pay securely with Visa, Mastercard or Apple Pay" },
                { id: "easypaisa", label: "EasyPaisa Mobile Wallet", icon: Wallet, desc: "Pay using EasyPaisa mobile account" },
                { id: "jazzcash", label: "JazzCash Mobile Wallet", icon: Wallet, desc: "Pay using JazzCash mobile account" },
                { id: "bank", label: "Direct Bank Wire Transfer", icon: Landmark, desc: "Send payment directly to our Alfalah Bank account" }
              ].map((pay) => {
                const PayIcon = pay.icon;
                return (
                  <button
                    key={pay.id}
                    type="button"
                    onClick={() => setPaymentMethod(pay.id)}
                    className={`flex items-start justify-between border rounded-2xl p-4 text-left transition hover:border-primary/40 cursor-pointer ${
                      paymentMethod === pay.id ? "border-primary bg-primary/5" : "border-border bg-white"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                        paymentMethod === pay.id ? "border-primary bg-primary text-white" : "border-muted-foreground"
                      }`}>
                        {paymentMethod === pay.id && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <PayIcon className="h-4 w-4 text-primary" /> {pay.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{pay.desc}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Payment integration form mock displays */}
            {paymentMethod === "stripe" && (
              <div className="rounded-2xl border border-border bg-secondary/5 p-4.5 space-y-3 animate-fade-in text-xs">
                <span className="font-bold text-foreground">Stripe Integration Mode</span>
                <div className="grid gap-2">
                  <input
                    type="text"
                    placeholder="Cardholder Name"
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="Card Number (4242 4242 ...)"
                    maxLength={19}
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="MM / YY"
                      maxLength={5}
                      className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs outline-none focus:border-primary"
                    />
                    <input
                      type="text"
                      placeholder="CVC"
                      maxLength={4}
                      className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {((paymentMethod === "easypaisa") || (paymentMethod === "jazzcash")) && (
              <div className="rounded-2xl border border-border bg-secondary/5 p-4.5 space-y-3 animate-fade-in text-xs">
                <span className="font-bold text-foreground capitalize">{paymentMethod} Account Transfer</span>
                <div className="space-y-2">
                  <input
                    type="tel"
                    placeholder="Mobile Account Number (03XXXXXXXXX)"
                    className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    You will receive a push notification on your mobile screen to approve the transaction.
                  </p>
                </div>
              </div>
            )}

            {paymentMethod === "bank" && (
              <div className="rounded-2xl border border-border bg-secondary/5 p-4.5 space-y-1.5 animate-fade-in text-[10px] text-muted-foreground leading-relaxed">
                <p className="font-bold text-foreground text-xs">Direct Wire Details</p>
                <p>Bank Name: <strong>Bank Alfalah Limited</strong></p>
                <p>Account Title: <strong>Pahraan Couture Pvt Ltd</strong></p>
                <p>Account Number: <strong>5510-9901-2291</strong></p>
                <p>IBAN: <strong>PK80ALFH551099012291</strong></p>
                <p className="pt-1.5 text-primary font-bold">Please email your wire slip screen capture to billing@pahraan.com with your Order ID reference.</p>
              </div>
            )}
          </div>

          {/* Section 6: Notes */}
          <div className="rounded-3xl border border-border bg-white p-6 shadow-soft space-y-3">
            <h3 className="font-display text-base font-bold">6. Order Notes</h3>
            <textarea
              placeholder="Delivery instructions (e.g. Leave package with gatekeeper, deliver after 2pm)"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-xs outline-none focus:border-primary transition"
            />
          </div>
        </div>

        {/* ORDER SUMMARY PANEL */}
        <div>
          <div className="rounded-3xl border border-border bg-white p-6 shadow-soft space-y-5 sticky top-20">
            <h3 className="font-display text-lg font-bold border-b border-border/40 pb-2">Order Summary</h3>

            {/* Cart items review */}
            <div className="divide-y divide-border/40 max-h-56 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3 py-3 items-center">
                  <div className="h-14 w-11 overflow-hidden rounded-lg bg-muted border border-border shrink-0">
                    <img src={resolveImage(item.product.images[0])} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="font-semibold text-xs text-foreground truncate">{item.product.title}</h5>
                    <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">
                      {item.size} / {item.color} · Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-foreground shrink-0">
                    PKR {(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Checkout Pricing breakdown */}
            <div className="space-y-2 text-xs text-muted-foreground border-t border-border/40 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">PKR {cartSubtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>- PKR {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping ({deliveryMethod.replace("_", " ")})</span>
                <span className="font-semibold text-foreground">
                  {shippingCost === 0 ? "FREE" : `PKR ${shippingCost}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sales Tax (5% GST)</span>
                <span className="font-semibold text-foreground">PKR {taxCost.toLocaleString()}</span>
              </div>

              {giftNote && (
                <div className="border border-dashed border-[#F8BBD0] bg-[#FFF9FB] rounded-xl p-3 text-[10px] text-primary mt-2">
                  <strong>Gift Note:</strong> "{giftNote}"
                </div>
              )}

              <div className="flex justify-between text-base font-bold text-foreground border-t border-border/40 pt-4.5">
                <span className="font-display">Total</span>
                <span className="text-primary font-display">PKR {finalTotal.toLocaleString()}</span>
              </div>
            </div>

            <Button
              onClick={() => placeOrderMutation.mutate()}
              disabled={placeOrderMutation.isPending}
              className="w-full bg-primary hover:bg-accent text-white rounded-full py-6 font-semibold shadow-soft hover:shadow-elegant flex items-center justify-center gap-1.5 cursor-pointer text-xs"
            >
              {placeOrderMutation.isPending ? "Processing Security Check..." : "Place Order (Secure)"}
            </Button>

            <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground font-semibold text-center mt-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Secure 256-bit SSL encrypted checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
