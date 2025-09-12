-- Reset Database Script
-- Use this to clean all data and start fresh
-- Run this in your Supabase SQL Editor if needed

-- Clear all registrations (but keep the table structure)
DELETE FROM registrations;

-- Clear all events (but keep the table structure)  
DELETE FROM events;

-- Reset auto-increment sequences if any
-- (UUID tables don't need this, but included for completeness)

-- Verify tables are empty
SELECT 'registrations' as table_name, COUNT(*) as record_count FROM registrations
UNION ALL
SELECT 'events' as table_name, COUNT(*) as record_count FROM events
UNION ALL  
SELECT 'admin_users' as table_name, COUNT(*) as record_count FROM admin_users;

-- Note: admin_users table is preserved for admin access
-- If you need to recreate admin user, use the setup-admin.js script
