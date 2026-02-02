-- Fix: Protect user emails from public exposure
-- Strategy: Users can only see their own email, public profile data is visible to all

-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create new policy: Users can see all public profile fields, but email only for their own profile
-- We implement this at the application level since Postgres can't conditionally hide columns in RLS
-- Instead, we'll create a view for public access and restrict the base table

-- Create a public view that excludes sensitive fields (email)
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT 
    id,
    user_id,
    full_name,
    avatar_url,
    bio,
    subscription_plan,
    portfolio_public,
    followers_count,
    following_count,
    created_at,
    updated_at
FROM public.profiles;

-- Grant SELECT on the view to authenticated and anon users
GRANT SELECT ON public.profiles_public TO authenticated, anon;

-- Update the base table policy: only the profile owner can SELECT from the base table
-- This ensures email is only accessible to the owner
CREATE POLICY "Users can view only their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Keep existing INSERT and UPDATE policies (they already use auth.uid() = user_id)