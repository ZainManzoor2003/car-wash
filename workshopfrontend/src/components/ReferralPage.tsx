import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ReferralDashboard from './ReferralDashboard';
import { API_BASE_URL } from '../config';

const ReferralPage: React.FC = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>('');
  const [membershipType, setMembershipType] = useState<string>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    
    if (!token || !email) {
      navigate('/login');
      return;
    }

    setUserEmail(email);
    fetchMembershipStatus(email);
  }, [navigate]);

  const fetchMembershipStatus = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/membership/${email}`);
      if (response.ok) {
        const data = await response.json();
        setMembershipType(data.membershipType || 'free');
      }
    } catch (error) {
      console.error('Error fetching membership status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          color: '#ffd600',
          fontSize: '1.2rem',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '20px' }}></div>
          Loading referral page...
        </div>
      </div>
    );
  }

  // Check if user has premium membership
  if (membershipType !== 'premium') {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
        <Navbar />
        
        <div  style={{
          padding: '100px 20px 50px',
          textAlign: 'center',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '60px 40px',
            border: '2px solid rgba(255, 214, 0, 0.3)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '30px' }}></div>
            <h1 style={{
              color: '#ffd600',
              fontSize: '2.5rem',
              marginBottom: '20px',
              fontWeight: '700'
            }}>
              Premium Access Required
            </h1>
            <p style={{
              color: '#ccc',
              fontSize: '1.2rem',
              lineHeight: '1.6',
              marginBottom: '40px'
            }}>
              The referral program is exclusively available to our premium members. 
              Upgrade your membership to start earning $5 for every friend you refer!
            </p>
            
            <div style={{
              background: 'rgba(255, 214, 0, 0.1)',
              borderRadius: '15px',
              padding: '30px',
              marginBottom: '40px',
              border: '1px solid rgba(255, 214, 0, 0.3)'
            }}>
              <h3 style={{
                color: '#ffd600',
                marginBottom: '15px',
                fontSize: '1.5rem'
              }}>
                Premium Benefits Include:
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                textAlign: 'left'
              }}>
                <div style={{ color: '#ccc' }}> Referral Program</div>
                <div style={{ color: '#ccc' }}>🔧 Free Seasonal Checks</div>
                <div style={{ color: '#ccc' }}> Fluid Top-ups</div>
                <div style={{ color: '#ccc' }}> Labour Discounts</div>
                <div style={{ color: '#ccc' }}> Priority Support</div>
                <div style={{ color: '#ccc' }}> Advanced Analytics</div>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/membership')}
              style={{
                background: 'linear-gradient(135deg, #ffd600, #ffed4e)',
                color: '#111',
                border: 'none',
                borderRadius: '25px',
                padding: '15px 40px',
                fontSize: '1.2rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' }}>
      <Navbar />
      
      <div style={{
        padding: '100px 20px 50px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Page Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '50px'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '20px'
          }}></div>
          <h1 id="rafw" style={{
            color: '#ffd600',
            fontSize: '3rem',
            marginBottom: '15px',
            fontWeight: '700',
            textShadow: '0 4px 8px rgba(255, 214, 0, 0.3)'
          }}>
            Referral Program
          </h1>
          <p style={{
            color: '#ccc',
            fontSize: '1.3rem',
            lineHeight: '1.6',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            Share your unique referral code with friends and earn <strong style={{ color: '#ffd600' }}>$5</strong> 
            {' '}for every friend who creates their first booking!
          </p>
        </div>

        {/* Referral Dashboard */}
        <ReferralDashboard userEmail={userEmail} />
      </div>
      
      <Footer />
    </div>
  );
};

export default ReferralPage;
