import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { API_BASE_URL } from '../config';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [bookingCreated, setBookingCreated] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [hasAttemptedBooking, setHasAttemptedBooking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const processedSessionsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id');
    setSessionId(sessionIdParam);
    
    // CRITICAL: Prevent multiple booking attempts
    if (hasAttemptedBooking || bookingCreated) {
      return;
    }
    
    if (sessionIdParam) {
      setHasAttemptedBooking(true); // Prevent multiple attempts
      createDirectBooking(sessionIdParam);
    }
  }, [searchParams, hasAttemptedBooking, bookingCreated]);

  const createDirectBooking = async (sessionId: string) => {
    // ENHANCED FRONTEND-SIDE DUPLICATE PREVENTION
    if (processedSessionsRef.current.has(sessionId)) {
      setBookingCreated(true); // Mark as created since it was already processed
      return;
    }
    
    if (isCreating) {
      return;
    }
    
    if (hasAttemptedBooking) {
      return;
    }
    
    // Mark this session as being processed immediately
    processedSessionsRef.current.add(sessionId);
    setIsCreating(true);
    setHasAttemptedBooking(true);
    setBookingError('');
    
    // CRITICAL: Prevent any error state if booking is already successful
    if (bookingCreated) {
      setIsCreating(false);
      return;
    }
    
    try {
      // Get pending booking data from localStorage
      const pendingBookingData = localStorage.getItem('pendingBooking');
      
      if (!pendingBookingData) {
        setBookingError('No booking data found. Please try again.');
        setIsCreating(false);
        return;
      }
      
      const bookingData = JSON.parse(pendingBookingData);
      
      // Get ALL services from cart and calculate total
      const allServices = bookingData.cart;
      const totalPrice = allServices.reduce((sum: number, item: any) => {
        const servicePrice = item.service.price;
        const labourCost = item.service.labourHours ? (item.service.labourHours * (item.service.labourCost || 10)) : 0;
        return sum + servicePrice + labourCost;
      }, 0);
      
      const serviceDetails = {
        label: allServices.map((item: any) => item.service.label).join(', '),
        description: `Multiple services: ${allServices.map((item: any) => `${item.service.label} (x${item.quantity})`).join(', ')}`,
        price: totalPrice,
        services: allServices // Send the entire cart
      };
      
      // Call the direct booking endpoint
      const response = await fetch(`${API_BASE_URL}/api/create-booking-direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          userEmail: bookingData.userEmail,
          userName: bookingData.userName,
          carDetails: bookingData.carDetails,
          serviceDetails: serviceDetails
        }),
      });
      
              if (response.ok) {
          const result = await response.json();
                  // Set both states atomically to prevent race conditions
          setBookingCreated(true);
          setBookingError(''); // Clear any previous errors
        
        // Clean up localStorage
        localStorage.removeItem('pendingBooking');
        localStorage.removeItem('checkoutCart');
        localStorage.removeItem('checkoutCarDetails');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to create direct booking:', errorData);
        console.error('❌ HTTP Status:', response.status);
        console.error('❌ Response Headers:', Object.fromEntries(response.headers.entries()));
        console.error('❌ Full Error Response:', errorData);
        
                         // Only set error if booking wasn't already successful
                 if (!bookingCreated) {
                   setBookingError('Failed to create booking: ' + (errorData.error || errorData.message || 'Unknown error'));
                 }
      }
          } catch (error) {
        console.error('❌ Error creating direct booking:', error);
                       // Only set error if booking wasn't already successful
               if (!bookingCreated) {
                 setBookingError('Network error while creating booking');
               }
      } finally {
      setIsCreating(false);
    }
  };

  const createBookingFromSession = async (sessionId: string) => {
    
    // Check if we've already processed this session (using ref for immediate protection)
    if (processedSessionsRef.current.has(sessionId)) {
      setBookingCreated(true);
      return;
    }
    
    setIsCreating(true);
    try {
      // Get user info from localStorage
      const userEmail = localStorage.getItem('userEmail');
      const userName = localStorage.getItem('userName') || 'Customer';
      
      if (!userEmail) {
        setBookingError('User information not found. Please contact support.');
        return;
      }
      
          // Try to get car details and service details from localStorage
    let carDetails = null;
    let serviceDetails = null;
    
    try {
      // Try multiple storage locations
      const storedCarDetails = localStorage.getItem('checkoutCarDetails') || 
                               localStorage.getItem('_mechanics_carDetails') ||
                               sessionStorage.getItem('checkoutCarDetails');
      
      const storedCart = localStorage.getItem('checkoutCart') || 
                         localStorage.getItem('_mechanics_cart') ||
                         sessionStorage.getItem('checkoutCart');
      
      if (storedCarDetails) {
        carDetails = JSON.parse(storedCarDetails);
      }
      
      if (storedCart) {
        const cart = JSON.parse(storedCart);
        if (cart.length > 0) {
          // Get the first service from cart
          const firstService = cart[0];
          serviceDetails = {
            label: firstService.service.label,
            description: firstService.service.sub,
            price: firstService.service.price * firstService.quantity
          };
        }
      }
    } catch (error) {
      // Handle error silently
    }
    
    // Use the new session-based endpoint with actual data
    
    const response = await fetch(`${API_BASE_URL}/api/create-booking-from-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: sessionId,
        userEmail: userEmail,
        userName: userName,
        carDetails: carDetails,
        serviceDetails: serviceDetails
      }),
    });

              if (response.ok) {
          const result = await response.json();
          setBookingCreated(true);
        
        // Clean up localStorage
        localStorage.removeItem('checkoutCart');
        localStorage.removeItem('checkoutCarDetails');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to create booking:', errorData);
        console.error('❌ HTTP Status:', response.status);
        console.error('❌ Response Headers:', Object.fromEntries(response.headers.entries()));
        console.error('❌ Full Error Response:', errorData);
        
        // Check if it's a duplicate (which is actually success)
        if (errorData.isDuplicate) {
          setBookingCreated(true);
        } else {
          setBookingError('Failed to create booking: ' + (errorData.error || errorData.message || 'Unknown error'));
        }
      }
          } catch (error) {
        console.error('❌ Error creating booking:', error);
        setBookingError('Network error while creating booking');
      } finally {
        setIsCreating(false);
        setIsProcessing(false); // Reset processing state
      }
    };



  return (
    <>
      <Navbar />
      <div id="ret" style={{ background: '#111', minHeight: '100vh', padding: '120px 24px 48px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          {/* Success Icon */}
          <div style={{ 
            background: '#28a745', 
            width: '120px', 
            height: '120px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '40px auto 32px',
            fontSize: '60px'
          }}>
            ✅
          </div>

          {/* Success Message */}
          <h1 style={{ color: '#28a745', fontSize: '2.5rem', fontWeight: '700', marginBottom: '24px' }}>
            Payment Successful!
          </h1>
          
          <p style={{ color: '#bdbdbd', fontSize: '1.2rem', marginBottom: '32px', lineHeight: '1.6' }}>
            Thank you for your booking! Your services have been confirmed and will appear in your past services.
          </p>

          {/* Booking Status */}
          {isCreating && (
            <div style={{ 
              background: '#ffd600', 
              color: '#111', 
              padding: '16px 24px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              fontWeight: '600'
            }}>
              ⏳ Creating your booking... Please wait
            </div>
          )}
          
          {bookingCreated && (
            <div style={{ 
              background: '#28a745', 
              color: '#fff', 
              padding: '16px 24px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              fontWeight: '600'
            }}>
              ✅ Your Booking is Confirmed!
            </div>
          )}
          
          {bookingError && !bookingCreated && (
            <div style={{ 
              background: '#dc3545', 
              color: '#fff', 
              padding: '16px 24px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              fontWeight: '600'
            }}>
              ❌ {bookingError}
            </div>
          )}





          {/* Services Booked */}
          {bookingCreated && (
            <div style={{ 
              background: '#181818', 
              borderRadius: '16px', 
              padding: '32px', 
              marginBottom: '32px',
              border: '1px solid #232323'
            }}>
              <h3 style={{ color: '#ffd600', fontSize: '1.3rem', fontWeight: '600', marginBottom: '20px' }}>
                📋 Services You Booked:
              </h3>
              <div style={{ textAlign: 'left', color: '#bdbdbd', lineHeight: '1.8' }}>
                {(() => {
                  try {
                    const pendingBookingData = localStorage.getItem('pendingBooking');
                    if (pendingBookingData) {
                      const bookingData = JSON.parse(pendingBookingData);
                      return (
                        <>
                          {bookingData.cart.map((item: any, index: number) => (
                            <div key={index} style={{ 
                              padding: '16px', 
                              background: '#232323', 
                              borderRadius: '8px', 
                              marginBottom: '12px',
                              border: '1px solid #333'
                            }}>
                              <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#fff', fontSize: '1.1rem' }}>
                                {item.service.label}
                              </p>
                              <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#888' }}>
                                {item.service.sub}
                              </p>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#ffd600', fontSize: '0.9rem' }}>
                                  💰 Service: £{item.service.price}
                                </span>
                                {item.service.labourHours && item.service.labourHours > 0 ? (
                                  <span style={{ color: '#ffd600', fontSize: '0.9rem' }}>
                                    🔧 Labour: £{(item.service.labourHours * (item.service.labourCost || 10)).toFixed(2)}
                                  </span>
                                ) : (
                                  <span style={{ color: '#4CAF50', fontSize: '0.9rem' }}>
                                    ✅ Labour Included
                                  </span>
                                )}
                              </div>
                              {item.service.labourHours && item.service.labourHours > 0 && (
                                <div style={{ 
                                  marginTop: '8px', 
                                  padding: '8px', 
                                  background: '#1a1a1a', 
                                  borderRadius: '4px',
                                  border: '1px solid #444'
                                }}>
                                  <p style={{ margin: '0', color: '#ffd600', fontSize: '0.85rem', fontWeight: '600' }}>
                                    💳 Total: £{(item.service.price + (item.service.labourHours * (item.service.labourCost || 10))).toFixed(2)}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                          <div style={{ 
                            marginTop: '16px', 
                            padding: '16px', 
                            background: '#1a1a1a', 
                            borderRadius: '8px',
                            border: '2px solid #ffd600'
                          }}>
                            <p style={{ margin: '0', color: '#ffd600', fontSize: '1.1rem', fontWeight: '700', textAlign: 'center' }}>
                              🎯 Total Cart Amount: £{(() => {
                                const total = bookingData.cart.reduce((sum: number, item: any) => {
                                  const servicePrice = item.service.price;
                                  const labourCost = item.service.labourHours ? (item.service.labourHours * (item.service.labourCost || 10)) : 0;
                                  return sum + servicePrice + labourCost;
                                }, 0);
                                return total.toFixed(2);
                              })()}
                            </p>
                          </div>
                        </>
                      );
                    }
                    return <p>Service details will be updated by our team</p>;
                  } catch (error) {
                    return <p>Service details will be updated by our team</p>;
                  }
                })()}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div style={{ 
            background: '#181818', 
            borderRadius: '16px', 
            padding: '32px', 
            marginBottom: '32px',
            border: '1px solid #232323'
          }}>
            <h3 style={{ color: '#ffd600', fontSize: '1.3rem', fontWeight: '600', marginBottom: '20px' }}>
              What happens next?
            </h3>
            <div style={{ textAlign: 'left', color: '#bdbdbd', lineHeight: '1.8' }}>
              <p>• Your booking has been added to our system</p>
              <p>• Our team will review your service request</p>
              <p>• You'll receive a confirmation email shortly</p>
              <p>• We'll contact you to schedule your appointment</p>
              <p>• You can reply to messages by opening your dashboard</p>
            </div>
          </div>



          {/* Contact Info */}
          <div style={{ 
            marginTop: '48px', 
            padding: '24px', 
            background: '#181818', 
            borderRadius: '12px',
            border: '1px solid #232323'
          }}>
            <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>
              Have questions? Contact us at{' '}
              <span style={{ color: '#ffd600' }}>info@mechanics.com</span> or call{' '}
              <span style={{ color: '#ffd600' }}>+44 123 456 7890</span>
            </p>
          </div>
          

        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentSuccessPage; 