-- 1. Remove email from client-readable columns on profiles (column-level privileges)
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, user_id, full_name, avatar_url, banner_url, bio, subscription_plan, created_at, updated_at, followers_count, following_count, portfolio_public, handle, tradershub_onboarded)
  ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- 2. Notifications: only SECURITY DEFINER triggers / server may insert
DROP POLICY IF EXISTS "Only server creates notifications" ON public.notifications;
REVOKE INSERT ON public.notifications FROM anon, authenticated;

-- 3. Unique handles (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_handle_lower_unique
  ON public.profiles (lower(handle)) WHERE handle IS NOT NULL;