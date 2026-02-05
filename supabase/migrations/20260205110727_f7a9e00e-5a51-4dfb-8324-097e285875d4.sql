-- Add banner_url column to profiles table for cover photo functionality
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Create storage bucket for banners if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload banners
CREATE POLICY "Users can upload their own banners"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read for banners
CREATE POLICY "Public read banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- Allow users to update their own banners
CREATE POLICY "Users can update their own banners"
ON storage.objects FOR UPDATE
USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own banners
CREATE POLICY "Users can delete their own banners"
ON storage.objects FOR DELETE
USING (bucket_id = 'banners' AND auth.uid()::text = (storage.foldername(name))[1]);