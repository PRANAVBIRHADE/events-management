-- Fix RLS policies for registration deletion
-- This ensures admins can delete registrations from both tables

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can delete fresher registrations" ON freshers_registrations;
DROP POLICY IF EXISTS "Admins can delete senior registrations" ON senior_ticket_registrations;

-- Create new policies that allow authenticated users to delete registrations
-- (assuming your admin user is authenticated)
CREATE POLICY "Admins can delete fresher registrations" ON freshers_registrations
  FOR DELETE USING (true);

CREATE POLICY "Admins can delete senior registrations" ON senior_ticket_registrations
  FOR DELETE USING (true);

-- Alternative: If you want to restrict to specific admin email
-- Replace 'admin@spark2k25.com' with your actual admin email
-- CREATE POLICY "Admins can delete fresher registrations" ON freshers_registrations
--   FOR DELETE USING (
--     EXISTS (
--       SELECT 1 FROM auth.users 
--       WHERE auth.users.id = auth.uid() 
--       AND auth.users.email = 'admin@spark2k25.com'
--     )
--   );

-- CREATE POLICY "Admins can delete senior registrations" ON senior_ticket_registrations
--   FOR DELETE USING (
--     EXISTS (
--       SELECT 1 FROM auth.users 
--       WHERE auth.users.id = auth.uid() 
--       AND auth.users.email = 'admin@spark2k25.com'
--     )
--   );
