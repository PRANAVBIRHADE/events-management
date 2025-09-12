// Script to verify database migration
const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'your_supabase_url_here';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your_supabase_anon_key_here';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
  console.log('🔍 Verifying database migration...\n');

  try {
    // Check if all tables exist
    console.log('1. Checking table existence...');
    
    const tables = ['events', 'user_profiles', 'freshers_registrations', 'senior_ticket_registrations'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table '${table}' - ERROR: ${error.message}`);
        } else {
          console.log(`✅ Table '${table}' - EXISTS`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}' - ERROR: ${err.message}`);
      }
    }

    // Check if sample event exists
    console.log('\n2. Checking sample event...');
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*');
    
    if (eventsError) {
      console.log(`❌ Events query failed: ${eventsError.message}`);
    } else {
      console.log(`✅ Found ${events.length} events`);
      if (events.length > 0) {
        console.log(`   Sample event: ${events[0].name}`);
      }
    }

    // Check if all_registrations view exists
    console.log('\n3. Checking all_registrations view...');
    const { data: allRegistrations, error: viewError } = await supabase
      .from('all_registrations')
      .select('*')
      .limit(1);
    
    if (viewError) {
      console.log(`❌ all_registrations view - ERROR: ${viewError.message}`);
    } else {
      console.log(`✅ all_registrations view - EXISTS`);
    }

    // Check RLS policies
    console.log('\n4. Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_rls_policies');
    
    if (policiesError) {
      console.log(`⚠️  Could not check RLS policies: ${policiesError.message}`);
      console.log('   (This is normal if the function doesn\'t exist)');
    } else {
      console.log(`✅ RLS policies checked`);
    }

    console.log('\n🎉 Migration verification complete!');
    console.log('\nNext steps:');
    console.log('1. Update your frontend code to use the new table structure');
    console.log('2. Test user registration flow');
    console.log('3. Test admin dashboard functionality');
    console.log('4. Update any hardcoded table references');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

// Run verification
verifyMigration();
