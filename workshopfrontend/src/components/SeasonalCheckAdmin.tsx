import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

interface Membership {
  _id: string;
  userEmail: string;
  membershipType: 'free' | 'premium';
  billingCycle: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  status: 'active' | 'cancelled' | 'expired';
  stripeSubscriptionId?: string;
  benefits: {
    labourDiscount: number;
    freeChecks: number;
    fluidTopUps: number;
    motDiscount: number;
    referralCredits: number;
  };
}

interface SeasonalCheck {
  _id: string;
  userEmail: string;
  userName: string;
  carRegistration: string;
  carMake: string;
  carModel: string;
  season: 'spring' | 'winter';
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  requestedDate: string;
  preferredTime: string;
  notes?: string;
  createdAt: string;
  membershipEligible: boolean;
  membershipType: string;
  billingCycle: string;
}

interface Service {
  _id: string;
  label: string;
  sub: string;
  price: number;
  category: string;
  description: string;
  isSeasonalCheck?: boolean;
}

const SeasonalCheckAdmin: React.FC = () => {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [seasonalChecks, setSeasonalChecks] = useState<SeasonalCheck[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    userEmail: '',
    carRegistration: '',
    carMake: '',
    carModel: '',
    season: 'spring' as 'spring' | 'winter',
    preferredDate: '',
    preferredTime: '09:00',
    notes: ''
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membershipsRes, seasonalChecksRes, servicesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/memberships`),
        fetch(`${API_BASE_URL}/api/seasonal-checks`),
        fetch(`${API_BASE_URL}/api/services`)
      ]);

      if (membershipsRes.ok) {
        const membershipsData = await membershipsRes.json();
        setMemberships(membershipsData);
      }

      if (seasonalChecksRes.ok) {
        const checksData = await seasonalChecksRes.json();
        setSeasonalChecks(checksData);
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData.filter((s: Service) => s.isSeasonalCheck));
      }
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const isEligibleForSeasonalCheck = (membership: Membership, season: 'spring' | 'winter'): boolean => {
    if (membership.membershipType !== 'premium' || membership.status !== 'active') {
      return false;
    }

    const now = new Date();
    const startDate = new Date(membership.startDate);
    const endDate = new Date(membership.endDate);

    // Check if membership is currently active
    if (now < startDate || now > endDate) {
      return false;
    }

    // For annual subscriptions: always eligible for both seasons
    if (membership.billingCycle === 'yearly') {
      return true;
    }

    // For monthly subscriptions: only eligible if active during the season
    if (membership.billingCycle === 'monthly') {
      const currentMonth = now.getMonth();
      const isSpringSeason = currentMonth >= 2 && currentMonth <= 5; // March to June
      const isWinterSeason = currentMonth >= 9 || currentMonth <= 1; // October to February

      if (season === 'spring' && isSpringSeason) {
        return true;
      }
      if (season === 'winter' && isWinterSeason) {
        return true;
      }
    }

    return false;
  };

  const getSeasonalChecksUsed = (userEmail: string, year: number): number => {
    return seasonalChecks.filter(check => 
      check.userEmail === userEmail && 
      new Date(check.createdAt).getFullYear() === year &&
      (check.status === 'approved' || check.status === 'completed')
    ).length;
  };

  const handleCreateBooking = async () => {
    try {
      const membership = memberships.find(m => m.userEmail === bookingForm.userEmail);
      if (!membership) {
        alert('No membership found for this email');
        return;
      }

      const currentYear = new Date().getFullYear();
      const checksUsed = getSeasonalChecksUsed(bookingForm.userEmail, currentYear);
      
      if (checksUsed >= 2) {
        alert('Maximum seasonal checks (2) already used this year');
        return;
      }

      if (!isEligibleForSeasonalCheck(membership, bookingForm.season)) {
        alert('Customer is not eligible for seasonal check at this time');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/seasonal-checks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingForm,
          membershipEligible: true,
          membershipType: membership.membershipType,
          billingCycle: membership.billingCycle
        })
      });

      if (response.ok) {
        setShowBookingModal(false);
        setBookingForm({
          userEmail: '',
          carRegistration: '',
          carMake: '',
          carModel: '',
          season: 'spring',
          preferredDate: '',
          preferredTime: '09:00',
          notes: ''
        });
        fetchData();
        alert('Seasonal check booking created successfully');
      } else {
        alert('Failed to create booking');
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      alert('Error creating booking');
    }
  };

  const handleStatusUpdate = async (checkId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/seasonal-checks/${checkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchData();
        alert('Status updated successfully');
      } else {
        alert('Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error updating status');
    }
  };

  const filteredChecks = seasonalChecks.filter(check => {
    const matchesFilter = filter === 'all' || check.status === filter;
    const matchesSearch = searchTerm === '' || 
      check.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      check.carRegistration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      check.userName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        color: '#fff',
        fontSize: '1.2rem'
      }}>
        Loading seasonal check data...
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', 
      color: '#fff',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '30px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            background: 'linear-gradient(45deg, #ffd600, #ffed4e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Seasonal Check Management
          </h1>
          <button
            onClick={() => setShowBookingModal(true)}
            style={{
              background: 'linear-gradient(45deg, #ffd600, #ffed4e)',
              color: '#000',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            + Create New Booking
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px', 
          marginBottom: '30px' 
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%)',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #555'
          }}>
            <h3 style={{ color: '#ffd600', margin: '0 0 10px 0' }}>Total Bookings</h3>
            <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>{seasonalChecks.length}</p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%)',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #555'
          }}>
            <h3 style={{ color: '#ffd600', margin: '0 0 10px 0' }}>Pending</h3>
            <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>
              {seasonalChecks.filter(c => c.status === 'pending').length}
            </p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%)',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #555'
          }}>
            <h3 style={{ color: '#ffd600', margin: '0 0 10px 0' }}>Completed</h3>
            <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>
              {seasonalChecks.filter(c => c.status === 'completed').length}
            </p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%)',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #555'
          }}>
            <h3 style={{ color: '#ffd600', margin: '0 0 10px 0' }}>Active Members</h3>
            <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>
              {memberships.filter(m => m.status === 'active').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          marginBottom: '20px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div>
            <label style={{ marginRight: '10px', color: '#ccc' }}>Filter by status:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              style={{
                background: '#333',
                color: '#fff',
                border: '1px solid #555',
                padding: '8px 12px',
                borderRadius: '5px'
              }}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <input
              type="text"
              placeholder="Search by email, registration, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: '#333',
                color: '#fff',
                border: '1px solid #555',
                padding: '8px 12px',
                borderRadius: '5px',
                minWidth: '300px'
              }}
            />
          </div>
        </div>

        {/* Bookings Table */}
        <div style={{
          background: 'linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%)',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid #555'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#1a1a1a' }}>
                <th style={{ padding: '15px', textAlign: 'left', color: '#ffd600' }}>Customer</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#ffd600' }}>Vehicle</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#ffd600' }}>Season</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#ffd600' }}>Membership</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#ffd600' }}>Status</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#ffd600' }}>Requested Date</th>
                <th style={{ padding: '15px', textAlign: 'left', color: '#ffd600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChecks.map((check) => {
                const membership = memberships.find(m => m.userEmail === check.userEmail);
                const checksUsed = getSeasonalChecksUsed(check.userEmail, new Date().getFullYear());
                const isEligible = membership ? isEligibleForSeasonalCheck(membership, check.season) : false;
                
                return (
                  <tr key={check._id} style={{ borderBottom: '1px solid #444' }}>
                    <td style={{ padding: '15px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{check.userName}</div>
                        <div style={{ color: '#ccc', fontSize: '0.9rem' }}>{check.userEmail}</div>
                      </div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{check.carMake} {check.carModel}</div>
                        <div style={{ color: '#ccc', fontSize: '0.9rem' }}>{check.carRegistration}</div>
                      </div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        background: check.season === 'spring' ? '#28a745' : '#007bff',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        textTransform: 'capitalize'
                      }}>
                        {check.season}
                      </span>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div>
                        <div style={{ 
                          color: membership?.membershipType === 'premium' ? '#ffd600' : '#ccc',
                          fontWeight: 'bold'
                        }}>
                          {membership?.membershipType?.toUpperCase() || 'N/A'}
                        </div>
                        <div style={{ color: '#ccc', fontSize: '0.8rem' }}>
                          {membership?.billingCycle || 'N/A'} • {checksUsed}/2 used
                        </div>
                        {!isEligible && (
                          <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>
                            Not eligible
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <span style={{
                        background: 
                          check.status === 'pending' ? '#ffc107' :
                          check.status === 'approved' ? '#28a745' :
                          check.status === 'completed' ? '#007bff' : '#dc3545',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        textTransform: 'capitalize'
                      }}>
                        {check.status}
                      </span>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div>{new Date(check.requestedDate).toLocaleDateString()}</div>
                      <div style={{ color: '#ccc', fontSize: '0.8rem' }}>{check.preferredTime}</div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {check.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(check._id, 'approved')}
                              style={{
                                background: '#28a745',
                                color: '#fff',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                              }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(check._id, 'cancelled')}
                              style={{
                                background: '#dc3545',
                                color: '#fff',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {check.status === 'approved' && (
                          <button
                            onClick={() => handleStatusUpdate(check._id, 'completed')}
                            style={{
                              background: '#007bff',
                              color: '#fff',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Create Booking Modal */}
        {showBookingModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%)',
              padding: '30px',
              borderRadius: '10px',
              width: '90%',
              maxWidth: '500px',
              border: '1px solid #555'
            }}>
              <h2 style={{ color: '#ffd600', marginBottom: '20px' }}>Create Seasonal Check Booking</h2>
              
              <div style={{ display: 'grid', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Customer Email</label>
                  <input
                    type="email"
                    value={bookingForm.userEmail}
                    onChange={(e) => setBookingForm({...bookingForm, userEmail: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: '#333',
                      color: '#fff',
                      border: '1px solid #555',
                      borderRadius: '5px'
                    }}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Car Make</label>
                    <input
                      type="text"
                      value={bookingForm.carMake}
                      onChange={(e) => setBookingForm({...bookingForm, carMake: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: '#333',
                        color: '#fff',
                        border: '1px solid #555',
                        borderRadius: '5px'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Car Model</label>
                    <input
                      type="text"
                      value={bookingForm.carModel}
                      onChange={(e) => setBookingForm({...bookingForm, carModel: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: '#333',
                        color: '#fff',
                        border: '1px solid #555',
                        borderRadius: '5px'
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Registration</label>
                  <input
                    type="text"
                    value={bookingForm.carRegistration}
                    onChange={(e) => setBookingForm({...bookingForm, carRegistration: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: '#333',
                      color: '#fff',
                      border: '1px solid #555',
                      borderRadius: '5px'
                    }}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Season</label>
                    <select
                      value={bookingForm.season}
                      onChange={(e) => setBookingForm({...bookingForm, season: e.target.value as 'spring' | 'winter'})}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: '#333',
                        color: '#fff',
                        border: '1px solid #555',
                        borderRadius: '5px'
                      }}
                    >
                      <option value="spring">Spring</option>
                      <option value="winter">Winter</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Preferred Time</label>
                    <select
                      value={bookingForm.preferredTime}
                      onChange={(e) => setBookingForm({...bookingForm, preferredTime: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: '#333',
                        color: '#fff',
                        border: '1px solid #555',
                        borderRadius: '5px'
                      }}
                    >
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="12:00">12:00</option>
                      <option value="13:00">13:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Preferred Date</label>
                  <input
                    type="date"
                    value={bookingForm.preferredDate}
                    onChange={(e) => setBookingForm({...bookingForm, preferredDate: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: '#333',
                      color: '#fff',
                      border: '1px solid #555',
                      borderRadius: '5px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#ccc' }}>Notes</label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: '#333',
                      color: '#fff',
                      border: '1px solid #555',
                      borderRadius: '5px',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                justifyContent: 'flex-end', 
                marginTop: '20px' 
              }}>
                <button
                  onClick={() => setShowBookingModal(false)}
                  style={{
                    background: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBooking}
                  style={{
                    background: 'linear-gradient(45deg, #ffd600, #ffed4e)',
                    color: '#000',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Create Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeasonalCheckAdmin;
