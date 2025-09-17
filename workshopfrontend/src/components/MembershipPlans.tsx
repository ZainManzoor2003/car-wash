import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { API_BASE_URL } from '../config';
import MembershipDashboard from './MembershipDashboard';

interface MembershipPlan {
  type: 'free' | 'premium';
  price: string;
  features: string[];
}

const MembershipPlans: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string>('');
  const [currentMembership, setCurrentMembership] = useState<string>('free');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
      fetchCurrentMembership(email);
    }
  }, []);

  const fetchCurrentMembership = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/membership/${email}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentMembership(data.membershipType || 'free');
      }
    } catch (error) {
      console.error('Error fetching membership:', error);
    }
  };

  const handleUpgradeToPremium = async (billingCycle: 'monthly' | 'yearly') => {
    if (!userEmail) {
      alert('Please log in to upgrade your membership');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/membership/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          membershipType: 'premium',
          billingCycle,
          amount: billingCycle === 'monthly' ? 4 : 45
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        }
      } else {
        alert('Failed to upgrade membership');
      }
    } catch (error) {
      console.error('Error upgrading membership:', error);
      alert('Error upgrading membership');
    }
    setLoading(false);
  };

  const membershipPlans: MembershipPlan[] = [
    {
      type: 'free',
      price: 'Free',
      features: [
        'Digital Service Record - Track vehicle service history and past repairs',
        'Service & Maintenance Reminders - Automated alerts for upcoming services',
        'Members-Only Discounts - Small occasional offers (e.g., £5 off air con servicing)'
      ]
    },
    {
      type: 'premium',
      price: '£4/month or £45/year',
      features: [
        'Everything from Free plan',
        '5% Discount on Labour Costs (excluding third-party parts or diagnostics)',
        'Free Seasonal Vehicle Checks (2x per year – Spring & Winter, normally £45 each)',
        'Free Fluid Top-Ups (Quarterly – includes up to 0.5L oil, coolant, screenwash, steering fluid)',
        'Free Wiper Blade Fitting (when blades are bought from us, normally £5–£10)',
        'Exclusive Flash Sales (e.g., 50% off diagnostics or brake fluid flush deals)',
        '10% Off MOT Pre-Checks (normally £120)',
        'Saved Quotes & Estimates (customers can view/accept quotes online)',
        'Refer-a-Friend Bonus (£5 credit when referral completes first job)',
        'Annual Loyalty Bonus (choice of £10 service voucher, branded merchandise, or free air con check)'
      ]
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      color: '#fff',
      paddingTop: '75px'
    }}>
      <Navbar />
      
      <div id="membb" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            marginBottom: '20px',
            background: 'linear-gradient(45deg, #ffd600, #ffed4e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            Membership Plans
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#ccc', maxWidth: '600px', margin: '0 auto' }}>
            Choose the perfect plan for your vehicle maintenance needs
          </p>
          {currentMembership && (
            <div style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: currentMembership === 'premium' ? 'linear-gradient(45deg, #ffd600, #ffed4e)' : '#333',
              color: currentMembership === 'premium' ? '#000' : '#fff',
              borderRadius: '25px',
              display: 'inline-block',
              fontWeight: 'bold'
            }}>
              Current Plan: {currentMembership === 'premium' ? 'Premium Member' : 'Free Member'}
            </div>
          )}
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '30px',
          alignItems: 'start'
        }}>
          {membershipPlans.map((plan, index) => (
            <div key={index} style={{
              background: plan.type === 'premium' 
                ? 'linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%)' 
                : 'linear-gradient(135deg, #333 0%, #444 100%)',
              borderRadius: '15px',
              padding: '30px',
              border: plan.type === 'premium' ? '2px solid #ffd600' : '2px solid #555',
              position: 'relative',
              transform: currentMembership === plan.type ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.3s ease'
            }}>
              {plan.type === 'premium' && (
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(45deg, #ffd600, #ffed4e)',
                  color: '#000',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  MOST POPULAR
                </div>
              )}
              
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h2 style={{ 
                  fontSize: '2rem', 
                  marginBottom: '10px',
                  color: plan.type === 'premium' ? '#ffd600' : '#fff',
                  textTransform: 'capitalize'
                }}>
                  {plan.type} Membership
                </h2>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold',
                  color: plan.type === 'premium' ? '#ffd600' : '#ccc'
                }}>
                  {plan.price}
                </div>
              </div>

              <div style={{ marginBottom: '30px' }}>
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: '15px',
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px'
                  }}>
                    <span style={{ 
                      color: '#ffd600', 
                      marginRight: '10px', 
                      fontSize: '1.2rem',
                      minWidth: '20px'
                    }}>
                      ✓
                    </span>
                    <span style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {plan.type === 'free' && currentMembership === 'free' && (
                <div style={{
                  background: '#555',
                  color: '#ccc',
                  padding: '15px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  Current Plan
                </div>
              )}

              {plan.type === 'premium' && currentMembership !== 'premium' && (
                <div style={{ display: 'flex', gap: '15px' }}>
                  <button
                    onClick={() => handleUpgradeToPremium('monthly')}
                    disabled={loading}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(45deg, #ffd600, #ffed4e)',
                      color: '#000',
                      border: 'none',
                      padding: '15px 20px',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? 'Processing...' : 'Monthly £4'}
                  </button>
                  <button
                    onClick={() => handleUpgradeToPremium('yearly')}
                    disabled={loading}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(45deg, #28a745, #20c997)',
                      color: '#fff',
                      border: 'none',
                      padding: '15px 20px',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? 'Processing...' : 'Yearly £45 (Save £3)'}
                  </button>
                </div>
              )}

              {plan.type === 'premium' && currentMembership === 'premium' && (
                <div style={{
                  background: 'linear-gradient(45deg, #ffd600, #ffed4e)',
                  color: '#000',
                  padding: '15px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  Current Premium Plan ✓
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '50px',
          textAlign: 'center',
          padding: '30px',
          background: 'rgba(255, 214, 0, 0.1)',
          borderRadius: '15px',
          border: '1px solid rgba(255, 214, 0, 0.3)'
        }}>
          <h3 style={{ color: '#ffd600', marginBottom: '15px' }}>
            Why Choose Premium?
          </h3>
          <p style={{ color: '#ccc', lineHeight: '1.6', maxWidth: '800px', margin: '0 auto' }}>
            Our Premium membership pays for itself! With 2 free seasonal checks (£90 value), 
            quarterly fluid top-ups (£60+ value), and 5% labour discounts, you'll save more than 
            the annual fee while keeping your vehicle in perfect condition.
          </p>
        </div>

        {/* Membership Dashboard */}
        {userEmail && (
          <MembershipDashboard 
            userEmail={userEmail} 
            membershipType={currentMembership} 
          />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MembershipPlans;
