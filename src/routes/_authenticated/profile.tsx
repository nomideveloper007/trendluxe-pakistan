import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { LogOut, Shield, Heart, Bookmark, User, PenTool, Sparkles, Plus, Image, Truck, MapPin, Key, Trash2, Edit3, Printer, CheckCircle, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fetchFavorites, fetchProfile, updateProfile } from "@/lib/user-data";
import { fetchTrendsBySlugs } from "@/lib/trends-data";
import { fetchPostsBySlugs } from "@/lib/blog-data";
import { bootstrapAdmin } from "@/lib/admin.functions";
import { SITE } from "@/lib/content";
import { TrendCard } from "@/components/TrendCard";
import { BlogCard } from "@/components/BlogCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { fetchUserOrders, fetchUserAddresses, createUserAddress, deleteUserAddress, type UserAddress } from "@/lib/ecommerce-data";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: `Your Profile — ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilePage,
});

const avatarTemplates = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
];

function ProfilePage() {
  const { user, isAdmin, refreshAdmin } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const bootstrap = useServerFn(bootstrapAdmin);

  // Queries
  const profileQ = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => (user ? fetchProfile(user.id) : Promise.resolve(null)),
    enabled: !!user,
  });

  const favQ = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: () => (user ? fetchFavorites(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const ordersQ = useQuery({
    queryKey: ["user-orders", user?.id],
    queryFn: () => (user ? fetchUserOrders(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const addressesQ = useQuery({
    queryKey: ["user-addresses", user?.id],
    queryFn: () => (user ? fetchUserAddresses(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const trendSlugs = (favQ.data ?? []).filter((f) => f.item_type === "trend").map((f) => f.item_slug);
  const postSlugs = (favQ.data ?? []).filter((f) => f.item_type === "blog").map((f) => f.item_slug);

  const savedTrendsQ = useQuery({
    queryKey: ["favorites-trends", trendSlugs],
    queryFn: () => fetchTrendsBySlugs(trendSlugs),
    enabled: trendSlugs.length > 0,
  });

  const savedPostsQ = useQuery({
    queryKey: ["favorites-posts", postSlugs],
    queryFn: () => fetchPostsBySlugs(postSlugs),
    enabled: postSlugs.length > 0,
  });

  // Profile forms
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Address dialog states
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [addrLabel, setAddrLabel] = useState("Home");
  const [addrFirst, setAddrFirst] = useState("");
  const [addrLast, setAddrLast] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrLine1, setAddrLine1] = useState("");
  const [addrLine2, setAddrLine2] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("Sindh");
  const [addrPostal, setAddrPostal] = useState("");
  const [addrDefault, setAddrDefault] = useState(false);

  useEffect(() => {
    if (profileQ.data) {
      setDisplayName(profileQ.data.display_name ?? "");
      setBio(profileQ.data.bio ?? "");
      setAvatarUrl(profileQ.data.avatar_url ?? "");
    }
  }, [profileQ.data]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      if (!user) return;
      await updateProfile(user.id, { display_name: displayName, bio, avatar_url: avatarUrl });
    },
    onSuccess: () => {
      toast.success("Profile details updated successfully");
      qc.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveAddress = useMutation({
    mutationFn: async () => {
      if (!user) return;
      if (!addrFirst || !addrLast || !addrPhone || !addrLine1 || !addrCity) {
        throw new Error("Please fill out all required fields");
      }
      await createUserAddress({
        user_id: user.id,
        label: addrLabel,
        first_name: addrFirst,
        last_name: addrLast,
        phone: addrPhone,
        address_line1: addrLine1,
        address_line2: addrLine2 || null,
        city: addrCity,
        state: addrState,
        postal_code: addrPostal,
        country: "Pakistan",
        is_default: addrDefault,
      });
    },
    onSuccess: () => {
      toast.success("Address added to your address book");
      setIsAddressOpen(false);
      qc.invalidateQueries({ queryKey: ["user-addresses", user?.id] });
      // Reset form
      setAddrFirst("");
      setAddrLast("");
      setAddrPhone("");
      setAddrLine1("");
      setAddrLine2("");
      setAddrCity("");
      setAddrPostal("");
      setAddrDefault(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteAddressMut = useMutation({
    mutationFn: async (id: string) => {
      if (!user) return;
      await deleteUserAddress(id, user.id);
    },
    onSuccess: () => {
      toast.success("Address deleted");
      qc.invalidateQueries({ queryKey: ["user-addresses", user?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast.success("Password reset request sent to your registered email! Check your inbox.");
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger password change");
    }
  };

  const claimAdmin = useMutation({
    mutationFn: async () => bootstrap(),
    onSuccess: async () => {
      toast.success("You're now the site admin ✨");
      await refreshAdmin();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function onSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
    window.location.reload();
  }

  const handlePrintInvoice = (order: any) => {
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
          <h1>PAHRAAN COUTURE</h1>
          <p>Order Date: ${new Date(order.created_at).toLocaleDateString()}</p>
          <p>Invoice reference: PAH-ORD-${order.id.slice(0, 8).toUpperCase()}</p>
          <p>Customer Details: ${order.first_name} ${order.last_name} (${order.email})</p>
          <p>Shipping To: ${order.shipping_address.address_line1}, ${order.shipping_address.city}</p>
          <table>
            <thead>
              <tr><th>Item Description</th><th>Size / Color</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              ${(order.order_items || []).map((i: any) => `
                <tr>
                  <td>${i.product_title}</td>
                  <td>${i.size} / ${i.color}</td>
                  <td>PKR ${i.price.toLocaleString()}</td>
                  <td>${i.quantity}</td>
                  <td>PKR ${(i.price * i.quantity).toLocaleString()}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div class="totals">
            <p>Subtotal: PKR ${order.subtotal.toLocaleString()}</p>
            <p>Discount: - PKR ${order.discount_amount.toLocaleString()}</p>
            <p>Shipping Cost: PKR ${order.shipping_cost.toLocaleString()}</p>
            <p>GST (5%): PKR ${order.tax_cost.toLocaleString()}</p>
            <p style="font-size: 1.2em; color: #C2185B;">Final Total Paid: PKR ${order.total.toLocaleString()}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="container-page py-10 animate-fade-in font-body text-foreground bg-background">
      {/* Profile Header Block */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-secondary/15 via-[#FFF9FB] to-primary/5 border border-border p-6 md:p-8 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="flex flex-col sm:flex-row items-center gap-5 relative">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center font-display text-2xl font-bold text-primary shadow-soft">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              (displayName || user?.email || "?")[0]?.toUpperCase()
            )}
          </div>
          <div className="text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="font-display text-2xl md:text-3xl font-bold">{displayName || "Premium Member"}</h1>
              {isAdmin ? (
                <Badge className="bg-primary text-white border-none flex items-center gap-1.5">
                  <Shield className="h-3 w-3" /> Admin Workspace
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-secondary/40 text-foreground">Member Profile</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
            {bio && <p className="text-xs text-muted-foreground/90 mt-2 max-w-md leading-relaxed">{bio}</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 items-center justify-center md:justify-end relative">
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4.5 py-2.5 text-xs font-semibold text-primary hover:bg-primary/10 transition shadow-soft cursor-pointer"
            >
              <Shield className="h-4 w-4" /> Admin dashboard
            </Link>
          )}
          <button
            onClick={onSignOut}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/10 transition shadow-soft cursor-pointer"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <Tabs defaultValue="collections" className="mt-10">
        <TabsList className="bg-secondary/10 border border-border/60 p-1 flex justify-start rounded-full max-w-xl mb-6 shadow-soft gap-1 overflow-x-auto">
          <TabsTrigger value="collections" className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold transition-all">
            <Bookmark className="h-3.5 w-3.5" /> Collections
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold transition-all">
            <Truck className="h-3.5 w-3.5" /> Order History
          </TabsTrigger>
          <TabsTrigger value="addresses" className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold transition-all">
            <MapPin className="h-3.5 w-3.5" /> Addresses
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold transition-all">
            <User className="h-3.5 w-3.5" /> Settings
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Saved Collections */}
        <TabsContent value="collections" className="space-y-10 focus-visible:outline-none">
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-2">
              <h2 className="font-display text-xl font-bold flex items-center gap-2 text-foreground">
                <Sparkles className="h-4.5 w-4.5 text-primary" /> Saved Visual Trends
              </h2>
            </div>
            {trendSlugs.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-10 bg-white border border-dashed rounded-3xl shadow-soft">No saved looks yet.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {(savedTrendsQ.data ?? []).map((t) => (
                  <TrendCard key={t.slug} trend={t} />
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-2">
              <h2 className="font-display text-xl font-bold flex items-center gap-2 text-foreground">
                <PenTool className="h-4.5 w-4.5 text-primary" /> Saved Editorial Readings
              </h2>
            </div>
            {postSlugs.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-10 bg-white border border-dashed rounded-3xl shadow-soft">No saved articles yet.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {(savedPostsQ.data ?? []).map((p) => (
                  <BlogCard key={p.slug} post={p} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab 2: Order History */}
        <TabsContent value="orders" className="focus-visible:outline-none space-y-4">
          <h2 className="font-display text-xl font-bold border-b border-border/40 pb-2 flex items-center gap-2">
            <Truck className="h-4.5 w-4.5 text-primary" /> Purchases & Shipments
          </h2>

          {ordersQ.isLoading ? (
            <p className="text-xs text-muted-foreground py-10 text-center">Loading purchase archives...</p>
          ) : (ordersQ.data ?? []).length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/80 bg-white p-8 text-center max-w-md mx-auto shadow-soft flex flex-col items-center">
              <ShoppingBag className="h-8 w-8 text-primary/60" />
              <h4 className="font-display font-semibold mt-3">No orders found</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
                You haven't placed any orders with Pahraan yet. Browse our catalogs to discover exclusive Pakistani apparel.
              </p>
              <Link
                to="/shop"
                className="mt-5 inline-flex bg-primary text-white rounded-full px-5 py-2.5 text-xs font-semibold shadow-soft hover:bg-accent"
              >
                Go to Shop
              </Link>
            </div>
          ) : (
            (ordersQ.data ?? []).map((order: any) => {
              const statusColors: Record<string, string> = {
                pending: "bg-amber-50 text-amber-700 border-amber-200",
                processing: "bg-blue-50 text-blue-700 border-blue-200",
                shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
                delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
                cancelled: "bg-rose-50 text-rose-700 border-rose-200",
              };

              return (
                <div key={order.id} className="bg-white border border-border/60 rounded-3xl p-5 shadow-soft hover:border-primary/10 transition">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-3 mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Order ID</p>
                      <p className="text-xs font-bold text-foreground mt-0.5">{order.id}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Placed On</p>
                      <p className="text-xs font-semibold text-foreground mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Amount</p>
                      <p className="text-xs font-bold text-primary mt-0.5">PKR {order.total.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <span className={`px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider ${statusColors[order.status] || "bg-gray-50 border-gray-200"}`}>
                        {order.status}
                      </span>
                      <button
                        onClick={() => handlePrintInvoice(order)}
                        className="p-1 text-muted-foreground hover:text-primary hover:bg-secondary/15 rounded-full transition cursor-pointer"
                        title="Print Invoice / Bill"
                      >
                        <Printer className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>

                  {/* Shipment Stepper progress visual */}
                  {["pending", "processing", "shipped", "delivered"].includes(order.status) && (
                    <div className="my-6 max-w-lg mx-auto">
                      <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-muted-foreground px-1 mb-2">
                        <span className={order.status === "pending" || order.status === "processing" || order.status === "shipped" || order.status === "delivered" ? "text-primary" : ""}>Ordered</span>
                        <span className={order.status === "processing" || order.status === "shipped" || order.status === "delivered" ? "text-primary" : ""}>Packed</span>
                        <span className={order.status === "shipped" || order.status === "delivered" ? "text-primary" : ""}>Shipped</span>
                        <span className={order.status === "delivered" ? "text-primary" : ""}>Delivered</span>
                      </div>
                      <div className="relative h-1 bg-border rounded-full flex items-center justify-between">
                        <div className={`absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500 ${
                          order.status === "pending"
                            ? "w-[5%]"
                            : order.status === "processing"
                              ? "w-[40%]"
                              : order.status === "shipped"
                                ? "w-[75%]"
                                : "w-[100%]"
                        }`} />
                        {["ordered", "packed", "shipped", "delivered"].map((step, idx) => {
                          const active =
                            idx === 0 ||
                            (idx === 1 && ["processing", "shipped", "delivered"].includes(order.status)) ||
                            (idx === 2 && ["shipped", "delivered"].includes(order.status)) ||
                            (idx === 3 && order.status === "delivered");
                          return (
                            <span
                              key={step}
                              className={`h-3 w-3 rounded-full border-2 transition z-10 ${
                                active ? "bg-white border-primary scale-110" : "bg-white border-border"
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Order items lists detail */}
                  <div className="divide-y divide-border/40 mt-3 bg-secondary/5 border border-border/30 rounded-2xl p-4">
                    {(order.order_items || []).map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between py-2 text-xs">
                        <div>
                          <p className="font-bold text-foreground">{item.product_title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">Size: {item.size} · Color: {item.color} · Qty: {item.quantity}</p>
                        </div>
                        <span className="font-semibold text-foreground">PKR {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {order.tracking_number && (
                    <div className="mt-3.5 bg-emerald-50 text-emerald-800 text-[10px] px-3.5 py-2.5 rounded-xl border border-emerald-100 flex items-center gap-1.5 font-bold">
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-600" /> Tracking Number: {order.tracking_number} (Courier: Leopard/TCS Express)
                    </div>
                  )}
                </div>
              );
            })
          )}
        </TabsContent>

        {/* Tab 3: Saved Address Book */}
        <TabsContent value="addresses" className="focus-visible:outline-none space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <MapPin className="h-4.5 w-4.5 text-primary" /> Delivery Address Book
            </h2>
            <Button
              onClick={() => setIsAddressOpen(true)}
              className="bg-primary hover:bg-accent text-white rounded-full text-xs font-semibold py-2 px-4 shadow-soft cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Address
            </Button>
          </div>

          {addressesQ.isLoading ? (
            <p className="text-xs text-muted-foreground py-10 text-center">Loading address directories...</p>
          ) : (addressesQ.data ?? []).length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-12 bg-white border border-dashed rounded-3xl shadow-soft">No addresses saved. Add one for rapid checkouts.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {(addressesQ.data ?? []).map((addr) => (
                <div key={addr.id} className="bg-white border border-border/60 rounded-3xl p-5 shadow-soft space-y-3 relative hover:border-primary/10 transition">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">{addr.label}</span>
                    {addr.is_default && <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full">Default</span>}
                  </div>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p className="font-semibold text-foreground">{addr.first_name} {addr.last_name}</p>
                    <p>Phone: {addr.phone}</p>
                    <p>Address: {addr.address_line1} {addr.address_line2 || ""}</p>
                    <p>City: {addr.city}, {addr.state}</p>
                  </div>
                  <div className="flex gap-2 justify-end border-t border-border/40 pt-3">
                    <button
                      onClick={() => deleteAddressMut.mutate(addr.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition cursor-pointer"
                      title="Delete Address"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 4: Edit Account settings */}
        <TabsContent value="edit" className="focus-visible:outline-none">
          <div className="max-w-2xl bg-white border border-border rounded-3xl p-6 shadow-soft space-y-6">
            <h2 className="font-display text-xl font-bold text-foreground">Update Profile Settings</h2>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 border border-border/40 bg-[#FFF9FB] p-5 rounded-2xl shadow-soft">
                <div className="h-16 w-16 overflow-hidden rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center font-display text-lg font-semibold text-primary shadow-soft shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (displayName || user?.email || "?")[0]?.toUpperCase()
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Avatar Image URL</Label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or template picker"
                    className="w-full rounded-full border border-border bg-white px-4 py-2.5 text-xs outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              {/* Avatar Templates Picker */}
              <div className="space-y-2.5">
                <Label className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1">
                  <Image className="h-3.5 w-3.5 text-primary" /> Or select a template:
                </Label>
                <div className="flex flex-wrap gap-2.5">
                  {avatarTemplates.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`h-11 w-11 rounded-full overflow-hidden border-2 transition cursor-pointer hover:scale-105 shadow-soft ${
                        avatarUrl === url ? "border-primary scale-105" : "border-transparent"
                      }`}
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Display Name</Label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your public fashion name"
                  maxLength={60}
                  className="w-full rounded-full border border-border bg-white px-5 py-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                  <Label>About Your Style (Bio)</Label>
                  <span>{bio.length}/280</span>
                </div>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Style bio details..."
                  maxLength={280}
                  rows={3}
                  className="w-full rounded-2xl border border-border bg-white px-5 py-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                />
              </div>

              <div className="border-t border-border/40 pt-4 flex justify-between items-center gap-4 flex-wrap">
                <Button
                  onClick={() => saveProfile.mutate()}
                  disabled={saveProfile.isPending}
                  className="bg-primary hover:bg-accent text-white rounded-full px-8 py-5.5 font-semibold shadow-soft cursor-pointer text-xs"
                >
                  {saveProfile.isPending ? "Syncing data..." : "Save changes"}
                </Button>

                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-bold cursor-pointer"
                >
                  <Key className="h-3.5 w-3.5" /> Request Password Change
                </button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* DIALOG FORM FOR ADDING ADDRESS */}
      <Dialog open={isAddressOpen} onOpenChange={setIsAddressOpen}>
        <DialogContent className="max-w-md rounded-3xl border border-border bg-white p-6 shadow-elegant animate-scale-in">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">Add Delivery Address</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3.5 py-2 text-xs">
            <div className="grid grid-cols-3 gap-2">
              {["Home", "Office", "Billing", "Other"].map((lbl) => (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => setAddrLabel(lbl)}
                  className={`py-1.5 rounded-xl border font-semibold transition cursor-pointer text-center ${
                    addrLabel === lbl ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-secondary/10"
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">First Name *</label>
                <input
                  type="text"
                  value={addrFirst}
                  onChange={(e) => setAddrFirst(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Last Name *</label>
                <input
                  type="text"
                  value={addrLast}
                  onChange={(e) => setAddrLast(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phone Number *</label>
              <input
                type="tel"
                placeholder="03XXXXXXXXX"
                value={addrPhone}
                onChange={(e) => setAddrPhone(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Street Address *</label>
              <input
                type="text"
                placeholder="House, street name..."
                value={addrLine1}
                onChange={(e) => setAddrLine1(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Apartment, Floor (optional)</label>
              <input
                type="text"
                value={addrLine2}
                onChange={(e) => setAddrLine2(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">City *</label>
                <input
                  type="text"
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Province *</label>
                <select
                  value={addrState}
                  onChange={(e) => setAddrState(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-2 py-2 text-xs outline-none focus:border-primary"
                >
                  <option value="Sindh">Sindh</option>
                  <option value="Punjab">Punjab</option>
                  <option value="KPK">KPK</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="Federal">Islamabad</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Postal Code</label>
                <input
                  type="text"
                  value={addrPostal}
                  onChange={(e) => setAddrPostal(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/45 pt-3.5 mt-2">
              <label htmlFor="address-default-cb" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Set as default shipping address</label>
              <input
                id="address-default-cb"
                type="checkbox"
                checked={addrDefault}
                onChange={(e) => setAddrDefault(e.target.checked)}
                className="h-4.5 w-4.5 accent-primary"
              />
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsAddressOpen(false)}
              className="rounded-full text-xs font-semibold px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={() => saveAddress.mutate()}
              disabled={saveAddress.isPending}
              className="bg-primary hover:bg-accent text-white rounded-full text-xs font-semibold px-6 cursor-pointer"
            >
              {saveAddress.isPending ? "Saving..." : "Add Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
