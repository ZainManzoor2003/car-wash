import React from 'react';
import { Navigate } from 'react-router-dom';
import Home from './Home';

const ProtectedHome: React.FC = () => {
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  // If user is logged in as admin, redirect to dashboard
  if (token && role === 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // For regular users or non-logged in users, show the home page
  return <Home />;
};

export default ProtectedHome;
