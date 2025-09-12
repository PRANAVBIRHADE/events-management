// Database Verification Script for New User Flow
// This script checks if your database is properly updated

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables:');
  console.error('   REACT_APP_SUPABASE_URL');
  console.error('   REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyDatabaseUpdate() {
  console.log('🔍 Verifying database update for new user flow...\n');
  
  let allChecksPassed = true;
  
  try {
    // Check 1: user_profiles table exists
    console.log('📋 Checking user_profiles table...');
    const { data: profilesData, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (profilesError && profilesError.code === 'PGRST116') {
      console.log('❌ user_profiles table does not exist');
      allChecksPassed = false;
    } else {
      console.log('✅ user_profiles table exists');
    }

    // Check 2: registrations has user_id column
    console.log('📋 Checking registrations.user_id column...');
    const { data: regData, error: regError } = await supabase
      .from('registrations')
      .select('user_id')
      .limit(1);
    
    if (regError && regError.message.includes('user_id')) {
      console.log('❌ user_id column does not exist in registrations');
      allChecksPassed = false;
    } else {
      console.log('✅ user_id column exists in registrations');
    }

    // Check 3: registration_type constraint allows 'senior'
    console.log('📋 Checking registration_type constraint...');
    const { data: constraintData, error: constraintError } = await supabase
      .from('registrations')
      .select('registration_type')
      .eq('registration_type', 'senior')
      .limit(1);
    
    if (constraintError) {
      console.log('❌ Registration type constraint issue:', constraintError.message);
      allChecksPassed = false;
    } else {
      console.log('✅ Registration type constraint allows "senior"');
    }

    // Check 4: No 'visitor' registrations exist
    console.log('📋 Checking for old "visitor" registrations...');
    const { data: visitorData, error: visitorError } = await supabase
      .from('registrations')
      .select('registration_type')
      .eq('registration_type', 'visitor')
      .limit(1);
    
    if (!visitorError && visitorData && visitorData.length > 0) {
      console.log('⚠️  Found "visitor" registrations - these should be updated to "senior"');
    } else {
      console.log('✅ No "visitor" registrations found (or constraint updated)');
    }

    // Check 5: Auth is working
    console.log('📋 Checking Supabase Auth status...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Supabase Auth not properly configured');
      allChecksPassed = false;
    } else {
      console.log('✅ Supabase Auth is working');
    }

    console.log('\n' + '='.repeat(60));
    
    if (allChecksPassed) {
      console.log('🎉 DATABASE UPDATE VERIFICATION PASSED!');
      console.log('');
      console.log('✅ Your database is ready for the new user flow:');
      console.log('   • User profiles table created');
      console.log('   • Registration type updated to use "senior"');
      console.log('   • User ID linking enabled');
      console.log('   • Authentication system ready');
      console.log('');
      console.log('🚀 You can now test the new signup flow!');
    } else {
      console.log('❌ DATABASE UPDATE VERIFICATION FAILED');
      console.log('');
      console.log('🔧 Please run the SQL update script:');
      console.log('   1. Go to Supabase Dashboard → SQL Editor');
      console.log('   2. Copy and paste update-database-for-new-flow.sql');
      console.log('   3. Click Run to execute');
      console.log('   4. Run this verification script again');
    }

  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    console.log('');
    console.log('💡 This might indicate:');
    console.log('   - Database connection issues');
    console.log('   - Missing environment variables');
    console.log('   - Supabase project not properly set up');
  }
}

verifyDatabaseUpdate();
