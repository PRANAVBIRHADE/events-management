#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Fresher\'s Party 2K25 - Credentials Setup\n');

const questions = [
  {
    key: 'SUPABASE_URL',
    question: 'Enter your Supabase Project URL (https://your-project-id.supabase.co): ',
    validate: (value) => value.includes('supabase.co')
  },
  {
    key: 'SUPABASE_ANON_KEY',
    question: 'Enter your Supabase Anon Key (starts with eyJ...): ',
    validate: (value) => value.startsWith('eyJ')
  },
  {
    key: 'PHONEPE_MERCHANT_ID',
    question: 'Enter your PhonePe Merchant ID: ',
    validate: (value) => value.length > 0
  },
  {
    key: 'PHONEPE_SALT_KEY',
    question: 'Enter your PhonePe Salt Key: ',
    validate: (value) => value.length > 0
  },
  {
    key: 'PHONEPE_SALT_INDEX',
    question: 'Enter your PhonePe Salt Index (usually 1): ',
    validate: (value) => !isNaN(value) && parseInt(value) > 0
  }
];

const answers = {};

function askQuestion(index) {
  if (index >= questions.length) {
    generateEnvFile();
    return;
  }

  const question = questions[index];
  rl.question(question.question, (answer) => {
    if (question.validate(answer.trim())) {
      answers[question.key] = answer.trim();
      askQuestion(index + 1);
    } else {
      console.log('❌ Invalid input. Please try again.\n');
      askQuestion(index);
    }
  });
}

function generateEnvFile() {
  const envContent = `# Supabase Configuration
REACT_APP_SUPABASE_URL=${answers.SUPABASE_URL}
REACT_APP_SUPABASE_ANON_KEY=${answers.SUPABASE_ANON_KEY}

# PhonePe Configuration
REACT_APP_PHONEPE_MERCHANT_ID=${answers.PHONEPE_MERCHANT_ID}
REACT_APP_PHONEPE_SALT_KEY=${answers.PHONEPE_SALT_KEY}
REACT_APP_PHONEPE_SALT_INDEX=${answers.PHONEPE_SALT_INDEX}
REACT_APP_PHONEPE_ENVIRONMENT=sandbox

# App Configuration
REACT_APP_APP_NAME=Fresher's Party 2K25
REACT_APP_APP_URL=http://localhost:3000`;

  try {
    fs.writeFileSync('.env.local', envContent);
    console.log('\n✅ .env.local file created successfully!');
    console.log('\n🚀 Next steps:');
    console.log('1. Run: npm start');
    console.log('2. Test the application at http://localhost:3000');
    console.log('3. Check the CREDENTIALS_SETUP.md file for detailed setup instructions');
  } catch (error) {
    console.error('❌ Error creating .env.local file:', error.message);
  }

  rl.close();
}

console.log('This script will help you set up your environment variables.\n');
console.log('Make sure you have:');
console.log('1. Created a Supabase project');
console.log('2. Set up PhonePe business account');
console.log('3. Obtained all necessary API keys\n');

askQuestion(0);
