-- Fix Admin System
-- Add admin functionality to user_profiles table

-- Add is_admin column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_user_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE email = user_email AND is_admin = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_user_admin(TEXT) TO authenticated;

-- You can manually set admin users by running:
-- UPDATE user_profiles SET is_admin = TRUE WHERE email = 'your-admin-email@example.com';
