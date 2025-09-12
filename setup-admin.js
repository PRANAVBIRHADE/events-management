// Setup script to create admin user in Supabase
// Run this after setting up your Supabase project

const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase URL and service role key
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseServiceKey = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAdmin() {
  try {
    console.log('Setting up admin user...');
    
    // Create admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@spark2k25.com',
      password: 'admin123',
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
          email: 'admin@spark2k25.com',
          name: 'Admin User',
          role: 'admin'
        }
      ]);

    if (insertError) {
      console.error('Error inserting admin user record:', insertError);
      return;
    }

    console.log('Admin user record created successfully');
    console.log('You can now login with:');
    console.log('Email: admin@spark2k25.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Setup error:', error);
  }
}

setupAdmin();
