import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserLogin from '../components/UserLogin';

const UserLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/user-profile'); // Redirect to profile after login
  };

  return <UserLogin onLoginSuccess={handleLoginSuccess} />;
};

export default UserLoginPage;
