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
  const [isQuoteRequest, setIsQuoteRequest] = useState(false);
  const [quoteRequestData, setQuoteRequestData] = useState<any>(null);
  const [processingMessage, setProcessingMessage] = useState('');
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
      processPayment(sessionIdParam);
    }
  }, [searchParams, hasAttemptedBooking, bookingCreated]);

  const processPayment = async (sessionId: string) => {
    setProcessingMessage('Processing your payment...');
    setIsProcessing(true);
    
    try {
      // First, try to determine if this is a quote request payment
      const isQuotePayment = await checkIfQuoteRequest(sessionId);
      
      if (isQuotePayment) {
        setProcessingMessage('Processing quote request payment...');
        await handleQuoteRequestPayment(sessionId);
      } else {
        setProcessingMessage('Processing regular booking...');
        await handleRegularBooking(sessionId);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setBookingError('Failed to process payment. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const checkIfQuoteRequest = async (sessionId: string): Promise<boolean> => {
    try {
      // Method 1: Check session type via API
      const response = await fetch(`${API_BASE_URL}/api/check-session-type?session_id=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.isQuoteRequest) {
          setQuoteRequestData(data.quoteRequest);
          return true;
        }
      }
    } catch (error) {
      console.log('Session type check failed, trying alternative method');
    }

    try {
      // Method 2: Check by looking for quote requests with matching session ID
      const response = await fetch(`${API_BASE_URL}/api/quote-requests`);
      if (response.ok) {
        const quoteRequests = await response.json();
        const matchingQuote = quoteRequests.find((qr: any) => 
          qr.paymentLink && qr.paymentLink.includes(sessionId)
        );
        
        if (matchingQuote) {
          setQuoteRequestData(matchingQuote);
          return true;
        }
      }
    } catch (error) {
      console.log('Quote request search failed');
    }

    return false;
  };

  const handleQuoteRequestPayment = async (sessionId: string) => {
    try {
      setProcessingMessage('Completing quote request payment...');
      
      // Use the new enhanced endpoint
      const response = await fetch(`${API_BASE_URL}/api/complete-quote-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Quote request payment processed:', result);
        
        setIsQuoteRequest(true);
        setQuoteRequestData(result.quoteRequest);
        setBookingCreated(true);
        setProcessingMessage('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process quote request payment');
      }
    } catch (error) {
      console.error('❌ Error processing quote request payment:', error);
      setBookingError(error instanceof Error ? error.message : 'Failed to process quote request payment');
    }
  };

  const handleRegularBooking = async (sessionId: string) => {
    try {
      setProcessingMessage('Creating your booking...');
      
      // Get pending booking data from localStorage
      const pendingBookingData = localStorage.getItem('pendingBooking');
      
      if (!pendingBookingData) {
        throw new Error('No booking data found. Please try again.');
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
        services: allServices
      };
      
      setProcessingMessage('Saving your booking...');
      
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
        console.log('✅ Regular booking created:', result);
        
        setBookingCreated(true);
        setBookingError('');
        setProcessingMessage('');
        
        // Clean up localStorage
        localStorage.removeItem('pendingBooking');
        localStorage.removeItem('checkoutCart');
        localStorage.removeItem('checkoutCarDetails');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('❌ Error creating regular booking:', error);
      setBookingError(error instanceof Error ? error.message : 'Failed to create booking');
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
            {isQuoteRequest 
              ? 'Thank you for your payment! Your quote request has been accepted and your booking is confirmed.'
              : 'Thank you for your booking! Your services have been confirmed and will appear in your past services.'
            }
          </p>

          {/* Processing Status */}
          {isProcessing && (
            <div style={{ 
              background: '#ffd600', 
              color: '#111', 
              padding: '16px 24px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              fontWeight: '600'
            }}>
              ⏳ {processingMessage}
            </div>
          )}
          
          {/* Success Status */}
          {bookingCreated && !isProcessing && (
            <div style={{ 
              background: '#28a745', 
              color: '#fff', 
              padding: '16px 24px', 
              borderRadius: '8px', 
              marginBottom: '24px',
              fontWeight: '600'
            }}>
              ✅ {isQuoteRequest ? 'Your Quote Payment is Confirmed!' : 'Your Booking is Confirmed!'}
            </div>
          )}
          
          {/* Error Status */}
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

          {/* Quote Request Details */}
          {isQuoteRequest && quoteRequestData && bookingCreated && (
            <div style={{ 
              background: '#181818', 
              borderRadius: '16px', 
              padding: '32px', 
              marginBottom: '32px',
              border: '1px solid #232323'
            }}>
              <h3 style={{ color: '#ffd600', fontSize: '1.3rem', fontWeight: '600', marginBottom: '20px' }}>
                📋 Quote Request Details:
              </h3>
              <div style={{ textAlign: 'left', color: '#bdbdbd', lineHeight: '1.8' }}>
                <div style={{ 
                  padding: '16px', 
                  background: '#232323', 
                  borderRadius: '8px', 
                  marginBottom: '12px',
                  border: '1px solid #333'
                }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#fff', fontSize: '1.1rem' }}>
                    {quoteRequestData.service?.title || 'Service Request'}
                  </p>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#888' }}>
                    {quoteRequestData.serviceDescription}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#ffd600', fontSize: '0.9rem' }}>
                      💰 Quoted Price: £{quoteRequestData.quotedPrice?.toFixed(2)}
                    </span>
                    <span style={{ color: '#4CAF50', fontSize: '0.9rem' }}>
                      ✅ Payment Completed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Services Booked */}
          {bookingCreated && !isQuoteRequest && (
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
              {isQuoteRequest ? (
                <>
                  <p>• Your quote payment has been processed successfully</p>
                  <p>• Your booking has been automatically created and confirmed</p>
                  <p>• You'll receive a confirmation email shortly</p>
                  <p>• We'll contact you to schedule your appointment</p>
                  <p>• You can view your booking in the dashboard</p>
                </>
              ) : (
                <>
                  <p>• Your booking has been added to our system</p>
                  <p>• Our team will review your service request</p>
                  <p>• You'll receive a confirmation email shortly</p>
                  <p>• We'll contact you to schedule your appointment</p>
                  <p>• You can reply to messages by opening your dashboard</p>
                </>
              )}
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
