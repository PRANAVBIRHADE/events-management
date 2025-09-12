# Environment Setup Guide

## 🚨 Quick Fix for "supabaseUrl is required" Error

If you're seeing this error, follow these steps:

### Step 1: Create Environment File

Run this command in the `freshers-party-2k25/` directory:

```bash
npm run setup-env
```

OR manually create a file called `.env.local` in the `freshers-party-2k25/` directory with:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# PhonePe Configuration (Optional)
REACT_APP_PHONEPE_MERCHANT_ID=your_phonepe_merchant_id_here
REACT_APP_PHONEPE_SALT_KEY=your_phonepe_salt_key_here
REACT_APP_PHONEPE_SALT_INDEX=your_phonepe_salt_index_here
```

### Step 2: Get Your Supabase Credentials

1. Go to https://app.supabase.com/
2. Sign in and select your project
3. Go to **Settings** → **API**
4. Copy the **URL** and **anon/public** key
5. Replace the placeholders in your `.env.local` file

### Step 3: Restart Development Server

```bash
npm start
```

## 🐛 Debugging Environment Issues

Visit `http://localhost:3000/debug` to see detailed environment information.

## 📁 File Structure

Your `.env.local` file should be here:

```
freshers-party-2k25/
├── .env.local          ← HERE (same level as package.json)
├── package.json
├── src/
└── public/
```

## ✅ Verification

After setup, you should see in the browser console:

```
🔍 Environment Variables Check:
✅ Present: ["REACT_APP_SUPABASE_URL", "REACT_APP_SUPABASE_ANON_KEY"]
❌ Missing: []
```

## 🆘 Still Having Issues?

1. Check that `.env.local` is in the correct directory
2. Make sure there are no spaces around the `=` sign
3. Ensure you've restarted the development server
4. Visit `/debug` page for detailed diagnostics
5. Check `CREDENTIALS_SETUP.md` for detailed Supabase setup instructions
