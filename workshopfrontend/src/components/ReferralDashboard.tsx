import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

interface ReferralStats {
  referralCode: string | null;
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  totalEarnings: number;
  referrals: Array<{
    referredName: string;
    referredEmail: string;
    status: string;
    signupDate: string;
    firstBookingDate?: string;
    bonusAmount: number;
    bonusPaid: boolean;
  }>;
}

interface ReferralDashboardProps {
  userEmail: string;
}

const ReferralDashboard: React.FC<ReferralDashboardProps> = ({ userEmail }) => {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (userEmail) {
      fetchReferralStats();
    }
  }, [userEmail]);

  const fetchReferralStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/referral/stats/${userEmail}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = async () => {
    setGenerating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/referral/generate-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          fetchReferralStats(); // Refresh stats
        } else {
          alert(data.error || 'Failed to generate referral code');
        }
      } else {
        alert('Failed to generate referral code');
      }
    } catch (error) {
      console.error('Error generating referral code:', error);
      alert('Error generating referral code');
    } finally {
      setGenerating(false);
    }
  };

  const copyReferralCode = () => {
    if (stats?.referralCode) {
      navigator.clipboard.writeText(stats.referralCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const shareReferralLink = () => {
    const baseUrl = window.location.origin;
    const referralLink = `${baseUrl}/signup?ref=${stats?.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (loading) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '15px',
        padding: '30px',
        marginTop: '30px',
        textAlign: 'center'
      }}>
        <div style={{ color: '#ccc' }}>Loading referral dashboard...</div>
      </div>
    );
  }

  return (
    <div  style={{
      background: 'linear-gradient(135deg, rgba(255, 214, 0, 0.15), rgba(255, 214, 0, 0.05))',
      borderRadius: '20px',
      padding: '40px',
      marginTop: '30px',
      border: '2px solid rgba(255, 214, 0, 0.3)',
      boxShadow: '0 8px 32px rgba(255, 214, 0, 0.1)'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '10px'
        }}></div>
        <h2 style={{
          color: '#ffd600',
          marginBottom: '10px',
          fontSize: '2.2rem',
          fontWeight: '700'
        }}>
          Referral Program
        </h2>
        <p style={{
          color: '#ccc',
          fontSize: '1.1rem',
          lineHeight: '1.6',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Share your unique code with friends and earn <strong style={{ color: '#ffd600' }}>$5</strong> 
          {' '}when they create their first booking!
        </p>
      </div>

      {/* Referral Code Section */}
      {!stats?.referralCode ? (
        <div style={{
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '15px',
          padding: '40px',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#ffd600', marginBottom: '20px' }}>
            Generate Your Referral Code
          </h3>
          <p style={{ color: '#ccc', marginBottom: '30px', lineHeight: '1.6' }}>
            Create your unique referral code to start earning bonuses when friends join our workshop!
          </p>
          <button
            onClick={generateReferralCode}
            disabled={generating}
            style={{
              background: 'linear-gradient(135deg, #ffd600, #ffed4e)',
              color: '#111',
              border: 'none',
              borderRadius: '25px',
              padding: '15px 40px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: generating ? 'not-allowed' : 'pointer',
              opacity: generating ? 0.7 : 1,
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {generating ? ' Generating...' : '✨ Generate My Code'}
          </button>
        </div>
      ) : (
        <>
          {/* Referral Code Display */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            padding: '30px',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#ffd600', marginBottom: '20px' }}>
              Your Referral Code
            </h3>
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '10px',
              padding: '20px',
              marginBottom: '20px',
              border: '2px dashed rgba(255, 214, 0, 0.5)'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#ffd600',
                letterSpacing: '3px',
                fontFamily: 'monospace',
                marginBottom: '10px'
              }}>
                {stats.referralCode}
              </div>
              <div style={{ color: '#ccc', fontSize: '0.9rem' }}>
                Share this code with friends
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={copyReferralCode}
                style={{
                  background: copySuccess ? '#4CAF50' : 'rgba(255, 214, 0, 0.2)',
                  color: copySuccess ? '#fff' : '#ffd600',
                  border: `2px solid ${copySuccess ? '#4CAF50' : '#ffd600'}`,
                  borderRadius: '20px',
                  padding: '10px 25px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {copySuccess ? ' Copied!' : ' Copy Code'}
              </button>
              
              <button
                onClick={shareReferralLink}
                style={{
                  background: 'linear-gradient(135deg, #ffd600, #ffed4e)',
                  color: '#111',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '10px 25px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                 Share Link
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '15px',
              padding: '25px',
              textAlign: 'center',
              border: '1px solid rgba(255, 214, 0, 0.2)'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#ffd600',
                marginBottom: '10px'
              }}>
                {stats.totalReferrals}
              </div>
              <div style={{ color: '#ccc', fontSize: '1rem' }}>
                Total Referrals
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '15px',
              padding: '25px',
              textAlign: 'center',
              border: '1px solid rgba(255, 214, 0, 0.2)'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#4CAF50',
                marginBottom: '10px'
              }}>
                {stats.completedReferrals}
              </div>
              <div style={{ color: '#ccc', fontSize: '1rem' }}>
                Successful
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '15px',
              padding: '25px',
              textAlign: 'center',
              border: '1px solid rgba(255, 214, 0, 0.2)'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#ff9800',
                marginBottom: '10px'
              }}>
                {stats.pendingReferrals}
              </div>
              <div style={{ color: '#ccc', fontSize: '1rem' }}>
                Pending
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '15px',
              padding: '25px',
              textAlign: 'center',
              border: '1px solid rgba(255, 214, 0, 0.2)'
            }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#4CAF50',
                marginBottom: '10px'
              }}>
                ${stats.totalEarnings}
              </div>
              <div style={{ color: '#ccc', fontSize: '1rem' }}>
                Total Earned
              </div>
            </div>
          </div>

          {/* Referral History */}
          {stats.referrals.length > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '15px',
              padding: '30px'
            }}>
              <h3 style={{
                color: '#ffd600',
                marginBottom: '20px',
                fontSize: '1.5rem'
              }}>
                Referral History
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {stats.referrals.map((referral, index) => (
                  <div
                    key={index}
                    style={{
                      background: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: '10px',
                      padding: '20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '15px'
                    }}
                  >
                    <div>
                      <div style={{
                        color: '#fff',
                        fontWeight: '600',
                        fontSize: '1.1rem',
                        marginBottom: '5px'
                      }}>
                        {referral.referredName}
                      </div>
                      <div style={{
                        color: '#ccc',
                        fontSize: '0.9rem'
                      }}>
                        Signed up: {new Date(referral.signupDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        color: referral.status === 'completed' ? '#4CAF50' : '#ff9800',
                        fontWeight: '600',
                        fontSize: '1rem',
                        marginBottom: '5px'
                      }}>
                        {referral.status === 'completed' ? ' Completed' : ' Pending'}
                      </div>
                      <div style={{
                        color: referral.bonusPaid ? '#4CAF50' : '#ccc',
                        fontSize: '0.9rem'
                      }}>
                        ${referral.bonusAmount} {referral.bonusPaid ? 'Earned' : 'Pending'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* How it Works */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '15px',
        padding: '30px',
        marginTop: '30px'
      }}>
        <h3 style={{
          color: '#ffd600',
          marginBottom: '20px',
          fontSize: '1.5rem',
          textAlign: 'center'
        }}>
          How It Works
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '25px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>1.</div>
            <h4 style={{ color: '#ffd600', marginBottom: '10px' }}>Share Your Code</h4>
            <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Send your unique referral code to friends and family
            </p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>2.</div>
            <h4 style={{ color: '#ffd600', marginBottom: '10px' }}>Friend Signs Up</h4>
            <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: '1.5' }}>
              They create an account using your referral code
            </p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>3.</div>
            <h4 style={{ color: '#ffd600', marginBottom: '10px' }}>First Booking</h4>
            <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: '1.5' }}>
              When they create their first booking, you earn $5!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralDashboard;
