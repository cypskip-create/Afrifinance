
-- Add handle column
ALTER TABLE public.profiles ADD COLUMN handle text UNIQUE;
CREATE INDEX idx_profiles_handle ON public.profiles (handle);

-- Must drop first since column order changed
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  full_name,
  avatar_url,
  banner_url,
  bio,
  subscription_plan,
  created_at,
  updated_at,
  followers_count,
  following_count,
  portfolio_public,
  handle
FROM public.profiles;
