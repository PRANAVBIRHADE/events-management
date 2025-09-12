// Updated Supabase types for new database structure

export interface Event {
  id: string;
  name: string;
  description?: string;
  event_date: string;
  location?: string;
  max_capacity?: number;
  current_registrations: number;
  is_active: boolean;
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

// Union type for all registrations
export type Registration = FresherRegistration | SeniorTicketRegistration;

// Combined view type for admin dashboard
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

// Database response types
export interface Database {
  public: {
    Tables: {
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'current_registrations'>;
        Update: Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at' | 'is_verified' | 'last_login'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;
      };
      freshers_registrations: {
        Row: FresherRegistration;
        Insert: Omit<FresherRegistration, 'id' | 'created_at' | 'updated_at' | 'qr_code' | 'ticket_number' | 'is_checked_in' | 'checked_in_at'>;
        Update: Partial<Omit<FresherRegistration, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'event_id'>>;
      };
      senior_ticket_registrations: {
        Row: SeniorTicketRegistration;
        Insert: Omit<SeniorTicketRegistration, 'id' | 'created_at' | 'updated_at' | 'qr_code' | 'ticket_number' | 'is_checked_in' | 'checked_in_at'>;
        Update: Partial<Omit<SeniorTicketRegistration, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'event_id'>>;
      };
    };
    Views: {
      all_registrations: {
        Row: AllRegistration;
      };
    };
  };
}
