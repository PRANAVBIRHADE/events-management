-- Update Events Schema for College Event Portal
-- Add event categories and enhanced event management

-- Add event category column to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS event_type VARCHAR(50) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS organizer VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS requirements TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Update the constraint for event categories
ALTER TABLE events 
DROP CONSTRAINT IF EXISTS events_category_check;

ALTER TABLE events 
ADD CONSTRAINT events_category_check 
CHECK (category IN ('sports', 'cultural', 'technical', 'academic', 'social', 'general'));

-- Update the constraint for event types
ALTER TABLE events 
DROP CONSTRAINT IF EXISTS events_event_type_check;

ALTER TABLE events 
ADD CONSTRAINT events_event_type_check 
CHECK (event_type IN ('free', 'paid', 'invitation_only'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_price ON events(price);

-- Update existing events to have proper categories
UPDATE events 
SET category = 'social', 
    event_type = 'free',
    price = 0.00
WHERE name ILIKE '%fresher%' OR name ILIKE '%party%';

-- Insert sample events for different categories
INSERT INTO events (name, description, event_date, location, max_capacity, category, event_type, price, organizer, contact_email) VALUES
('Basketball Tournament', 'Annual inter-college basketball championship. Show your skills and compete for the trophy!', 
 '2025-03-01 09:00:00+05:30', 'Sports Complex', 100, 'sports', 'free', 0.00, 'Sports Committee', 'sports@college.edu'),

('Cultural Fest 2025', 'A grand celebration of arts, music, dance, and drama. Performances by students and guest artists.', 
 '2025-03-15 18:00:00+05:30', 'Main Auditorium', 800, 'cultural', 'paid', 150.00, 'Cultural Committee', 'cultural@college.edu'),

('Tech Symposium', 'Latest trends in technology, AI, and innovation. Workshops and presentations by industry experts.', 
 '2025-04-01 10:00:00+05:30', 'Computer Lab', 200, 'technical', 'free', 0.00, 'CS Department', 'tech@college.edu'),

('Science Fair', 'Exhibition of innovative projects and research by students. Open to all science enthusiasts.', 
 '2025-04-10 09:00:00+05:30', 'Science Block', 300, 'academic', 'free', 0.00, 'Science Department', 'science@college.edu'),

('Alumni Meet', 'Annual gathering of college alumni. Networking, reminiscing, and building connections.', 
 '2025-04-20 17:00:00+05:30', 'Conference Hall', 150, 'social', 'paid', 200.00, 'Alumni Association', 'alumni@college.edu');

-- Create view for event statistics
CREATE OR REPLACE VIEW event_statistics AS
SELECT 
  e.id,
  e.name,
  e.category,
  e.event_type,
  e.price,
  e.max_capacity,
  e.current_registrations,
  e.is_active,
  COUNT(fr.id) as fresher_registrations,
  COUNT(str.id) as senior_registrations,
  COUNT(fr.id) + COUNT(str.id) as total_registrations
FROM events e
LEFT JOIN freshers_registrations fr ON e.id = fr.event_id
LEFT JOIN senior_ticket_registrations str ON e.id = str.event_id
GROUP BY e.id, e.name, e.category, e.event_type, e.price, e.max_capacity, e.current_registrations, e.is_active;

-- Update RLS policies for events
DROP POLICY IF EXISTS "Anyone can view active events" ON events;
CREATE POLICY "Anyone can view active events" ON events
  FOR SELECT USING (is_active = true);

-- Allow authenticated users to view all events (for better UX)
CREATE POLICY "Authenticated users can view all events" ON events
  FOR SELECT USING (auth.role() = 'authenticated');

-- Update the admin policy to be more flexible
DROP POLICY IF EXISTS "Admins can manage events" ON events;
CREATE POLICY "Admins can manage events" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.email = 'admin@spark2k25.com' OR auth.users.email LIKE '%@college.edu')
    )
  );

-- Add helpful comments
COMMENT ON COLUMN events.category IS 'Event category: sports, cultural, technical, academic, social, general';
COMMENT ON COLUMN events.event_type IS 'Event type: free, paid, invitation_only';
COMMENT ON COLUMN events.price IS 'Event price in INR (0.00 for free events)';
COMMENT ON COLUMN events.registration_deadline IS 'Last date for registration';
COMMENT ON COLUMN events.tags IS 'Array of tags for better searchability';
