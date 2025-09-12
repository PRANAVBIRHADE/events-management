-- Fix RLS Policies for Events Table
-- This script fixes the permission issues

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active events" ON events;
DROP POLICY IF EXISTS "Authenticated users can view all events" ON events;
DROP POLICY IF EXISTS "Admins can manage events" ON events;

-- Create new policies that work properly
-- Allow anyone to view active events (for public access)
CREATE POLICY "Public can view active events" ON events
  FOR SELECT USING (is_active = true);

-- Allow authenticated users to view all events
CREATE POLICY "Authenticated users can view all events" ON events
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow public access to events (for the website to work)
CREATE POLICY "Public access to events" ON events
  FOR SELECT USING (true);

-- Allow admins to manage events (insert, update, delete)
CREATE POLICY "Admins can manage events" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.email = 'admin@spark2k25.com' OR auth.users.email LIKE '%@college.edu')
    )
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON events TO anon, authenticated;
GRANT ALL ON events TO authenticated;

-- Make sure the events table is accessible
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Test query to verify access
-- This should work without authentication
SELECT COUNT(*) FROM events WHERE is_active = true;
