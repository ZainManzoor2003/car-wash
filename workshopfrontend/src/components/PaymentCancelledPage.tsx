import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const PaymentCancelledPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToCart = () => {
    navigate('/user-dashboard');
  };

  const handleContactUs = () => {
    navigate('/contact');
  };

  return (
    <>
      <Navbar />
      <div style={{ background: '#111', minHeight: '100vh', padding: '48px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          {/* Cancelled Icon */}
          <div style={{ 
            background: '#dc3545', 
            width: '120px', 
            height: '120px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 32px',
            fontSize: '60px'
          }}>
            ❌
          </div>

          {/* Cancelled Message */}
          <h1 style={{ color: '#dc3545', fontSize: '2.5rem', fontWeight: '700', marginBottom: '24px' }}>
            Payment Cancelled
          </h1>
          
          <p style={{ color: '#bdbdbd', fontSize: '1.2rem', marginBottom: '32px', lineHeight: '1.6' }}>
            Your payment was cancelled. No charges were made to your account. Your cart items are still available for checkout.
          </p>

          {/* Info Box */}
          <div style={{ 
            background: '#181818', 
            borderRadius: '16px', 
            padding: '32px', 
            marginBottom: '32px',
            border: '1px solid #232323'
          }}>
            <h3 style={{ color: '#ffd600', fontSize: '1.3rem', fontWeight: '600', marginBottom: '20px' }}>
              What happened?
            </h3>
            <div style={{ textAlign: 'left', color: '#bdbdbd', lineHeight: '1.8' }}>
              <p>• Your payment was not completed</p>
              <p>• No money was taken from your account</p>
              <p>• Your selected services are still in your cart</p>
              <p>• You can try the payment again anytime</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleBackToCart}
              style={{
                background: '#ffd600',
                color: '#111',
                border: 'none',
                borderRadius: '8px',
                padding: '16px 32px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1.1rem'
              }}
            >
              🛒 Back to Cart
            </button>
            
            <button
              onClick={handleContactUs}
              style={{
                background: '#232323',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '8px',
                padding: '16px 32px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1.1rem'
              }}
            >
              📞 Contact Support
            </button>
          </div>

          {/* Help Section */}
          <div style={{ 
            marginTop: '48px', 
            padding: '24px', 
            background: '#181818', 
            borderRadius: '12px',
            border: '1px solid #232323'
          }}>
            <h4 style={{ color: '#ffd600', fontSize: '1.1rem', fontWeight: '600', marginBottom: '16px' }}>
              Need help with payment?
            </h4>
            <p style={{ color: '#888', fontSize: '0.9rem', margin: '0 0 16px 0' }}>
              Common reasons for payment issues:
            </p>
            <div style={{ textAlign: 'left', color: '#bdbdbd', fontSize: '0.9rem', lineHeight: '1.6' }}>
              <p>• Insufficient funds in your account</p>
              <p>• Card declined by your bank</p>
              <p>• Incorrect card details</p>
              <p>• Browser security settings</p>
            </div>
          </div>

          {/* Contact Info */}
          <div style={{ 
            marginTop: '32px', 
            padding: '20px', 
            background: '#181818', 
            borderRadius: '12px',
            border: '1px solid #232323'
          }}>
            <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>
              Still having issues? Contact us at{' '}
              <span style={{ color: '#ffd600' }}>support@mechanics.com</span> or call{' '}
              <span style={{ color: '#ffd600' }}>+44 123 456 7890</span>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentCancelledPage; 