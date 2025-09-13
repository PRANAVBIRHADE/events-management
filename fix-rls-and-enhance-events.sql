-- Fix RLS policies and enhance events table for better event management
-- This script fixes the 406 errors and adds new event creation features

-- First, let's fix the RLS policies for the events table
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Events are viewable by authenticated users" ON events;

-- Create new RLS policies for events
CREATE POLICY "Events are viewable by everyone" ON events
    FOR SELECT USING (true);

CREATE POLICY "Events are viewable by authenticated users" ON events
    FOR SELECT USING (auth.role() = 'authenticated');

-- Fix RLS policies for freshers_registrations
DROP POLICY IF EXISTS "Users can view own fresher registrations" ON freshers_registrations;
DROP POLICY IF EXISTS "Users can insert own fresher registrations" ON freshers_registrations;

CREATE POLICY "Users can view own fresher registrations" ON freshers_registrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fresher registrations" ON freshers_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fix RLS policies for senior_ticket_registrations
DROP POLICY IF EXISTS "Users can view own senior registrations" ON senior_ticket_registrations;
DROP POLICY IF EXISTS "Users can insert own senior registrations" ON senior_ticket_registrations;

CREATE POLICY "Users can view own senior registrations" ON senior_ticket_registrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own senior registrations" ON senior_ticket_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Now let's enhance the events table with new columns for better event management
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS pricing_type VARCHAR(20) DEFAULT 'fixed' CHECK (pricing_type IN ('fixed', 'year_based')),
ADD COLUMN IF NOT EXISTS free_for_years INTEGER[] DEFAULT '{1}',
ADD COLUMN IF NOT EXISTS paid_for_years INTEGER[] DEFAULT '{2,3,4}',
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2) DEFAULT 99.00,
ADD COLUMN IF NOT EXISTS year_specific_pricing JSONB DEFAULT '{}';

-- Add comments for clarity
COMMENT ON COLUMN events.pricing_type IS 'Type of pricing: fixed (same price for all) or year_based (different prices per year)';
COMMENT ON COLUMN events.free_for_years IS 'Array of years that get free access (e.g., [1] for freshers)';
COMMENT ON COLUMN events.paid_for_years IS 'Array of years that need to pay (e.g., [2,3,4] for seniors)';
COMMENT ON COLUMN events.base_price IS 'Base price for paid events (used when pricing_type is fixed)';
COMMENT ON COLUMN events.year_specific_pricing IS 'JSON object with year-specific pricing (e.g., {"2": 50, "3": 75, "4": 100})';

-- Update existing events to use the new pricing system
UPDATE events 
SET 
    pricing_type = 'fixed',
    free_for_years = '{1}',
    paid_for_years = '{2,3,4}',
    base_price = COALESCE(price, 99.00)
WHERE pricing_type IS NULL;

-- Create a function to get event price for a specific user year
CREATE OR REPLACE FUNCTION get_event_price_for_year(event_id_param UUID, user_year INTEGER)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    event_record RECORD;
    year_price DECIMAL(10,2);
BEGIN
    -- Get event details
    SELECT * INTO event_record FROM events WHERE id = event_id_param;
    
    -- If event not found, return 0
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Check if user year is in free years
    IF user_year = ANY(event_record.free_for_years) THEN
        RETURN 0;
    END IF;
    
    -- Check if user year is in paid years
    IF user_year = ANY(event_record.paid_for_years) THEN
        -- If year-based pricing, check for specific year price
        IF event_record.pricing_type = 'year_based' AND event_record.year_specific_pricing ? user_year::text THEN
            year_price := (event_record.year_specific_pricing ->> user_year::text)::DECIMAL(10,2);
            RETURN COALESCE(year_price, event_record.base_price);
        ELSE
            -- Use base price for fixed pricing or fallback
            RETURN event_record.base_price;
        END IF;
    END IF;
    
    -- Default to base price if year not found in either array
    RETURN event_record.base_price;
END;
$$ LANGUAGE plpgsql;

-- Create a function to check if event is free for a specific user year
CREATE OR REPLACE FUNCTION is_event_free_for_year(event_id_param UUID, user_year INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    event_record RECORD;
BEGIN
    -- Get event details
    SELECT * INTO event_record FROM events WHERE id = event_id_param;
    
    -- If event not found, return false
    IF NOT FOUND THEN
        RETURN false;
    END IF;
    
    -- Check if user year is in free years
    RETURN user_year = ANY(event_record.free_for_years);
END;
$$ LANGUAGE plpgsql;

-- Update RLS policies to allow admins to manage events
DROP POLICY IF EXISTS "Admins can manage events" ON events;
CREATE POLICY "Admins can manage events" ON events
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM user_profiles 
            WHERE email LIKE '%@admin%' OR email LIKE '%admin@%'
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_pricing_type ON events(pricing_type);
CREATE INDEX IF NOT EXISTS idx_events_free_years ON events USING GIN(free_for_years);
CREATE INDEX IF NOT EXISTS idx_events_paid_years ON events USING GIN(paid_for_years);

-- Insert a sample event with year-based pricing
INSERT INTO events (
    name, 
    description, 
    event_date, 
    location, 
    max_capacity, 
    category, 
    event_type, 
    price, 
    pricing_type,
    free_for_years,
    paid_for_years,
    base_price,
    year_specific_pricing,
    is_active,
    created_at
) VALUES (
    'Tech Workshop 2025',
    'Advanced programming workshop for all students',
    '2025-03-20 14:00:00+00',
    'Computer Lab 1',
    50,
    'technical',
    'paid',
    0, -- This will be calculated dynamically
    'year_based',
    '{1}', -- Free for 1st year
    '{2,3,4}', -- Paid for 2nd, 3rd, 4th year
    100.00, -- Base price
    '{"2": 50, "3": 75, "4": 100}', -- Year-specific pricing
    true,
    NOW()
) ON CONFLICT DO NOTHING;

-- Insert a sample free event
INSERT INTO events (
    name, 
    description, 
    event_date, 
    location, 
    max_capacity, 
    category, 
    event_type, 
    price, 
    pricing_type,
    free_for_years,
    paid_for_years,
    base_price,
    is_active,
    created_at
) VALUES (
    'Welcome Freshers 2025',
    'Welcome party for all freshers',
    '2025-03-15 18:00:00+00',
    'Main Auditorium',
    200,
    'social',
    'free',
    0,
    'fixed',
    '{1,2,3,4}', -- Free for all years
    '{}', -- No paid years
    0, -- No base price
    true,
    NOW()
) ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_event_price_for_year(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION is_event_free_for_year(UUID, INTEGER) TO authenticated;
