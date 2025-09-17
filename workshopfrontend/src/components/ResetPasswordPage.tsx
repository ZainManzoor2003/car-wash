import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { API_BASE_URL } from '../config';

function useQuery() {
  return new URLSearchParams(useParams().search);
}

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const query = useQuery();
  const token = query.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!password) {
      setError('Please enter a new password.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Password has been reset.');
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ background: '#111', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
        <div style={{ background: '#181818', borderRadius: 16, boxShadow: '0 4px 24px #0006', padding: 32, minWidth: 340, maxWidth: 380, width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '2rem', marginBottom: 32, textAlign: 'center' }}>Reset Password</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <label htmlFor="password" style={{ color: '#eaeaea', fontWeight: 500, marginBottom: 4 }}>New Password</label>
            <input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', marginBottom: 8 }} />
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            {message && <div style={{ color: 'green', marginBottom: 8 }}>{message}</div>}
            <button type="submit" style={{ background: '#ffd600', color: '#111', fontWeight: 600, border: 'none', borderRadius: 8, padding: '12px 0', fontSize: '1.1rem', marginTop: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 2px 8px #0003' }}>
              Reset Password
            </button>
          </form>
          <span style={{ fontSize: '0.98rem', color: '#ffd600', cursor: 'pointer', textAlign: 'center', marginTop: 12 }} onClick={() => navigate('/login')}>Back to Login</span>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ResetPasswordPage; 