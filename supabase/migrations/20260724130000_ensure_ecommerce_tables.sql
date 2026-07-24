-- Ensure ecommerce tables exist (safe to re-run)
-- Fixes missing public.products and related tables on remote Supabase.

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    compare_at_price NUMERIC(10, 2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
    images TEXT[] NOT NULL DEFAULT '{}',
    video_url TEXT,
    stock_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'low_stock', 'out_of_stock')),
    sku TEXT UNIQUE NOT NULL,
    brand TEXT NOT NULL DEFAULT 'Pahraan',
    category TEXT NOT NULL,
    sizes TEXT[] NOT NULL DEFAULT ARRAY['XS','S','M','L','XL','XXL'],
    colors TEXT[] NOT NULL DEFAULT '{}',
    fabric TEXT,
    embroidery TEXT,
    rating NUMERIC(3, 2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,
    is_best_seller BOOLEAN DEFAULT false,
    is_new_arrival BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    reserved_quantity INTEGER NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
    UNIQUE (product_id, size, color)
);

CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value >= 0),
    min_purchase_amount NUMERIC(10, 2) DEFAULT 0 CHECK (min_purchase_amount >= 0),
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL,
    usage_limit INTEGER CHECK (usage_limit IS NULL OR usage_limit >= 0),
    usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    delivery_method TEXT NOT NULL DEFAULT 'flat_rate',
    shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
    tax_cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    coupon_code TEXT,
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    tracking_number TEXT,
    order_notes TEXT,
    gift_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_title TEXT NOT NULL,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0)
);

CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    display_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT NOT NULL,
    images TEXT[] DEFAULT '{}',
    verified_purchase BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'visible' CHECK (status IN ('visible', 'hidden')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    label TEXT NOT NULL DEFAULT 'Home',
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'Pakistan',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- Recreate policies with correct has_role(auth.uid(), 'admin')
DO $$
BEGIN
  -- products
  DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
  DROP POLICY IF EXISTS "Allow admin write access to products" ON public.products;
  CREATE POLICY "Allow public read access to products" ON public.products FOR SELECT USING (true);
  CREATE POLICY "Allow admin write access to products" ON public.products
    FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

  -- inventory
  DROP POLICY IF EXISTS "Allow public read access to inventory" ON public.inventory;
  DROP POLICY IF EXISTS "Allow admin write access to inventory" ON public.inventory;
  CREATE POLICY "Allow public read access to inventory" ON public.inventory FOR SELECT USING (true);
  CREATE POLICY "Allow admin write access to inventory" ON public.inventory
    FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

  -- coupons
  DROP POLICY IF EXISTS "Allow authenticated and anonymous to read coupons" ON public.coupons;
  DROP POLICY IF EXISTS "Allow admin write access to coupons" ON public.coupons;
  CREATE POLICY "Allow authenticated and anonymous to read coupons" ON public.coupons FOR SELECT USING (true);
  CREATE POLICY "Allow admin write access to coupons" ON public.coupons
    FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

  -- orders
  DROP POLICY IF EXISTS "Allow users to read own orders" ON public.orders;
  DROP POLICY IF EXISTS "Allow public to create orders" ON public.orders;
  DROP POLICY IF EXISTS "Allow admin write access to orders" ON public.orders;
  CREATE POLICY "Allow users to read own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id OR email = auth.email());
  CREATE POLICY "Allow public to create orders" ON public.orders FOR INSERT WITH CHECK (true);
  CREATE POLICY "Allow admin write access to orders" ON public.orders
    FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

  -- order_items
  DROP POLICY IF EXISTS "Allow users to view their own order items" ON public.order_items;
  DROP POLICY IF EXISTS "Allow public to create order items" ON public.order_items;
  DROP POLICY IF EXISTS "Allow admin write access to order items" ON public.order_items;
  CREATE POLICY "Allow users to view their own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR o.email = auth.email()))
  );
  CREATE POLICY "Allow public to create order items" ON public.order_items FOR INSERT WITH CHECK (true);
  CREATE POLICY "Allow admin write access to order items" ON public.order_items
    FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

  -- reviews
  DROP POLICY IF EXISTS "Allow public read access to visible reviews" ON public.product_reviews;
  DROP POLICY IF EXISTS "Allow authenticated users to write reviews" ON public.product_reviews;
  DROP POLICY IF EXISTS "Allow owners and admin write access to reviews" ON public.product_reviews;
  CREATE POLICY "Allow public read access to visible reviews" ON public.product_reviews
    FOR SELECT USING (status = 'visible' OR public.has_role(auth.uid(), 'admin'));
  CREATE POLICY "Allow authenticated users to write reviews" ON public.product_reviews
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  CREATE POLICY "Allow owners and admin write access to reviews" ON public.product_reviews
    FOR ALL USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
    WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

  -- addresses
  DROP POLICY IF EXISTS "Allow users to manage their own addresses" ON public.user_addresses;
  CREATE POLICY "Allow users to manage their own addresses" ON public.user_addresses
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
END $$;

-- Helpers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_addresses_updated_at ON public.user_addresses;
CREATE TRIGGER update_user_addresses_updated_at
BEFORE UPDATE ON public.user_addresses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET
    rating = COALESCE((SELECT AVG(rating)::numeric(3,2) FROM public.product_reviews WHERE product_id = NEW.product_id AND status = 'visible'), 0.00),
    review_count = (SELECT COUNT(*) FROM public.product_reviews WHERE product_id = NEW.product_id AND status = 'visible')
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_product_rating_trigger ON public.product_reviews;
CREATE TRIGGER update_product_rating_trigger
AFTER INSERT OR UPDATE ON public.product_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_product_rating();

CREATE OR REPLACE FUNCTION public.update_product_rating_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET
    rating = COALESCE((SELECT AVG(rating)::numeric(3,2) FROM public.product_reviews WHERE product_id = OLD.product_id AND status = 'visible'), 0.00),
    review_count = (SELECT COUNT(*) FROM public.product_reviews WHERE product_id = OLD.product_id AND status = 'visible')
  WHERE id = OLD.product_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_product_rating_on_delete_trigger ON public.product_reviews;
CREATE TRIGGER update_product_rating_on_delete_trigger
AFTER DELETE ON public.product_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_product_rating_on_delete();

CREATE OR REPLACE FUNCTION public.decrement_inventory(p_id UUID, sz TEXT, col TEXT, qty INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.inventory
  SET quantity = GREATEST(quantity - qty, 0)
  WHERE product_id = p_id AND size = sz AND color = col;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.coupons
  SET usage_count = usage_count + 1
  WHERE code = coupon_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_inventory(uuid, text, text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(text) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
