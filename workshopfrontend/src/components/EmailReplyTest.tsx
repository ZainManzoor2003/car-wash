import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { API_BASE_URL } from '../config';

const EmailReplyTest: React.FC = () => {
  const [bookingId, setBookingId] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [message, setMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const testEmailReply = async () => {
    if (!bookingId || !customerEmail || !message) {
      setResult('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/test-email-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          customerEmail,
          message,
          customerName: customerName || 'Test Customer'
        })
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ background: '#111', minHeight: '100vh', padding: '48px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '2.2rem', marginBottom: '24px' }}>
            🧪 Email Reply Test
          </h1>
          
          <div style={{ 
            background: '#181818', 
            borderRadius: '16px', 
            padding: '32px',
            border: '1px solid #232323',
            marginBottom: '24px'
          }}>
            <h2 style={{ color: '#ffd700', fontSize: '1.5rem', marginBottom: '20px' }}>
              Test Email Reply Functionality
            </h2>
            
            <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Booking ID *
                </label>
                <input
                  type="text"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="Enter booking ID"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    background: '#232323',
                    color: '#fff',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Customer Email *
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Enter customer email"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    background: '#232323',
                    color: '#fff',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Customer Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name (optional)"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    background: '#232323',
                    color: '#fff',
                    fontSize: '16px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ color: '#fff', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Message *
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter the message content"
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    background: '#232323',
                    color: '#fff',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
            
            <button
              onClick={testEmailReply}
              disabled={loading}
              style={{
                background: loading ? '#444' : '#ffd700',
                color: loading ? '#888' : '#111',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Testing...' : '🧪 Test Email Reply'}
            </button>
          </div>
          
          {result && (
            <div style={{ 
              background: '#181818', 
              borderRadius: '16px', 
              padding: '24px',
              border: '1px solid #232323'
            }}>
              <h3 style={{ color: '#ffd700', fontSize: '1.3rem', marginBottom: '16px' }}>
                Test Result
              </h3>
              <pre style={{
                background: '#232323',
                padding: '16px',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                {result}
              </pre>
            </div>
          )}
          
          <div style={{ 
            background: '#181818', 
            borderRadius: '16px', 
            padding: '24px',
            border: '1px solid #232323',
            marginTop: '24px'
          }}>
            <h3 style={{ color: '#ffd700', fontSize: '1.3rem', marginBottom: '16px' }}>
              📋 Instructions
            </h3>
            <ol style={{ color: '#fff', lineHeight: '1.6', paddingLeft: '20px' }}>
              <li>Get a booking ID from your admin dashboard</li>
              <li>Enter the customer email associated with that booking</li>
              <li>Type a test message</li>
              <li>Click "Test Email Reply"</li>
              <li>Check the admin dashboard to see if the message appears</li>
              <li>Check the backend console for detailed logs</li>
            </ol>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EmailReplyTest; 