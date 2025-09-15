// Clear All User Sessions Script
// Run this in your Supabase SQL Editor

-- Option 1: Clear all user sessions (signs out everyone)
UPDATE auth.users 
SET last_sign_in_at = NULL,
    updated_at = NOW()
WHERE last_sign_in_at IS NOT NULL;

-- Option 2: Delete specific user completely (replace with actual user ID)
-- DELETE FROM auth.users WHERE id = 'USER_ID_HERE';

-- Option 3: Check current active sessions
SELECT 
    id,
    email,
    last_sign_in_at,
    created_at,
    updated_at
FROM auth.users 
WHERE last_sign_in_at IS NOT NULL
ORDER BY last_sign_in_at DESC;
