-- Setup Payment Screenshots Storage
-- This script creates a storage bucket for payment screenshots

-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-screenshots', 'payment-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for payment screenshots
-- Allow authenticated users to upload their own payment screenshots
CREATE POLICY "Users can upload own payment screenshots" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'payment-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow users to view their own payment screenshots
CREATE POLICY "Users can view own payment screenshots" ON storage.objects
FOR SELECT USING (
  bucket_id = 'payment-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow admins to view all payment screenshots
CREATE POLICY "Admins can view all payment screenshots" ON storage.objects
FOR SELECT USING (
  bucket_id = 'payment-screenshots' 
  AND EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND is_admin = true
  )
);

-- Allow users to update their own payment screenshots
CREATE POLICY "Users can update own payment screenshots" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'payment-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow users to delete their own payment screenshots
CREATE POLICY "Users can delete own payment screenshots" ON storage.objects
FOR DELETE USING (
  bucket_id = 'payment-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[2]
);
