-- Fix permissions on public.has_role function
-- Revoking execute permissions on this function in a previous migration causes database query failures
-- for authenticated users because PostgreSQL RLS policies evaluate this function when they query tables.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
