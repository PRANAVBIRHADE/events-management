# Spark 2K25 ⚡ - Event Registration System

A modern, responsive event registration system built with React, Chakra UI, and Supabase. This electrifying system handles both free fresher registrations and paid visitor registrations with QR code ticket generation and admin dashboard.

## 🚀 Features

### Public Website
- **Landing Page**: Modern design with event details and registration buttons
- **Registration Forms**: Separate flows for freshers (free) and visitors (paid)
- **Payment Integration**: PhonePe payment gateway integration for ₹99 visitor fee
- **QR Ticket System**: Automatic QR code generation and download options (PNG/PDF)
- **Fresher Hype Page**: Animated celebration page for 1st year students

### Admin Dashboard
- **Secure Authentication**: Supabase Auth integration
- **Registration Management**: View and manage all registrations
- **QR Code Scanner**: Real-time QR code scanning for entry verification
- **Live Statistics**: Real-time attendee counts and payment status
- **CSV Export**: Export registration data for analysis
- **Check-in System**: Mark attendees as checked in

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **UI Library**: Chakra UI
- **Animations**: Framer Motion
- **Backend**: Supabase (Database + Auth + Edge Functions)
- **Payments**: PhonePe API/SDK
- **QR Codes**: qrcode.react
- **QR Scanner**: @yudiel/react-qr-scanner
- **File Downloads**: html2canvas + jsPDF
- **Icons**: React Icons

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- PhonePe merchant account (for payments)

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
cd freshers-party-2k25
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase-schema.sql`
3. Go to Settings > API and copy your project URL and anon key
4. Update `.env.local` with your Supabase credentials:

```env
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
REACT_APP_PHONEPE_MERCHANT_ID=your_phonep_merchant_id_here
REACT_APP_PHONEPE_SALT_KEY=your_phonep_salt_key_here
REACT_APP_PHONEPE_SALT_INDEX=1
REACT_APP_BASE_URL=http://localhost:3000
```

### 3. PhonePe Setup (Optional for Demo)

For production, you'll need to:
1. Register with PhonePe for merchant account
2. Get your Merchant ID, Salt Key, and Salt Index
3. Update the environment variables
4. Implement proper payment verification in backend

### 4. Run the Application

```bash
npm start
```

The application will open at `http://localhost:3000`

## 📱 Usage

### For Students

1. **Visit the landing page** to see event details
2. **Choose registration type**:
   - Fresher (1st Year) - Free registration
   - Visitor (2nd/3rd/4th Year) - ₹99 payment required
3. **Fill registration form** with personal details
4. **Complete payment** (for visitors) or enjoy free registration (for freshers)
5. **Download ticket** with QR code for entry

### For Admins

1. **Access admin dashboard** at `/admin`
2. **Login with Supabase credentials**
3. **View registrations** in different tabs (All/Freshers/Visitors)
4. **Use QR scanner** to check in attendees
5. **Export data** as CSV for analysis

## 🎨 Customization

### Theme Colors
The app uses a party theme with neon colors. You can customize colors in `src/App.tsx`:

```typescript
const theme = extendTheme({
  colors: {
    neon: {
      pink: '#ff0080',
      blue: '#00ffff',
      green: '#00ff00',
      purple: '#8000ff',
      yellow: '#ffff00',
    }
  }
});
```

### Event Details
Update event information in the landing page component or fetch from Supabase events table.

## 🔧 Development

### Project Structure

```
src/
├── components/          # Reusable components
├── lib/                # Supabase configuration
├── pages/              # Page components
│   ├── LandingPage.tsx
│   ├── RegistrationPage.tsx
│   ├── PaymentPage.tsx
│   ├── TicketPage.tsx
│   ├── FresherHypePage.tsx
│   └── AdminDashboard.tsx
├── App.tsx             # Main app component
└── index.tsx           # Entry point
```

### Key Components

- **LandingPage**: Event showcase with registration buttons
- **RegistrationPage**: Form handling for both freshers and visitors
- **PaymentPage**: PhonePe integration and payment processing
- **TicketPage**: QR code generation and download functionality
- **FresherHypePage**: Animated celebration page for freshers
- **AdminDashboard**: Management interface with QR scanner

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Netlify

1. Build the project: `npm run build`
2. Deploy the `build` folder to Netlify
3. Add environment variables in Netlify dashboard

### Other Platforms

The app can be deployed to any platform that supports React applications.

## 🔒 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Secure authentication** with Supabase Auth
- **Input validation** on all forms
- **Payment verification** before ticket generation
- **QR code uniqueness** for each registration

## 📊 Performance

- **Optimized for 200+ concurrent users**
- **Lazy loading** for better performance
- **Efficient database queries** with proper indexing
- **Responsive design** for all devices
- **Fast QR code generation** and scanning

## 🐛 Troubleshooting

### Common Issues

1. **Supabase connection errors**: Check your environment variables
2. **Payment not working**: Verify PhonePe credentials
3. **QR scanner not working**: Ensure HTTPS in production
4. **Build errors**: Check for TypeScript errors and missing dependencies

### Debug Mode

Enable debug mode by adding to `.env.local`:
```env
REACT_APP_DEBUG=true
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support, email support@spark2k25.com or create an issue in the repository.

---

**Built with ⚡ for Spark 2K25**