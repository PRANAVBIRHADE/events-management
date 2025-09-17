import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import EventRegistrationPage from './pages/EventRegistrationPage';
import UserProfilePage from './pages/UserProfilePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => (
  <ChakraProvider>
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/event/:eventId" element={<EventRegistrationPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/admin-dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ChakraProvider>
);

export default App;
