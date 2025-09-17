import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { API_BASE_URL } from '../config';

const LoginLogo = () => (
  <div style={{ textAlign: 'center', marginBottom: 32 }}>
    <img 
      id="imager11" 
      src="/nlogo.png" 
      alt="Reliable Mechanics Logo"
    />
  </div>
);

const LockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8, minWidth: 22 }}>
    <rect x="3" y="11" width="18" height="10" rx="4" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Check for navigation state on component mount
  useEffect(() => {
    if (location.state?.redirectTo) {
      console.log('🔍 Login - Redirect destination:', location.state.redirectTo);
      console.log('🔍 Login - Service info:', location.state.serviceInfo);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      
      // For admin users, always store the correct admin email
      if (data.role === 'admin') {
        localStorage.setItem('userEmail', 'j2mechanicslondon@gmail.com'); // Use correct admin email
      } else {
        localStorage.setItem('userEmail', email); // Store user email for regular users
      }
      
      if (data.role === 'admin') {
        // Check if there's a redirect destination with service info
        if (location.state?.redirectTo === '/dashboard' && location.state?.serviceInfo) {
          console.log('🔍 Login - Redirecting to dashboard with service info:', location.state.serviceInfo);
          navigate('/dashboard', { 
            state: location.state.serviceInfo 
          });
        } else {
          navigate('/dashboard');
        }
      } else {
        navigate('/user-dashboard'); // Redirect regular users to user dashboard
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <style>{`
        @media (max-width: 600px) {
          .login-card {
            padding: 18px !important;
            border-radius: 8px !important;
            min-width: 0 !important;
            width: 100% !important;
          }
          .login-card input {
            font-size: 0.98rem !important;
            padding: 8px 10px !important;
            border-radius: 6px !important;
          }
        }
        .login-card input {
          width: 100%;
          box-sizing: border-box;
          min-width: 0;
          max-width: 100%;
        }
      `}</style>
      <Navbar/>
      <div id="rrre">
      <div style={{ background: '#111', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
        <LoginLogo />
        <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '2rem', marginBottom: 32, textAlign: 'center' }}>Login to Dashboard</h2>
        <form className="login-card" onSubmit={handleSubmit} style={{ background: '#181818', borderRadius: 16, boxShadow: '0 4px 24px #0006', padding: 32, minWidth: 340, maxWidth: 380, width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <label htmlFor="email" style={{ color: '#eaeaea', fontWeight: 500, marginBottom: 4 }}>Email</label>
          <input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
          <label htmlFor="password" style={{ color: '#eaeaea', fontWeight: 500, marginBottom: 4 }}>Password</label>
          <input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.98rem', color: '#ffd600', cursor: 'pointer' }} onClick={() => navigate('/signup')}>Create Account</span>
            <span style={{ fontSize: '0.98rem', color: '#ffd600', cursor: 'pointer' }} onClick={() => navigate('/forgot-password')}>Forgotten Password?</span>
          </div>
          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
          <button type="submit" style={{ background: '#ffd600', color: '#111', fontWeight: 600, border: 'none', borderRadius: 8, padding: '12px 0', fontSize: '1.1rem', marginTop: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 2px 8px #0003' }}>
            <LockIcon /> Login
          </button>
        </form>
      </div>
      <Footer/>
      </div>
    </>
  );
};

export default LoginPage; 