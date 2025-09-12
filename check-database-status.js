// Database Status Checker for Spark 2K25 ⚡
// This script checks if your database needs migration

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

async function checkDatabaseStatus() {
  console.log('🔍 Checking database status...\n');
  
  let needsMigration = false;
  
  try {
    // Check if user_profiles table exists
    console.log('📋 Checking user_profiles table...');
    const { data: profilesData, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (profilesError && profilesError.code === 'PGRST116') {
      console.log('❌ user_profiles table does not exist');
      needsMigration = true;
    } else {
      console.log('✅ user_profiles table exists');
    }

    // Check if registrations has user_id column
    console.log('📋 Checking registrations.user_id column...');
    const { data: regData, error: regError } = await supabase
      .from('registrations')
      .select('user_id')
      .limit(1);
    
    if (regError && regError.message.includes('user_id')) {
      console.log('❌ user_id column does not exist in registrations');
      needsMigration = true;
    } else {
      console.log('✅ user_id column exists in registrations');
    }

    // Check registration_type constraint
    console.log('📋 Checking registration_type constraint...');
    const { data: constraintData, error: constraintError } = await supabase
      .from('registrations')
      .select('registration_type')
      .eq('registration_type', 'visitor')
      .limit(1);
    
    if (!constraintError && constraintData && constraintData.length > 0) {
      console.log('⚠️  Found "visitor" registrations - constraint may need updating');
      needsMigration = true;
    } else {
      console.log('✅ Registration type constraint appears correct');
    }

    // Check if auth is enabled
    console.log('📋 Checking Supabase Auth status...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Supabase Auth not properly configured');
      needsMigration = true;
    } else {
      console.log('✅ Supabase Auth is working');
    }

    console.log('\n' + '='.repeat(50));
    
    if (needsMigration) {
      console.log('🚨 MIGRATION NEEDED');
      console.log('');
      console.log('Your database needs to be updated to support user authentication.');
      console.log('');
      console.log('📋 To migrate:');
      console.log('   1. Run: node migrate-database.js');
      console.log('   2. Or manually run supabase-schema-updated.sql');
      console.log('');
      console.log('📖 See DATABASE_MIGRATION.md for detailed instructions');
    } else {
      console.log('✅ DATABASE UP TO DATE');
      console.log('');
      console.log('Your database is ready for user authentication!');
      console.log('You can start using the registration system with passwords.');
    }

  } catch (error) {
    console.error('❌ Error checking database status:', error.message);
    console.log('');
    console.log('💡 This might indicate:');
    console.log('   - Database connection issues');
    console.log('   - Missing environment variables');
    console.log('   - Supabase project not properly set up');
  }
}

checkDatabaseStatus();
