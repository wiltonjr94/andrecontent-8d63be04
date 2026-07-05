-- Helper in private schema (not exposed via Data API) to check if any admin exists, bypassing RLS
CREATE OR REPLACE FUNCTION private.admin_exists()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin');
$$;

REVOKE ALL ON FUNCTION private.admin_exists() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.admin_exists() TO authenticated, service_role;

-- Allow the very first authenticated user to claim admin for themselves,
-- only while no admin exists yet.
CREATE POLICY "First user can claim admin"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role = 'admin'
  AND NOT private.admin_exists()
);
