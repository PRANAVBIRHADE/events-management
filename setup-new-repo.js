#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Setting up Spark 2K25 ⚡ for new repository...\n');

// Initialize git if not already done
try {
  execSync('git status', { stdio: 'pipe' });
  console.log('✅ Git repository already exists');
} catch (error) {
  console.log('📦 Initializing git repository...');
  execSync('git init', { stdio: 'inherit' });
  console.log('✅ Git initialized');
}

// Create .gitignore if it doesn't exist
if (!fs.existsSync('.gitignore')) {
  const gitignoreContent = `# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# IDE
.vscode/
.idea/

# OS
Thumbs.db
`;
  
  fs.writeFileSync('.gitignore', gitignoreContent);
  console.log('✅ .gitignore created');
}

// Add all files to git
console.log('📁 Adding files to git...');
execSync('git add .', { stdio: 'inherit' });

// Create initial commit
console.log('💾 Creating initial commit...');
execSync('git commit -m "Initial commit: Spark 2K25 ⚡ Event Management System"', { stdio: 'inherit' });

console.log('\n🎉 Repository setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Create a new repository on GitHub:');
console.log('   - Go to https://github.com/new');
console.log('   - Name: spark-2k25');
console.log('   - Description: Spark 2K25 ⚡ - Freshers Party Event Management System');
console.log('   - Make it Public');
console.log('   - Don\'t initialize with README');
console.log('\n2. Connect your local repository:');
console.log('   git remote add origin https://github.com/YOUR_USERNAME/spark-2k25.git');
console.log('   git branch -M main');
console.log('   git push -u origin main');
console.log('\n3. Deploy to Vercel:');
console.log('   - Go to https://vercel.com');
console.log('   - Import your GitHub repository');
console.log('   - Configure environment variables');
console.log('   - Deploy! 🚀');
