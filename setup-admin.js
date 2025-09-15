// Setup script to create admin user in Supabase
// Run this after setting up your Supabase project

const { createClient } = require('@supabase/supabase-js');

// Supabase creds from environment variables
// Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

// Admin credentials (can override via env)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@spark2k25.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAdmin() {
  try {
    console.log('Setting up admin user...');
    
    // Create admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });

    if (authError) {
      console.error('Error creating admin user:', authError);
      return;
    }

    console.log('Admin user created successfully:', authData.user.email);

    // Insert admin user record
    const { error: insertError } = await supabase
      .from('admin_users')
      .insert([
        {
          id: authData.user.id,
          email: ADMIN_EMAIL,
          name: 'Admin User',
          role: 'admin'
        }
      ]);

    if (insertError) {
      console.error('Error inserting admin user record:', insertError);
      return;
    }

    console.log('Admin user record created successfully');

    // Also mark is_admin in user_profiles if table exists
    try {
      await supabase
        .from('user_profiles')
        .upsert({
          user_id: authData.user.id,
          full_name: 'Admin User',
          mobile_number: '',
          studying_year: 4,
          is_admin: true,
        }, { onConflict: 'user_id' });
      console.log('user_profiles updated with is_admin = true');
    } catch (e) {
      console.log('Skipping user_profiles is_admin update (table may not exist or RLS prevents write).');
    }

    console.log('You can now login with:');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);

  } catch (error) {
    console.error('Setup error:', error);
  }
}

setupAdmin();
