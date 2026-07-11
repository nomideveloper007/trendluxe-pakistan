
-- ========== ROLES ==========
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- ========== TRENDS ==========
CREATE TABLE public.trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category_slug text NOT NULL,
  image_key text NOT NULL,
  gallery_keys jsonb NOT NULL DEFAULT '[]'::jsonb,
  excerpt text NOT NULL,
  content jsonb NOT NULL DEFAULT '[]'::jsonb,
  tips jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags text[] NOT NULL DEFAULT '{}',
  views_seed int NOT NULL DEFAULT 0,
  likes_seed int NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.trends TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trends TO authenticated;
GRANT ALL ON public.trends TO service_role;
ALTER TABLE public.trends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published trends" ON public.trends FOR SELECT USING (published = true);
CREATE POLICY "Admins read all trends" ON public.trends FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert trends" ON public.trends FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update trends" ON public.trends FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete trends" ON public.trends FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trends_set_updated_at BEFORE UPDATE ON public.trends FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== BLOG POSTS ==========
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL,
  image_key text NOT NULL,
  excerpt text NOT NULL,
  content jsonb NOT NULL DEFAULT '[]'::jsonb,
  read_minutes int NOT NULL DEFAULT 5,
  published boolean NOT NULL DEFAULT true,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published posts" ON public.blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Admins read all posts" ON public.blog_posts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert posts" ON public.blog_posts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update posts" ON public.blog_posts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete posts" ON public.blog_posts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER blog_posts_set_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== NEWSLETTER ==========
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT SELECT, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone subscribes" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete subscribers" ON public.newsletter_subscribers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ========== CONTACT ==========
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  handled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone sends message" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read messages" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update messages" ON public.contact_messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete messages" ON public.contact_messages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ========== SEED TRENDS ==========
INSERT INTO public.trends (slug, title, category_slug, image_key, gallery_keys, excerpt, content, tips, tags, views_seed, likes_seed, published_at) VALUES
('sheer-organza-dupatta', 'The Sheer Organza Dupatta Renaissance', 'party-wear', 'trend-organza',
 '["trend-organza","cat-eid","cat-bridal"]'::jsonb,
 'Weightless, hand-embroidered organza is the season''s most repeated silhouette on Pakistani runways.',
 '["This year''s most-repeated silhouette on Pakistani runways is soft, translucent and heavily embroidered. Organza dupattas — cut long, wide and detailed with floral thread work — layer effortlessly over solid kurtas and pastel shararas.","Designers are pairing organza with satin slips underneath to keep the drape structured. Look for pearl edging, scallop borders and repeat motifs in tonal thread.","Style it with statement jhumkas and a low bun for a modern take on an old favourite."]'::jsonb,
 '["Match dupatta embroidery to at least one accessory (earrings or clutch).","Anchor a sheer dupatta with a heavier base — silk, raw silk or crepe.","For daytime, choose champagne, ivory or blush; for evenings pick emerald or wine."]'::jsonb,
 ARRAY['organza','dupatta','pastel','party'], 12480, 890, '2026-06-14'),
('pastel-coord-set', 'Pastel Co-ord Sets For The Modern Muse', 'party-wear', 'trend-coord',
 '["trend-coord","cat-university"]'::jsonb,
 'Matching sets in blush, mint and butter are quietly replacing the classic three-piece.',
 '["Two-piece coordinates in soft pastels have become the go-to for editorial shoots and mehndi mornings alike. The formula: flowy wide-leg pants, a fitted or draped top, and a single statement gold piece.","Look for silks, crepes and viscose blends that catch light without adding weight."]'::jsonb,
 '["Keep jewellery to one bold piece — chokers or long chandbalis.","Play with tonal layering: blush on blush, mint on cream."]'::jsonb,
 ARRAY['coord','pastel','modern'], 9860, 712, '2026-06-01'),
('bridal-red-reimagined', 'Bridal Red, Reimagined', 'bridal-wear', 'cat-bridal',
 '["cat-bridal","cat-mehndi"]'::jsonb,
 'The classic Pakistani bridal red returns with softer undertones, lighter fabrics and modern draping.',
 '["Deep crimson and rani pink dominate 2026''s bridal calendar, but the silhouette has changed: lighter velvets, floating dupattas and hand-embroidered chunky borders replace last decade''s stiff can-can lehengas.","Pair with heirloom gold or diamond polki — layered, not stacked."]'::jsonb,
 '["Balance heavy embroidery with a minimalist hair look.","Two dupattas — a lighter one on the head, richer one over the shoulder."]'::jsonb,
 ARRAY['bridal','red','couture'], 21430, 1780, '2026-05-20'),
('printed-lawn-2026', 'Printed Lawn: What To Wear This Summer', 'lawn-suits', 'cat-lawn',
 '["cat-lawn","cat-eid"]'::jsonb,
 'The 2026 lawn season leans into peach florals, mint chikankari and dusty roses.',
 '["This year''s lawn drops favour soft floral repeats over bold digital prints. Peach, mint and dusty rose lead the palette.","Cotton nets and lawn-silk blends give body without heat — perfect for Karachi and Lahore summers."]'::jsonb,
 '["Iron dupattas on the reverse to keep embroidery intact.","Style unstitched fabric as a straight-cut kurta with pants for versatility."]'::jsonb,
 ARRAY['lawn','summer','floral'], 15200, 1120, '2026-05-10'),
('modest-abaya-tailoring', 'Modern Abayas With Sculpted Tailoring', 'abayas', 'cat-abaya',
 '["cat-abaya"]'::jsonb,
 'The new abaya silhouette is architectural — sharp sleeves, subtle embroidery, quiet luxury.',
 '["The new wave of abayas favours structure over embellishment. Bell sleeves, wrap fronts and single embroidered cuffs replace all-over sequin work.","Black remains the anchor but stone, olive and charcoal are gaining runway time."]'::jsonb,
 '["Look for wool-blend crepes in cooler months.","One statement — sleeve or hemline. Never both."]'::jsonb,
 ARRAY['abaya','modest','minimal'], 6740, 502, '2026-04-28'),
('eid-pastels', 'The Eid Pastel Edit', 'eid-collections', 'cat-eid',
 '["cat-eid","cat-lawn"]'::jsonb,
 'Butter yellow, lilac and mint dominate this year''s Eid wardrobe.',
 '["Chaand raat calls for something soft, luxe and photogenic. Butter yellow with pink resham embroidery is the top request at ateliers this year."]'::jsonb,
 '["Match jewellery metal to embroidery thread — gold with gold, silver with silver.","A single-shade outfit reads more expensive than a busy print."]'::jsonb,
 ARRAY['eid','pastel','occasion'], 18300, 1410, '2026-04-01'),
('university-everyday', 'Effortless Campus Style', 'university-fashion', 'cat-university',
 '["cat-university"]'::jsonb,
 'The kurta-jeans-tote formula gets a soft-pink update.',
 '["Pastel kurtas over straight-leg jeans, a tan tote and neutral loafers — the uniform of modern university girls in Lahore, Islamabad and Karachi.","It''s the balance of ease and polish that makes it work day after day."]'::jsonb,
 '["Invest in two neutral kurtas that layer over anything.","One statement earring dresses up any outfit."]'::jsonb,
 ARRAY['campus','everyday','kurta'], 7820, 620, '2026-03-18'),
('mehndi-yellows', 'Mehndi Yellows: Bold Meets Traditional', 'mehndi-outfits', 'cat-mehndi',
 '["cat-mehndi"]'::jsonb,
 'Marigold, saffron and turmeric — the mehndi palette is at its most joyful.',
 '["Mehndi outfits this year lean into deep marigolds and saffrons, offset with pink resham and floral jewellery.","Ghararas remain the crowd favourite over shararas for the ceremony itself."]'::jsonb,
 '["Fresh floral jewellery photographs better than plastic — order the day before.","Balance a busy outfit with a slicked-back hairstyle."]'::jsonb,
 ARRAY['mehndi','yellow','festive'], 11250, 940, '2026-03-02'),
('sage-and-rose', 'Sage & Rose: The Palette Of The Season', 'color-combinations', 'cat-colors',
 '["cat-colors"]'::jsonb,
 'Sage green paired with dusty rose is 2026''s most-requested colour story.',
 '["The pairing feels heritage — think Mughal miniature paintings — while reading fresh on modern silhouettes."]'::jsonb,
 '["Use rose as the base and sage as embroidery, or vice versa.","Add antique gold, not yellow gold, for the right undertone."]'::jsonb,
 ARRAY['palette','sage','rose'], 4930, 380, '2026-02-22'),
('occasion-shararas', 'The Return Of The Sharara', 'party-wear', 'cat-party',
 '["cat-party"]'::jsonb,
 'Wide-legged, embellished and endlessly photogenic — shararas are back.',
 '["After a decade of lehengas, wide-legged shararas are the new occasion favourite. Silver zardozi on emerald and rani pink lead the charge."]'::jsonb,
 '["The waistband defines the drape — get it tailored to sit high.","A short kurti reads more contemporary than a long peplum."]'::jsonb,
 ARRAY['sharara','party','occasion'], 8940, 690, '2026-02-05'),
('bridal-second-look', 'Planning A Second Bridal Look', 'bridal-wear', 'cat-bridal',
 '["cat-bridal","cat-eid"]'::jsonb,
 'How modern Pakistani brides are styling a lighter second outfit for the reception.',
 '["A softer second look — often in blush, champagne or ivory — is now standard at Pakistani weddings.","It photographs beautifully at night and lets brides dance freely."]'::jsonb,
 '["Keep colour temperature consistent across both looks.","Repeat one jewellery piece to tie the two outfits together."]'::jsonb,
 ARRAY['bridal','reception'], 13600, 1040, '2026-01-20'),
('everyday-abaya-styling', 'Everyday Abaya Styling For Winter', 'abayas', 'cat-abaya',
 '["cat-abaya"]'::jsonb,
 'Layered scarves, boots and structured bags elevate the everyday abaya.',
 '["For winter, style abayas with a fitted turtleneck underneath, ankle boots and a structured tote. Colour-block scarves add personality."]'::jsonb,
 '["Choose one statement — scarf or bag — not both.","Boot colour should match your bag, not your abaya."]'::jsonb,
 ARRAY['abaya','winter','styling'], 5140, 410, '2026-01-08');

-- ========== SEED BLOG POSTS ==========
INSERT INTO public.blog_posts (slug, title, category, image_key, excerpt, content, read_minutes, published_at) VALUES
('capsule-wardrobe-pakistani-woman', 'Building A Capsule Wardrobe: The Pakistani Edit', 'styling-guides', 'blog-editorial',
 'Ten pieces that carry a Pakistani woman through every season, occasion and city.',
 '["A well-built capsule wardrobe doesn''t chase trends — it anchors your style. Start with two neutral kurtas, one white and one beige.","Add a black abaya, a pair of straight-leg trousers, and one statement dupatta.","For occasions, invest in a single silk sharara set that can be re-styled endlessly."]'::jsonb,
 6, '2026-06-20'),
('how-to-drape-dupatta', '5 Ways To Drape A Dupatta This Year', 'how-to', 'trend-organza',
 'From the classic double-shoulder to the modern belted drape — a step-by-step guide.',
 '["The dupatta drape can transform an outfit more than the outfit itself.","Try the belted saree-drape for parties, or the wrapped neck-drape for casual days."]'::jsonb,
 4, '2026-06-05'),
('wedding-guest-outfits', 'The Wedding Guest Playbook', 'occasion', 'cat-party',
 'What to wear to each function without ever upstaging the bride.',
 '["Mehndi calls for yellows and greens; barat for jewel tones; walima for pastels and metallics.","Avoid pure red or all-white as a guest — no matter how tempting."]'::jsonb,
 5, '2026-05-25'),
('sustainable-pakistani-fashion', 'The Rise Of Sustainable Pakistani Labels', 'features', 'cat-colors',
 'Small-batch designers rewriting how our clothes are made — and worn.',
 '["A quiet revolution is happening in Karachi and Lahore ateliers: natural dyes, deadstock fabrics and made-to-order production.","Buying less, better, is the most Pakistani thing you can do."]'::jsonb,
 7, '2026-05-10'),
('eid-shopping-guide', 'Your Complete Eid Shopping Timeline', 'how-to', 'cat-eid',
 'Six weeks out, three weeks out, one week out — what to buy and when.',
 '["Start six weeks before Eid: unstitched fabric first, tailoring booked next.","Three weeks out: accessories and shoes. One week: alterations."]'::jsonb,
 5, '2026-04-18'),
('mehndi-makeup-hair', 'Mehndi Hair & Makeup: The Modern Playbook', 'beauty', 'cat-mehndi',
 'Fresh florals, dewy skin and a middle-parted braid — the new mehndi beauty formula.',
 '["Modern mehndi beauty is about looking like yourself — a little brighter.","Dewy base, warm blush, soft gold eye and a nude-pink lip."]'::jsonb,
 4, '2026-04-02'),
('campus-outfit-formulas', '10 Campus Outfit Formulas That Never Fail', 'styling-guides', 'cat-university',
 'Bookmark-worthy combinations for morning classes, evening study sessions and everything in between.',
 '["Kurta + jeans + loafers is only the beginning.","Try a jumpsuit with a linen shirt tied at the waist, or a printed maxi with a denim jacket."]'::jsonb,
 5, '2026-03-14'),
('abaya-fabric-guide', 'The Abaya Fabric Guide', 'how-to', 'cat-abaya',
 'Nida, korean crepe, wool-blend — which fabric works for which season.',
 '["Nida crepe is the year-round classic.","Wool-blends work through Islamabad winters; korean crepe drapes best in Karachi humidity."]'::jsonb,
 4, '2026-02-28'),
('jewellery-heirlooms', 'Styling Your Mother''s Jewellery', 'features', 'cat-bridal',
 'Heirloom polki, gold sets and antique jhumkas — how to wear them without looking dated.',
 '["The trick to heirloom jewellery is contrast: pair antique with minimal, ornate with simple.","One statement piece per outfit — always."]'::jsonb,
 6, '2026-02-10'),
('color-story-2026', 'The Colour Story Of 2026', 'features', 'cat-colors',
 'Dusty rose, sage, terracotta and butter yellow — the year in shades.',
 '["This year is about warmth. Cool blues take a step back; earthy warms lead the palette."]'::jsonb,
 5, '2026-01-25');
