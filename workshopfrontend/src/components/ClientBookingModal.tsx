import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { API_BASE_URL } from '../config';

interface ClientBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedService: {
    id: number;
    category: string;
    title: string;
    price: string;
    duration: string;
    details: string;
    labourHours?: number;
    labourCost?: number;
  } | null;
}

const ClientBookingModal: React.FC<ClientBookingModalProps> = ({ isOpen, onClose, selectedService }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    carMake: '',
    carModel: '',
    carYear: '',
    carRegistration: '',
    preferredDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    preferredTime: '09:00',
    additionalNotes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Debug logging
  console.log('🔍 ClientBookingModal rendered with timeSlots:', timeSlots);
  console.log('🔍 Current formData:', formData);



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    // Show payment form instead of submitting directly
    setShowPaymentForm(true);
  };

  const handlePayment = async () => {
    if (!selectedService) return;

    setPaymentLoading(true);
    
    try {
      // Create booking data with proper time field
      const bookingData = {
        car: {
          make: formData.carMake,
          model: formData.carModel,
          year: formData.carYear,
          registration: formData.carRegistration,
        },
        customer: {
          name: formData.customerName,
          email: formData.customerEmail,
          phone: formData.customerPhone,
          postcode: '',
          address: '',
        },
        service: {
          label: selectedService.title,
          sub: `${selectedService.duration} - ${selectedService.category.toLowerCase()}`,
          description: selectedService.details,
          price: parseFloat(selectedService.price.replace('£', '')),
        },
        parts: [],
        labourHours: selectedService.labourHours || 0,
        labourCost: selectedService.labourCost || 0,
        partsCost: 0,
        subtotal: parseFloat(selectedService.price.replace('£', '')) + (selectedService.labourHours || 0) * (selectedService.labourCost || 0),
        vat: (parseFloat(selectedService.price.replace('£', '')) + (selectedService.labourHours || 0) * (selectedService.labourCost || 0)) * 0.2,
        total: (parseFloat(selectedService.price.replace('£', '')) + (selectedService.labourHours || 0) * (selectedService.labourCost || 0)) * 1.2,
        date: formData.preferredDate,
        time: formData.preferredTime, // This ensures time is saved
        category: selectedService.category.toLowerCase() === 'tyres' ? 'tyres' : 
                 selectedService.category.toLowerCase() === 'repairs' ? 'mechanical' : 'service',
        status: 'pending',
        paymentStatus: 'pending',
        additionalNotes: formData.additionalNotes
      };

      console.log('🚗 Creating booking with data:', bookingData);
      console.log('⏰ Time field:', formData.preferredTime);
      console.log('📅 Date field:', formData.preferredDate);

      // Create the booking
      console.log('📤 Sending booking to backend...');
      const bookingResponse = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      console.log('📥 Backend response status:', bookingResponse.status);
      
      if (!bookingResponse.ok) {
        const errorText = await bookingResponse.text();
        console.error('❌ Backend error:', errorText);
        throw new Error(`Failed to create booking: ${errorText}`);
      }

      const booking = await bookingResponse.json();
      console.log('✅ Booking created successfully:', booking);

      // For now, just show success (payment simulation)
      console.log('🎉 Booking ID:', booking._id);

      // Show success message
      setSubmitSuccess(true);
      setTimeout(() => {
        onClose();
        setSubmitSuccess(false);
        setShowPaymentForm(false);
        setFormData({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          carMake: '',
          carModel: '',
          carYear: '',
          carRegistration: '',
          preferredDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
          preferredTime: '09:00',
          additionalNotes: ''
        });
      }, 2000);

    } catch (error) {
      console.error('Booking error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Booking failed';
      alert(`Booking failed: ${errorMessage}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (!isOpen || !selectedService) return null;

  return (
    <div className="client-booking-modal-bg">
      <div className="client-booking-modal">
        <button className="client-booking-modal-close" onClick={onClose}>&times;</button>
        
        {submitSuccess ? (
          <div className="booking-success">
            <h2>🎉 Booking Submitted Successfully!</h2>
            <p>Thank you for choosing our services. We'll contact you shortly to confirm your appointment.</p>
            <div className="success-icon">✅</div>
          </div>
        ) : (
          <>
            <h2>Book Your Service</h2>
            
            {/* Selected Service Summary */}
            <div className="selected-service-summary">
              <h3>{selectedService.title}</h3>
              <div className="service-details">
                <span className="service-category">{selectedService.category}</span>
                <span className="service-price">{selectedService.price}</span>
                <span className="service-duration">{selectedService.duration}</span>
              </div>
              <p className="service-description">{selectedService.details}</p>
            </div>

            <form onSubmit={handleSubmit} className="client-booking-form">
              {/* Customer Information */}
              <div className="form-section">
                <h3>Your Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="customerName">Full Name *</label>
                    <input
                      type="text"
                      id="customerName"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="customerEmail">Email Address *</label>
                    <input
                      type="email"
                      id="customerEmail"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="customerPhone">Phone Number *</label>
                  <input
                    type="tel"
                    id="customerPhone"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="form-section">
                <h3>Vehicle Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="carMake">Car Make *</label>
                    <input
                      type="text"
                      id="carMake"
                      name="carMake"
                      value={formData.carMake}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="carModel">Car Model *</label>
                    <input
                      type="text"
                      id="carModel"
                      name="carModel"
                      value={formData.carModel}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="carYear">Year *</label>
                    <input
                      type="text"
                      id="carYear"
                      name="carYear"
                      value={formData.carYear}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="carRegistration">Registration Number *</label>
                    <input
                      type="text"
                      id="carRegistration"
                      name="carRegistration"
                      value={formData.carRegistration}
                      onChange={handleInputChange}
                      required
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="form-section">
                <h3>Appointment Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="preferredDate">Preferred Date *</label>
                    <input
                      type="date"
                      id="preferredDate"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      min={dayjs().add(1, 'day').format('YYYY-MM-DD')}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="preferredTime">Preferred Time *</label>
                    <select
                      id="preferredTime"
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                      required
                      style={{ border: '2px solid red' }} // Temporary styling to make it visible
                    >
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    <small style={{ color: 'red', fontSize: '12px' }}>Time field should be visible here</small>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="additionalNotes">Additional Notes (Optional)</label>
                  <textarea
                    id="additionalNotes"
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any specific requirements or concerns..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Proceed to Payment'}
                </button>
              </div>
            </form>

            {/* Booking Confirmation */}
            {showPaymentForm && (
              <div className="payment-section">
                <h3>Booking Confirmation</h3>
                <div className="payment-summary">
                  <div className="payment-row">
                    <span>Service:</span>
                    <span>{selectedService.title}</span>
                  </div>
                  <div className="payment-row">
                    <span>Date:</span>
                    <span>{formData.preferredDate} at {formData.preferredTime}</span>
                  </div>
                  <div className="payment-row total">
                    <span>Total Amount:</span>
                    <span>{selectedService.price}</span>
                  </div>
                </div>
                
                <div className="payment-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowPaymentForm(false)}>
                    Back to Form
                  </button>
                  <button 
                    type="button" 
                    className="btn-submit" 
                    onClick={handlePayment}
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? 'Creating Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClientBookingModal; 