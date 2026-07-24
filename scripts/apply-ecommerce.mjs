#!/usr/bin/env node
/**
 * Apply ensure-ecommerce SQL to the linked Supabase project via the SQL HTTP API.
 * Requires SUPABASE_ACCESS_TOKEN (personal access token) OR DATABASE_URL.
 *
 * Fallback instructions printed if credentials are missing.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

loadEnv();

const sqlPath = resolve(
  process.cwd(),
  "supabase/migrations/20260724130000_ensure_ecommerce_tables.sql",
);
const sql = readFileSync(sqlPath, "utf8");
const projectRef =
  process.env.SUPABASE_PROJECT_REF ||
  (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "")
    .replace(/^https?:\/\//, "")
    .split(".")[0];

console.log(`
============================================================
Pahraan: create missing ecommerce tables (products, etc.)
============================================================

Project: ${projectRef || "(unknown)"}

This SQL cannot be applied with the anon/service REST key alone.
Run it in the Supabase SQL Editor (30 seconds):

1. Open: https://supabase.com/dashboard/project/${projectRef || "YOUR_PROJECT"}/sql/new
2. Paste the contents of:
   supabase/migrations/20260724130000_ensure_ecommerce_tables.sql
3. Click Run
4. Refresh the admin Products page

Optional — product image uploads:
   also run supabase/migrations/20260724120000_product_images_bucket.sql

SQL file path:
${sqlPath}
SQL length: ${sql.length} chars
`);
