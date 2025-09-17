import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { API_BASE_URL } from '../config';

const PastServicesPage: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Auto-fetch services when page opens
  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    const isLoggedIn = localStorage.getItem('token') && localStorage.getItem('role');
    
    if (storedEmail && isLoggedIn) {
      handleAutoSearch(storedEmail);
    } else {
      setError('Please log in to view your services.');
    }
  }, []);

  const handleAutoSearch = async (userEmail: string) => {
    setLoading(true);
    setError('');
    setServices([]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/user-services-with-images/${encodeURIComponent(userEmail.trim())}`);
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        setError('Failed to fetch services. Please try logging in again.');
        setServices([]);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setExpandedImage(imageUrl);
  };

  const closeExpandedImage = () => {
    setExpandedImage(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatPrice = (price: number) => {
    return `£${typeof price === 'number' ? price.toFixed(2) : '0.00'}`;
  };

  // Filter services to only show past services (before today)
  const filterPastServices = (services: any[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    return services.filter(service => {
      if (!service.date) return false;
      
      try {
        let serviceDate;
        
        // Handle different date formats
        if (typeof service.date === 'string') {
          // Check if it's a simple date format (YYYY-MM-DD)
          if (service.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            serviceDate = new Date(service.date);
          } else {
            // Handle complex date strings like "Sat Sep 06 2025 14:00:00 GMT+0500 (Pakistan Standard Time)"
            serviceDate = new Date(service.date);
          }
        } else {
          serviceDate = new Date(service.date);
        }
        
        serviceDate.setHours(0, 0, 0, 0); // Start of service date
        return serviceDate < today; // Only show services before today
      } catch (error) {
        console.error('Date parsing error:', error, 'for date:', service.date);
        return false;
      }
    });
  };

  // Get filtered past services
  const pastServices = filterPastServices(services);

  return (
    <>
      <Navbar />
      <div id="tepast"></div>
      <div style={{ background: '#111', minHeight: '100vh', padding: 0 }}>
        <div id="past2" style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 0 24px' }}>
          <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '2.2rem', marginBottom: 8 }}>Past Services</h1>
          <div style={{ color: '#bdbdbd', fontSize: '1.15rem', marginBottom: 32 }}>
            {localStorage.getItem('token') ? (
              <>
                Welcome back! Showing services for <span style={{ color: '#ffd600', fontWeight: 600 }}>{localStorage.getItem('userEmail')}</span>
              </>
            ) : (
              'Please log in to view your services.'
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#ff4444',
              color: '#fff',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 20px',
              color: '#bdbdbd'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #333',
                borderTop: '4px solid #ffd600',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '16px'
              }}></div>
              <div>Loading your services...</div>
            </div>
          )}

          {/* No Past Services Message */}
          {!loading && pastServices.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#ccc',
              fontSize: '1.1rem'
            }}>
              <div style={{
                background: 'rgba(255, 214, 0, 0.1)',
                border: '1px solid rgba(255, 214, 0, 0.3)',
                borderRadius: '15px',
                padding: '30px',
                maxWidth: '500px',
                margin: '0 auto'
              }}>
                <div style={{
                  fontSize: '2rem',
                  marginBottom: '15px'
                }}>📅</div>
                <div style={{
                  color: '#ffd600',
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  marginBottom: '10px'
                }}>
                  No Past Services Found
                </div>
                <div>
                  You don't have any completed services yet. Future appointments will appear here once they're completed.
                </div>
              </div>
            </div>
          )}

          {/* Services List */}
          {!loading && pastServices.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ 
                color: '#fff', 
                fontSize: '1.1rem', 
                marginBottom: 16 
              }}>
                Found {pastServices.length} service{pastServices.length !== 1 ? 's' : ''} for {localStorage.getItem('userEmail')}
              </div>
              
              {pastServices.map((service, index) => (
                <div key={service._id || index} style={{
                  background: '#181818',
                  borderRadius: 16,
                  padding: 24,
                  marginBottom: 16,
                  border: '1px solid #333',
                  transition: 'all 0.3s ease'
                }}>
                  {/* Service Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 16
                  }}>
                    <div>
                      <h3 style={{
                        color: '#fff',
                        fontSize: '1.3rem',
                        fontWeight: 600,
                        margin: '0 0 8px 0'
                      }}>
                        {service.service?.label || 'Service'}
                      </h3>
                      <div style={{
                        color: '#bdbdbd',
                        fontSize: '0.9rem',
                        marginBottom: 4
                      }}>
                        Car: {service.car?.make} {service.car?.model} ({service.car?.year}) - {service.car?.registration}
                      </div>
                      <div style={{
                        color: '#ffd600',
                        fontSize: '0.9rem',
                        fontWeight: 500
                      }}>
                        Completed: {formatDate(service.date)}
                      </div>
                    </div>
                    <div style={{
                      textAlign: 'right',
                      color: '#4CAF50',
                      fontSize: '1.1rem',
                      fontWeight: 600
                    }}>
                      {formatPrice(service.total)}
                    </div>
                  </div>

                  {/* Service Details */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 16,
                    marginBottom: 16
                  }}>
                    <div>
                      <div style={{ color: '#bdbdbd', fontSize: '0.8rem', marginBottom: 4 }}>Service Price</div>
                      <div style={{ color: '#fff', fontWeight: 500 }}>{formatPrice(service.service?.price || 0)}</div>
                    </div>
                    <div>
                      <div style={{ color: '#bdbdbd', fontSize: '0.8rem', marginBottom: 4 }}>Labour Hours</div>
                      <div style={{ color: '#fff', fontWeight: 500 }}>{service.labourHours || 0} hours</div>
                    </div>
                    <div>
                      <div style={{ color: '#bdbdbd', fontSize: '0.8rem', marginBottom: 4 }}>Labour Cost</div>
                      <div style={{ color: '#fff', fontWeight: 500 }}>{formatPrice(service.labourCost || 0)}</div>
                    </div>
                    <div>
                      <div style={{ color: '#bdbdbd', fontSize: '0.8rem', marginBottom: 4 }}>Parts Cost</div>
                      <div style={{ color: '#fff', fontWeight: 500 }}>{formatPrice(service.partsCost || 0)}</div>
                    </div>
                    <div>
                      <div style={{ color: '#bdbdbd', fontSize: '0.8rem', marginBottom: 4 }}>VAT</div>
                      <div style={{ color: '#fff', fontWeight: 500 }}>{formatPrice(service.vat || 0)}</div>
                    </div>
                    <div>
                      <div style={{ color: '#bdbdbd', fontSize: '0.8rem', marginBottom: 4 }}>Total</div>
                      <div style={{ color: '#4CAF50', fontWeight: 600, fontSize: '1.1rem' }}>{formatPrice(service.total || 0)}</div>
                    </div>
                  </div>

                  {/* Service Images - Show ALL images (both user and admin uploaded) with bigger size */}
                  {service.images && service.images.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{
                        color: '#bdbdbd',
                        fontSize: '0.9rem',
                        marginBottom: 12,
                        fontWeight: 500
                      }}>
                        Service Images:
                      </div>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 12
                      }}>
                        {service.images.map((image: any, imgIndex: number) => (
                          <div key={imgIndex} style={{ position: 'relative' }}>
                            <img
                              src={image.imageUrl || image}
                              alt={`Service image ${imgIndex + 1}`}
                              style={{
                                width: 120,
                                height: 120,
                                objectFit: 'cover',
                                borderRadius: 12,
                                cursor: 'pointer',
                                border: '2px solid #333',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                              }}
                              onClick={() => handleImageClick(image.imageUrl || image)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#ffd600';
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 6px 12px rgba(255, 214, 0, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#333';
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                              }}
                            />
                            {/* Show uploader badge */}
                            {image.uploadedBy && (
                              <div style={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                background: image.uploadedBy === 'admin' ? '#ffd600' : '#4CAF50',
                                color: '#000',
                                fontSize: '0.7rem',
                                padding: '4px 6px',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                              }}>
                                {image.uploadedBy === 'admin' ? 'ADMIN' : 'USER'}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Service Description */}
                  {service.service?.description && (
                    <div style={{
                      background: '#222',
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 16
                    }}>
                      <div style={{
                        color: '#bdbdbd',
                        fontSize: '0.9rem',
                        marginBottom: 4,
                        fontWeight: 500
                      }}>
                        Description:
                      </div>
                      <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                        {service.service.description}
                      </div>
                    </div>
                  )}

                  {/* Parts Used */}
                  {service.parts && service.parts.length > 0 && (
                    <div style={{
                      background: '#222',
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 16
                    }}>
                      <div style={{
                        color: '#bdbdbd',
                        fontSize: '0.9rem',
                        marginBottom: 8,
                        fontWeight: 500
                      }}>
                        Parts Used:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {service.parts.map((part: any, partIndex: number) => (
                          <div
                            key={partIndex}
                            style={{
                              background: '#333',
                              padding: '6px 12px',
                              borderRadius: 16,
                              fontSize: '0.8rem',
                              color: '#fff'
                            }}
                          >
                            {part.name} - {formatPrice(part.price)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Instructions */}
          {!loading && pastServices.length === 0 && (
            <div style={{
              background: '#181818',
              borderRadius: 16,
              padding: 24,
              textAlign: 'center',
              border: '1px solid #333'
            }}>
              <div style={{
                color: '#bdbdbd',
                fontSize: '1rem',
                lineHeight: 1.6
              }}>
                <p style={{ margin: '0 0 16px 0' }}>
                  This page shows your completed services. Future appointments will appear here once they're finished.
                </p>
                <p style={{ margin: '0 0 16px 0' }}>
                  To book a new service, visit our <a href="/services" style={{ color: '#ffd600', textDecoration: 'none' }}>Services page</a>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Expanded Image Modal with Close Button */}
      {expandedImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={closeExpandedImage}
        >
          {/* Close Button */}
          <button
            onClick={closeExpandedImage}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: '#ff4444',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              fontSize: '24px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1001,
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ff6666';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ff4444';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ×
          </button>
          
          {/* Image Container */}
          <div
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={expandedImage}
              alt="Expanded service image"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
              }}
            />
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default PastServicesPage;
