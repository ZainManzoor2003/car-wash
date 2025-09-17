import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { API_BASE_URL } from '../config';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setMessage(data.message || 'If this email is registered, you will receive password reset instructions.');
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ background: '#111', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
        <div style={{ background: '#181818', borderRadius: 16, boxShadow: '0 4px 24px #0006', padding: 32, minWidth: 340, maxWidth: 380, width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '2rem', marginBottom: 32, textAlign: 'center' }}>Forgot Password</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <label htmlFor="email" style={{ color: '#eaeaea', fontWeight: 500, marginBottom: 4 }}>Email</label>
            <input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            {message && <div style={{ color: 'green', marginBottom: 8 }}>{message}</div>}
            <button type="submit" style={{ background: '#ffd600', color: '#111', fontWeight: 600, border: 'none', borderRadius: 8, padding: '12px 0', fontSize: '1.1rem', marginTop: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 2px 8px #0003' }}>
              Send Reset Link
            </button>
          </form>
          <span style={{ fontSize: '0.98rem', color: '#ffd600', cursor: 'pointer', textAlign: 'center', marginTop: 12 }} onClick={() => navigate('/login')}>Back to Login</span>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ForgotPasswordPage; 