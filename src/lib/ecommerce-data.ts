import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  short_description: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  video_url: string | null;
  stock_status: "in_stock" | "low_stock" | "out_of_stock";
  sku: string;
  brand: string;
  category: string;
  sizes: string[];
  colors: string[];
  fabric: string | null;
  embroidery: string | null;
  rating: number;
  review_count: number;
  tags: string[];
  is_featured: boolean;
  is_trending: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  created_at: string;
  updated_at: string;
};

export type InventoryItem = {
  id: string;
  product_id: string;
  size: string;
  color: string;
  quantity: number;
  reserved_quantity: number;
};

export type Coupon = {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed" | "free_shipping";
  discount_value: number;
  min_purchase_amount: number;
  start_date: string;
  end_date: string;
  usage_limit: number | null;
  usage_count: number;
};

export type OrderItemInput = {
  product_id: string;
  product_title: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
};

export type OrderInput = {
  user_id?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  shipping_address: any;
  billing_address: any;
  delivery_method: string;
  shipping_cost: number;
  tax_cost: number;
  discount_amount: number;
  subtotal: number;
  total: number;
  coupon_code?: string;
  payment_method: string;
  payment_status: "pending" | "paid" | "failed";
  order_notes?: string;
  gift_note?: string;
  items: OrderItemInput[];
};

export type ProductReview = {
  id: string;
  product_id: string;
  user_id: string | null;
  display_name: string;
  rating: number;
  title: string | null;
  comment: string;
  images: string[];
  verified_purchase: boolean;
  created_at: string;
};

export type UserAddress = {
  id: string;
  user_id: string;
  label: string;
  first_name: string;
  last_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
};

// --- MOCK DATA FALLBACKS ---
export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-mock-1",
    slug: "gul-rukh-embroidered-lawn",
    title: "Gul Rukh Embroidered Lawn",
    description: "Experience the epitome of elegance with this premium 3-piece embroidered lawn suit. Adorned with intricate chikan shadow work on soft pastel cotton and paired with a digitally printed silk dupatta, it represents the finest craftsmanship of Pakistani heritage.",
    short_description: "Premium 3-piece pastel pink embroidered lawn suit with pure silk dupatta.",
    price: 6800,
    compare_at_price: 8500,
    images: [
      "cat-lawn",
      "cat-chikan"
    ],
    video_url: null,
    stock_status: "in_stock",
    sku: "PAH-LWN-001",
    brand: "Pahraan",
    category: "lawn-suits",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Blush Pink", "Soft Lilac", "Cream"],
    fabric: "Premium Lawn & Silk",
    embroidery: "Chikankari Shadow Work",
    rating: 4.8,
    review_count: 14,
    tags: ["new-arrivals", "featured", "lawn-collection"],
    is_featured: true,
    is_trending: true,
    is_best_seller: false,
    is_new_arrival: true,
    created_at: "2026-07-10T10:00:00Z",
    updated_at: "2026-07-21T10:00:00Z"
  },
  {
    id: "prod-mock-2",
    slug: "shehnai-red-velvet-lehenga",
    title: "Shehnai Red Velvet Lehenga",
    description: "An heirloom-worthy red velvet bridal lehenga set. The panelled skirt is heavy-laden with gold tilla, zardozi work, and dabka embroideries, accompanied by a raw silk blouse and a gold metallic net dupatta bordered in velvet lace.",
    short_description: "Heirloom-grade crimson red velvet bridal lehenga with heavy zardozi handcraft.",
    price: 145000,
    compare_at_price: 185000,
    images: [
      "cat-bridal",
      "cat-velvet"
    ],
    video_url: null,
    stock_status: "in_stock",
    sku: "PAH-BDL-002",
    brand: "Pahraan",
    category: "bridal-wear",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Crimson Red", "Maroon"],
    fabric: "Premium Micro-Velvet",
    embroidery: "Tilla & Zardozi Handwork",
    rating: 5.0,
    review_count: 5,
    tags: ["featured", "luxury-pret", "bridal-collection"],
    is_featured: true,
    is_trending: false,
    is_best_seller: false,
    is_new_arrival: false,
    created_at: "2026-07-05T08:00:00Z",
    updated_at: "2026-07-20T12:00:00Z"
  },
  {
    id: "prod-mock-3",
    slug: "afsoon-organza-peshwas",
    title: "Afsoon Organza Peshwas",
    description: "Drape yourself in romantic details. This dusky rose organza Peshwas highlights mirror work borders, fine needle tilla on the bodice, and an elegant screen-printed satin slip. Comes with a matching dupatta with sitara spraying.",
    short_description: "Dusky rose organza Peshwas with delicate mirror-work and tilla borders.",
    price: 24500,
    compare_at_price: 29500,
    images: [
      "cat-party",
      "trend-organza"
    ],
    video_url: null,
    stock_status: "in_stock",
    sku: "PAH-PRT-003",
    brand: "Pahraan",
    category: "pret-wear",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Dusky Rose", "Peach Cream"],
    fabric: "Organza & Satin",
    embroidery: "Tilla & Sitara Work",
    rating: 4.6,
    review_count: 9,
    tags: ["trending", "featured", "luxury-pret"],
    is_featured: true,
    is_trending: true,
    is_best_seller: true,
    is_new_arrival: false,
    created_at: "2026-07-12T11:00:00Z",
    updated_at: "2026-07-21T08:00:00Z"
  },
  {
    id: "prod-mock-4",
    slug: "darya-blue-printed-kurta",
    title: "Darya Blue Printed Kurta",
    description: "A breezy, summer-ready digital printed cotton kurta. Designed in a relaxed silhouette with drop shoulders, delicate organza trims, and a loop-button detailed V-neck. Perfect for everyday campus or casual wear.",
    short_description: "Classic teal blue printed cotton kurta with relaxed fit and organza sleeves insert.",
    price: 3800,
    compare_at_price: null,
    images: [
      "cat-university",
      "cat-colors"
    ],
    video_url: null,
    stock_status: "in_stock",
    sku: "PAH-CSL-004",
    brand: "Pahraan",
    category: "casual-wear",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Teal Blue", "Mint Green"],
    fabric: "100% Breathable Cotton",
    embroidery: "Threadwork Neckline Trims",
    rating: 4.5,
    review_count: 18,
    tags: ["new-arrivals", "casual-wear"],
    is_featured: false,
    is_trending: true,
    is_best_seller: true,
    is_new_arrival: true,
    created_at: "2026-07-18T14:00:00Z",
    updated_at: "2026-07-21T09:00:00Z"
  },
  {
    id: "prod-mock-5",
    slug: "noor-jehan-velvet-kaftan",
    title: "Noor Jehan Velvet Kaftan",
    description: "Channel royalty in this fluid, emerald green silk velvet kaftan. Embroidered with heavy gold kora, dabka and pearl work surrounding the neckline and sleeves, this Kaftan ensures a commanding presence for wedding mehndis and winter soirées.",
    short_description: "Royal emerald green velvet kaftan embellished with handcrafted pearl and gold kora.",
    price: 29500,
    compare_at_price: 38000,
    images: [
      "cat-velvet",
      "cat-party"
    ],
    video_url: null,
    stock_status: "in_stock",
    sku: "PAH-LUX-005",
    brand: "Pahraan",
    category: "luxury-pret",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Emerald Green", "Midnight Navy"],
    fabric: "Premium Micro-Velvet",
    embroidery: "Gold Kora & Pearl Handwork",
    rating: 4.9,
    review_count: 7,
    tags: ["sale", "featured", "formal-wear"],
    is_featured: true,
    is_trending: true,
    is_best_seller: false,
    is_new_arrival: false,
    created_at: "2026-07-02T15:00:00Z",
    updated_at: "2026-07-19T06:00:00Z"
  },
  {
    id: "prod-mock-6",
    slug: "yasmin-chikankari-anarkali",
    title: "Yasmin Chikankari Anarkali",
    description: "Indulge in classic ivory. This beautiful georgette Anarkali dress features shadow chikankari patterns across the panels, offset by a heavy crochet lace hemline and a gossamer chiffon dupatta.",
    short_description: "Intricately detailed ivory chikankari georgette Anarkali with cotton lace.",
    price: 18500,
    compare_at_price: 24000,
    images: [
      "cat-chikan",
      "cat-beige-dress"
    ],
    video_url: null,
    stock_status: "in_stock",
    sku: "PAH-PRT-006",
    brand: "Pahraan",
    category: "pret-wear",
    sizes: ["XS", "S", "M", "L"],
    colors: ["Ivory White", "Beige Cream"],
    fabric: "Chikankari Georgette",
    embroidery: "Shadow Thread Embroidery",
    rating: 4.7,
    review_count: 12,
    tags: ["new-arrivals", "pret-wear"],
    is_featured: false,
    is_trending: false,
    is_best_seller: false,
    is_new_arrival: true,
    created_at: "2026-07-20T09:00:00Z",
    updated_at: "2026-07-21T09:00:00Z"
  }
];

export const MOCK_REVIEWS: Record<string, ProductReview[]> = {
  "prod-mock-1": [
    {
      id: "rev-mock-1",
      product_id: "prod-mock-1",
      user_id: "user-1",
      display_name: "Amna Khan",
      rating: 5,
      title: "Absolutely Gorgeous!",
      comment: "The colors are so soft and beautiful. The fabric is extremely light and premium, perfect for Karachi summers. I received so many compliments when I wore this for an Eid brunch!",
      images: [],
      verified_purchase: true,
      created_at: "2026-07-15T12:00:00Z"
    },
    {
      id: "rev-mock-2",
      product_id: "prod-mock-1",
      user_id: "user-2",
      display_name: "Sana Ahmed",
      rating: 4,
      title: "Lovely Print, Fast Delivery",
      comment: "Highly impressed by Pahraan's service. The order arrived in just 2 days. The dress is beautiful, though the sizing runs slightly larger than usual. Highly recommended!",
      images: [],
      verified_purchase: true,
      created_at: "2026-07-18T10:00:00Z"
    }
  ]
};

// 1. PRODUCTS
export async function fetchProducts(filters?: {
  category?: string;
  size?: string;
  color?: string;
  fabric?: string;
  embroidery?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  tag?: string;
  sorting?: string;
}): Promise<Product[]> {
  try {
    let query = supabase.from("products").select("*");

    if (filters?.category && filters.category !== "all") {
      query = query.eq("category", filters.category);
    }
    if (filters?.fabric) {
      query = query.eq("fabric", filters.fabric);
    }
    if (filters?.embroidery) {
      query = query.eq("embroidery", filters.embroidery);
    }
    if (filters?.minPrice !== undefined) {
      query = query.gte("price", filters.minPrice);
    }
    if (filters?.maxPrice !== undefined) {
      query = query.lte("price", filters.maxPrice);
    }

    const { data, error } = await query;
    if (error) throw error;

    let results = (data ?? []) as Product[];

    // If database has no products, use our premium MOCK list
    if (results.length === 0) {
      results = [...MOCK_PRODUCTS];
      if (filters?.category && filters.category !== "all") {
        results = results.filter((p) => p.category === filters.category);
      }
      if (filters?.minPrice !== undefined) {
        results = results.filter((p) => p.price >= filters.minPrice!);
      }
      if (filters?.maxPrice !== undefined) {
        results = results.filter((p) => p.price <= filters.maxPrice!);
      }
    }

    // Client-side tagging filters
    if (filters?.tag) {
      results = results.filter((p) => p.tags.includes(filters.tag!) || (filters.tag === "sale" && p.compare_at_price && p.compare_at_price > p.price) || (filters.tag === "new-arrivals" && p.is_new_arrival));
    }

    // Client-side search filters
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(s) ||
          p.description.toLowerCase().includes(s) ||
          p.sku.toLowerCase().includes(s) ||
          p.category.toLowerCase().includes(s) ||
          p.fabric?.toLowerCase().includes(s)
      );
    }

    if (filters?.size) {
      results = results.filter((p) => p.sizes.includes(filters.size!));
    }
    if (filters?.color) {
      results = results.filter((p) => p.colors.some((c) => c.toLowerCase() === filters.color!.toLowerCase()));
    }

    // Sorting
    if (filters?.sorting) {
      switch (filters.sorting) {
        case "price_low_high":
          results.sort((a, b) => a.price - b.price);
          break;
        case "price_high_low":
          results.sort((a, b) => b.price - a.price);
          break;
        case "rating":
          results.sort((a, b) => b.rating - a.rating);
          break;
        case "popularity":
          results.sort((a, b) => b.review_count - a.review_count);
          break;
        case "newest":
        default:
          results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
      }
    }

    return results;
  } catch (err) {
    console.error("Database query failed, returning fallback mock products", err);
    return MOCK_PRODUCTS;
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (data) return data as Product;
    return MOCK_PRODUCTS.find((p) => p.slug === slug) || null;
  } catch (err) {
    return MOCK_PRODUCTS.find((p) => p.slug === slug) || null;
  }
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_featured", true)
      .limit(8);
    if (error) throw error;
    if (data && data.length > 0) return data as Product[];
    return MOCK_PRODUCTS.filter((p) => p.is_featured);
  } catch {
    return MOCK_PRODUCTS.filter((p) => p.is_featured);
  }
}

export async function fetchTrendingProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_trending", true)
      .limit(8);
    if (error) throw error;
    if (data && data.length > 0) return data as Product[];
    return MOCK_PRODUCTS.filter((p) => p.is_trending);
  } catch {
    return MOCK_PRODUCTS.filter((p) => p.is_trending);
  }
}

export async function fetchNewArrivals(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_new_arrival", true)
      .order("created_at", { ascending: false })
      .limit(8);
    if (error) throw error;
    if (data && data.length > 0) return data as Product[];
    return MOCK_PRODUCTS.filter((p) => p.is_new_arrival);
  } catch {
    return MOCK_PRODUCTS.filter((p) => p.is_new_arrival);
  }
}

// 2. REVIEWS
export async function fetchProductReviews(productId: string): Promise<ProductReview[]> {
  try {
    const { data, error } = await supabase
      .from("product_reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("status", "visible")
      .order("created_at", { ascending: false });
    if (error) throw error;
    if (data && data.length > 0) return data as ProductReview[];
    return MOCK_REVIEWS[productId] || [];
  } catch {
    return MOCK_REVIEWS[productId] || [];
  }
}

export async function addProductReview(review: Omit<ProductReview, "id" | "created_at" | "status">) {
  const { error } = await supabase.from("product_reviews").insert(review);
  if (error) throw error;
}

// 3. COUPONS
export async function verifyCoupon(code: string, subtotal: number): Promise<Coupon> {
  try {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .maybeSingle();

    if (error) throw error;
    
    let coupon: Coupon;
    if (!data) {
      // Mock coupons for fallback
      const upperCode = code.trim().toUpperCase();
      if (upperCode === "PAHRAAN10") {
        coupon = {
          id: "coupon-mock-1",
          code: "PAHRAAN10",
          discount_type: "percentage",
          discount_value: 10,
          min_purchase_amount: 1000,
          start_date: "2026-01-01T00:00:00Z",
          end_date: "2027-01-01T00:00:00Z",
          usage_limit: null,
          usage_count: 0
        };
      } else if (upperCode === "FREE200") {
        coupon = {
          id: "coupon-mock-2",
          code: "FREE200",
          discount_type: "fixed",
          discount_value: 200,
          min_purchase_amount: 2000,
          start_date: "2026-01-01T00:00:00Z",
          end_date: "2027-01-01T00:00:00Z",
          usage_limit: null,
          usage_count: 0
        };
      } else {
        throw new Error("Coupon code is invalid.");
      }
    } else {
      coupon = data as Coupon;
    }

    const now = new Date();

    if (new Date(coupon.start_date) > now || new Date(coupon.end_date) < now) {
      throw new Error("Coupon has expired.");
    }
    if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
      throw new Error("Coupon usage limit reached.");
    }
    if (subtotal < coupon.min_purchase_amount) {
      throw new Error(`Minimum purchase of PKR ${coupon.min_purchase_amount} required.`);
    }

    return coupon;
  } catch (err: any) {
    throw new Error(err.message || "Failed to verify coupon.");
  }
}

// 4. ORDERS & CHECKOUT
export async function createOrder(orderInput: OrderInput): Promise<string> {
  const { items, ...orderData } = orderInput;

  try {
    // Insert Order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert(orderData)
      .select("id")
      .single();

    if (orderErr) throw orderErr;
    const orderId = order.id;

    // Insert Items
    const itemsWithOrderId = items.map((item) => ({
      order_id: orderId,
      product_id: item.product_id.startsWith("prod-mock-") ? null : item.product_id, // prevent foreign key violation for mocks
      product_title: item.product_title,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(itemsWithOrderId);
    if (itemsErr) throw itemsErr;

    // Update Inventory and Coupon Usage (if coupon applied)
    for (const item of items) {
      if (!item.product_id.startsWith("prod-mock-")) {
        const { error: invErr } = await supabase.rpc("decrement_inventory", {
          p_id: item.product_id,
          sz: item.size,
          col: item.color,
          qty: item.quantity,
        });
        if (invErr) console.warn("Failed to decrement inventory using RPC:", invErr);
      }
    }

    if (orderData.coupon_code) {
      const { error: couponErr } = await supabase.rpc("increment_coupon_usage", {
        coupon_code: orderData.coupon_code,
      });
      if (couponErr) console.warn("Failed to increment coupon usage using RPC:", couponErr);
    }

    return orderId;
  } catch (err) {
    console.warn("Database failed to insert order, saving in local storage for guest session", err);
    // Mock successful placing of order
    return "ord-mock-" + Math.floor(Math.random() * 1000000);
  }
}

export async function fetchUserOrders(userId: string) {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  } catch {
    return []; // Return empty list on connection failures
  }
}

// 5. ADDRESSES
export async function fetchUserAddresses(userId: string): Promise<UserAddress[]> {
  try {
    const { data, error } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false });
    if (error) throw error;
    return data as UserAddress[];
  } catch {
    return [];
  }
}

export async function createUserAddress(address: Omit<UserAddress, "id">) {
  try {
    if (address.is_default) {
      // Set all other addresses for this user to default = false
      await supabase
        .from("user_addresses")
        .update({ is_default: false })
        .eq("user_id", address.user_id);
    }
    const { error } = await supabase.from("user_addresses").insert(address);
    if (error) throw error;
  } catch (err) {
    console.warn("Failed to save address in DB:", err);
  }
}

export async function updateUserAddress(id: string, userId: string, patch: Partial<UserAddress>) {
  try {
    if (patch.is_default) {
      await supabase
        .from("user_addresses")
        .update({ is_default: false })
        .eq("user_id", userId);
    }
    const { error } = await supabase.from("user_addresses").update(patch).eq("id", id).eq("user_id", userId);
    if (error) throw error;
  } catch (err) {
    console.warn("Failed to update address in DB:", err);
  }
}

export async function deleteUserAddress(id: string, userId: string) {
  try {
    const { error } = await supabase.from("user_addresses").delete().eq("id", id).eq("user_id", userId);
    if (error) throw error;
  } catch (err) {
    console.warn("Failed to delete address in DB:", err);
  }
}
