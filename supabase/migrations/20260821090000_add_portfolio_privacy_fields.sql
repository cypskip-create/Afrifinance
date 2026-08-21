ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS portfolio_hide_amounts BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS portfolio_hide_gains BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS portfolio_top_holdings_only BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS portfolio_followers_only BOOLEAN DEFAULT false;

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
  portfolio_hide_amounts,
  portfolio_hide_gains,
  portfolio_top_holdings_only,
  portfolio_followers_only,
  handle
FROM public.profiles;