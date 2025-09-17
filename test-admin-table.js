// Test script to check admin_users table
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.log('REACT_APP_SUPABASE_URL:', supabaseUrl);
  console.log('REACT_APP_SUPABASE_ANON_KEY:', supabaseKey ? 'Present' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminTable() {
  try {
    console.log('🔍 Testing admin_users table...');
    
    // Test 1: Check if table exists and is accessible
    console.log('📊 Querying admin_users table...');
    const { data, error } = await supabase
      .from('admin_users')
      .select('*');
    
    if (error) {
      console.error('❌ Error querying admin_users:', error);
      return;
    }
    
    console.log('✅ admin_users table accessible');
    console.log('📋 Data:', data);
    
    // Test 2: Check specific admin user
    console.log('🔍 Checking for admin@spark2k25.com...');
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'admin@spark2k25.com')
      .single();
    
    if (adminError) {
      console.error('❌ Error finding admin user:', adminError);
    } else {
      console.log('✅ Admin user found:', adminData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAdminTable();
