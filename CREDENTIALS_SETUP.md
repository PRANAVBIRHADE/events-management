# 🔐 Credentials Setup Guide

This guide will help you set up Supabase and PhonePe credentials for your Fresher's Party 2K25 application.

## 📊 Supabase Setup

### 1. Create Account & Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up with GitHub, Google, or email
3. Click "New Project"
4. Fill in:
   - **Name**: `freshers-party-2k25`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
5. Click "Create new project"
6. Wait for setup to complete (2-3 minutes)

### 2. Get API Credentials
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon/Public Key**: `eyJ...` (long string)

### 3. Set Up Database
1. Go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase-schema.sql`
4. Click "Run" to create tables

### 4. Create Admin User
1. Go to **Authentication** → **Users**
2. Click "Add user"
3. Create an admin user with email and password
4. Note down these credentials for admin login

## 💳 PhonePe Setup

### 1. Create Business Account
1. Go to [https://developer.phonepe.com](https://developer.phonepe.com)
2. Click "Get Started"
3. Choose "Business Account"
4. Fill in business details:
   - Company name
   - Business type
   - Contact information
   - Bank account details

### 2. Complete KYC
Upload required documents:
- PAN card
- Business registration certificate
- Bank account details
- Address proof
- Wait for verification (1-3 business days)

### 3. Get API Credentials
1. Once approved, go to **Dashboard** → **API Keys**
2. Create new API key
3. Copy these values:
   - **Merchant ID** (MID)
   - **Salt Key** (for encryption)
   - **Salt Index** (usually 1)

### 4. Configure Webhook
Set up webhook URL: `https://your-domain.com/api/phonepe/webhook`

## 🔧 Environment Configuration

### 1. Update .env.local
Replace the placeholder values in `.env.local` with your actual credentials:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# PhonePe Configuration
REACT_APP_PHONEPE_MERCHANT_ID=YOUR_MERCHANT_ID
REACT_APP_PHONEPE_SALT_KEY=your_salt_key_here
REACT_APP_PHONEPE_SALT_INDEX=1
REACT_APP_PHONEPE_ENVIRONMENT=sandbox

# App Configuration
REACT_APP_APP_NAME=Fresher's Party 2K25
REACT_APP_APP_URL=http://localhost:3000
```

### 2. Test Configuration
1. Restart your development server: `npm start`
2. Check browser console for any configuration errors
3. Test registration and payment flow

## 🚀 Production Setup

### For Production Deployment:
1. Update `REACT_APP_PHONEPE_ENVIRONMENT=production`
2. Update `REACT_APP_APP_URL` to your production domain
3. Set up production webhook URL
4. Update Supabase RLS policies if needed

## 🔒 Security Notes

1. **Never commit `.env.local`** to version control
2. **Keep credentials secure** and don't share them
3. **Use environment variables** for all sensitive data
4. **Enable RLS** in Supabase for production
5. **Use HTTPS** in production for secure payments

## 🆘 Troubleshooting

### Common Issues:
1. **Supabase connection failed**: Check URL and API key
2. **PhonePe payment failed**: Verify merchant ID and salt key
3. **Database errors**: Ensure schema is properly set up
4. **CORS issues**: Check Supabase CORS settings

### Support:
- Supabase: [https://supabase.com/docs](https://supabase.com/docs)
- PhonePe: [https://developer.phonepe.com/docs](https://developer.phonepe.com/docs)

## 📋 Checklist

- [ ] Supabase account created
- [ ] Supabase project created
- [ ] Database schema imported
- [ ] Admin user created
- [ ] PhonePe business account created
- [ ] PhonePe KYC completed
- [ ] API credentials obtained
- [ ] .env.local file updated
- [ ] Application tested locally
- [ ] Production environment configured

---

**Note**: Keep this file secure and don't commit it to version control!
