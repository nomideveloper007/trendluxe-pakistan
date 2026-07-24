-- Product image uploads for admin panel
-- Run in Supabase SQL editor if the bucket does not exist yet.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read
drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Authenticated admins can upload (adjust if you use a custom admin check)
drop policy if exists "Auth upload product images" on storage.objects;
create policy "Auth upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "Auth update product images" on storage.objects;
create policy "Auth update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images');

drop policy if exists "Auth delete product images" on storage.objects;
create policy "Auth delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');
