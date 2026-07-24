import { supabase } from "@/integrations/supabase/client";

const BUCKET = "product-images";
const MAX_BYTES = 4 * 1024 * 1024; // 4MB

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
}

async function ensureBucketHint() {
  // Bucket must exist in Supabase dashboard; we don't create it from the client.
}

/**
 * Upload a product image. Prefers Supabase Storage public URL;
 * falls back to a data URL so admins can still attach images offline.
 */
export async function uploadProductImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (JPG, PNG, WebP, etc.)");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be under 4MB");
  }

  await ensureBucketHint();

  const path = `products/${Date.now()}-${sanitizeFileName(file.name)}`;

  try {
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

    if (!error) {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      if (data?.publicUrl) return data.publicUrl;
    }
  } catch {
    // fall through to data URL
  }

  // Fallback: embed as data URL (works without storage bucket)
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
  return dataUrl;
}
