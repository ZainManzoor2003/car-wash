import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import Navbar from './Navbar';
import Footer from './Footer';

interface Membership {
  _id: string;
  userEmail: string;
  membershipType: 'free' | 'premium';
  billingCycle: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  status: 'active' | 'cancelled' | 'expired';
  benefits: {
    labourDiscount: number;
    freeChecks: number;
    fluidTopUps: number;
    motDiscount: number;
    referralCredits: number;
  };
}

interface EligibilityCheck {
  eligible: boolean;
  reason: string;
  membershipType: string;
  billingCycle: string;
  checksUsed?: number;
  maxChecks?: number;
  seasonActive?: boolean;
  currentMonth?: number;
}

const SeasonalCheckBooking: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string>('');
  const [membership, setMembership] = useState<Membership | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityCheck | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    email: '',
    carRegistration: '',
    carMake: '',
    carModel: '',
    season: 'summer' as 'summer' | 'winter',
    preferredDate: '',
    preferredTime: '09:00',
    notes: ''
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [seasonalSettings, setSeasonalSettings] = useState<any>(null);

  const fetchSeasonalSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/seasonal-settings`);
      if (response.ok) {
        const settings = await response.json();
        setSeasonalSettings(settings);
      }
    } catch (error) {
      console.error('Error fetching seasonal settings:', error);
    }
  };

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
      setBookingForm(prev => ({ ...prev, email }));
      fetchMembership(email);
      fetchSeasonalSettings();
    }
  }, []);

  const fetchMembership = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/membership/${email}`);
      if (response.ok) {
        const data = await response.json();
        setMembership(data);
        checkEligibility(email, 'summer');
      }
    } catch (error) {
      console.error('Error fetching membership:', error);
    }
  };

  const checkEligibility = async (email: string, season: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/seasonal-checks/eligibility/${email}/${season}`);
      if (response.ok) {
        const data = await response.json();
        setEligibility(data);
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/seasonal-checks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingForm,
          email: userEmail
        })
      });

      if (response.ok) {
        setBookingSuccess(true);
        // Refresh eligibility after successful booking
        checkEligibility(userEmail, bookingForm.season);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to book seasonal check');
      }
    } catch (error) {
      console.error('Error booking seasonal check:', error);
      alert('Error booking seasonal check');
    } finally {
      setLoading(false);
    }
  };

  if (bookingSuccess) {
    return (
      <>
        <Navbar />
        <div  style={{
    minHeight: '100vh',
    backgroundColor: '#000000',
    color: '#fff',
    padding: '20px',
     // Add margin to push content below navbar
  }}>
          <div style={{
            background: '#000000',
            padding: '40px',
            borderRadius: '15px',
            textAlign: 'center',
            border: '1px solid #555',
            maxWidth: '500px'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
            <h2 style={{ color: '#ffd600', marginBottom: '20px' }}>
              Booking Successful!
            </h2>
            <p style={{ marginBottom: '30px', lineHeight: '1.6' }}>
              Your seasonal check has been booked successfully. We'll contact you soon to confirm the appointment details.
              {eligibility && eligibility.checksUsed !== undefined && (
                <>
                  <br /><br />
                  You have used {eligibility.checksUsed} out of {eligibility.maxChecks} seasonal checks this year.
                </>
              )}
            </p>
            <button
              onClick={() => setBookingSuccess(false)}
              style={{
                background: 'linear-gradient(45deg, #ffd600, #ffed4e)',
                color: '#000',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Book Another Check
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{
        minHeight: '100vh',
        background: '#000000',
        color: '#fff',
        padding: '20px',
        marginTop: '100px'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '60px' }}>
            <h1 style={{
              fontSize: '2.5rem',
              marginBottom: '10px',
              background: 'linear-gradient(135deg, #ffd600, #ffed4e)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Seasonal Vehicle Check
            </h1>
            <p style={{ color: '#bdbdbd', fontSize: '1.2rem' }}>
              Book your free seasonal vehicle check (Premium members only)
            </p>
          </div>

          {/* Membership Status */}
          {membership && (
            <div style={{
              background: '#000000',
              padding: '20px',
              borderRadius: '10px',
              marginBottom: '30px',
              border: '1px solid #555'
            }}>
              <h3 style={{ color: '#ffd600', marginBottom: '15px' }}>Your Membership Status</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div>
                  <strong>Type:</strong> {membership.membershipType.toUpperCase()}
                </div>
                <div>
                  <strong>Billing:</strong> {membership.billingCycle.toUpperCase()}
                </div>
                <div>
                  <strong>Status:</strong> {membership.status.toUpperCase()}
                </div>
                {eligibility && eligibility.checksUsed !== undefined && (
                  <div>
                    <strong>Free Checks:</strong> {eligibility.checksUsed}/{eligibility.maxChecks} used this year
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Eligibility Status */}
          {eligibility && (
            <div style={{
              background: eligibility.eligible 
                ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                : 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
              padding: '20px',
              borderRadius: '10px',
              marginBottom: '30px',
              border: '1px solid #555'
            }}>
              <h3 style={{ marginBottom: '10px' }}>
                {eligibility.eligible ? '✅ Eligible' : '❌ Not Eligible'}
              </h3>
              <p style={{ marginBottom: '10px' }}>{eligibility.reason}</p>
              {eligibility.checksUsed !== undefined && (
                <p>Checks used this year: {eligibility.checksUsed}/{eligibility.maxChecks}</p>
              )}
            </div>
          )}

          {/* Seasonal Information */}
          <div style={{
            background: '#000000',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '30px',
            border: '1px solid #555'
          }}>
            <h3 style={{ color: '#ffd600', marginBottom: '20px' }}>Seasonal Check Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div>
                <h4 style={{ color: '#ffd600', marginBottom: '10px' }}>Summer Check</h4>
                <p style={{ color: '#28a745', marginBottom: '5px' }}>Available: September</p>
                <p style={{ color: '#28a745' }}>Current status: ✅ Available</p>
              </div>
              <div>
                <h4 style={{ color: '#ffd600', marginBottom: '10px' }}>Winter Check</h4>
                <p style={{ color: '#007bff', marginBottom: '5px' }}>Available: Not configured</p>
                <p style={{ color: '#dc3545' }}>Current status: ❌ Not available</p>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          {eligibility?.eligible && membership?.membershipType === 'premium' && (
            <div style={{
              background: '#000000',
              padding: '30px',
              borderRadius: '10px',
              border: '1px solid #555'
            }}>
              <h3 style={{ color: '#ffd600', marginBottom: '20px' }}>Book Your Seasonal Check</h3>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email</label>
                    <input
                      type="email"
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #555',
                        background: '#000000',
                        color: '#fff'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Car Registration</label>
                    <input
                      type="text"
                      value={bookingForm.carRegistration}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, carRegistration: e.target.value }))}
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #555',
                        background: '#000000',
                        color: '#fff'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Car Make</label>
                    <input
                      type="text"
                      value={bookingForm.carMake}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, carMake: e.target.value }))}
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #555',
                        background: '#000000',
                        color: '#fff'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Car Model</label>
                    <input
                      type="text"
                      value={bookingForm.carModel}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, carModel: e.target.value }))}
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #555',
                        background: '#000000',
                        color: '#fff'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Season</label>
                    <select
                      value={bookingForm.season}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, season: e.target.value as 'summer' | 'winter' }))}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #555',
                        background: '#000000',
                        color: '#fff'
                      }}
                    >
                      <option value="summer">Summer</option>
                      <option value="winter">Winter</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Preferred Date</label>
                    <input
                      type="date"
                      value={bookingForm.preferredDate}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, preferredDate: e.target.value }))}
                      required
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #555',
                        background: '#000000',
                        color: '#fff'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Preferred Time</label>
                    <input
                      type="time"
                      value={bookingForm.preferredTime}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, preferredTime: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '5px',
                        border: '1px solid #555',
                        background: '#000000',
                        color: '#fff'
                      }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Additional Notes</label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '5px',
                      border: '1px solid #555',
                      background: '#000000',
                      color: '#fff',
                      resize: 'vertical'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: loading 
                      ? 'linear-gradient(45deg, #6c757d, #868e96)'
                      : 'linear-gradient(45deg, #ffd600, #ffed4e)',
                    color: '#000',
                    border: 'none',
                    padding: '15px 30px',
                    borderRadius: '8px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    width: '100%'
                  }}
                >
                  {loading ? 'Booking...' : 'Book Seasonal Check'}
                </button>
              </form>
            </div>
          )}

          {!eligibility?.eligible && membership?.membershipType !== 'premium' && (
            <div style={{
              background: '#000000',
              padding: '30px',
              borderRadius: '10px',
              textAlign: 'center',
              border: '1px solid #555'
            }}>
              <h3 style={{ color: '#ffd600', marginBottom: '20px' }}>
                Upgrade to Premium for Seasonal Checks
              </h3>
              <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                Seasonal vehicle checks are a premium member benefit. Upgrade your membership to access free seasonal checks twice per year.
              </p>
              <a
                href="/membership"
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(45deg, #ffd600, #ffed4e)',
                  color: '#000',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                View Membership Plans
              </a>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SeasonalCheckBooking;