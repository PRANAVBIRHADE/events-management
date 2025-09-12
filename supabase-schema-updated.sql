-- Updated Supabase Schema for Spark 2K25 ⚡ with User Authentication
-- Run this to update your existing database

-- First, let's update the registrations table to support user authentication
ALTER TABLE registrations 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS registrations_registration_type_check;

-- Update the registration_type constraint to use 'senior' instead of 'visitor'
ALTER TABLE registrations 
  ADD CONSTRAINT registrations_registration_type_check 
  CHECK (registration_type IN ('fresher', 'senior'));

-- Create user_profiles table to store additional user information
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(20) NOT NULL,
  studying_year INTEGER CHECK (studying_year >= 1 AND studying_year <= 4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_mobile ON user_profiles(mobile_number);

-- Create function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, mobile_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'mobile_number', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Update registrations policies to work with authenticated users
DROP POLICY IF EXISTS "Allow public insert on registrations" ON registrations;
DROP POLICY IF EXISTS "Allow public select on registrations" ON registrations;
DROP POLICY IF EXISTS "Allow public update on registrations" ON registrations;

-- Allow public to insert registrations (for registration form)
CREATE POLICY "Allow public insert on registrations" ON registrations
  FOR INSERT WITH CHECK (true);

-- Allow public to select registrations (for admin dashboard)
CREATE POLICY "Allow public select on registrations" ON registrations
  FOR SELECT USING (true);

-- Allow public to update registrations (for admin operations)
CREATE POLICY "Allow public update on registrations" ON registrations
  FOR UPDATE USING (true);

-- Allow users to view their own registrations
CREATE POLICY "Users can view own registrations" ON registrations
  FOR SELECT USING (auth.uid() = user_id);

-- Grant permissions for user_profiles
GRANT ALL ON user_profiles TO anon, authenticated;

-- Create trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update existing registrations to have user_id if they have matching emails
-- This is optional - only run if you want to link existing registrations to users
-- UPDATE registrations 
-- SET user_id = au.id 
-- FROM auth.users au 
-- WHERE registrations.email = au.email;

-- Add helpful comments
COMMENT ON TABLE user_profiles IS 'Stores additional user profile information linked to Supabase auth users';
COMMENT ON COLUMN registrations.user_id IS 'Links registration to Supabase auth user';
COMMENT ON COLUMN user_profiles.user_id IS 'References auth.users.id for authentication';
