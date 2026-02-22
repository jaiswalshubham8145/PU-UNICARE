-- Create storage bucket for complaint images
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint-images', 'complaint-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload complaint images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'complaint-images' AND auth.uid() IS NOT NULL);

-- Allow anyone to view complaint images
CREATE POLICY "Anyone can view complaint images"
ON storage.objects FOR SELECT
USING (bucket_id = 'complaint-images');

-- Allow users to update their own images
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'complaint-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'complaint-images' AND auth.uid()::text = (storage.foldername(name))[1]);