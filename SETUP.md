# 🚀 Quick Setup Guide - Fresher's Party 2K25

## Prerequisites
- Node.js (v16+)
- Supabase account
- Git

## Step 1: Project Setup
```bash
cd freshers-party-2k25
npm install
```

## Step 2: Supabase Configuration

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for project to be ready

### 2.2 Database Setup
1. Go to SQL Editor in your Supabase dashboard
2. Run the schema from `supabase-schema.sql`
3. (Optional) Run `demo-data.sql` for sample data

### 2.3 Get API Keys
1. Go to Settings > API
2. Copy your Project URL and anon key

### 2.4 Environment Variables
Update `.env.local` with your credentials:
```env
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
REACT_APP_PHONEPE_MERCHANT_ID=your_phonep_merchant_id_here
REACT_APP_PHONEPE_SALT_KEY=your_phonep_salt_key_here
REACT_APP_PHONEPE_SALT_INDEX=1
REACT_APP_BASE_URL=http://localhost:3000
```

### 2.5 Create Admin User
1. Go to Authentication > Users in Supabase
2. Click "Add user"
3. Email: `admin@freshersparty.com`
4. Password: `admin123`
5. Confirm email: Yes

## Step 3: Run the Application
```bash
npm start
```

The app will open at `http://localhost:3000`

## Step 4: Test the Application

### Public Features
1. **Landing Page**: Visit `/` to see the event page
2. **Fresher Registration**: Click "Register as Fresher" (free)
3. **Visitor Registration**: Click "Register as Visitor" (₹99)
4. **Payment Flow**: Test the payment process
5. **Ticket Generation**: Download QR tickets

### Admin Features
1. **Admin Login**: Visit `/admin`
2. **Login**: Use `admin@freshersparty.com` / `admin123`
3. **Dashboard**: View registrations and statistics
4. **QR Scanner**: Test QR code scanning
5. **Export**: Download CSV data

## 🎯 Key Features Implemented

### ✅ Public Website
- Modern landing page with party theme
- Responsive design for mobile/desktop
- Registration forms for freshers and visitors
- PhonePe payment integration (demo mode)
- QR code ticket generation
- Animated fresher hype page
- Download tickets as PNG/PDF

### ✅ Admin Dashboard
- Secure authentication
- Real-time registration management
- QR code scanner for entry verification
- Live statistics and analytics
- CSV export functionality
- Check-in system
- Mobile-responsive design

### ✅ Technical Features
- React 19 + TypeScript
- Chakra UI for modern design
- Framer Motion for animations
- Supabase for backend
- QR code generation and scanning
- File download capabilities
- Performance optimized for 200+ users

## 🔧 Customization

### Change Event Details
Edit `src/pages/LandingPage.tsx` to update:
- Event title
- Date and time
- Venue
- Description

### Modify Payment Amount
Update the price in:
- `src/pages/PaymentPage.tsx`
- `src/pages/LandingPage.tsx`

### Customize Theme
Edit colors in `src/App.tsx`:
```typescript
colors: {
  neon: {
    pink: '#ff0080',
    blue: '#00ffff',
    green: '#00ff00',
    // ... add more colors
  }
}
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Netlify
1. Run `npm run build`
2. Deploy `build` folder
3. Add environment variables

## 📱 Mobile Testing
The app is fully responsive and tested on:
- iOS Safari
- Android Chrome
- Various screen sizes

## 🎉 You're Ready!

Your Fresher's Party 2K25 registration system is now ready to handle registrations and manage the event like a pro!

For support or questions, check the main README.md file.
