import { createClient } from '@supabase/supabase-js';
import { getEnvConfig, validateEnvironment, debugEnvironment } from '../config/environment';

// Get environment configuration safely
const envConfig = getEnvConfig();

// Debug in development
if (envConfig.isDevelopment) {
  debugEnvironment();
}

// Validate environment variables
const validation = validateEnvironment();

if (!validation.isValid) {
  const missingVars = validation.missing.join(', ');
  throw new Error(`
❌ Missing required environment variables: ${missingVars}

🔧 To fix this:
1. Create a file called ".env.local" in the freshers-party-2k25/ directory
2. Add these lines:
   ${validation.missing.map(varName => `${varName}=your_value_here`).join('\n   ')}
3. Replace the placeholder values with your actual Supabase credentials
4. Restart the development server: npm start

📍 Your .env.local file should be located at:
   freshers-party-2k25/.env.local (same directory as package.json)

📚 Need help getting credentials? Check CREDENTIALS_SETUP.md
🐛 For debugging, visit: http://localhost:3000/debug
  `);
}

// Create Supabase client
export const supabase = createClient(envConfig.supabaseUrl!, envConfig.supabaseAnonKey!);

// Database types for new schema
export interface Event {
  id: string;
  name: string;
  description?: string;
  event_date: string;
  location?: string;
  max_capacity?: number;
  current_registrations: number;
  is_active: boolean;
  category: 'sports' | 'cultural' | 'technical' | 'academic' | 'social' | 'general';
  event_type: 'free' | 'paid' | 'invitation_only';
  price: number;
  pricing_type?: 'fixed' | 'year_based';
  free_for_years?: number[];
  paid_for_years?: number[];
  base_price?: number;
  year_specific_pricing?: { [key: number]: number };
  registration_deadline?: string;
  image_url?: string;
  organizer?: string;
  contact_email?: string;
  contact_phone?: string;
  requirements?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  mobile_number?: string;
  studying_year: number;
  password_hash?: string;
  is_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface FresherRegistration {
  id: string;
  user_id: string;
  event_id: string;
  registration_type: 'fresher';
  full_name: string;
  mobile_number: string;
  email: string;
  studying_year: number;
  qr_code?: string;
  ticket_number?: string;
  is_checked_in: boolean;
  checked_in_at?: string;
  created_at: string;
  updated_at: string;
  event?: Event;
}

export interface SeniorTicketRegistration {
  id: string;
  user_id: string;
  event_id: string;
  registration_type: 'senior';
  full_name: string;
  mobile_number: string;
  email: string;
  studying_year: number;
  amount_paid: number;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_id?: string;
  payment_method?: string;
  qr_code?: string;
  ticket_number?: string;
  is_checked_in: boolean;
  checked_in_at?: string;
  created_at: string;
  updated_at: string;
  event?: Event;
}

export type Registration = FresherRegistration | SeniorTicketRegistration;

export interface AllRegistration {
  registration_type: 'fresher' | 'senior';
  id: string;
  user_id: string;
  event_id: string;
  full_name: string;
  mobile_number: string;
  email: string;
  studying_year: number;
  amount_paid?: number;
  payment_status?: string;
  qr_code?: string;
  ticket_number?: string;
  is_checked_in: boolean;
  checked_in_at?: string;
  created_at: string;
  updated_at: string;
}