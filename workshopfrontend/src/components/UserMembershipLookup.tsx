import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

interface MembershipData {
  _id: string;
  userEmail: string;
  membershipType: 'free' | 'premium';
  billingCycle: 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  status: 'active' | 'cancelled' | 'expired';
  benefits: {
    labourDiscount: number;
    freeChecks: number;
    fluidTopUps: number;
    motDiscount: number;
    referralCredits: number;
  };
}

const UserMembershipLookup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchUser = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError('');
    setMembership(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/membership/${encodeURIComponent(email.trim())}`);
      
      if (response.ok) {
        const data = await response.json();
        setMembership(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'User not found');
      }
    } catch (err) {
      setError('Failed to fetch user membership data');
      console.error('Error fetching membership:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isExpired = (endDate?: string) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  const getDaysUntilExpiry = (endDate?: string) => {
    if (!endDate) return null;
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string, membershipType: string, endDate?: string) => {
    if (membershipType === 'free') return '#6c757d';
    if (status === 'cancelled') return '#dc3545';
    if (status === 'expired' || isExpired(endDate)) return '#dc3545';
    if (status === 'active') return '#28a745';
    return '#ffc107';
  };

  const getStatusText = (status: string, membershipType: string, endDate?: string) => {
    if (membershipType === 'free') return 'Free Member';
    if (status === 'cancelled') return 'Cancelled';
    if (status === 'expired' || isExpired(endDate)) return 'Expired';
    if (status === 'active') return 'Active Premium';
    return status;
  };

  return (
    <div style={{ 
      background: '#181818', 
      borderRadius: '16px', 
      padding: '32px', 
      marginBottom: '32px',
      border: '1px solid #232323'
    }}>
      <h2 style={{ 
        color: '#ffd600', 
        fontSize: '1.8rem', 
        fontWeight: '700', 
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        🔍 User Membership Lookup
      </h2>

      {/* Search Form */}
      <div style={{ 
        background: '#232323', 
        borderRadius: '12px', 
        padding: '24px', 
        marginBottom: '24px',
        border: '1px solid #333'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="email"
            placeholder="Enter user email address..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchUser()}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #444',
              background: '#111',
              color: '#fff',
              fontSize: '16px'
            }}
          />
          <button
            onClick={searchUser}
            disabled={loading}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: loading ? '#666' : '#ffd600',
              color: loading ? '#999' : '#111',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              minWidth: '120px'
            }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#dc3545',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          textAlign: 'center',
          fontWeight: '600'
        }}>
          ❌ {error}
        </div>
      )}

      {/* Membership Results */}
      {membership && (
        <div style={{
          background: '#232323',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #333'
        }}>
          <h3 style={{ 
            color: '#fff', 
            fontSize: '1.4rem', 
            fontWeight: '600', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Membership Details
          </h3>

          <div style={{ display: 'grid', gap: '16px' }}>
            {/* User Email */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px',
              background: '#111',
              borderRadius: '8px'
            }}>
              <span style={{ color: '#ccc', fontWeight: '600' }}>Email:</span>
              <span style={{ color: '#fff', fontSize: '16px' }}>{membership.userEmail}</span>
            </div>

            {/* Membership Type & Status */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px',
              background: '#111',
              borderRadius: '8px'
            }}>
              <span style={{ color: '#ccc', fontWeight: '600' }}>Status:</span>
              <span style={{ 
                color: getStatusColor(membership.status, membership.membershipType, membership.endDate),
                fontWeight: '700',
                fontSize: '16px'
              }}>
                {getStatusText(membership.status, membership.membershipType, membership.endDate)}
              </span>
            </div>

            {/* Billing Cycle */}
            {membership.membershipType === 'premium' && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px',
                background: '#111',
                borderRadius: '8px'
              }}>
                <span style={{ color: '#ccc', fontWeight: '600' }}>Billing Cycle:</span>
                <span style={{ color: '#fff', fontSize: '16px', textTransform: 'capitalize' }}>
                  {membership.billingCycle}
                </span>
              </div>
            )}

            {/* Start Date */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px',
              background: '#111',
              borderRadius: '8px'
            }}>
              <span style={{ color: '#ccc', fontWeight: '600' }}>Start Date:</span>
              <span style={{ color: '#fff', fontSize: '16px' }}>
                {formatDate(membership.startDate)}
              </span>
            </div>

            {/* End Date / Expiry */}
            {membership.membershipType === 'premium' && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px',
                background: '#111',
                borderRadius: '8px'
              }}>
                <span style={{ color: '#ccc', fontWeight: '600' }}>Expires:</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#fff', fontSize: '16px' }}>
                    {formatDate(membership.endDate || '')}
                  </div>
                  {membership.endDate && (
                    <div style={{ 
                      color: isExpired(membership.endDate) ? '#dc3545' : '#28a745',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      {isExpired(membership.endDate) 
                        ? 'Expired' 
                        : `${getDaysUntilExpiry(membership.endDate)} days remaining`
                      }
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Premium Benefits removed as requested */}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        background: '#232323',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '24px',
        border: '1px solid #333'
      }}>
        <h4 style={{ color: '#ffd600', marginBottom: '12px', fontSize: '16px' }}>
          💡 Instructions:
        </h4>
        <ul style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6', margin: 0, paddingLeft: '20px' }}>
          <li>Enter the user's email address to check their membership status</li>
          <li>Free members have basic access with no premium benefits</li>
          <li>Premium members get exclusive discounts and benefits</li>
          <li>Check the expiry date to see when premium membership ends</li>
        </ul>
      </div>
    </div>
  );
};

export default UserMembershipLookup;
