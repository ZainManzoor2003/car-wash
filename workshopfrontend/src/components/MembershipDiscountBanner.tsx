import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

interface MembershipDiscountBannerProps {
  userEmail?: string;
  serviceLabel?: string;
  serviceCategory?: string;
  labourCost?: number;
}

interface ServiceBenefit {
  type: string;
  percentage?: number;
  description: string;
  value?: string;
}

interface BenefitCheck {
  qualifies: boolean;
  membershipType: string;
  benefits: ServiceBenefit[];
}

const MembershipDiscountBanner: React.FC<MembershipDiscountBannerProps> = ({ 
  userEmail, 
  serviceLabel, 
  serviceCategory, 
  labourCost = 0 
}) => {
  const [benefitCheck, setBenefitCheck] = useState<BenefitCheck | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userEmail && serviceLabel) {
      checkServiceBenefits();
    }
  }, [userEmail, serviceLabel, serviceCategory]);

  const checkServiceBenefits = async () => {
    if (!userEmail || !serviceLabel) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/membership/check-benefit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail,
          serviceLabel,
          serviceCategory
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setBenefitCheck(data);
      }
    } catch (error) {
      console.error('Error checking service benefits:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        background: 'rgba(255, 214, 0, 0.1)',
        border: '1px solid rgba(255, 214, 0, 0.3)',
        borderRadius: '8px',
        padding: '12px',
        margin: '10px 0',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, color: '#ffd600', fontSize: '0.9rem' }}>
          Checking for membership benefits...
        </p>
      </div>
    );
  }

  if (!benefitCheck || !benefitCheck.qualifies) {
    // Show upgrade prompt for non-members
    if (benefitCheck && benefitCheck.membershipType === 'free') {
      return (
        <div style={{
          background: 'rgba(255, 214, 0, 0.1)',
          border: '1px solid rgba(255, 214, 0, 0.3)',
          borderRadius: '8px',
          padding: '15px',
          margin: '10px 0',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>💎</span>
            <strong style={{ color: '#ffd600' }}>Upgrade to Premium for Exclusive Savings!</strong>
          </div>
          <p style={{ margin: '5px 0', color: '#ccc', fontSize: '0.9rem' }}>
            Premium members save 5% on labour costs
            {labourCost > 0 && (
              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                {' '}(£{(labourCost * 0.05).toFixed(2)} savings on this service!)
              </span>
            )}
          </p>
          <p style={{ margin: '5px 0', color: '#ccc', fontSize: '0.8rem' }}>
            Plus free seasonal checks, fluid top-ups, and more benefits!
          </p>
        </div>
      );
    }
    return null;
  }

  const labourDiscountBenefit = benefitCheck.benefits.find(b => b.type === 'labourDiscount');
  const freeServiceBenefit = benefitCheck.benefits.find(b => b.type === 'freeService');
  const discountBenefit = benefitCheck.benefits.find(b => b.type === 'discount');

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.25) 100%)',
      border: '1px solid rgba(76, 175, 80, 0.4)',
      borderRadius: '8px',
      padding: '15px',
      margin: '10px 0'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '10px',
        justifyContent: 'center'
      }}>
        <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>💎</span>
        <strong style={{ color: '#4CAF50' }}>Premium Member Benefits Applied!</strong>
        <span style={{ fontSize: '1.2rem', marginLeft: '8px' }}>💎</span>
      </div>

      <div style={{ textAlign: 'center' }}>
        {labourDiscountBenefit && labourCost > 0 && labourDiscountBenefit.percentage && (
          <div style={{ marginBottom: '8px' }}>
            <p style={{ 
              margin: '0', 
              color: '#fff', 
              fontSize: '0.9rem',
              background: 'rgba(76, 175, 80, 0.2)',
              padding: '8px 12px',
              borderRadius: '6px',
              display: 'inline-block'
            }}>
              <strong>🎉 {labourDiscountBenefit.percentage}% Labour Discount Applied!</strong>
              <br />
              <span style={{ color: '#4CAF50', fontSize: '1rem', fontWeight: 'bold' }}>
                You save £{(labourCost * (labourDiscountBenefit.percentage / 100)).toFixed(2)}
              </span>
            </p>
          </div>
        )}

        {freeServiceBenefit && (
          <div style={{ marginBottom: '8px' }}>
            <p style={{ 
              margin: '0', 
              color: '#fff', 
              fontSize: '0.9rem',
              background: 'rgba(255, 214, 0, 0.2)',
              padding: '8px 12px',
              borderRadius: '6px',
              display: 'inline-block'
            }}>
              <strong>🆓 {freeServiceBenefit.description}</strong>
              <br />
              <span style={{ color: '#ffd600', fontSize: '0.9rem' }}>
                Value: {freeServiceBenefit.value}
              </span>
            </p>
          </div>
        )}

        {discountBenefit && discountBenefit.percentage && (
          <div style={{ marginBottom: '8px' }}>
            <p style={{ 
              margin: '0', 
              color: '#fff', 
              fontSize: '0.9rem',
              background: 'rgba(76, 175, 80, 0.2)',
              padding: '8px 12px',
              borderRadius: '6px',
              display: 'inline-block'
            }}>
              <strong>💰 {discountBenefit.percentage}% Discount Available!</strong>
              <br />
              <span style={{ color: '#4CAF50', fontSize: '0.9rem' }}>
                {discountBenefit.description} • {discountBenefit.value}
              </span>
            </p>
          </div>
        )}

        <p style={{ 
          margin: '10px 0 0 0', 
          color: '#ccc', 
          fontSize: '0.8rem',
          fontStyle: 'italic'
        }}>
          Thank you for being a Premium Member! 🙏
        </p>
      </div>
    </div>
  );
};

export default MembershipDiscountBanner;
