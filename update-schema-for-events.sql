-- Update Supabase Schema for Event-Based Registration Flow
-- Run this in your Supabase SQL Editor

-- 1. Update registrations table to link to events
ALTER TABLE registrations 
  ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE CASCADE;

-- 2. Update registration_type constraint to use 'senior' instead of 'visitor'
ALTER TABLE registrations 
  DROP CONSTRAINT IF EXISTS registrations_registration_type_check;

ALTER TABLE registrations 
  ADD CONSTRAINT registrations_registration_type_check 
  CHECK (registration_type IN ('fresher', 'senior'));

-- 3. Add user_id column to link registrations to auth users
ALTER TABLE registrations 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Create user_profiles table for additional user information
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(20) NOT NULL,
  studying_year INTEGER CHECK (studying_year >= 1 AND studying_year <= 4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_mobile ON user_profiles(mobile_number);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);

-- 6. Create function to automatically create user profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, mobile_number, studying_year)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'mobile_number', ''),
    COALESCE((NEW.raw_user_meta_data->>'studying_year')::INTEGER, 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Enable Row Level Security (RLS) for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- 10. Update registrations policies to work with authenticated users
DROP POLICY IF EXISTS "Users can view own registrations" ON registrations;
CREATE POLICY "Users can view own registrations" ON registrations
  FOR SELECT USING (auth.uid() = user_id);

-- 11. Grant necessary permissions
GRANT ALL ON user_profiles TO anon, authenticated;

-- 12. Create trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Update any existing 'visitor' registrations to 'senior'
UPDATE registrations 
SET registration_type = 'senior' 
WHERE registration_type = 'visitor';

-- 14. Insert sample event if no events exist
INSERT INTO events (title, description, date, venue, price)
SELECT 'Freshers Party 2K25', 'Welcome to the most amazing freshers party ever! Get ready for music, dance, food, and unforgettable memories.', NOW() + INTERVAL '7 days', 'Main Auditorium, College Campus', 0
WHERE NOT EXISTS (SELECT 1 FROM events LIMIT 1);

-- 15. Add helpful comments
COMMENT ON TABLE user_profiles IS 'Stores additional user profile information linked to Supabase auth users';
COMMENT ON COLUMN registrations.user_id IS 'Links registration to Supabase auth user';
COMMENT ON COLUMN registrations.event_id IS 'Links registration to specific event';
COMMENT ON COLUMN user_profiles.user_id IS 'References auth.users.id for authentication';

-- 16. Success message
SELECT 'Database updated successfully for event-based registration flow!' as status;
