import heroFashion from "@/assets/hero-fashion.jpg";
import catBridal from "@/assets/cat-bridal.jpg";
import catParty from "@/assets/cat-party.jpg";
import catLawn from "@/assets/cat-lawn.jpg";
import catAbaya from "@/assets/cat-abaya.jpg";
import catEid from "@/assets/cat-eid.jpg";
import catUniversity from "@/assets/cat-university.jpg";
import catMehndi from "@/assets/cat-mehndi.jpg";
import catColors from "@/assets/cat-colors.jpg";
import trendOrganza from "@/assets/trend-organza.jpg";
import trendCoord from "@/assets/trend-coord.jpg";
import blogEditorial from "@/assets/blog-editorial.jpg";

export const SITE = {
  name: "TrendLibas",
  tagline: "Pakistani Fashion, Reimagined",
  description:
    "TrendLibas is a fashion inspiration platform celebrating Pakistani women's style — from lawn suits and bridal couture to everyday elegance.",
};

export type Category = {
  slug: string;
  name: string;
  image: string;
  blurb: string;
};

export const categories: Category[] = [
  { slug: "lawn-suits", name: "Lawn Suits", image: catLawn, blurb: "Airy prints and pastel drapes for effortless summer style." },
  { slug: "bridal-wear", name: "Bridal Wear", image: catBridal, blurb: "Heirloom-worthy couture in reds, golds and dusky rose." },
  { slug: "party-wear", name: "Party Wear", image: catParty, blurb: "Statement silhouettes that turn every entrance into a moment." },
  { slug: "abayas", name: "Abayas", image: catAbaya, blurb: "Modest tailoring with elegant embroidery and quiet luxury." },
  { slug: "eid-collections", name: "Eid Collections", image: catEid, blurb: "Festive palettes and delicate craftsmanship for celebrations." },
  { slug: "university-fashion", name: "University Fashion", image: catUniversity, blurb: "Chic, easy-to-style pieces built for campus days." },
  { slug: "mehndi-outfits", name: "Mehndi Outfits", image: catMehndi, blurb: "Yellows, oranges and mirror-work for the joyful pre-wedding." },
  { slug: "color-combinations", name: "Color Combinations", image: catColors, blurb: "Curated palette pairings for every season and mood." },
];

export type Trend = {
  slug: string;
  title: string;
  category: string; // category slug
  image: string;
  gallery: string[];
  excerpt: string;
  content: string[];
  tips: string[];
  tags: string[];
  views: number;
  likes: number;
  date: string;
};

const p = (...t: string[]) => t;

export const trends: Trend[] = [
  {
    slug: "sheer-organza-dupatta",
    title: "The Sheer Organza Dupatta Renaissance",
    category: "party-wear",
    image: trendOrganza,
    gallery: [trendOrganza, catEid, catBridal],
    excerpt: "Weightless, hand-embroidered organza is the season's most repeated silhouette on Pakistani runways.",
    content: p(
      "This year's most-repeated silhouette on Pakistani runways is soft, translucent and heavily embroidered. Organza dupattas — cut long, wide and detailed with floral thread work — layer effortlessly over solid kurtas and pastel shararas.",
      "Designers are pairing organza with satin slips underneath to keep the drape structured. Look for pearl edging, scallop borders and repeat motifs in tonal thread.",
      "Style it with statement jhumkas and a low bun for a modern take on an old favourite."
    ),
    tips: [
      "Match dupatta embroidery to at least one accessory (earrings or clutch).",
      "Anchor a sheer dupatta with a heavier base — silk, raw silk or crepe.",
      "For daytime, choose champagne, ivory or blush; for evenings pick emerald or wine.",
    ],
    tags: ["organza", "dupatta", "pastel", "party"],
    views: 12480,
    likes: 890,
    date: "2026-06-14",
  },
  {
    slug: "pastel-coord-set",
    title: "Pastel Co-ord Sets For The Modern Muse",
    category: "party-wear",
    image: trendCoord,
    gallery: [trendCoord, catUniversity],
    excerpt: "Matching sets in blush, mint and butter are quietly replacing the classic three-piece.",
    content: p(
      "Two-piece coordinates in soft pastels have become the go-to for editorial shoots and mehndi mornings alike. The formula: flowy wide-leg pants, a fitted or draped top, and a single statement gold piece.",
      "Look for silks, crepes and viscose blends that catch light without adding weight."
    ),
    tips: [
      "Keep jewellery to one bold piece — chokers or long chandbalis.",
      "Play with tonal layering: blush on blush, mint on cream.",
    ],
    tags: ["coord", "pastel", "modern"],
    views: 9860,
    likes: 712,
    date: "2026-06-01",
  },
  {
    slug: "bridal-red-reimagined",
    title: "Bridal Red, Reimagined",
    category: "bridal-wear",
    image: catBridal,
    gallery: [catBridal, catMehndi],
    excerpt: "The classic Pakistani bridal red returns with softer undertones, lighter fabrics and modern draping.",
    content: p(
      "Deep crimson and rani pink dominate 2026's bridal calendar, but the silhouette has changed: lighter velvets, floating dupattas and hand-embroidered chunky borders replace last decade's stiff can-can lehengas.",
      "Pair with heirloom gold or diamond polki — layered, not stacked."
    ),
    tips: [
      "Balance heavy embroidery with a minimalist hair look.",
      "Two dupattas — a lighter one on the head, richer one over the shoulder.",
    ],
    tags: ["bridal", "red", "couture"],
    views: 21430,
    likes: 1780,
    date: "2026-05-20",
  },
  {
    slug: "printed-lawn-2026",
    title: "Printed Lawn: What To Wear This Summer",
    category: "lawn-suits",
    image: catLawn,
    gallery: [catLawn, catEid],
    excerpt: "The 2026 lawn season leans into peach florals, mint chikankari and dusty roses.",
    content: p(
      "This year's lawn drops favour soft floral repeats over bold digital prints. Peach, mint and dusty rose lead the palette.",
      "Cotton nets and lawn-silk blends give body without heat — perfect for Karachi and Lahore summers."
    ),
    tips: [
      "Iron dupattas on the reverse to keep embroidery intact.",
      "Style unstitched fabric as a straight-cut kurta with pants for versatility.",
    ],
    tags: ["lawn", "summer", "floral"],
    views: 15200,
    likes: 1120,
    date: "2026-05-10",
  },
  {
    slug: "modest-abaya-tailoring",
    title: "Modern Abayas With Sculpted Tailoring",
    category: "abayas",
    image: catAbaya,
    gallery: [catAbaya],
    excerpt: "The new abaya silhouette is architectural — sharp sleeves, subtle embroidery, quiet luxury.",
    content: p(
      "The new wave of abayas favours structure over embellishment. Bell sleeves, wrap fronts and single embroidered cuffs replace all-over sequin work.",
      "Black remains the anchor but stone, olive and charcoal are gaining runway time."
    ),
    tips: [
      "Look for wool-blend crepes in cooler months.",
      "One statement — sleeve or hemline. Never both.",
    ],
    tags: ["abaya", "modest", "minimal"],
    views: 6740,
    likes: 502,
    date: "2026-04-28",
  },
  {
    slug: "eid-pastels",
    title: "The Eid Pastel Edit",
    category: "eid-collections",
    image: catEid,
    gallery: [catEid, catLawn],
    excerpt: "Butter yellow, lilac and mint dominate this year's Eid wardrobe.",
    content: p(
      "Chaand raat calls for something soft, luxe and photogenic. Butter yellow with pink resham embroidery is the top request at ateliers this year."
    ),
    tips: [
      "Match jewellery metal to embroidery thread — gold with gold, silver with silver.",
      "A single-shade outfit reads more expensive than a busy print.",
    ],
    tags: ["eid", "pastel", "occasion"],
    views: 18300,
    likes: 1410,
    date: "2026-04-01",
  },
  {
    slug: "university-everyday",
    title: "Effortless Campus Style",
    category: "university-fashion",
    image: catUniversity,
    gallery: [catUniversity],
    excerpt: "The kurta-jeans-tote formula gets a soft-pink update.",
    content: p(
      "Pastel kurtas over straight-leg jeans, a tan tote and neutral loafers — the uniform of modern university girls in Lahore, Islamabad and Karachi.",
      "It's the balance of ease and polish that makes it work day after day."
    ),
    tips: [
      "Invest in two neutral kurtas that layer over anything.",
      "One statement earring dresses up any outfit.",
    ],
    tags: ["campus", "everyday", "kurta"],
    views: 7820,
    likes: 620,
    date: "2026-03-18",
  },
  {
    slug: "mehndi-yellows",
    title: "Mehndi Yellows: Bold Meets Traditional",
    category: "mehndi-outfits",
    image: catMehndi,
    gallery: [catMehndi],
    excerpt: "Marigold, saffron and turmeric — the mehndi palette is at its most joyful.",
    content: p(
      "Mehndi outfits this year lean into deep marigolds and saffrons, offset with pink resham and floral jewellery.",
      "Ghararas remain the crowd favourite over shararas for the ceremony itself."
    ),
    tips: [
      "Fresh floral jewellery photographs better than plastic — order the day before.",
      "Balance a busy outfit with a slicked-back hairstyle.",
    ],
    tags: ["mehndi", "yellow", "festive"],
    views: 11250,
    likes: 940,
    date: "2026-03-02",
  },
  {
    slug: "sage-and-rose",
    title: "Sage & Rose: The Palette Of The Season",
    category: "color-combinations",
    image: catColors,
    gallery: [catColors],
    excerpt: "Sage green paired with dusty rose is 2026's most-requested colour story.",
    content: p(
      "The pairing feels heritage — think Mughal miniature paintings — while reading fresh on modern silhouettes."
    ),
    tips: [
      "Use rose as the base and sage as embroidery, or vice versa.",
      "Add antique gold, not yellow gold, for the right undertone.",
    ],
    tags: ["palette", "sage", "rose"],
    views: 4930,
    likes: 380,
    date: "2026-02-22",
  },
  {
    slug: "occasion-shararas",
    title: "The Return Of The Sharara",
    category: "party-wear",
    image: catParty,
    gallery: [catParty],
    excerpt: "Wide-legged, embellished and endlessly photogenic — shararas are back.",
    content: p(
      "After a decade of lehengas, wide-legged shararas are the new occasion favourite. Silver zardozi on emerald and rani pink lead the charge."
    ),
    tips: [
      "The waistband defines the drape — get it tailored to sit high.",
      "A short kurti reads more contemporary than a long peplum.",
    ],
    tags: ["sharara", "party", "occasion"],
    views: 8940,
    likes: 690,
    date: "2026-02-05",
  },
  {
    slug: "bridal-second-look",
    title: "Planning A Second Bridal Look",
    category: "bridal-wear",
    image: catBridal,
    gallery: [catBridal, catEid],
    excerpt: "How modern Pakistani brides are styling a lighter second outfit for the reception.",
    content: p(
      "A softer second look — often in blush, champagne or ivory — is now standard at Pakistani weddings.",
      "It photographs beautifully at night and lets brides dance freely."
    ),
    tips: [
      "Keep colour temperature consistent across both looks.",
      "Repeat one jewellery piece to tie the two outfits together.",
    ],
    tags: ["bridal", "reception"],
    views: 13600,
    likes: 1040,
    date: "2026-01-20",
  },
  {
    slug: "everyday-abaya-styling",
    title: "Everyday Abaya Styling For Winter",
    category: "abayas",
    image: catAbaya,
    gallery: [catAbaya],
    excerpt: "Layered scarves, boots and structured bags elevate the everyday abaya.",
    content: p(
      "For winter, style abayas with a fitted turtleneck underneath, ankle boots and a structured tote. Colour-block scarves add personality."
    ),
    tips: [
      "Choose one statement — scarf or bag — not both.",
      "Boot colour should match your bag, not your abaya.",
    ],
    tags: ["abaya", "winter", "styling"],
    views: 5140,
    likes: 410,
    date: "2026-01-08",
  },
];

export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  image: string;
  excerpt: string;
  content: string[];
  date: string;
  readMinutes: number;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "capsule-wardrobe-pakistani-woman",
    title: "Building A Capsule Wardrobe: The Pakistani Edit",
    category: "styling-guides",
    image: blogEditorial,
    excerpt: "Ten pieces that carry a Pakistani woman through every season, occasion and city.",
    content: p(
      "A well-built capsule wardrobe doesn't chase trends — it anchors your style. Start with two neutral kurtas, one white and one beige.",
      "Add a black abaya, a pair of straight-leg trousers, and one statement dupatta.",
      "For occasions, invest in a single silk sharara set that can be re-styled endlessly."
    ),
    date: "2026-06-20",
    readMinutes: 6,
  },
  {
    slug: "how-to-drape-dupatta",
    title: "5 Ways To Drape A Dupatta This Year",
    category: "how-to",
    image: trendOrganza,
    excerpt: "From the classic double-shoulder to the modern belted drape — a step-by-step guide.",
    content: p(
      "The dupatta drape can transform an outfit more than the outfit itself.",
      "Try the belted saree-drape for parties, or the wrapped neck-drape for casual days."
    ),
    date: "2026-06-05",
    readMinutes: 4,
  },
  {
    slug: "wedding-guest-outfits",
    title: "The Wedding Guest Playbook",
    category: "occasion",
    image: catParty,
    excerpt: "What to wear to each function without ever upstaging the bride.",
    content: p(
      "Mehndi calls for yellows and greens; barat for jewel tones; walima for pastels and metallics.",
      "Avoid pure red or all-white as a guest — no matter how tempting."
    ),
    date: "2026-05-25",
    readMinutes: 5,
  },
  {
    slug: "sustainable-pakistani-fashion",
    title: "The Rise Of Sustainable Pakistani Labels",
    category: "features",
    image: catColors,
    excerpt: "Small-batch designers rewriting how our clothes are made — and worn.",
    content: p(
      "A quiet revolution is happening in Karachi and Lahore ateliers: natural dyes, deadstock fabrics and made-to-order production.",
      "Buying less, better, is the most Pakistani thing you can do."
    ),
    date: "2026-05-10",
    readMinutes: 7,
  },
  {
    slug: "eid-shopping-guide",
    title: "Your Complete Eid Shopping Timeline",
    category: "how-to",
    image: catEid,
    excerpt: "Six weeks out, three weeks out, one week out — what to buy and when.",
    content: p(
      "Start six weeks before Eid: unstitched fabric first, tailoring booked next.",
      "Three weeks out: accessories and shoes. One week: alterations."
    ),
    date: "2026-04-18",
    readMinutes: 5,
  },
  {
    slug: "mehndi-makeup-hair",
    title: "Mehndi Hair & Makeup: The Modern Playbook",
    category: "beauty",
    image: catMehndi,
    excerpt: "Fresh florals, dewy skin and a middle-parted braid — the new mehndi beauty formula.",
    content: p(
      "Modern mehndi beauty is about looking like yourself — a little brighter.",
      "Dewy base, warm blush, soft gold eye and a nude-pink lip."
    ),
    date: "2026-04-02",
    readMinutes: 4,
  },
  {
    slug: "campus-outfit-formulas",
    title: "10 Campus Outfit Formulas That Never Fail",
    category: "styling-guides",
    image: catUniversity,
    excerpt: "Bookmark-worthy combinations for morning classes, evening study sessions and everything in between.",
    content: p(
      "Kurta + jeans + loafers is only the beginning.",
      "Try a jumpsuit with a linen shirt tied at the waist, or a printed maxi with a denim jacket."
    ),
    date: "2026-03-14",
    readMinutes: 5,
  },
  {
    slug: "abaya-fabric-guide",
    title: "The Abaya Fabric Guide",
    category: "how-to",
    image: catAbaya,
    excerpt: "Nida, korean crepe, wool-blend — which fabric works for which season.",
    content: p(
      "Nida crepe is the year-round classic.",
      "Wool-blends work through Islamabad winters; korean crepe drapes best in Karachi humidity."
    ),
    date: "2026-02-28",
    readMinutes: 4,
  },
  {
    slug: "jewellery-heirlooms",
    title: "Styling Your Mother's Jewellery",
    category: "features",
    image: catBridal,
    excerpt: "Heirloom polki, gold sets and antique jhumkas — how to wear them without looking dated.",
    content: p(
      "The trick to heirloom jewellery is contrast: pair antique with minimal, ornate with simple.",
      "One statement piece per outfit — always."
    ),
    date: "2026-02-10",
    readMinutes: 6,
  },
  {
    slug: "color-story-2026",
    title: "The Colour Story Of 2026",
    category: "features",
    image: catColors,
    excerpt: "Dusty rose, sage, terracotta and butter yellow — the year in shades.",
    content: p(
      "This year is about warmth. Cool blues take a step back; earthy warms lead the palette."
    ),
    date: "2026-01-25",
    readMinutes: 5,
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
export function getTrend(slug: string) {
  return trends.find((t) => t.slug === slug);
}
export function getBlogPost(slug: string) {
  return blogPosts.find((b) => b.slug === slug);
}
export function trendsInCategory(catSlug: string) {
  return trends.filter((t) => t.category === catSlug);
}
export function relatedTrends(t: Trend, n = 3) {
  return trends.filter((x) => x.slug !== t.slug && x.category === t.category).slice(0, n);
}

export const heroImage = heroFashion;
