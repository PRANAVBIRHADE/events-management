#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Restarting Development Server...');
console.log('');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env.local file not found!');
  console.log('📝 Creating template .env.local file...');
  
  const envContent = `# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# PhonePe Configuration (Optional)
REACT_APP_PHONEPE_MERCHANT_ID=your_phonepe_merchant_id_here
REACT_APP_PHONEPE_SALT_KEY=your_phonepe_salt_key_here
REACT_APP_PHONEPE_SALT_INDEX=your_phonepe_salt_index_here`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local template');
    console.log('⚠️  Please edit .env.local with your actual Supabase credentials');
  } catch (error) {
    console.error('❌ Failed to create .env.local:', error.message);
  }
}

console.log('🧹 Clearing React cache and restarting...');
console.log('');

// Start the development server with cache reset
const child = spawn('npm', ['start', '--', '--reset-cache'], {
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  console.log(`\n🏁 Development server exited with code ${code}`);
});
