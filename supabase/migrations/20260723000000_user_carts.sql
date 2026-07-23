-- Persistent shopping carts for authenticated users (cross-device sync)

CREATE TABLE IF NOT EXISTS public.user_carts (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    cart_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    saved_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    coupon_code TEXT,
    gift_note TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own cart" ON public.user_carts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own cart" ON public.user_carts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own cart" ON public.user_carts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own cart" ON public.user_carts
    FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_user_carts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_carts_updated_at ON public.user_carts;
CREATE TRIGGER user_carts_updated_at
  BEFORE UPDATE ON public.user_carts
  FOR EACH ROW EXECUTE FUNCTION public.touch_user_carts_updated_at();
