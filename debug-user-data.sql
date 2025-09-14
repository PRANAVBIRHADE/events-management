-- Debug User Data Script
-- Run this in Supabase SQL Editor to check your current data

-- Check all users in auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- Check all user profiles
SELECT 
    id,
    user_id,
    full_name,
    email,
    mobile_number,
    studying_year,
    created_at
FROM user_profiles
ORDER BY created_at DESC;

-- Check if there are any admin users
SELECT 
    up.id,
    up.user_id,
    up.full_name,
    up.email,
    au.email as auth_email,
    au.created_at as auth_created_at
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
ORDER BY au.created_at DESC;

-- Check events table
SELECT 
    id,
    name,
    event_date,
    is_active,
    created_at
FROM events
ORDER BY created_at DESC;

-- Check registrations
SELECT 
    'freshers' as type,
    id,
    full_name,
    email,
    created_at
FROM freshers_registrations
UNION ALL
SELECT 
    'seniors' as type,
    id,
    full_name,
    email,
    created_at
FROM senior_ticket_registrations
ORDER BY created_at DESC;
