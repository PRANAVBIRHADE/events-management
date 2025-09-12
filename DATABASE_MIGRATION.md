# Database Migration Guide for Spark 2K25 ⚡

## 🚀 Overview
This guide helps you update your Supabase database to support the new user authentication system.

## 📋 What Needs to be Updated

### 1. **Registration Type Change**
- Change `'visitor'` to `'senior'` in the database constraint
- Update any existing data if needed

### 2. **User Authentication Support**
- Add `user_id` column to link registrations to Supabase auth users
- Create `user_profiles` table for additional user information
- Set up automatic user profile creation

### 3. **Security Policies**
- Update Row Level Security (RLS) policies
- Ensure users can only access their own data

## 🛠️ Migration Options

### Option 1: Automatic Migration (Recommended)
```bash
# 1. Add your service role key to .env.local
echo "REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here" >> .env.local

# 2. Install dependencies
npm install @supabase/supabase-js dotenv

# 3. Run migration
node migrate-database.js
```

### Option 2: Manual Migration via Supabase Dashboard
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-schema-updated.sql`
4. Click **Run** to execute the migration

## 🔑 Getting Your Service Role Key

1. **Go to Supabase Dashboard** → Your Project
2. **Navigate to Settings** → **API**
3. **Copy the "service_role" key** (not the anon key)
4. **Add to .env.local:**
   ```
   REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

## 📊 Database Changes Summary

### New Tables:
- **`user_profiles`** - Stores additional user information linked to auth users

### Updated Tables:
- **`registrations`** - Added `user_id` column, updated constraint

### New Features:
- **Automatic user profile creation** when users sign up
- **User-specific data access** through RLS policies
- **Linked registrations** to user accounts

## ✅ Verification

After migration, verify:
1. **Registration form works** with password fields
2. **User accounts are created** during registration
3. **User dashboard shows** user's registrations
4. **Admin dashboard** still works for managing all registrations

## 🚨 Important Notes

- **Backup your data** before running migration
- **Test in development** first
- **Service role key** has full database access - keep it secure
- **Existing registrations** won't be linked to users until they log in

## 🆘 Troubleshooting

### Common Issues:
1. **"Permission denied"** - Check service role key
2. **"Constraint violation"** - Run migration again (idempotent)
3. **"Table already exists"** - Normal, migration is safe to run multiple times

### Need Help?
- Check Supabase logs in dashboard
- Verify environment variables
- Test with a fresh registration

---

**🎉 Once migration is complete, your Spark 2K25 ⚡ website will have full user authentication support!**
