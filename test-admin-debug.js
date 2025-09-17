// Debug script to test admin_users table
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminTable() {
  try {
    console.log('🔍 Testing admin_users table access...');
    console.log('📊 Supabase URL:', supabaseUrl);
    console.log('🔑 Supabase Key:', supabaseKey ? 'Present' : 'Missing');
    
    // Test 1: Check if we can query the table at all
    console.log('📋 Testing basic table access...');
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Error accessing admin_users table:', error);
      return;
    }
    
    console.log('✅ admin_users table accessible');
    console.log('📊 Data found:', data);
    
    // Test 2: Check for specific admin user
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
    
    // Test 3: Test with timeout (like the app does)
    console.log('⏱️ Testing with 8-second timeout...');
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('admin_users check timeout')), 8000)
    );
    
    const queryPromise = supabase
      .from('admin_users')
      .select('id')
      .eq('email', 'admin@spark2k25.com')
      .eq('role', 'admin')
      .single();
    
    try {
      const result = await Promise.race([queryPromise, timeoutPromise]);
      console.log('✅ Query with timeout successful:', result);
    } catch (timeoutError) {
      console.error('❌ Query timed out:', timeoutError.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAdminTable();
