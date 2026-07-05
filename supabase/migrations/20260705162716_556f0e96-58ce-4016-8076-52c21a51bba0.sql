-- 1. Move has_role into a non-API-exposed schema (removes direct RPC surface for signed-in users)
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, app_role) TO authenticated, service_role;

-- Recreate all policies to reference private.has_role
DROP POLICY "Admins manage items" ON public.content_items;
CREATE POLICY "Admins manage items" ON public.content_items FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY "Admins manage highlights" ON public.highlights;
CREATE POLICY "Admins manage highlights" ON public.highlights FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY "Admins manage pages" ON public.pages;
CREATE POLICY "Admins manage pages" ON public.pages FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY "Admins manage site settings" ON public.site_settings;
CREATE POLICY "Admins manage site settings" ON public.site_settings FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY "Admins manage theme" ON public.theme_settings;
CREATE POLICY "Admins manage theme" ON public.theme_settings FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

-- Drop the now-unused public SECURITY DEFINER functions exposed to signed-in users
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.claim_admin();

-- 2. Add explicit storage.objects policies for the media bucket: only service role may access.
--    (RLS is already enabled; with these policies anon/authenticated remain denied by default.)
DROP POLICY IF EXISTS "Service role manages media objects" ON storage.objects;
CREATE POLICY "Service role manages media objects" ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'media')
  WITH CHECK (bucket_id = 'media');