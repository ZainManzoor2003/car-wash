import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

interface MembershipBenefit {
  type: string;
  total?: number;
  used?: number;
  remaining?: number;
  percentage?: number;
  unlimited?: boolean;
  balance?: number;
  description: string;
  value: string;
}

interface MembershipBenefits {
  membershipType: string;
  year: number;
  benefits: {
    labourDiscount: MembershipBenefit;
    seasonalChecks: MembershipBenefit;
    fluidTopUps: MembershipBenefit;
    wiperBladeFitting: MembershipBenefit;
    motPreCheckDiscount: MembershipBenefit;
    referralCredits: MembershipBenefit;
  };
  totalSavingsThisYear: number;
}

interface MembershipDashboardProps {
  userEmail: string;
  membershipType: string;
}

const MembershipDashboard: React.FC<MembershipDashboardProps> = ({ userEmail, membershipType }) => {
  const [benefits, setBenefits] = useState<MembershipBenefits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userEmail && membershipType === 'premium') {
      fetchBenefits();
    } else {
      setLoading(false);
    }
  }, [userEmail, membershipType]);

  const fetchBenefits = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/membership/${userEmail}/benefits`);
      if (response.ok) {
        const data = await response.json();
        setBenefits(data);
      }
    } catch (error) {
      console.error('Error fetching membership benefits:', error);
    } finally {
      setLoading(false);
    }
  };

  if (membershipType !== 'premium') {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '15px',
        padding: '30px',
        marginTop: '30px',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#ffd600', marginBottom: '20px' }}>
          🆓 Free Membership Benefits
        </h3>
        <div style={{ color: '#ccc', lineHeight: '1.6' }}>
          <p>✓ Digital Service Record</p>
          <p>✓ Service & Maintenance Reminders</p>
          <p>✓ Members-Only Discounts</p>
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            background: 'rgba(255, 214, 0, 0.1)', 
            borderRadius: '10px',
            border: '1px solid rgba(255, 214, 0, 0.3)'
          }}>
            <strong style={{ color: '#ffd600' }}>Upgrade to Premium for exclusive benefits!</strong>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '15px',
        padding: '30px',
        marginTop: '30px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#ccc' }}>Loading your membership benefits...</p>
      </div>
    );
  }

  if (!benefits) {
    return null;
  }

  const BenefitCard: React.FC<{ title: string; benefit: MembershipBenefit; icon: string }> = ({ title, benefit, icon }) => (
    <div style={{
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '10px',
      padding: '20px',
      border: '1px solid rgba(255, 214, 0, 0.2)',
      height: '100%'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
        <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>{icon}</span>
        <h4 style={{ color: '#ffd600', margin: 0, fontSize: '1.1rem' }}>{title}</h4>
      </div>
      
      <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '15px', lineHeight: '1.4' }}>
        {benefit.description}
      </p>
      
      <div style={{ color: '#fff' }}>
        {benefit.unlimited ? (
          <div>
            <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
              <strong style={{ color: '#4CAF50' }}>Unlimited</strong>
              {benefit.used !== undefined && (
                <span style={{ color: '#ccc' }}> • Used this year: {benefit.used}</span>
              )}
            </p>
          </div>
        ) : benefit.total !== undefined ? (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <span style={{ fontSize: '0.9rem' }}>
                <strong>{benefit.remaining}</strong> of {benefit.total} remaining
              </span>
              <span style={{ color: '#ffd600', fontSize: '0.8rem', fontWeight: 'bold' }}>
                {benefit.value}
              </span>
            </div>
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '10px',
              height: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: benefit.remaining === 0 ? '#f44336' : 
                           benefit.remaining === benefit.total ? '#4CAF50' : '#ffd600',
                height: '100%',
                width: `${((benefit.total - (benefit.remaining || 0)) / benefit.total) * 100}%`,
                borderRadius: '10px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        ) : benefit.percentage ? (
          <div>
            <p style={{ margin: '5px 0', fontSize: '1rem' }}>
              <strong style={{ color: '#4CAF50' }}>{benefit.percentage}% OFF</strong>
              {benefit.used !== undefined && (
                <span style={{ color: '#ccc', fontSize: '0.8rem' }}> • Applied {benefit.used} times this year</span>
              )}
            </p>
          </div>
        ) : benefit.balance !== undefined ? (
          <div>
            <p style={{ margin: '5px 0', fontSize: '1rem' }}>
              Balance: <strong style={{ color: '#4CAF50' }}>£{benefit.balance}</strong>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '15px',
      padding: '30px',
      marginTop: '30px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h3 style={{ 
          color: '#ffd600', 
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <span>💎</span>
          Premium Membership Dashboard
          <span>💎</span>
        </h3>
        <p style={{ color: '#ccc', fontSize: '0.9rem' }}>
          {benefits.year} Benefits • Total Savings This Year: 
          <strong style={{ color: '#4CAF50', marginLeft: '5px' }}>
            £{benefits.totalSavingsThisYear.toFixed(2)}
          </strong>
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <BenefitCard
          title="Labour Discount"
          benefit={benefits.benefits.labourDiscount}
          icon="💰"
        />
        <BenefitCard
          title="Seasonal Checks"
          benefit={benefits.benefits.seasonalChecks}
          icon="🔍"
        />
        <BenefitCard
          title="Fluid Top-Ups"
          benefit={benefits.benefits.fluidTopUps}
          icon="🛢️"
        />
        <BenefitCard
          title="Wiper Blade Fitting"
          benefit={benefits.benefits.wiperBladeFitting}
          icon="🚗"
        />
        <BenefitCard
          title="MOT Pre-Check Discount"
          benefit={benefits.benefits.motPreCheckDiscount}
          icon="📋"
        />
        <BenefitCard
          title="Referral Credits"
          benefit={benefits.benefits.referralCredits}
          icon="👥"
        />
      </div>

      <div style={{
        background: 'rgba(76, 175, 80, 0.1)',
        border: '1px solid rgba(76, 175, 80, 0.3)',
        borderRadius: '10px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h4 style={{ color: '#4CAF50', marginBottom: '10px' }}>
          🎉 Your Premium Membership is Paying Off!
        </h4>
        <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: '1.5', margin: 0 }}>
          With £{benefits.totalSavingsThisYear.toFixed(2)} in savings this year, 
          your membership has {benefits.totalSavingsThisYear >= 45 ? 'already paid for itself' : 'saved you money'}!
          {benefits.totalSavingsThisYear < 45 && (
            <span> You need £{(45 - benefits.totalSavingsThisYear).toFixed(2)} more in savings to break even on your annual membership.</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default MembershipDashboard;
