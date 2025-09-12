# Database Restructure Guide for Spark 2K25

## 🎯 Overview
This guide helps you migrate from the old database structure to the new, more organized structure with separate tables for freshers and senior registrations.

## 📊 New Database Structure

### Tables:
1. **`events`** - Event information
2. **`user_profiles`** - User account data (enhanced)
3. **`freshers_registrations`** - Free registrations for 1st year students
4. **`senior_ticket_registrations`** - Paid registrations for 2nd/3rd/4th year students

### Key Changes:
- ✅ Separate tables for freshers vs senior registrations
- ✅ Enhanced user_profiles with all user data
- ✅ Better organization of payment vs free registrations
- ✅ Improved RLS policies
- ✅ Combined view for admin dashboard

## 🚀 Migration Steps

### Step 1: Backup Current Data (IMPORTANT!)
```sql
-- Export current data before migration
-- This is a safety measure in case you need to rollback
```

### Step 2: Run the Migration Script
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `updated-database-schema.sql`
4. Execute the script

### Step 3: Verify Migration
```sql
-- Check if tables were created successfully
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('events', 'user_profiles', 'freshers_registrations', 'senior_ticket_registrations');

-- Check if sample event was inserted
SELECT * FROM events;

-- Check if the combined view exists
SELECT * FROM all_registrations LIMIT 5;
```

## 🔧 Frontend Updates Required

After running the migration, you'll need to update the frontend code to work with the new table structure:

### 1. Update Registration Logic
- Freshers (1st year) → `freshers_registrations` table
- Seniors (2nd/3rd/4th year) → `senior_ticket_registrations` table

### 2. Update Admin Dashboard
- Use `all_registrations` view for combined data
- Separate CSV exports for freshers and seniors

### 3. Update User Dashboard
- Query appropriate table based on user type
- Handle different registration flows

## 📋 Migration Checklist

- [ ] Backup current database
- [ ] Run migration script in Supabase
- [ ] Verify all tables created successfully
- [ ] Check RLS policies are working
- [ ] Test user registration flow
- [ ] Test admin dashboard functionality
- [ ] Update frontend code (next step)

## ⚠️ Important Notes

1. **Data Loss Warning**: This migration will drop existing tables. Make sure to backup any important data first.

2. **User Accounts**: Existing user accounts will need to be recreated as the user_profiles table structure has changed.

3. **Registrations**: All existing registrations will be lost and need to be recreated.

4. **Testing**: Test thoroughly in a development environment before applying to production.

## 🆘 Rollback Plan

If you need to rollback:
1. Restore from your backup
2. Or run the previous database schema script
3. Contact support if you encounter issues

## 📞 Support

If you encounter any issues during migration, check:
1. Supabase logs for errors
2. RLS policy conflicts
3. Foreign key constraint violations
4. Permission issues

---

**Ready to migrate? Run the `updated-database-schema.sql` script in your Supabase SQL Editor!**
