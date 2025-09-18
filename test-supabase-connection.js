// Simple test to check Supabase connection
const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual values
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error);
      return;
    }
    
    console.log('✅ Basic connection successful');
    
    // Test 2: Simple count query
    console.log('2. Testing count query...');
    const startTime = Date.now();
    const { data: countData, error: countError } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });
    
    const endTime = Date.now();
    console.log(`✅ Count query completed in ${endTime - startTime}ms`);
    console.log('Count result:', countData);
    
    if (countError) {
      console.error('❌ Count query failed:', countError);
    }
    
    // Test 3: Simple select query
    console.log('3. Testing select query...');
    const selectStartTime = Date.now();
    const { data: selectData, error: selectError } = await supabase
      .from('user_profiles')
      .select('id, full_name, email')
      .limit(5);
    
    const selectEndTime = Date.now();
    console.log(`✅ Select query completed in ${selectEndTime - selectStartTime}ms`);
    console.log('Select result:', selectData);
    
    if (selectError) {
      console.error('❌ Select query failed:', selectError);
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testConnection();
