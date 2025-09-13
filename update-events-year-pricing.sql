-- Update events table to support year-wise pricing
-- This script adds the necessary columns for the new year-wise pricing feature

-- Add new columns to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS pricing_type VARCHAR(20) DEFAULT 'fixed' CHECK (pricing_type IN ('fixed', 'year_based')),
ADD COLUMN IF NOT EXISTS free_for_years INTEGER[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS paid_for_years INTEGER[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS year_specific_pricing JSONB DEFAULT '{}';

-- Update existing events to have year_based pricing by default
UPDATE events 
SET 
  pricing_type = 'year_based',
  free_for_years = CASE 
    WHEN event_type = 'free' THEN ARRAY[1, 2, 3, 4]
    ELSE ARRAY[1]
  END,
  paid_for_years = CASE 
    WHEN event_type = 'paid' THEN ARRAY[2, 3, 4]
    ELSE ARRAY[]::integer[]
  END,
  base_price = CASE 
    WHEN event_type = 'paid' THEN price
    ELSE 0
  END,
  year_specific_pricing = CASE 
    WHEN event_type = 'paid' THEN jsonb_build_object('2', price, '3', price, '4', price)
    ELSE '{}'
  END
WHERE pricing_type IS NULL OR pricing_type = 'fixed';

-- Create helper functions for pricing logic
-- Drop existing function if it exists with different parameters
DROP FUNCTION IF EXISTS get_event_price_for_year(UUID, INTEGER);
DROP FUNCTION IF EXISTS get_event_price_for_year(uuid, integer);

CREATE OR REPLACE FUNCTION get_event_price_for_year(event_id_param UUID, year_param INTEGER)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  event_record RECORD;
  price DECIMAL(10,2) := 0;
BEGIN
  SELECT * INTO event_record FROM events WHERE id = event_id_param;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- If pricing type is fixed, return the base price
  IF event_record.pricing_type = 'fixed' THEN
    RETURN COALESCE(event_record.price, 0);
  END IF;
  
  -- If year is in free_for_years, return 0
  IF year_param = ANY(event_record.free_for_years) THEN
    RETURN 0;
  END IF;
  
  -- If year is in paid_for_years, get specific price or base price
  IF year_param = ANY(event_record.paid_for_years) THEN
    -- Check for year-specific pricing first
    IF event_record.year_specific_pricing ? year_param::text THEN
      price := (event_record.year_specific_pricing ->> year_param::text)::DECIMAL(10,2);
    ELSE
      price := COALESCE(event_record.base_price, event_record.price, 0);
    END IF;
    RETURN price;
  END IF;
  
  -- Default to base price
  RETURN COALESCE(event_record.base_price, event_record.price, 0);
END;
$$ LANGUAGE plpgsql;

-- Create function to check if event is free for a specific year
-- Drop existing function if it exists with different parameters
DROP FUNCTION IF EXISTS is_event_free_for_year(UUID, INTEGER);
DROP FUNCTION IF EXISTS is_event_free_for_year(uuid, integer);

CREATE OR REPLACE FUNCTION is_event_free_for_year(event_id_param UUID, year_param INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  event_record RECORD;
BEGIN
  SELECT * INTO event_record FROM events WHERE id = event_id_param;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- If pricing type is fixed, check if price is 0
  IF event_record.pricing_type = 'fixed' THEN
    RETURN COALESCE(event_record.price, 0) = 0;
  END IF;
  
  -- Check if year is in free_for_years
  RETURN year_param = ANY(event_record.free_for_years);
END;
$$ LANGUAGE plpgsql;

-- Update RLS policies to allow proper access to events
DROP POLICY IF EXISTS "Events are viewable by everyone" ON events;
DROP POLICY IF EXISTS "Events are manageable by admins" ON events;

CREATE POLICY "Events are viewable by everyone" ON events
  FOR SELECT USING (true);

CREATE POLICY "Events are manageable by admins" ON events
  FOR ALL USING (
    auth.role() = 'service_role' OR 
    auth.jwt() ->> 'email' IN (
      SELECT email FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_pricing_type ON events(pricing_type);
CREATE INDEX IF NOT EXISTS idx_events_free_for_years ON events USING GIN(free_for_years);
CREATE INDEX IF NOT EXISTS idx_events_paid_for_years ON events USING GIN(paid_for_years);

-- Add comments for documentation
COMMENT ON COLUMN events.pricing_type IS 'Type of pricing: fixed (single price) or year_based (different prices per year)';
COMMENT ON COLUMN events.free_for_years IS 'Array of years that get free entry (e.g., [1, 2] for 1st and 2nd year)';
COMMENT ON COLUMN events.paid_for_years IS 'Array of years that need to pay (e.g., [3, 4] for 3rd and 4th year)';
COMMENT ON COLUMN events.base_price IS 'Base price for paid events (used when no year-specific pricing)';
COMMENT ON COLUMN events.year_specific_pricing IS 'JSON object with year-specific prices (e.g., {"2": 50, "3": 75, "4": 100})';

-- Test the functions with sample data
-- You can uncomment these to test:
-- SELECT get_event_price_for_year('your-event-id', 1); -- Should return 0 for 1st year
-- SELECT get_event_price_for_year('your-event-id', 3); -- Should return specific price for 3rd year
-- SELECT is_event_free_for_year('your-event-id', 1); -- Should return true for 1st year
-- SELECT is_event_free_for_year('your-event-id', 3); -- Should return false for 3rd year
