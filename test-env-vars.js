// Test script to check environment variables
console.log('=== Environment Variables Test ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Set (length: ' + process.env.REACT_APP_SUPABASE_ANON_KEY.length + ')' : 'Not set');

// Test if we can create a Supabase client
try {
  const { createClient } = require('@supabase/supabase-js');
  
  if (process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_ANON_KEY) {
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.REACT_APP_SUPABASE_ANON_KEY
    );
    console.log('✅ Supabase client created successfully');
    
    // Test connection
    supabase.from('admin_users').select('count').then(({ data, error }) => {
      if (error) {
        console.log('❌ Database connection failed:', error.message);
      } else {
        console.log('✅ Database connection successful');
      }
    });
  } else {
    console.log('❌ Missing Supabase credentials');
  }
} catch (error) {
  console.log('❌ Error creating Supabase client:', error.message);
}
