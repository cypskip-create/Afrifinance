-- Revert: Make profiles SELECT more restrictive again
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Profiles are publicly viewable" ON public.profiles;

-- Create a policy that only allows users to view their own profile (for email access)
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a separate policy for public profile data that explicitly excludes email via RLS
-- Since we can't control columns in RLS, we'll use a service role approach instead

-- Drop and recreate the view with SECURITY DEFINER function approach
DROP VIEW IF EXISTS public.profiles_public;

-- Create a function that returns public profile data (runs with definer rights)
CREATE OR REPLACE FUNCTION public.get_public_profile(target_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  subscription_plan TEXT,
  portfolio_public BOOLEAN,
  followers_count INTEGER,
  following_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.subscription_plan,
    p.portfolio_public,
    p.followers_count,
    p.following_count,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.user_id = target_user_id;
$$;

-- Create a function to get all public profiles (for listings)
CREATE OR REPLACE FUNCTION public.get_all_public_profiles()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  subscription_plan TEXT,
  portfolio_public BOOLEAN,
  followers_count INTEGER,
  following_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.subscription_plan,
    p.portfolio_public,
    p.followers_count,
    p.following_count,
    p.created_at,
    p.updated_at
  FROM profiles p;
$$;

-- Recreate the view using the security definer function
CREATE VIEW public.profiles_public AS
SELECT * FROM public.get_all_public_profiles();

COMMENT ON VIEW public.profiles_public IS 'Public view of profiles that excludes sensitive data like email. Use this view for all public-facing profile queries.';