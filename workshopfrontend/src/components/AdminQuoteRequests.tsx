import React, { useState, useEffect } from 'react';
// Fluid tracking removed in rollback
import { API_BASE_URL } from '../config';
import Navbar from './Navbar';
import CircularLoader from './CircularLoader';
import Footer from './Footer';

interface QuoteRequest {
  _id: string;
  // New nested structure
  service?: {
    title: string;
    category: string;
    duration: string;
    details: string;
  };
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  car?: {
    make: string;
    model: string;
    year: string;
    registration: string;
    mileage: string;
  };
  // Old flat structure (for backward compatibility)
  serviceId?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  carMake?: string;
  carModel?: string;
  carYear?: string;
  carVin?: string;
  carMileage?: string;
  // Common fields
  serviceDescription: string;
  additionalDetails: string;
  urgency: string;
  preferredDateTime: string;
  alternativeDateTime: string;
  status: string;
  quotedPrice?: number;
  quotedDetails?: string;
  paymentLink?: string;
  requestedAt: string;
  quotedAt?: string;
  paymentStatus: string;
  // Premium fields
  isPremiumService?: boolean;
  serviceName?: string;
  benefitType?: string;
  totalCost?: number;
  // Legacy fields for backward compatibility
  isPremiumQuote?: boolean;
  premiumBenefit?: string;
}

const AdminQuoteRequests: React.FC = () => {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  // Removed fluid tracking state in rollback
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quotedPrice, setQuotedPrice] = useState('');
  const [quotedDetails, setQuotedDetails] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  // Track which emails are premium members
  const [premiumEmails, setPremiumEmails] = useState<Record<string, boolean>>({});
  // Submitting state for loader overlay
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Removed fluid eligibility state
  // Services cache for discount lookup
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    fetchQuoteRequests();
  }, []);

  const fetchQuoteRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/quote-requests`);
      // Fetch services in parallel for discounts
      const servicesPromise = fetch(`${API_BASE_URL}/api/services`).then(r => r.ok ? r.json() : []);
      if (response.ok) {
        const data = await response.json();
        const servicesData = await servicesPromise;
        setServices(Array.isArray(servicesData) ? servicesData : []);
        setQuoteRequests(data);
        // Fetch membership status for unique customer emails
        try {
          const uniqueEmails = Array.from(new Set(
            (data as any[])
              .map((r:any) => (r.customer?.email || r.customerEmail || '').toLowerCase())
              .filter((e:string) => !!e)
          )) as string[];
          const results: Record<string, boolean> = {};
          await Promise.all(uniqueEmails.map(async (email: string) => {
            try {
              const mRes = await fetch(`${API_BASE_URL}/api/membership/${encodeURIComponent(email)}`);
              if (mRes.ok) {
                const membership = await mRes.json();
                results[email] = (membership?.membershipType === 'premium');
              }
            } catch {}
          }));
          setPremiumEmails(results);
        } catch {}
        // Removed fluid prechecks
      } else {
        setError('Failed to fetch quote requests');
      }
    } catch (err) {
      setError('Failed to fetch quote requests');
    } finally {
      setLoading(false);
    }
  };

  const getCustomerEmailLower = (request: QuoteRequest) => (request.customer?.email || request.customerEmail || '').toLowerCase();
  const getServiceTitle = (request: QuoteRequest) => (request.service?.title || (request as any).serviceName || '').toString();
  const getServiceDiscountForRequest = (request: QuoteRequest) => {
    const title = getServiceTitle(request);
    if (!title) return null;
    const svc = services.find((s:any) => (s.label || '').toLowerCase() === title.toLowerCase());
    if (!svc) return null;
    const isPremium = !!premiumEmails[getCustomerEmailLower(request)];
    const percent = isPremium ? (svc.premiumDiscount || 0) : (svc.standardDiscount || 0);
    if (!percent || percent <= 0) return null;
    return { percent, isPremium };
  };
  const renderServiceDiscount = (request: QuoteRequest): JSX.Element | null => {
    const d = getServiceDiscountForRequest(request);
    if (!d) return null;
    return (
      <p style={{
        color: '#ffd600',
        fontSize: '0.85rem',
        margin: '6px 0 0 0',
        fontWeight: 'bold'
      }}>
        {d.isPremium ? '💎 Premium' : '👤 Standard'} discount — {d.percent}% OFF
      </p>
    );
  };

  const renderLabourDiscount = (request: QuoteRequest): JSX.Element | null => {
    const email = getCustomerEmailLower(request);
    const isPremium = !!premiumEmails[email];
    if (!isPremium) return null;
    return (
      <p style={{
        color: '#ffd600',
        fontSize: '0.85rem',
        margin: '4px 0 0 0',
        fontWeight: 'bold'
      }}>
        💼 Labour discount — 5% OFF (Premium)
      </p>
    );
  };

  // Removed fluid eligibility helpers

  const handleQuoteSubmit = async () => {
    if (!selectedRequest || !quotedPrice || !quotedDetails) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/api/quote-requests/${selectedRequest._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'quoted',
          quotedPrice: parseFloat(quotedPrice),
          quotedDetails,
          customerEmail: selectedRequest.customer?.email || selectedRequest.customerEmail,
          serviceTitle: selectedRequest.service?.title || selectedRequest.serviceName
        }),
      });

      if (response.ok) {
        console.log('✅ Quote submitted successfully');
        setIsQuoteModalOpen(false);
        setQuotedPrice('');
        setQuotedDetails('');
        setSelectedRequest(null);
        fetchQuoteRequests();
      } else {
        console.error('❌ Failed to submit quote');
      }
    } catch (error) {
      console.error('❌ Error submitting quote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveUnlimitedService = async (request: QuoteRequest) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quote-requests/${request._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          quotedPrice: 0, // Free service
          quotedDetails: 'Approved - Free Premium Service',
          customerEmail: request.customer?.email || request.customerEmail,
          serviceTitle: request.service?.title || request.serviceName
        }),
      });

      if (response.ok) {
        console.log('✅ Unlimited Premium service approved');
        fetchQuoteRequests();
      } else {
        console.error('❌ Failed to approve service');
      }
    } catch (error) {
      console.error('❌ Error approving service:', error);
    }
  };

  const getServiceName = (request: QuoteRequest) => {
    return request.service?.title || request.serviceName || 'Unknown Service';
  };

  const getServiceId = (request: QuoteRequest) => {
    return request.serviceId || 'N/A';
  };

  const getCustomerName = (request: QuoteRequest) => {
    return request.customer?.name || request.customerName || 'Not provided';
  };

  const getCustomerEmail = (request: QuoteRequest) => {
    return request.customer?.email || request.customerEmail || 'Not provided';
  };

  const getCustomerPhone = (request: QuoteRequest) => {
    return request.customer?.phone || request.customerPhone || 'Not provided';
  };

  const getCarInfo = (request: QuoteRequest) => {
    if (request.car) {
      return `${request.car.make} ${request.car.model} (${request.car.year})`;
    }
    return `${request.carMake || 'Unknown'} ${request.carModel || 'Unknown'} (${request.carYear || 'Unknown'})`;
  };

  const getCarVin = (request: QuoteRequest) => {
    return request.car?.registration || request.carVin || 'Not provided';
  };

  const getCarMileage = (request: QuoteRequest) => {
    return request.car?.mileage || request.carMileage || 'Not provided';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'quoted': return '#2196f3';
      case 'accepted': return '#4caf50';
      case 'rejected': return '#f44336';
      case 'approved': return '#4caf50';
      default: return '#666';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return '#f44336';
      case 'high': return '#ff9800';
      case 'normal': return '#2196f3';
      case 'low': return '#4caf50';
      default: return '#666';
    }
  };

  const getPremiumBenefitText = (benefit: string) => {
    switch (benefit) {
      case 'mot_discount': return 'MOT Pre-Check (10% Discount)';
      case 'mot_precheck': return 'MOT Pre-Check (10% Discount)';
      case 'seasonal_check': return 'Free Seasonal Check';
      case 'fluid_topup': return 'Free Fluid Top-up';
      case 'wiper_fitting': return 'Free Wiper Blade Fitting';
      case 'labour_discount': return 'Labour Discount (5% off)';
      default: return 'Premium Member - Apply 5% Labour Discount';
    }
  };

  const isUnlimitedPremiumService = (request: QuoteRequest) => {
    // Treat as free wiper service if explicitly marked, or the title clearly says so
    const serviceName = getServiceName(request).toLowerCase();
    if ((request.benefitType || request.premiumBenefit) === 'wiper_fitting') return true;
    return serviceName.includes('wiper') && serviceName.includes('blade') && (serviceName.includes('free') || serviceName.includes('fitting'));
  };

  const filteredRequests = quoteRequests.filter(request => {
    if (filterStatus === 'all') return true;
    return request.status === filterStatus;
  });

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        color: '#fff',
        fontSize: '1.2rem'
      }}>
        Loading quote requests...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        color: '#f44336',
        fontSize: '1.2rem'
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', paddingTop: '155px' }}>
      <Navbar />
      
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#fff', fontSize: '2rem', marginBottom: '10px' }}>
          Quote Requests
        </h1>
        <p style={{ color: '#bdbdbd', fontSize: '1.1rem' }}>
          Manage customer quote requests and provide pricing
        </p>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: '20px' }}>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '10px 15px',
            borderRadius: '8px',
            border: '2px solid #333',
            background: '#1a1a1a',
            color: '#fff',
            fontSize: '1rem',
            outline: 'none'
          }}
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="quoted">Quoted</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      {/* Quote Requests List */}
      <div style={{
        display: 'grid',
        gap: '20px',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
      }}>
        {filteredRequests.map((request) => (
          <div
            key={request._id}
            style={{
              background: (request.isPremiumService || request.isPremiumQuote)
                ? 'linear-gradient(145deg, #2a2a2a, #1f1f1f)' 
                : 'linear-gradient(145deg, #2a2a2a, #1f1f1f)',
              borderRadius: '15px',
              padding: '25px',
              border: (request.isPremiumService || request.isPremiumQuote)
                ? '2px solid #ffd600' 
                : '1px solid #333',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Premium Badge */}
            {(request.isPremiumService || request.isPremiumQuote) && (
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '20px',
                background: 'linear-gradient(135deg, #ffd600, #ffed4e)',
                color: '#000',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)'
              }}>
                👑 PREMIUM MEMBER
              </div>
            )}

            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '20px',
              marginTop: (request.isPremiumService || request.isPremiumQuote) ? '10px' : '0'
            }}>
              <div>
                <h3 style={{
                  color: '#fff',
                  fontSize: '1.3rem',
                  marginBottom: '5px'
                }}>
                  {getServiceName(request)}
                </h3>
                <p style={{
                  color: '#bdbdbd',
                  fontSize: '0.9rem',
                  margin: 0
                }}>
                  Service ID: {getServiceId(request)}
                </p>
                {((request.isPremiumService && request.benefitType) || (request.isPremiumQuote && request.premiumBenefit)) && (
                  <p style={{
                    color: '#ffd600',
                    fontSize: '0.8rem',
                    margin: '5px 0 0 0',
                    fontWeight: 'bold'
                  }}>
                    💎 {getPremiumBenefitText(request.benefitType || request.premiumBenefit || '')}
                  </p>
                )}
                {isUnlimitedPremiumService(request) && (
                  <p style={{
                    color: '#4CAF50',
                    fontSize: '0.8rem',
                    margin: '5px 0 0 0',
                    fontWeight: 'bold'
                  }}>
                    ♾️ Unlimited Service
                  </p>
                )}
                {/* Show MOT premium note if customer email is a premium member */}
                {getServiceTitle(request).toLowerCase().includes('mot') && premiumEmails[getCustomerEmailLower(request)] && (
                  <p style={{
                    color: '#ffd600',
                    fontSize: '0.8rem',
                    margin: '5px 0 0 0',
                    fontWeight: 'bold'
                  }}>
                    💎 Premium member — apply 10% MOT discount
                  </p>
                )}
                {renderServiceDiscount(request)}
                {renderLabourDiscount(request)}
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  background: getStatusColor(request.status),
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}>
                  {request.status}
                </span>
                <div style={{
                  background: getUrgencyColor(request.urgency),
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '15px',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  marginTop: '8px'
                }}>
                  {request.urgency}
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ color: '#ffd600', fontSize: '1rem', marginBottom: '8px' }}>
                Customer Details
              </h4>
              <p style={{ color: '#e0e0e0', margin: '4px 0', fontSize: '0.9rem' }}>
                <strong>Name:</strong> {getCustomerName(request)}
              </p>
              <p style={{ color: '#e0e0e0', margin: '4px 0', fontSize: '0.9rem' }}>
                <strong>Email:</strong> {getCustomerEmail(request)}
              </p>
              <p style={{ color: '#e0e0e0', margin: '4px 0', fontSize: '0.9rem' }}>
                <strong>Phone:</strong> {getCustomerPhone(request)}
              </p>
            </div>

            {/* Vehicle Info */}
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ color: '#ffd600', fontSize: '1rem', marginBottom: '8px' }}>
                Vehicle Details
              </h4>
              <p style={{ color: '#e0e0e0', margin: '4px 0', fontSize: '0.9rem' }}>
                <strong>Car:</strong> {getCarInfo(request)}
              </p>
              {getCarVin(request) !== 'Not provided' && (
                <p style={{ color: '#e0e0e0', margin: '4px 0', fontSize: '0.9rem' }}>
                  <strong>VIN:</strong> {getCarVin(request)}
                </p>
              )}
              {getCarMileage(request) !== 'Not provided' && (
                <p style={{ color: '#e0e0e0', margin: '4px 0', fontSize: '0.9rem' }}>
                  <strong>Mileage:</strong> {getCarMileage(request)} miles
                </p>
              )}
            </div>

            {/* Preferred Time */}
            {request.preferredDateTime && (
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ color: '#ffd600', fontSize: '1rem', marginBottom: '8px' }}>
                  Preferred Time
                </h4>
                <p style={{ color: '#e0e0e0', margin: '4px 0', fontSize: '0.9rem' }}>
                  {new Date(request.preferredDateTime).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            )}

            {/* Service Description */}
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ color: '#ffd600', fontSize: '1rem', marginBottom: '8px' }}>
                Service Description
              </h4>
              <p style={{ color: '#e0e0e0', margin: '4px 0', fontSize: '0.9rem' }}>
                {request.serviceDescription}
              </p>
            </div>

            {/* Additional Details */}
            {request.additionalDetails && (
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ color: '#ffd600', fontSize: '1rem', marginBottom: '8px' }}>
                  Additional Details
                </h4>
                <p style={{ color: '#e0e0e0', margin: '4px 0', fontSize: '0.9rem' }}>
                  {request.additionalDetails}
                </p>
              </div>
            )}

            {/* Quote Information */}
            {request.status === 'quoted' && (
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ color: '#4caf50', fontSize: '1rem', marginBottom: '8px' }}>
                  Quote Information
                </h4>
                <p style={{ color: '#e0e0e0', margin: '4px 0', fontSize: '0.9rem' }}>
                  <strong>Price:</strong> £{request.quotedPrice}
                </p>
                <p style={{ color: '#e0e0e0', margin: '4px 0', fontSize: '0.9rem' }}>
                  <strong>Details:</strong> {request.quotedDetails}
                </p>
                {request.isPremiumQuote && (
                  <p style={{ color: '#ffd600', margin: '4px 0', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    💎 Premium Discount Applied: {(request.premiumBenefit === 'mot_discount' || request.premiumBenefit === 'mot_precheck') ? '10% off MOT' : request.premiumBenefit === 'labour_discount' ? '5% off Labour' : 'Premium Benefit'}
                  </p>
                )}
                {renderServiceDiscount(request)}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              {request.status === 'pending' && (
                <>
                  {(() => {
                    const renderApprove = (
                      <button
                        onClick={() => handleApproveUnlimitedService(request)}
                        style={{
                          background: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
                          color: '#fff',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          flex: 1,
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                      >
                        ✅ Approve Free Service
                      </button>
                    );

                    const renderQuote = (
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setIsQuoteModalOpen(true);
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #ffd600, #ffed4e)',
                          color: '#000',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          flex: 1,
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                      >
                        Provide Quote
                      </button>
                    );
                    // Free premium services should not show an Approve button
                    // They are auto-approved or handled without manual approval
                    // if (isUnlimitedPremiumService(request)) return renderApprove;
                    return renderQuote;
                  })()}
                </>
              )}
              
              {request.status === 'quoted' && (
                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                  <button
                    style={{
                      background: '#4caf50',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    Quote Sent
                  </button>
                </div>
              )}

              {request.status === 'approved' && (
                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                  <button
                    style={{
                      background: '#4caf50',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    ✅ Service Approved
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quote Modal */}
      {isQuoteModalOpen && selectedRequest && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#1a1a1a',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            padding: '30px',
            border: (selectedRequest.isPremiumService || selectedRequest.isPremiumQuote) ? '2px solid #ffd600' : '1px solid #333'
          }}>
            <h2 style={{ color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
              Provide Quote
            </h2>
            
            {(selectedRequest.isPremiumService || selectedRequest.isPremiumQuote) && (
              <div style={{
                background: 'linear-gradient(135deg, #ffd600, #ffed4e)',
                color: '#000',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <h3 style={{ margin: '0 0 10px 0' }}>👑 Premium Member Quote</h3>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  {(selectedRequest.benefitType || selectedRequest.premiumBenefit) === 'mot_discount' || (selectedRequest.benefitType || selectedRequest.premiumBenefit) === 'mot_precheck'
                    ? 'Apply 10% discount to MOT Pre-Check service'
                    : (selectedRequest.benefitType || selectedRequest.premiumBenefit) === 'wiper_fitting' || (selectedRequest.benefitType || selectedRequest.premiumBenefit) === 'seasonal_check'
                    ? 'This is a FREE Premium member benefit'
                    : 'Apply 5% discount to labour costs - Premium Member'
                  }
                </p>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#fff', marginBottom: '8px' }}>
                Quote Price (£)
              </label>
              <input
                type="number"
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(e.target.value)}
                placeholder="Enter quote price"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  backgroundColor: '#2a2a2a',
                  color: '#fff',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', color: '#fff', marginBottom: '8px' }}>
                Quote Details
              </label>
              <textarea
                value={quotedDetails}
                onChange={(e) => setQuotedDetails(e.target.value)}
                placeholder="Enter quote details and any additional information"
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  backgroundColor: '#2a2a2a',
                  color: '#fff',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={() => {
                  setIsQuoteModalOpen(false);
                  setSelectedRequest(null);
                  setQuotedPrice('');
                  setQuotedDetails('');
                }}
                style={{
                  background: '#666',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  flex: 1
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleQuoteSubmit}
                disabled={!quotedPrice || !quotedDetails || isSubmitting}
                style={{
                  background: 'linear-gradient(135deg, #ffd600, #ffed4e)',
                  color: '#000',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  flex: 1,
                  opacity: (!quotedPrice || !quotedDetails || isSubmitting) ? 0.5 : 1
                }}
              >
                {isSubmitting ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <CircularLoader size="small" showBackground={false} message="" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  'Send Quote'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredRequests.length === 0 && (
        <div style={{
          textAlign: 'center',
          color: '#bdbdbd',
          fontSize: '1.2rem',
          marginTop: '50px'
        }}>
          No quote requests found
        </div>
      )}
    
      {/* Fluid Tracking Modal */}
      {/* Removed Fluid Tracking Modal */}
      </div>
      
      <Footer />
    </div>
  );
};

export default AdminQuoteRequests;
