import { supabase } from "@/integrations/supabase/client";

export type AdminTrend = {
  id: string;
  slug: string;
  title: string;
  category_slug: string;
  image_key: string;
  gallery_keys: string[];
  excerpt: string;
  content: string[];
  tips: string[];
  tags: string[];
  views_seed: number;
  likes_seed: number;
  published: boolean;
  published_at: string | null;
  updated_at: string;
};

export type AdminPost = {
  id: string;
  slug: string;
  title: string;
  category: string;
  image_key: string;
  excerpt: string;
  content: string[];
  read_minutes: number;
  published: boolean;
  published_at: string | null;
  updated_at: string;
};

function arr(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

export async function fetchAdminTrends(): Promise<AdminTrend[]> {
  const { data, error } = await supabase
    .from("trends")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    category_slug: r.category_slug,
    image_key: r.image_key,
    gallery_keys: arr(r.gallery_keys),
    excerpt: r.excerpt,
    content: arr(r.content),
    tips: arr(r.tips),
    tags: r.tags ?? [],
    views_seed: r.views_seed ?? 0,
    likes_seed: r.likes_seed ?? 0,
    published: r.published,
    published_at: r.published_at,
    updated_at: r.updated_at,
  }));
}

export type TrendInput = Omit<AdminTrend, "id" | "updated_at">;
export async function upsertTrend(input: TrendInput & { id?: string }) {
  const payload = {
    slug: input.slug,
    title: input.title,
    category_slug: input.category_slug,
    image_key: input.image_key,
    gallery_keys: input.gallery_keys,
    excerpt: input.excerpt,
    content: input.content,
    tips: input.tips,
    tags: input.tags,
    views_seed: input.views_seed,
    likes_seed: input.likes_seed,
    published: input.published,
    published_at: input.published_at,
  };
  if (input.id) {
    const { error } = await supabase.from("trends").update(payload).eq("id", input.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("trends").insert(payload);
    if (error) throw error;
  }
}

export async function deleteTrend(id: string) {
  const { error } = await supabase.from("trends").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchAdminPosts(): Promise<AdminPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    category: r.category,
    image_key: r.image_key,
    excerpt: r.excerpt,
    content: arr(r.content),
    read_minutes: r.read_minutes ?? 5,
    published: r.published,
    published_at: r.published_at,
    updated_at: r.updated_at,
  }));
}

export type PostInput = Omit<AdminPost, "id" | "updated_at">;
export async function upsertPost(input: PostInput & { id?: string }) {
  const payload = {
    slug: input.slug,
    title: input.title,
    category: input.category,
    image_key: input.image_key,
    excerpt: input.excerpt,
    content: input.content,
    read_minutes: input.read_minutes,
    published: input.published,
    published_at: input.published_at,
  };
  if (input.id) {
    const { error } = await supabase.from("blog_posts").update(payload).eq("id", input.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("blog_posts").insert(payload);
    if (error) throw error;
  }
}

export async function deletePost(id: string) {
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchNewsletterSubscribers() {
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id,email,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function deleteSubscriber(id: string) {
  const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchContactMessages() {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id,name,email,subject,message,handled,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function markMessageHandled(id: string, handled: boolean) {
  const { error } = await supabase.from("contact_messages").update({ handled }).eq("id", id);
  if (error) throw error;
}

export async function deleteMessage(id: string) {
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchAdminOverview() {
  try {
    const [
      trends,
      posts,
      subs,
      msgs,
      likes,
      favs,
      comments,
      users,
      orders,
      products,
      orderRows,
      inventoryRows,
    ] = await Promise.all([
      supabase.from("trends").select("id", { count: "exact", head: true }),
      supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
      supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("handled", false),
      supabase.from("trend_likes").select("id", { count: "exact", head: true }),
      supabase.from("favorites").select("id", { count: "exact", head: true }),
      supabase.from("comments").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id, total, status, created_at, email, first_name, last_name"),
      supabase.from("inventory").select("id, quantity, reserved_quantity, products(title, sku)"),
    ]);

    const allOrders = (orderRows.data ?? []) as {
      id: string;
      total: number;
      status: string;
      created_at: string;
      email: string;
      first_name: string;
      last_name: string;
    }[];
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const paidLike = allOrders.filter((o) =>
      ["pending", "processing", "shipped", "delivered", "confirmed", "packed"].includes(o.status),
    );
    const totalRevenue = paidLike.reduce((s, o) => s + Number(o.total || 0), 0);
    const todaySales = paidLike
      .filter((o) => o.created_at >= startOfDay)
      .reduce((s, o) => s + Number(o.total || 0), 0);
    const monthlySales = paidLike
      .filter((o) => o.created_at >= startOfMonth)
      .reduce((s, o) => s + Number(o.total || 0), 0);
    const pendingOrders = allOrders.filter((o) =>
      ["pending", "processing", "confirmed", "packed"].includes(o.status),
    ).length;
    const returnedOrders = allOrders.filter((o) =>
      ["returned", "refunded"].includes(o.status),
    ).length;
    const inv = inventoryRows.data ?? [];
    const lowStock = inv.filter(
      (i: any) => Number(i.quantity) > 0 && Number(i.quantity) <= 5,
    ).length;
    const outOfStock = inv.filter((i: any) => Number(i.quantity) <= 0).length;
    const conversionRate =
      (users.count ?? 0) > 0
        ? Math.round(((orders.count ?? 0) / (users.count ?? 1)) * 1000) / 10
        : 0;

    const last7: { label: string; sales: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayOrders = paidLike.filter((o) => o.created_at.slice(0, 10) === key);
      last7.push({
        label: d.toLocaleDateString(undefined, { weekday: "short" }),
        sales: dayOrders.reduce((s, o) => s + Number(o.total || 0), 0),
        orders: dayOrders.length,
      });
    }

    return {
      trends: trends.count ?? 0,
      posts: posts.count ?? 0,
      subscribers: subs.count ?? 0,
      openMessages: msgs.count ?? 0,
      likes: likes.count ?? 0,
      favorites: favs.count ?? 0,
      comments: comments.count ?? 0,
      users: users.count ?? 0,
      orders: orders.count ?? 0,
      products: products.count ?? 0,
      totalRevenue,
      todaySales,
      monthlySales,
      pendingOrders,
      returnedOrders,
      lowStock,
      outOfStock,
      conversionRate,
      salesSeries: last7,
      recentOrders: [...allOrders]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 8),
      lowStockItems: inv
        .filter((i: any) => Number(i.quantity) <= 5)
        .slice(0, 8)
        .map((i: any) => ({
          id: i.id,
          title: i.products?.title || "Product",
          sku: i.products?.sku || "—",
          quantity: i.quantity,
          reserved: i.reserved_quantity ?? 0,
        })),
    };
  } catch {
    return {
      trends: 0,
      posts: 0,
      subscribers: 0,
      openMessages: 0,
      likes: 0,
      favorites: 0,
      comments: 0,
      users: 0,
      orders: 0,
      products: 0,
      totalRevenue: 0,
      todaySales: 0,
      monthlySales: 0,
      pendingOrders: 0,
      returnedOrders: 0,
      lowStock: 0,
      outOfStock: 0,
      conversionRate: 0,
      salesSeries: [],
      recentOrders: [],
      lowStockItems: [],
    };
  }
}

export type AdminUser = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  role: "admin" | "user";
};

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const { data: profiles, error: pError } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, bio, created_at")
    .order("created_at", { ascending: false });
  if (pError) throw pError;

  const { data: roles, error: rError } = await supabase.from("user_roles").select("user_id, role");

  if (rError) {
    console.warn("Could not fetch user roles, RLS policies might not be updated yet:", rError);
  }

  const roleMap = new Map((roles ?? []).map((r) => [r.user_id, r.role]));
  return (profiles ?? []).map((p) => ({
    id: p.id,
    display_name: p.display_name,
    avatar_url: p.avatar_url,
    bio: p.bio,
    created_at: p.created_at,
    role: (roleMap.get(p.id) as "admin" | "user") || "user",
  }));
}

export async function updateUserRole(userId: string, role: "admin" | "user") {
  if (role === "admin") {
    const { error } = await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", "admin");
    if (error) throw error;
  }
}

// --- E-COMMERCE ADMIN FUNCTIONS ---

// 1. PRODUCTS
export async function fetchAdminProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function upsertProduct(product: any) {
  const { id, ...payload } = product;
  if (id) {
    const { error } = await supabase.from("products").update(payload).eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("products").insert(payload);
    if (error) throw error;
  }
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

// 2. ORDERS
export async function fetchAdminOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  trackingNumber?: string,
  internalNotes?: string,
) {
  const payload: any = { status };
  if (trackingNumber !== undefined) payload.tracking_number = trackingNumber;
  if (internalNotes !== undefined) payload.order_notes = internalNotes;
  const { error } = await supabase.from("orders").update(payload).eq("id", orderId);
  if (error) throw error;
}

// 3. INVENTORY
export async function fetchAdminInventory() {
  const { data, error } = await supabase
    .from("inventory")
    .select("*, products(title, sku)")
    .order("quantity", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function updateInventoryQty(id: string, quantity: number) {
  const { error } = await supabase.from("inventory").update({ quantity }).eq("id", id);
  if (error) throw error;
}

// 4. COUPONS
export async function fetchAdminCoupons() {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function upsertCoupon(coupon: any) {
  const { id, ...payload } = coupon;
  payload.code = payload.code.trim().toUpperCase();
  if (id) {
    const { error } = await supabase.from("coupons").update(payload).eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("coupons").insert(payload);
    if (error) throw error;
  }
}

export async function deleteCoupon(id: string) {
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) throw error;
}

// 5. REVIEWS
export async function fetchAdminReviews() {
  const { data, error } = await supabase
    .from("product_reviews")
    .select("*, products(title, sku)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateReviewStatus(id: string, status: "visible" | "hidden") {
  const { error } = await supabase.from("product_reviews").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteReview(id: string) {
  const { error } = await supabase.from("product_reviews").delete().eq("id", id);
  if (error) throw error;
}
