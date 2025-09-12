# New User Flow Setup Guide for Spark 2K25 ⚡

## 🎯 **Overview**
This guide helps you set up the new streamlined user flow where users sign up once and are automatically categorized as freshers or seniors based on their studying year.

## 🔄 **New User Flow**

### **Step 1: Landing Page**
- Users see **Login** and **Sign Up** buttons
- Single call-to-action: **"Get Started Now! 🚀"**

### **Step 2: Signup Form**
- **Basic Information**: Name, Email, Mobile
- **Year Selection**: 1st, 2nd, 3rd, or 4th year
- **Password**: For account creation
- **Dynamic Pricing**: Shows FREE for 1st year, ₹99 for others

### **Step 3: Automatic Processing**
- **1st Year** → Fresher (Free) → Hype Page
- **2nd/3rd/4th Year** → Senior (₹99) → Payment Page

## 🛠️ **Database Setup**

### **Option 1: Manual Setup (Recommended)**
1. **Go to Supabase Dashboard** → Your Project
2. **Navigate to SQL Editor**
3. **Copy and paste** the contents of `update-database-for-new-flow.sql`
4. **Click Run** to execute the update

### **Option 2: Verification**
After running the SQL, verify everything is working:
```bash
npm run verify-db
```

## 📊 **Database Changes**

### **What Gets Updated:**
- ✅ **Registration type** from 'visitor' to 'senior'
- ✅ **User ID column** added to registrations
- ✅ **User profiles table** created
- ✅ **Automatic user profile creation** trigger
- ✅ **RLS policies** for data protection

### **New Tables:**
- **`user_profiles`** - Additional user information
- **`registrations`** - Now linked to user accounts

## 🎨 **New Pages Created**

### **Landing Page (`/`)**
- **Login & Sign Up** buttons in header
- **Single call-to-action** button
- **Clean, modern design**

### **Signup Page (`/user-signup`)**
- **Complete user form** with year selection
- **Dynamic pricing display**
- **Real-time validation**
- **Beautiful animations**

### **Existing Pages (Updated)**
- **Login Page** - For existing users
- **User Dashboard** - For ticket management
- **Payment Page** - For senior registrations
- **Admin Dashboard** - For event management

## 🚀 **Testing the New Flow**

### **Test Fresher Registration:**
1. Go to **Landing Page**
2. Click **"Get Started Now! 🚀"**
3. Fill form with **1st Year** selected
4. Should see **"FREE"** pricing
5. Submit → Should go to **Hype Page**

### **Test Senior Registration:**
1. Go to **Landing Page**
2. Click **"Get Started Now! 🚀"**
3. Fill form with **2nd/3rd/4th Year** selected
4. Should see **"₹99"** pricing
5. Submit → Should go to **Payment Page**

### **Test Login:**
1. Click **"Login"** on landing page
2. Use email/password from registration
3. Should go to **User Dashboard**

## 🔧 **Troubleshooting**

### **Common Issues:**
1. **"Registration type constraint"** - Run the SQL update
2. **"User not found"** - Check if user was created in Supabase Auth
3. **"Permission denied"** - Check RLS policies

### **Verification Commands:**
```bash
# Check database status
npm run check-db

# Verify new flow setup
npm run verify-db

# Start development server
npm start
```

## ✅ **Success Indicators**

### **Database:**
- ✅ `user_profiles` table exists
- ✅ `registrations` has `user_id` column
- ✅ Registration type allows 'senior'
- ✅ No 'visitor' registrations exist

### **Application:**
- ✅ Landing page shows Login/Sign Up buttons
- ✅ Signup form works with year selection
- ✅ Freshers get free registration
- ✅ Seniors get ₹99 registration
- ✅ Users can login after registration

## 🎉 **Benefits of New Flow**

- **🎯 Simplified** - Single signup form
- **💰 Smart Pricing** - Automatic based on year
- **🔐 Secure** - Password-protected accounts
- **📱 User-Friendly** - Clear, intuitive flow
- **⚡ Efficient** - No confusion about registration types

---

**Your Spark 2K25 ⚡ website now has a perfect user flow! Users sign up once, select their year, and get automatically categorized! 🚀**
