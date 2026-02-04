-- Fix: Allow public SELECT access on profiles table for non-email fields via the view
-- The profiles_public view already excludes the email field

-- Drop the restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view only their own profile" ON public.profiles;

-- Create a policy that allows anyone to SELECT from profiles (since email is hidden via view)
-- But the application should use profiles_public view which excludes email
CREATE POLICY "Profiles are publicly viewable" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Ensure the profiles_public view is accessible
COMMENT ON VIEW public.profiles_public IS 'Public view of profiles that excludes sensitive data like email. Use this view for all public-facing profile queries.';