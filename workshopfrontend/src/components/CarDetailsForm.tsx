import React, { useState } from 'react';
import dayjs from 'dayjs';

interface CarDetails {
  make: string;
  model: string;
  year: string;
  registration: string;
  color: string;
  mileage: number;
  preferredDate: string;
  preferredTime: string;
}

interface CarDetailsFormProps {
  onSubmit: (carDetails: CarDetails) => void;
  onCancel: () => void;
  isVisible: boolean;
}

const CarDetailsForm: React.FC<CarDetailsFormProps> = ({ onSubmit, onCancel, isVisible }) => {
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const [carDetails, setCarDetails] = useState<CarDetails>({
    make: '',
    model: '',
    year: '',
    registration: '',
    color: '',
    mileage: 0,
    preferredDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    preferredTime: '09:00'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(carDetails);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCarDetails(prev => ({
      ...prev,
      [name]: name === 'mileage' ? parseInt(value) || 0 : value
    }));
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#181818',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid #232323',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)'
      }}>
        <h2 style={{ color: '#ffd600', fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', textAlign: 'center' }}>
          Car Details
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#fff', marginBottom: '8px', fontWeight: '500' }}>
              Car Make *
            </label>
            <input
              type="text"
              name="make"
              value={carDetails.make}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                background: '#111',
                color: '#eaeaea',
                border: '2px solid #444',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '1rem',
                outline: 'none'
              }}
              placeholder="e.g., Ford, BMW, Toyota"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#fff', marginBottom: '8px', fontWeight: '500' }}>
              Car Model *
            </label>
            <input
              type="text"
              name="model"
              value={carDetails.model}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                background: '#111',
                color: '#eaeaea',
                border: '2px solid #444',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '1rem',
                outline: 'none'
              }}
              placeholder="e.g., Focus, 3 Series, Corolla"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', color: '#fff', marginBottom: '8px', fontWeight: '500' }}>
                Year *
              </label>
              <input
                type="text"
                name="year"
                value={carDetails.year}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  background: '#111',
                  color: '#eaeaea',
                  border: '2px solid #444',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                placeholder="e.g., 2020"
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#fff', marginBottom: '8px', fontWeight: '500' }}>
                Registration *
              </label>
              <input
                type="text"
                name="registration"
                value={carDetails.registration}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  background: '#111',
                  color: '#eaeaea',
                  border: '2px solid #444',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                placeholder="e.g., AB12 CDE"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', color: '#fff', marginBottom: '8px', fontWeight: '500' }}>
                Color
              </label>
              <input
                type="text"
                name="color"
                value={carDetails.color}
                onChange={handleChange}
                style={{
                  width: '100%',
                  background: '#111',
                  color: '#eaeaea',
                  border: '2px solid #444',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                placeholder="e.g., Red, Blue, Silver"
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#fff', marginBottom: '8px', fontWeight: '500' }}>
                Mileage
              </label>
              <input
                type="number"
                name="mileage"
                value={carDetails.mileage}
                onChange={handleChange}
                style={{
                  width: '100%',
                  background: '#111',
                  color: '#eaeaea',
                  border: '2px solid #444',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
                placeholder="e.g., 50000"
              />
            </div>
          </div>

          {/* Appointment Details */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#ffd600', fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px', textAlign: 'center' }}>
              Appointment Details
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', color: '#fff', marginBottom: '8px', fontWeight: '500' }}>
                  Preferred Date *
                </label>
                <input
                  type="date"
                  name="preferredDate"
                  value={carDetails.preferredDate}
                  onChange={handleChange}
                  min={dayjs().add(1, 'day').format('YYYY-MM-DD')}
                  required
                  style={{
                    width: '100%',
                    background: '#111',
                    color: '#eaeaea',
                    border: '2px solid #444',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#fff', marginBottom: '8px', fontWeight: '500' }}>
                  Preferred Time *
                </label>
                <select
                  name="preferredTime"
                  value={carDetails.preferredTime}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    background: '#111',
                    color: '#eaeaea',
                    border: '2px solid #444',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                >
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                background: '#444',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                background: '#ffd600',
                color: '#111',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              Continue to Checkout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CarDetailsForm; 