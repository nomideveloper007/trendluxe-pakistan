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

export const imageMap: Record<string, string> = {
  "hero-fashion": heroFashion,
  "cat-bridal": catBridal,
  "cat-party": catParty,
  "cat-lawn": catLawn,
  "cat-abaya": catAbaya,
  "cat-eid": catEid,
  "cat-university": catUniversity,
  "cat-mehndi": catMehndi,
  "cat-colors": catColors,
  "trend-organza": trendOrganza,
  "trend-coord": trendCoord,
  "blog-editorial": blogEditorial,
};

export const imageKeyOptions = Object.keys(imageMap);

export function resolveImage(keyOrUrl: string | null | undefined): string {
  if (!keyOrUrl) return imageMap["hero-fashion"];
  if (/^(https?:)?\/\//.test(keyOrUrl) || keyOrUrl.startsWith("/")) return keyOrUrl;
  return imageMap[keyOrUrl] ?? imageMap["hero-fashion"];
}

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

export const blogCategories = ["styling-guides", "how-to", "occasion", "features", "beauty"] as const;

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export type Trend = {
  slug: string;
  title: string;
  category: string;
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

export const heroImage = heroFashion;
