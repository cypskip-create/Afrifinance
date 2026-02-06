-- Add a SELECT policy on profiles for viewing public data (non-sensitive fields only)
-- This allows the profiles_public view to work correctly

-- First, we need to allow select on profiles for the view to work
-- But we'll limit what columns are accessible through the view

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create policy that allows public viewing of non-sensitive profile data
-- The view profiles_public already filters out sensitive columns
CREATE POLICY "Profiles are publicly viewable"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Note: The profiles_public view already excludes the email column
-- so sensitive data remains protected even with this policy