import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import QuoteRequestModal from './QuoteRequestModal';
import { API_BASE_URL } from '../config';

interface Service {
  _id: string;
  label: string;
  sub: string;
  price: number;
  category: string;
  description?: string;
  labourHours?: number;
  labourCost?: number;
  standardDiscount?: number;
  premiumDiscount?: number;
}

const UserDashboard: React.FC = () => {
  // Function to get discount display text
  const getDiscountText = (service: Service) => {
    console.log('🔍 getDiscountText called with service:', service);
    console.log('🔍 membershipInfo:', membershipInfo);
    console.log('🔍 Service discount fields:', {
      standardDiscount: service.standardDiscount,
      premiumDiscount: service.premiumDiscount
    });
    
    if (!membershipInfo) {
      console.log('🔍 No membership info available');
      return null;
    }
    
    const isPremium = membershipInfo.membershipType === 'premium';
    console.log('🔍 isPremium:', isPremium);
    console.log('🔍 service.standardDiscount:', service.standardDiscount);
    console.log('🔍 service.premiumDiscount:', service.premiumDiscount);
    
    const discountPercent = isPremium ? service.premiumDiscount : service.standardDiscount;
    console.log('🔍 discountPercent:', discountPercent);
    
    if (!discountPercent || discountPercent <= 0) return null;
    
    return (
      <div style={{
        background: 'linear-gradient(135deg, #ffd600, #ffed4e)',
        color: '#111',
        padding: '8px 12px',
        borderRadius: '20px',
        fontSize: '0.9rem',
        fontWeight: '600',
        marginBottom: '15px',
        display: 'inline-block',
        letterSpacing: '0.5px'
      }}>
        {discountPercent}% off with premium
      </div>
    );
  };

  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedServiceForQuote, setSelectedServiceForQuote] = useState<{
    id: number;
    category: string;
    title: string;
    duration: string;
    details: string;
  } | null>(null);
  const [membershipInfo, setMembershipInfo] = useState<{membershipType: string} | null>(null);
  const [rewardAllowed, setRewardAllowed] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch services
        const servicesResponse = await fetch(`${API_BASE_URL}/api/services`);
        
        // Fetch membership info
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const testUserType = urlParams.get('user'); // 'premium' or 'standard'
          
          let membershipData = null;
          if (testUserType) {
            // For testing with URL parameter
            membershipData = { membershipType: testUserType } as any;
            console.log('🔍 Testing with user type:', testUserType);
            console.log('🔍 URL params:', window.location.search);
          } else {
            // FORCE PREMIUM USER FOR TESTING
            membershipData = { membershipType: 'premium' } as any;
            console.log('🔍 FORCED PREMIUM USER FOR TESTING');
          }
          setMembershipInfo(membershipData);
        } catch (err) {
          console.log('🔍 No membership info available:', err);
          // Default to premium for testing
          setMembershipInfo({ membershipType: 'premium' });
        }

        // Fetch reward eligibility for current logged-in user (if available)
        try {
          const email = localStorage.getItem('userEmail') || localStorage.getItem('email');
          if (email) {
            const res = await fetch(`${API_BASE_URL}/api/reward/eligibility/${encodeURIComponent(email)}`);
            const data = await res.json();
            setRewardAllowed(!!data?.eligible);
          } else {
            setRewardAllowed(false);
          }
        } catch {
          setRewardAllowed(false);
        }

        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          console.log('🔧 Services data received:', servicesData);
          setServices(servicesData);
        }
      } catch (err) {
        setError('Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Maintenance': return '#28a745';
      case 'Repairs': return '#dc3545';
      case 'Diagnostics': return '#17a2b8';
      case 'Inspection': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const handleQuoteRequest = (service: Service) => {
    const serviceForQuote = {
      id: parseInt(service._id) || Math.random(),
      category: service.category,
      title: service.label,
      duration: service.sub || '1-2 hours',
      details: service.description || 'Professional service with quality workmanship.'
    };
    setSelectedServiceForQuote(serviceForQuote);
    setIsQuoteModalOpen(true);
  };

  // Visibility list based on eligibility for yearly specials
  const servicesVisible = services.filter(s => (s.category || '').toLowerCase() !== 'yearly' || rewardAllowed);

  const filteredServices = servicesVisible.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', ...Array.from(new Set(servicesVisible.map(s => s.category)))];

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: '#fff'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid #333',
          borderTop: '3px solid #ffd600',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <h2>Loading Services...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: '#fff'
      }}>
        <h2>Error: {error}</h2>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            background: '#ffd600',
            color: '#111',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', paddingTop: '200px' }}>
      <Navbar />
      
      <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            color: '#fff', 
            fontSize: '2.5rem', 
            marginBottom: '10px',
            background: 'linear-gradient(135deg, #ffd600, #ffed4e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Our Services
          </h1>
          <p style={{ color: '#bdbdbd', fontSize: '1.2rem' }}>
            Professional automotive services tailored to your needs
          </p>
        </div>

        {/* Search and Filter */}
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          marginBottom: '40px', 
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '12px 20px',
              borderRadius: '25px',
              border: '2px solid #333',
              background: '#1a1a1a',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none',
              minWidth: '300px',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#ffd600';
              e.target.style.boxShadow = '0 0 0 3px rgba(255, 214, 0, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#333';
              e.target.style.boxShadow = 'none';
            }}
          />
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '25px',
                  border: '2px solid #333',
                  background: selectedCategory === category ? '#ffd600' : 'transparent',
                  color: selectedCategory === category ? '#111' : '#fff',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.borderColor = '#ffd600';
                    e.currentTarget.style.color = '#ffd600';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.borderColor = '#333';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '30px',
          marginBottom: '40px'
        }}>
          {filteredServices.map((service, index) => (
            <div
              key={service._id}
              style={{
                background: 'linear-gradient(145deg, #2a2a2a, #1f1f1f)',
                borderRadius: '20px',
                padding: '30px',
                border: '1px solid #333',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.borderColor = '#ffd600';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#333';
              }}
            >
              {/* Category Badge */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: getCategoryColor(service.category),
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '15px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {service.category}
              </div>

              {/* Service Title */}
              <h3 style={{
                color: '#fff',
                fontSize: '1.5rem',
                marginBottom: '15px',
                marginRight: '100px',
                lineHeight: '1.3'
              }}>
                {service.label}
              </h3>
              
              {/* Discount Badge */}
              {getDiscountText(service)}

              {/* Service Duration */}
              <div style={{
                color: '#ffd600',
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '15px'
              }}>
                Duration: {service.sub || '1-2 hours'}
              </div>

              {/* Service Description */}
              <p style={{
                color: '#bdbdbd',
                fontSize: '1rem',
                lineHeight: '1.6',
                marginBottom: '25px',
                minHeight: '60px'
              }}>
                {service.description || 'Professional service with quality workmanship and attention to detail.'}
              </p>

              {/* Request Quote Button */}
              <button
                onClick={() => handleQuoteRequest(service)}
                style={{
                  width: '100%',
                  padding: '15px 25px',
                  background: 'linear-gradient(135deg, #ffd600, #ffed4e)',
                  color: '#111',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 214, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Request Quote
              </button>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'linear-gradient(145deg, #2a2a2a, #1f1f1f)',
            borderRadius: '20px',
            border: '1px solid #333'
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '20px'
            }}>
              🔍
            </div>
            <h3 style={{
              color: '#fff',
              fontSize: '1.5rem',
              marginBottom: '10px'
            }}>
              No services found
            </h3>
            <p style={{
              color: '#bdbdbd',
              fontSize: '1rem'
            }}>
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      <Footer />

      {/* Quote Request Modal */}
      <QuoteRequestModal
        isOpen={isQuoteModalOpen}
        onClose={() => {
          setIsQuoteModalOpen(false);
          setSelectedServiceForQuote(null);
        }}
        selectedService={selectedServiceForQuote}
      />
    </div>
  );
};

export default UserDashboard;
