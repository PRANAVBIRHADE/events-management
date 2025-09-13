-- Fix RLS policies for events table
-- This script fixes the RLS policies that are blocking event creation/editing

-- Drop existing policies
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Events are manageable by admins" ON events;

-- Create new policies that work properly
-- Allow everyone to read events
CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);

-- Allow authenticated users to insert events (for admin dashboard)
CREATE POLICY "Authenticated users can insert events" ON events
  FOR INSERT WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- Allow authenticated users to update events (for admin dashboard)
CREATE POLICY "Authenticated users can update events" ON events
  FOR UPDATE USING (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- Allow authenticated users to delete events (for admin dashboard)
CREATE POLICY "Authenticated users can delete events" ON events
  FOR DELETE USING (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- Alternative: If you want to be more restrictive, you can use this instead:
-- CREATE POLICY "Events are manageable by authenticated users" ON events
--   FOR ALL USING (
--     auth.role() = 'service_role' OR 
--     auth.uid() IS NOT NULL
--   );