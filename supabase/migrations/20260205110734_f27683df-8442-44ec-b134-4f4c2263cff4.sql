-- Update profiles_public view to include banner_url
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public
WITH (security_invoker = on) AS
  SELECT 
    id,
    user_id,
    full_name,
    avatar_url,
    banner_url,
    bio,
    subscription_plan,
    portfolio_public,
    followers_count,
    following_count,
    created_at,
    updated_at
  FROM public.profiles;