import React from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';

// Import pages
import LandingPage from './pages/LandingPage';
import EventsPage from './pages/EventsPage';
import ContactPage from './pages/ContactPage';
import PaymentPage from './pages/PaymentPage';
import TicketPage from './pages/TicketPage';
import FresherHypePage from './pages/FresherHypePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardNew from './pages/AdminDashboardNew';
import UserLoginPage from './pages/UserLoginPage';
import UserSignupPage from './pages/UserSignupPage';
import UserProfilePage from './pages/UserProfilePage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import EventRegistrationPage from './pages/EventRegistrationPage';
import DebugPage from './pages/DebugPage';
import MyTicketsPage from './pages/MyTicketsPage';
import UPIPaymentPage from './pages/UPIPaymentPage';
import PaymentPendingPage from './pages/PaymentPendingPage';
import { AuthProvider } from './contexts/AuthContext';

// Custom theme with party vibes
const theme = extendTheme({
  colors: {
    brand: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    neon: {
      pink: '#ff0080',
      blue: '#00ffff',
      green: '#00ff00',
      purple: '#8000ff',
      yellow: '#ffff00',
    }
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
      },
    },
  },
  components: {
    Button: {
      variants: {
        neon: {
          bg: 'neon.pink',
          color: 'white',
          _hover: {
            bg: 'neon.blue',
            transform: 'scale(1.05)',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
          },
          _active: {
            transform: 'scale(0.95)',
          },
          boxShadow: '0 0 15px rgba(255, 0, 128, 0.3)',
          transition: 'all 0.3s ease',
        },
        glow: {
          bg: 'transparent',
          border: '2px solid',
          borderColor: 'neon.blue',
          color: 'neon.blue',
          _hover: {
            bg: 'neon.blue',
            color: 'white',
            boxShadow: '0 0 25px rgba(0, 255, 255, 0.6)',
          },
        },
      },
    },
  },
});

const MotionDiv = motion.div;

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Router>
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/ticket" element={<TicketPage />} />
              <Route path="/fresher-hype" element={<FresherHypePage />} />
              <Route path="/admin-login" element={<AdminLoginPage />} />
              <Route path="/admin-dashboard" element={<AdminDashboardNew />} />
              <Route path="/user-login" element={<UserLoginPage />} />
              <Route path="/user-signup" element={<UserSignupPage />} />
              <Route path="/verify-email" element={<EmailVerificationPage />} />
              <Route path="/user-profile" element={<UserProfilePage />} />
              <Route path="/register/:eventId" element={<EventRegistrationPage />} />
              <Route path="/debug" element={<DebugPage />} />
              <Route path="/my-tickets" element={<MyTicketsPage />} />
              <Route path="/upi-payment" element={<UPIPaymentPage />} />
              <Route path="/payment-pending" element={<PaymentPendingPage />} />
            </Routes>
          </MotionDiv>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;