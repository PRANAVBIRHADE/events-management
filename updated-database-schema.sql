-- Updated Database Schema for Spark 2K25
-- This script restructures the database for better organization

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- Create events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location VARCHAR(255),
  max_capacity INTEGER,
  current_registrations INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table with enhanced structure
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  mobile_number VARCHAR(20),
  studying_year INTEGER NOT NULL CHECK (studying_year >= 1 AND studying_year <= 4),
  password_hash VARCHAR(255), -- Store password hash for additional security
  is_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create freshers_registrations table for free registrations
CREATE TABLE freshers_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  registration_type VARCHAR(20) DEFAULT 'fresher',
  full_name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  studying_year INTEGER NOT NULL,
  qr_code TEXT,
  ticket_number VARCHAR(50) UNIQUE,
  is_checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_id) -- Prevent duplicate registrations
);

-- Create senior_ticket_registrations table for paid registrations
CREATE TABLE senior_ticket_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  registration_type VARCHAR(20) DEFAULT 'senior',
  full_name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  studying_year INTEGER NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL DEFAULT 99.00,
  payment_status VARCHAR(20) DEFAULT 'pending',
  payment_id VARCHAR(255),
  payment_method VARCHAR(50),
  qr_code TEXT,
  ticket_number VARCHAR(50) UNIQUE,
  is_checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_id) -- Prevent duplicate registrations
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_freshers_registrations_user_id ON freshers_registrations(user_id);
CREATE INDEX idx_freshers_registrations_event_id ON freshers_registrations(event_id);
CREATE INDEX idx_senior_registrations_user_id ON senior_ticket_registrations(user_id);
CREATE INDEX idx_senior_registrations_event_id ON senior_ticket_registrations(event_id);
CREATE INDEX idx_events_active ON events(is_active) WHERE is_active = true;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_freshers_registrations_updated_at 
    BEFORE UPDATE ON freshers_registrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_senior_registrations_updated_at 
    BEFORE UPDATE ON senior_ticket_registrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, email, mobile_number, studying_year)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'mobile_number', ''),
    COALESCE((NEW.raw_user_meta_data->>'studying_year')::integer, 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE freshers_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE senior_ticket_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for freshers_registrations
DROP POLICY IF EXISTS "Users can view own fresher registrations" ON freshers_registrations;
CREATE POLICY "Users can view own fresher registrations" ON freshers_registrations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own fresher registrations" ON freshers_registrations;
CREATE POLICY "Users can insert own fresher registrations" ON freshers_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own fresher registrations" ON freshers_registrations;
CREATE POLICY "Users can update own fresher registrations" ON freshers_registrations
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for senior_ticket_registrations
DROP POLICY IF EXISTS "Users can view own senior registrations" ON senior_ticket_registrations;
CREATE POLICY "Users can view own senior registrations" ON senior_ticket_registrations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own senior registrations" ON senior_ticket_registrations;
CREATE POLICY "Users can insert own senior registrations" ON senior_ticket_registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own senior registrations" ON senior_ticket_registrations;
CREATE POLICY "Users can update own senior registrations" ON senior_ticket_registrations
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for events (public read, admin write)
DROP POLICY IF EXISTS "Anyone can view active events" ON events;
CREATE POLICY "Anyone can view active events" ON events
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage events" ON events;
CREATE POLICY "Admins can manage events" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@spark2k25.com'
    )
  );

-- Insert sample event
INSERT INTO events (name, description, event_date, location, max_capacity) VALUES
('Fresher''s Party 2K25', 'Welcome to the most epic fresher''s party of the year! Get ready for an unforgettable night filled with music, dance, games, and amazing memories.', 
 '2025-02-15 19:00:00+05:30', 'Main Auditorium, College Campus', 500);

-- Create view for combined registrations (for admin dashboard)
CREATE OR REPLACE VIEW all_registrations AS
SELECT 
  'fresher' as registration_type,
  id,
  user_id,
  event_id,
  full_name,
  mobile_number,
  email,
  studying_year,
  NULL as amount_paid,
  'completed' as payment_status,
  qr_code,
  ticket_number,
  is_checked_in,
  checked_in_at,
  created_at,
  updated_at
FROM freshers_registrations
UNION ALL
SELECT 
  'senior' as registration_type,
  id,
  user_id,
  event_id,
  full_name,
  mobile_number,
  email,
  studying_year,
  amount_paid,
  payment_status,
  qr_code,
  ticket_number,
  is_checked_in,
  checked_in_at,
  created_at,
  updated_at
FROM senior_ticket_registrations;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
