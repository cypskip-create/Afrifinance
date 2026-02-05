-- Fix PUBLIC_DATA_EXPOSURE: Email addresses exposed in profiles table
-- Drop the overly permissive SELECT policy that allows anyone to see all profiles including emails
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a restrictive SELECT policy that only allows users to view their own profile directly
-- This protects the email field from being accessed by other users
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Note: The profiles_public view (which excludes email) with security_invoker=on 
-- is already in place and should be used for all public profile queries.
-- Application code already uses profiles_public view for social features.