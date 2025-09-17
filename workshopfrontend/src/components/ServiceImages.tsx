import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { API_BASE_URL } from '../config';

const ServiceImages: React.FC = () => {
  const [userEmail, setUserEmail] = useState('');
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Get user email from localStorage
  useEffect(() => {
    const email = localStorage.getItem('userEmail') || localStorage.getItem('email');
    if (email) {
      setUserEmail(email);
      fetchUserServices(email);
    }
  }, []);

  // Fetch user services with images
  const fetchUserServices = async (email: string) => {
    setLoading(true);
    try {
      console.log('🔍 Fetching services for user:', email);
      
      // Get user services
      const response = await fetch(`${API_BASE_URL}/api/user-services-with-images/${encodeURIComponent(email)}`);
      if (!response.ok) throw new Error('Failed to fetch services');
      
      const data = await response.json();
      console.log('📋 Found services:', data.length);
      setServices(data);
      
    } catch (error) {
      console.error('❌ Failed to fetch services:', error);
      alert('Failed to load your services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh services
  const handleRefresh = () => {
    if (userEmail) {
      fetchUserServices(userEmail);
    }
  };

  if (!userEmail) {
    return (
      <>
        <div id="upperi">
          <Navbar />
          <div id="inneri" style={{ background: '#111', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
            <div style={{ background: '#181818', borderRadius: 18, boxShadow: '0 4px 24px #0008', padding: 36, textAlign: 'center' }}>
              <h2 style={{ color: '#ffd600', fontWeight: 700, fontSize: '2.1rem', marginBottom: 20 }}>
                📸 Service Images
              </h2>
              <div style={{ color: '#bdbdbd', fontSize: '1.08rem' }}>
                Please log in to view your service images.
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <div id="upperi">
        <Navbar />
        <div id="inneri" style={{ background: '#111', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '48px 0' }}>
          <div style={{ background: '#181818', borderRadius: 18, boxShadow: '0 4px 24px #0008', padding: 36, minWidth: 340, maxWidth: 800, width: '100%', display: 'flex', flexDirection: 'column', gap: 22 }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: '#ffd600', fontWeight: 700, fontSize: '2.1rem', margin: 0 }}>
                📸 Your Service Images
              </h2>
              <button
                onClick={handleRefresh}
                disabled={loading}
                style={{ 
                  background: loading ? '#666' : '#4caf50', 
                  color: '#fff', 
                  fontWeight: 600, 
                  border: 'none', 
                  borderRadius: 8, 
                  padding: '10px 20px', 
                  fontSize: '1rem', 
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '⏳ Loading...' : '🔄 Refresh'}
              </button>
            </div>
            
            <div style={{ color: '#bdbdbd', fontSize: '1.08rem', textAlign: 'center', marginBottom: 20 }}>
              View images from your completed services
            </div>

            {/* Services List */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: 10 }}>⏳ Loading your services...</div>
                <div style={{ fontSize: '0.9rem' }}>Please wait...</div>
              </div>
            ) : services.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: 10 }}>📭 No services found</div>
                <div style={{ fontSize: '0.9rem' }}>
                  You don't have any services with images yet.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {services.map((service, index) => (
                  <div key={service._id} style={{ background: '#232323', borderRadius: 12, boxShadow: '0 2px 8px #0005', overflow: 'hidden' }}>
                    
                    {/* Service Header */}
                    <div style={{ padding: '20px', background: '#2a2a2a' }}>
                      <div style={{ color: '#ffd600', fontWeight: 600, fontSize: '1.2rem', marginBottom: 8 }}>
                        {service.service?.label || 'Service'}
                      </div>
                      
                      <div style={{ color: '#bdbdbd', fontSize: '0.95rem', marginBottom: 4 }}>
                        <strong>Car:</strong> {service.car?.make} {service.car?.model} {service.car?.year} - {service.car?.registration}
                      </div>
                      
                      <div style={{ color: '#bdbdbd', fontSize: '0.95rem', marginBottom: 4 }}>
                        <strong>Date:</strong> {new Date(service.date).toLocaleDateString()}
                      </div>
                      
                      <div style={{ color: '#bdbdbd', fontSize: '0.95rem' }}>
                        <strong>Status:</strong> {service.status || 'pending'}
                      </div>
                    </div>

                    {/* Images Section */}
                    <div style={{ padding: '20px' }}>
                      {service.images && service.images.length > 0 ? (
                        <>
                          <div style={{ color: '#4caf50', fontWeight: 600, marginBottom: 15, fontSize: '1.1rem' }}>
                            📸 Service Images ({service.images.length})
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 15 }}>
                            {service.images.map((image: any, imgIndex: number) => (
                              <div key={imgIndex} style={{ position: 'relative' }}>
                                <img
                                  src={image.imageUrl}
                                  alt={`Service ${service.service?.label || 'Service'} ${imgIndex + 1}`}
                                  style={{ 
                                    width: '100%', 
                                    height: 150, 
                                    objectFit: 'cover', 
                                    borderRadius: 8, 
                                    border: '2px solid #333',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => window.open(image.imageUrl, '_blank')}
                                  title="Click to view full size"
                                />
                                <div style={{ 
                                  position: 'absolute', 
                                  top: 5, 
                                  right: 5, 
                                  background: '#0008', 
                                  color: '#fff', 
                                  fontSize: '10px', 
                                  padding: '2px 6px', 
                                  borderRadius: 4 
                                }}>
                                  {imgIndex + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                          <div style={{ fontSize: '1rem', marginBottom: 5 }}>📷 No images yet</div>
                          <div style={{ fontSize: '0.9rem' }}>
                            Images will appear here once uploaded by our team.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default ServiceImages; 