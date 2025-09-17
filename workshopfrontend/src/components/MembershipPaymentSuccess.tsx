import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { API_BASE_URL } from '../config';

const MembershipPaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [membershipType, setMembershipType] = useState<string>('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const userEmail = localStorage.getItem('userEmail');
    
    if (!sessionId || !userEmail) {
      setError('Missing payment session or user information');
      setLoading(false);
      return;
    }

    // Update membership status after successful payment
    updateMembershipStatus(userEmail, sessionId);
  }, [searchParams]);

  const updateMembershipStatus = async (userEmail: string, sessionId: string) => {
    try {
      console.log('🎉 Processing membership payment success...');
      console.log('📧 User Email:', userEmail);
      console.log('🔑 Session ID:', sessionId);

      // Call backend to update membership status
      const response = await fetch(`${API_BASE_URL}/api/membership/payment-success`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          sessionId,
          membershipType: 'premium',
          billingCycle: 'monthly'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Membership updated successfully:', data);
        setSuccess(true);
        setMembershipType(data.membershipType || 'premium');
        
        // Update localStorage to reflect new membership
        localStorage.setItem('membershipType', 'premium');
        
        // Redirect to membership page after 3 seconds
        setTimeout(() => {
          navigate('/membership');
        }, 3000);
      } else {
        const errorData = await response.json();
        console.error('❌ Error updating membership:', errorData);
        setError(errorData.error || 'Failed to update membership');
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '100px'
      }}>
        <Navbar />
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid #ffd600',
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <h2 style={{ color: '#ffd600', marginBottom: '10px' }}>
            Processing Your Payment...
          </h2>
          <p style={{ color: '#ccc' }}>
            Updating your membership status
          </p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: '#fff',
        marginTop: '100px'
      }}>
        <Navbar />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
            borderRadius: '15px',
            padding: '40px',
            maxWidth: '500px'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>❌</div>
            <h2 style={{ color: '#f44336', marginBottom: '20px' }}>
              Payment Processing Error
            </h2>
            <p style={{ color: '#ccc', marginBottom: '30px', lineHeight: '1.6' }}>
              {error}
            </p>
            <button
              onClick={() => navigate('/membership')}
              style={{
                background: 'linear-gradient(45deg, #ffd600, #ffed4e)',
                color: '#000',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginRight: '15px'
              }}
            >
              Back to Membership
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid #555',
                padding: '15px 30px',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: '#fff',
      marginTop: '100px'
    }}>
      <Navbar />
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(76, 175, 80, 0.1)',
          border: '1px solid rgba(76, 175, 80, 0.3)',
          borderRadius: '15px',
          padding: '40px',
          maxWidth: '600px'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
          <h2 style={{ 
            color: '#4CAF50', 
            marginBottom: '20px',
            background: 'linear-gradient(45deg, #4CAF50, #8BC34A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            Payment Successful!
          </h2>
          <p style={{ color: '#ccc', marginBottom: '30px', lineHeight: '1.6' }}>
            Your membership has been successfully upgraded to <strong style={{ color: '#ffd600' }}>Premium</strong>!
          </p>
          
          <div style={{
            background: 'rgba(255, 214, 0, 0.1)',
            border: '1px solid rgba(255, 214, 0, 0.3)',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '30px'
          }}>
            <h3 style={{ color: '#ffd600', marginBottom: '15px' }}>
              🎯 Your Premium Benefits Are Now Active:
            </h3>
            <div style={{ textAlign: 'left', color: '#ccc' }}>
              <p>✅ 5% Discount on Labour Costs</p>
              <p>✅ 2 Free Seasonal Vehicle Checks per year</p>
              <p>✅ 4 Free Quarterly Fluid Top-ups</p>
              <p>✅ Free Wiper Blade Fitting</p>
              <p>✅ 10% Off MOT Pre-Checks</p>
              <p>✅ Refer-a-Friend Bonus (£5 credit)</p>
            </div>
          </div>

          <p style={{ color: '#ccc', marginBottom: '30px' }}>
            Redirecting you to the membership page in 3 seconds...
          </p>

          <button
            onClick={() => navigate('/membership')}
            style={{
              background: 'linear-gradient(45deg, #ffd600, #ffed4e)',
              color: '#000',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginRight: '15px'
            }}
          >
            View Membership Dashboard
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              border: '1px solid #555',
              padding: '15px 30px',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Go to Home
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MembershipPaymentSuccess;
