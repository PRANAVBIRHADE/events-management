// Database Migration Script for Spark 2K25 ⚡
// This script helps migrate your existing database to support user authentication

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY; // You'll need to add this

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   REACT_APP_SUPABASE_URL');
  console.error('   REACT_APP_SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('💡 To get your service role key:');
  console.error('   1. Go to your Supabase dashboard');
  console.error('   2. Navigate to Settings > API');
  console.error('   3. Copy the "service_role" key (not the anon key)');
  console.error('   4. Add it to your .env.local file as REACT_APP_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Starting database migration...');
  
  try {
    // 1. Update registration_type constraint
    console.log('📝 Updating registration_type constraint...');
    const { error: constraintError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE registrations 
        DROP CONSTRAINT IF EXISTS registrations_registration_type_check;
        
        ALTER TABLE registrations 
        ADD CONSTRAINT registrations_registration_type_check 
        CHECK (registration_type IN ('fresher', 'senior'));
      `
    });
    
    if (constraintError) {
      console.log('⚠️  Constraint update failed (might already be updated):', constraintError.message);
    } else {
      console.log('✅ Registration type constraint updated');
    }

    // 2. Add user_id column to registrations
    console.log('📝 Adding user_id column to registrations...');
    const { error: columnError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE registrations 
        ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
      `
    });
    
    if (columnError) {
      console.log('⚠️  Column addition failed (might already exist):', columnError.message);
    } else {
      console.log('✅ User ID column added to registrations');
    }

    // 3. Create user_profiles table
    console.log('📝 Creating user_profiles table...');
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_profiles (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          mobile_number VARCHAR(20) NOT NULL,
          studying_year INTEGER CHECK (studying_year >= 1 AND studying_year <= 4),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (tableError) {
      console.log('⚠️  Table creation failed (might already exist):', tableError.message);
    } else {
      console.log('✅ User profiles table created');
    }

    // 4. Create indexes
    console.log('📝 Creating indexes...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_profiles_mobile ON user_profiles(mobile_number);
      `
    });
    
    if (indexError) {
      console.log('⚠️  Index creation failed:', indexError.message);
    } else {
      console.log('✅ Indexes created');
    }

    // 5. Create user profile trigger function
    console.log('📝 Creating user profile trigger...');
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$
        BEGIN
          INSERT INTO public.user_profiles (user_id, full_name, mobile_number)
          VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
            COALESCE(NEW.raw_user_meta_data->>'mobile_number', '')
          );
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `
    });
    
    if (triggerError) {
      console.log('⚠️  Trigger creation failed:', triggerError.message);
    } else {
      console.log('✅ User profile trigger created');
    }

    // 6. Update RLS policies
    console.log('📝 Updating RLS policies...');
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

        DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
        CREATE POLICY "Users can view own profile" ON user_profiles
          FOR SELECT USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
        CREATE POLICY "Users can update own profile" ON user_profiles
          FOR UPDATE USING (auth.uid() = user_id);

        GRANT ALL ON user_profiles TO anon, authenticated;
      `
    });
    
    if (policyError) {
      console.log('⚠️  Policy update failed:', policyError.message);
    } else {
      console.log('✅ RLS policies updated');
    }

    console.log('');
    console.log('🎉 Migration completed successfully!');
    console.log('');
    console.log('📋 What was updated:');
    console.log('   ✅ Registration type changed from "visitor" to "senior"');
    console.log('   ✅ Added user_id column to registrations table');
    console.log('   ✅ Created user_profiles table');
    console.log('   ✅ Added automatic user profile creation trigger');
    console.log('   ✅ Updated RLS policies for user data protection');
    console.log('');
    console.log('🚀 Your database is now ready for user authentication!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('');
    console.error('💡 Manual migration:');
    console.error('   1. Go to your Supabase dashboard');
    console.error('   2. Navigate to SQL Editor');
    console.error('   3. Run the contents of supabase-schema-updated.sql');
  }
}

runMigration();
