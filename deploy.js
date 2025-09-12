#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Spark 2K25 ⚡ Deployment Helper\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Check if .env.local exists
if (!fs.existsSync('.env.local')) {
  console.log('⚠️  Warning: .env.local not found. Make sure to configure environment variables in Vercel.');
  console.log('   Required variables:');
  console.log('   - REACT_APP_SUPABASE_URL');
  console.log('   - REACT_APP_SUPABASE_ANON_KEY');
  console.log('   - REACT_APP_PHONEPE_MERCHANT_ID');
  console.log('   - REACT_APP_PHONEPE_SALT_KEY');
  console.log('   - REACT_APP_PHONEPE_SALT_INDEX\n');
}

// Check if git is initialized
try {
  execSync('git status', { stdio: 'pipe' });
  console.log('✅ Git repository found');
} catch (error) {
  console.log('⚠️  Git not initialized. Initializing...');
  try {
    execSync('git init', { stdio: 'inherit' });
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Initial commit"', { stdio: 'inherit' });
    console.log('✅ Git initialized and initial commit created');
  } catch (gitError) {
    console.error('❌ Error initializing git:', gitError.message);
  }
}

// Check if all dependencies are installed
console.log('\n📦 Checking dependencies...');
try {
  execSync('npm list --depth=0', { stdio: 'pipe' });
  console.log('✅ Dependencies are installed');
} catch (error) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed');
  } catch (installError) {
    console.error('❌ Error installing dependencies:', installError.message);
    process.exit(1);
  }
}

// Test build
console.log('\n🔨 Testing production build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Production build successful');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.log('\n🔧 Fix the build errors and try again.');
  process.exit(1);
}

// Check if build directory exists
if (fs.existsSync('build')) {
  console.log('✅ Build directory created successfully');
} else {
  console.error('❌ Build directory not found');
  process.exit(1);
}

console.log('\n🎉 Project is ready for deployment!');
console.log('\n📋 Next steps:');
console.log('1. Push your code to GitHub:');
console.log('   git add .');
console.log('   git commit -m "Ready for deployment"');
console.log('   git push origin main');
console.log('\n2. Go to https://vercel.com');
console.log('3. Import your GitHub repository');
console.log('4. Configure environment variables in Vercel dashboard');
console.log('5. Deploy! 🚀');
console.log('\n📖 For detailed instructions, see DEPLOYMENT_GUIDE.md');
