-- Fix Admin RLS Policies
-- This script fixes the admin_users table RLS policies

-- First, let's check if admin_users table exists and has data
-- If not, we'll create it and insert the admin user

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow admin select on admin_users" ON admin_users;

-- Create a more permissive policy for admin_users
-- Allow any authenticated user to read admin_users (needed for admin verification)
CREATE POLICY "Allow authenticated users to read admin_users" ON admin_users
    FOR SELECT USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT SELECT ON admin_users TO authenticated;

-- Insert admin user if it doesn't exist
INSERT INTO admin_users (id, email, name, role)
VALUES (
  'c04c5443-642c-44c4-ac3f-51425e467d73', -- Use the actual user ID from the console
  'admin@spark2k25.com',
  'Admin User',
  'admin'
)
ON CONFLICT (email) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Also create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_user_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users 
        WHERE email = user_email AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_user_admin(TEXT) TO authenticated;
