import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

interface QuoteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService: {
    id: number;
    category: string;
    title: string;
    duration?: string;
    details?: string;
    description?: string;
    image?: string;
    isPremiumOnly?: boolean;
    premiumBenefit?: string;
    labourCost?: number;
  } | null;
}

interface MembershipInfo {
  membershipType: string;
  benefits: {
    labourDiscount: number;
    freeChecks: number;
    fluidTopUps: number;
    motDiscount: number;
    referralCredits: number;
  };
}

const QuoteRequestModal: React.FC<QuoteRequestModalProps> = ({ isOpen, onClose, selectedService }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    carMake: '',
    carModel: '',
    carYear: '',
    carVin: '',
    carMileage: '',
    serviceDescription: '',
    additionalDetails: '',
    urgency: 'normal',
    preferredDate: '',
    preferredTime: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [membershipInfo, setMembershipInfo] = useState<MembershipInfo | null>(null);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [regInput, setRegInput] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  const timeSlots = [
    { value: '08:00', label: '8:00 AM' },
    { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '13:00', label: '1:00 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '17:00', label: '5:00 PM' }
  ];

  useEffect(() => {
    const fetchMembershipInfo = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
          const response = await fetch(`${API_BASE_URL}/api/membership/${userEmail}`);
          if (response.ok) {
            const data = await response.json();
            setMembershipInfo(data);
            setIsPremiumUser(data.membershipType === 'premium');
            // Pre-fill email for Premium users
            if (data.membershipType === 'premium') {
              setFormData(prev => ({
                ...prev,
                customerEmail: userEmail
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching membership info:', error);
      }
    };

    if (isOpen) {
      fetchMembershipInfo();
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getServiceType = (serviceName: string) => {
    if (serviceName.includes('Seasonal Check') || serviceName.includes('Fluid Top-up') || serviceName.includes('Wiper Blade Fitting')) {
      return 'free'; // Completely free services
    } else if (serviceName.includes('MOT Pre-Check')) {
      return 'discounted'; // Discounted services
    }
    return 'regular'; // Regular services
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const serviceType = getServiceType(selectedService.title);
      
      // Check if this is a Premium service and user is Premium
      if (selectedService.isPremiumOnly && isPremiumUser) {
        // Use Premium booking endpoint
        const response = await fetch(`${API_BASE_URL}/api/premium-service-booking`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userEmail: localStorage.getItem('userEmail'),
            serviceName: selectedService.title,
            serviceDescription: formData.serviceDescription || selectedService.details,
            vehicleDetails: `${formData.carMake} ${formData.carModel} ${formData.carYear} - VIN: ${formData.carVin}, Mileage: ${formData.carMileage}`,
            preferredDate: formData.preferredDate,
            preferredTime: formData.preferredTime,
            additionalDetails: formData.additionalDetails,
            serviceType: serviceType,
            customerName: formData.customerName,
            customerPhone: formData.customerPhone
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.isFreeService) {
            setSubmitMessage(`🎉 FREE Premium service booked! Your ${selectedService.title} is confirmed. No admin approval needed!`);
          } else {
            setSubmitMessage(`✅ Premium quote request submitted! Admin will provide quote with your discount applied.`);
          }
          setFormData({
            customerName: '',
            customerEmail: '',
            customerPhone: '',
            carMake: '',
            carModel: '',
            carYear: '',
            carVin: '',
            carMileage: '',
            serviceDescription: '',
            additionalDetails: '',
            urgency: 'normal',
            preferredDate: '',
            preferredTime: ''
          });
          setTimeout(() => {
            onClose();
            setSubmitMessage('');
          }, 3000);
        } else {
          const errorData = await response.json();
          setSubmitMessage(`Failed to process Premium service: ${errorData.error}`);
        }
      } else {
        // Regular quote request
        const response = await fetch(`${API_BASE_URL}/api/quote-requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serviceId: selectedService.id,
            serviceName: selectedService.title,
            customerName: formData.customerName,
            customerEmail: formData.customerEmail,
            customerPhone: formData.customerPhone,
            carMake: formData.carMake,
            carModel: formData.carModel,
            carYear: formData.carYear,
            carVin: formData.carVin,
            carMileage: formData.carMileage,
            serviceDescription: formData.serviceDescription,
            additionalDetails: formData.additionalDetails,
            urgency: formData.urgency,
            preferredDateTime: formData.preferredDate && formData.preferredTime 
              ? `${formData.preferredDate}T${formData.preferredTime}:00` 
              : null,
            alternativeDateTime: null
          }),
        });

        if (response.ok) {
          setSubmitMessage('Quote request submitted successfully! We will contact you soon.');
          setFormData({
            customerName: '',
            customerEmail: '',
            customerPhone: '',
            carMake: '',
            carModel: '',
            carYear: '',
            carVin: '',
            carMileage: '',
            serviceDescription: '',
            additionalDetails: '',
            urgency: 'normal',
            preferredDate: '',
            preferredTime: ''
          });
          setTimeout(() => {
            onClose();
            setSubmitMessage('');
          }, 2000);
        } else {
          setSubmitMessage('Failed to submit quote request. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      setSubmitMessage('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDVLAlookup = async () => {
    setLookupLoading(true);
    setLookupError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/dvla-lookup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationNumber: regInput })
      });
      if (!response.ok) throw new Error('Vehicle not found or API error');
      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        carMake: data.make || prev.carMake,
        carModel: data.model || prev.carModel,
        carYear: data.yearOfManufacture ? String(data.yearOfManufacture) : prev.carYear
      }));
    } catch (err: any) {
      setLookupError(err.message || 'Lookup failed');
    } finally {
      setLookupLoading(false);
    }
  };

  if (!isOpen || !selectedService) return null;

  const isPremiumService = selectedService.isPremiumOnly;
  const serviceType = getServiceType(selectedService.title);
  const canBookDirectly = isPremiumService && isPremiumUser && serviceType === 'free';

  return (
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
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          background: canBookDirectly 
            ? 'linear-gradient(135deg, #4CAF50, #8BC34A)' 
            : isPremiumService && isPremiumUser && serviceType === 'discounted'
            ? 'linear-gradient(135deg, #FF9800, #FFC107)'
            : 'linear-gradient(135deg, #ffd600, #ffed4e)',
          color: '#000',
          padding: '20px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'rgba(0, 0, 0, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              color: '#000',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: 'bold' }}>
            {canBookDirectly ? '🎉 Book FREE Premium Service' : 
             isPremiumService && isPremiumUser && serviceType === 'discounted' ? '💎 Premium Discount Quote' :
             'Request Quote'}
          </h2>
          <p style={{ margin: 0, fontSize: '16px' }}>
            {canBookDirectly 
              ? `Book your FREE ${selectedService.title} - No admin approval needed!`
              : isPremiumService && isPremiumUser && serviceType === 'discounted'
              ? `Get a quote for ${selectedService.title} with your Premium discount!`
              : `Get a quote for ${selectedService.title}`
            }
          </p>
          {isPremiumService && !isPremiumUser && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '10px',
              borderRadius: '8px',
              marginTop: '10px'
            }}>
              <p style={{ margin: 0, fontSize: '14px' }}>
                🔒 This is a Premium member benefit. <a href="/membership" style={{ color: '#000', textDecoration: 'underline' }}>Upgrade to Premium</a> to access this service!
              </p>
            </div>
          )}
          {isPremiumService && isPremiumUser && serviceType === 'discounted' && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '10px',
              borderRadius: '8px',
              marginTop: '10px'
            }}>
              <p style={{ margin: 0, fontSize: '14px' }}>
                💎 Premium Member: You'll receive a discounted quote from admin
              </p>
            </div>
          )}
        </div>

        <div style={{ padding: '20px', maxHeight: 'calc(90vh - 120px)', overflowY: 'auto' }}>
          {submitMessage && (
            <div style={{
              background: submitMessage.includes('successfully') || submitMessage.includes('FREE') ? '#4CAF50' : '#f44336',
              color: 'white',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {submitMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Customer Information */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#ffd600', fontSize: '1.1rem', marginBottom: '15px' }}>
                Contact Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#fff', fontSize: '14px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #444',
                      borderRadius: '8px',
                      backgroundColor: '#2a2a2a',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#fff', fontSize: '14px' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #444',
                      borderRadius: '8px',
                      backgroundColor: '#2a2a2a',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              {!isPremiumUser && (
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#fff', fontSize: '14px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #444',
                      borderRadius: '8px',
                      backgroundColor: '#2a2a2a',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>
              )}
              {isPremiumUser && (
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#fff', fontSize: '14px' }}>
                    Email Address (Premium Member)
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    disabled
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #444',
                      borderRadius: '8px',
                      backgroundColor: '#1a1a1a',
                      color: '#888',
                      fontSize: '14px'
                    }}
                  />
                  <p style={{ color: '#888', fontSize: '12px', margin: '5px 0 0 0' }}>
                    Using your Premium membership email
                  </p>
                </div>
              )}
            </div>

            {/* Vehicle Information */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#ffd600', fontSize: '1.1rem', marginBottom: '15px' }}>
                Vehicle Information
              </h3>
              {/* DVLA Lookup Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', marginBottom: '12px' }}>
                <input
                  type="text"
                  placeholder="Enter registration (e.g. KE14OYZ)"
                  value={regInput}
                  onChange={(e) => setRegInput(e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    backgroundColor: '#2a2a2a',
                    color: '#fff',
                    fontSize: '14px',
                    textTransform: 'uppercase'
                  }}
                />
                <button
                  type="button"
                  onClick={handleDVLAlookup}
                  disabled={lookupLoading || !regInput}
                  style={{
                    padding: '10px 16px',
                    background: '#ffd600',
                    color: '#111',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: lookupLoading || !regInput ? 'not-allowed' : 'pointer',
                    minWidth: 120
                  }}
                >
                  {lookupLoading ? 'Looking up...' : 'Lookup'}
                </button>
              </div>
              {lookupError && (
                <div style={{ color: '#ff6b6b', marginBottom: '8px' }}>{lookupError}</div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#fff', fontSize: '14px' }}>
                    Car Make *
                  </label>
                  <input
                    type="text"
                    name="carMake"
                    value={formData.carMake}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #444',
                      borderRadius: '8px',
                      backgroundColor: '#2a2a2a',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#fff', fontSize: '14px' }}>
                    Car Model *
                  </label>
                  <input
                    type="text"
                    name="carModel"
                    value={formData.carModel}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #444',
                      borderRadius: '8px',
                      backgroundColor: '#2a2a2a',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#fff', fontSize: '14px' }}>
                    Car Year *
                  </label>
                  <input
                    type="number"
                    name="carYear"
                    value={formData.carYear}
                    onChange={handleInputChange}
                    required
                    min="1990"
                    max="2025"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #444',
                      borderRadius: '8px',
                      backgroundColor: '#2a2a2a',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#fff', fontSize: '14px' }}>
                    VIN Number
                  </label>
                  <input
                    type="text"
                    name="carVin"
                    value={formData.carVin}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #444',
                      borderRadius: '8px',
                      backgroundColor: '#2a2a2a',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#fff', fontSize: '14px' }}>
                  Current Mileage
                </label>
                <input
                  type="number"
                  name="carMileage"
                  value={formData.carMileage}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    backgroundColor: '#2a2a2a',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Service Details */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#ffd600', fontSize: '1.1rem', marginBottom: '15px' }}>
                Service Details
              </h3>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#fff', fontSize: '14px' }}>
                  Service Description
                </label>
                <textarea
                  name="serviceDescription"
                  value={formData.serviceDescription}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder={selectedService.details}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    backgroundColor: '#2a2a2a',
                    color: '#fff',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#fff', fontSize: '14px' }}>
                  Additional Details
                </label>
                <textarea
                  name="additionalDetails"
                  value={formData.additionalDetails}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Any additional information or special requirements..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    backgroundColor: '#2a2a2a',
                    color: '#fff',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            {/* Preferred Time */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#ffd600', fontSize: '1.1rem', marginBottom: '15px' }}>
                Preferred Time
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#fff', fontSize: '14px' }}>
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #444',
                      borderRadius: '8px',
                      backgroundColor: '#2a2a2a',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#fff', fontSize: '14px' }}>
                    Preferred Time *
                  </label>
                  <select
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #444',
                      borderRadius: '8px',
                      backgroundColor: '#2a2a2a',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select time</option>
                    {timeSlots.map(slot => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '15px',
                background: canBookDirectly 
                  ? 'linear-gradient(135deg, #4CAF50, #8BC34A)' 
                  : isPremiumService && isPremiumUser && serviceType === 'discounted'
                  ? 'linear-gradient(135deg, #FF9800, #FFC107)'
                  : 'linear-gradient(135deg, #ffd600, #ffed4e)',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                transition: 'opacity 0.3s'
              }}
            >
              {isSubmitting 
                ? 'Processing...' 
                : canBookDirectly 
                  ? `✅ Approve Free ${selectedService.title}` 
                  : isPremiumService && isPremiumUser && serviceType === 'discounted'
                  ? `💎 Request Premium Quote`
                  : 'Request Quote'
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuoteRequestModal;
