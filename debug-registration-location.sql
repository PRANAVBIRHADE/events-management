-- Debug query to find where a specific registration exists
-- Replace 'REGISTRATION_ID_HERE' with the actual registration ID you're trying to delete

-- Check if it exists in freshers_registrations
SELECT 'freshers_registrations' as table_name, id, full_name, email, created_at 
FROM freshers_registrations 
WHERE id = 'REGISTRATION_ID_HERE'

UNION ALL

-- Check if it exists in senior_ticket_registrations  
SELECT 'senior_ticket_registrations' as table_name, id, full_name, email, created_at
FROM senior_ticket_registrations 
WHERE id = 'REGISTRATION_ID_HERE'

UNION ALL

-- Check if it exists in the all_registrations view
SELECT 'all_registrations_view' as table_name, id, full_name, email, created_at
FROM all_registrations 
WHERE id = 'REGISTRATION_ID_HERE';

-- Also check if there are any registrations with similar names/emails
SELECT 'similar_registrations' as table_name, id, full_name, email, created_at, 'freshers' as source_table
FROM freshers_registrations 
WHERE full_name ILIKE '%PARTIAL_NAME%' OR email ILIKE '%PARTIAL_EMAIL%'

UNION ALL

SELECT 'similar_registrations' as table_name, id, full_name, email, created_at, 'seniors' as source_table
FROM senior_ticket_registrations 
WHERE full_name ILIKE '%PARTIAL_NAME%' OR email ILIKE '%PARTIAL_EMAIL%';
