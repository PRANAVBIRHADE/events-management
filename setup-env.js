#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envContent = `# Supabase Configuration
# Get these from your Supabase project dashboard: https://app.supabase.com/
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# PhonePe Configuration (Optional - for payment integration)
REACT_APP_PHONEPE_MERCHANT_ID=your_phonepe_merchant_id_here
REACT_APP_PHONEPE_SALT_KEY=your_phonepe_salt_key_here
REACT_APP_PHONEPE_SALT_INDEX=your_phonepe_salt_index_here`;

const envPath = path.join(__dirname, '.env.local');

console.log('🔧 Setting up environment configuration...');
console.log('📍 Creating .env.local file at:', envPath);

try {
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists. Backing up to .env.local.backup');
    fs.copyFileSync(envPath, envPath + '.backup');
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file successfully!');
  console.log('');
  console.log('🚨 IMPORTANT: Please edit .env.local and add your actual Supabase credentials:');
  console.log('   1. Replace "your-project-id" with your actual Supabase project ID');
  console.log('   2. Replace "your_supabase_anon_key_here" with your actual Supabase anon key');
  console.log('   3. Save the file');
  console.log('   4. Restart the development server (npm start)');
  console.log('');
  console.log('📚 Need help getting credentials? Check CREDENTIALS_SETUP.md');
  
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
  process.exit(1);
}
