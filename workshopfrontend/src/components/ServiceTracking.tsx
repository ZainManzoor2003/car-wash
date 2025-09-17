import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

interface ServiceHistory {
  _id: string;
  userEmail: string;
  userName: string;
  car: {
    make: string;
    model: string;
    year: string;
    registration: string;
  };
  service: {
    label: string;
    sub: string;
    category: string;
    price: number;
  };
  services: Array<{
    label: string;
    sub: string;
    category: string;
    price: number;
    labourHours: number;
    labourCost: number;
  }>;
  total: number;
  date: string;
  time: string;
  status: string;
  createdAt: string;
  isSeasonalCheck?: boolean;
  season?: 'summer' | 'winter';
}

interface MaintenanceReminder {
  service: string;
  lastServiceDate: string;
  nextDueDate: string;
  daysUntilDue: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
  carRegistration: string;
  carDetails: {
    make: string;
    model: string;
    year: string;
  };
}

const ServiceTracking: React.FC = () => {
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);
  const [maintenanceReminders, setMaintenanceReminders] = useState<MaintenanceReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCar, setSelectedCar] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const userEmail = localStorage.getItem('userEmail');
      console.log('🔍 ServiceTracking: Starting fetchData, userEmail:', userEmail);
      
      if (!userEmail) {
        setError('User email not found');
        return;
      }

      // Fetch service history and maintenance reminders in parallel
      console.log('🔍 ServiceTracking: Fetching data from APIs...');
      const [historyResponse, remindersResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/user-services/${encodeURIComponent(userEmail)}`),
        fetch(`${API_BASE_URL}/api/maintenance-reminders/${encodeURIComponent(userEmail)}`)
      ]);

      console.log('🔍 ServiceTracking: History response status:', historyResponse.status);
      console.log('🔍 ServiceTracking: Reminders response status:', remindersResponse.status);

      if (!historyResponse.ok) throw new Error('Failed to fetch service history');
      if (!remindersResponse.ok) throw new Error('Failed to fetch maintenance reminders');
      
      const [historyData, remindersData] = await Promise.all([
        historyResponse.json(),
        remindersResponse.json()
      ]);

      console.log('🔍 ServiceTracking: History data received:', historyData);
      console.log('🔍 ServiceTracking: Reminders data received:', remindersData);

      setServiceHistory(historyData);
      setMaintenanceReminders(remindersData);
      console.log('🔍 ServiceTracking: State updated successfully');
    } catch (err) {
      setError('Failed to load service data');
      console.error('❌ ServiceTracking: Error fetching data:', err);
    } finally {
      setLoading(false);
      console.log('🔍 ServiceTracking: Loading set to false');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const filteredHistory = serviceHistory.filter(service => {
    const carMatch = selectedCar === 'all' || service.car.registration === selectedCar;
    const statusMatch = filterStatus === 'all' || service.status === filterStatus;
    return carMatch && statusMatch;
  });

  const uniqueCars = Array.from(new Set(serviceHistory.map(s => s.car.registration)));

  console.log('🔍 ServiceTracking: Render - loading:', loading, 'serviceHistory length:', serviceHistory.length, 'maintenanceReminders length:', maintenanceReminders.length);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        color: '#fff',
        marginTop: '100px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #333',
            borderTop: '4px solid #ffd600',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          Loading service history...
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      marginTop: '100px', 
      maxWidth: '1200px', 
      margin: '0 auto' 
    }}>
      <h2 style={{ color: '#fff', marginBottom: '30px', textAlign: 'center' }}>
        🔧 Service Tracking & Maintenance Reminders
      </h2>

      {/* Debug Info */}
      <div style={{
        background: '#333',
        color: '#fff',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '12px'
      }}>
        <strong>Debug Info:</strong> Service History: {serviceHistory.length} items, Maintenance Reminders: {maintenanceReminders.length} items
      </div>

      {/* Maintenance Reminders Section */}
      <div style={{
        background: 'linear-gradient(145deg, #2a2a2a, #1f1f1f)',
        borderRadius: '15px',
        padding: '25px',
        marginBottom: '30px',
        border: '1px solid #333'
      }}>
        <h3 style={{ color: '#ffd600', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
          ⏰ Maintenance Reminders
        </h3>
        
        {maintenanceReminders.length === 0 ? (
          <p style={{ color: '#ccc', textAlign: 'center', fontStyle: 'italic' }}>
            No maintenance reminders available. Complete some services to see upcoming maintenance alerts.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {maintenanceReminders.map((reminder, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  padding: '15px',
                  border: `2px solid ${getPriorityColor(reminder.priority)}`,
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(5px)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center' }}>
                    {getPriorityIcon(reminder.priority)} {reminder.service}
                  </h4>
                  <span style={{
                    background: getPriorityColor(reminder.priority),
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {reminder.priority}
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', color: '#ccc' }}>
                  <div>
                    <strong>Car:</strong> {reminder.carDetails.make} {reminder.carDetails.model} ({reminder.carRegistration})
                  </div>
                  <div>
                    <strong>Last Service:</strong> {formatDate(reminder.lastServiceDate)}
                  </div>
                  <div>
                    <strong>Next Due:</strong> {formatDate(reminder.nextDueDate)}
                  </div>
                  <div>
                    <strong>Days Until Due:</strong> 
                    <span style={{ 
                      color: reminder.daysUntilDue <= 0 ? '#dc3545' : 
                             reminder.daysUntilDue <= 7 ? '#ffc107' : '#28a745',
                      fontWeight: 'bold',
                      marginLeft: '5px'
                    }}>
                      {reminder.daysUntilDue <= 0 ? 'OVERDUE' : `${reminder.daysUntilDue} days`}
                    </span>
                  </div>
                  <div>
                    <strong>Category:</strong> {reminder.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Service History Section */}
      <div style={{
        background: 'linear-gradient(145deg, #2a2a2a, #1f1f1f)',
        borderRadius: '15px',
        padding: '25px',
        border: '1px solid #333'
      }}>
        <h3 style={{ color: '#ffd600', marginBottom: '20px' }}>
          📋 Service History
        </h3>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <select
            value={selectedCar}
            onChange={(e) => setSelectedCar(e.target.value)}
            style={{
              background: '#333',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '14px'
            }}
          >
            <option value="all">All Cars</option>
            {uniqueCars.map(car => (
              <option key={car} value={car}>{car}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              background: '#333',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '14px'
            }}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {error && (
          <div style={{
            background: '#dc3545',
            color: '#fff',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {filteredHistory.length === 0 ? (
          <p style={{ color: '#ccc', textAlign: 'center', fontStyle: 'italic' }}>
            No service history found for the selected filters.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {filteredHistory.map((service, index) => (
              <div
                key={service._id}
                style={{
                  background: service.isSeasonalCheck ? 'rgba(255, 165, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  padding: '20px',
                  border: service.isSeasonalCheck ? '1px solid #FFA500' : '1px solid #444',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = service.isSeasonalCheck ? 'rgba(255, 165, 0, 0.15)' : 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = service.isSeasonalCheck ? 'rgba(255, 165, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                    <h4 style={{ color: '#fff', margin: '0 0 5px 0' }}>
                      {service.isSeasonalCheck ? `${service.season?.charAt(0).toUpperCase()}${service.season?.slice(1)} Seasonal Check` : 
                       (service.service?.label || service.services?.[0]?.label || 'Service')}
                    </h4>
                    <p style={{ color: '#ccc', margin: 0, fontSize: '14px' }}>
                      {service.car.make} {service.car.model} ({service.car.registration})
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      background: service.status === 'completed' ? '#28a745' : 
                                 service.status === 'pending' ? '#ffc107' : 
                                 service.status === 'in-progress' ? '#17a2b8' : '#dc3545',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      marginBottom: '5px'
                    }}>
                      {service.status}
                    </div>
                    <div style={{ color: '#ffd600', fontWeight: 'bold', fontSize: '1.1rem' }}>
                      {service.isSeasonalCheck ? 'FREE' : formatCurrency(service.total)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', color: '#ccc', fontSize: '14px' }}>
                  <div>
                    <strong>Date:</strong> {formatDate(service.date || service.createdAt)}
                  </div>
                  <div>
                    <strong>Time:</strong> {service.time || 'N/A'}
                  </div>
                  <div>
                    <strong>Category:</strong> {service.isSeasonalCheck ? 'Seasonal Check' : (service.service?.category || service.services?.[0]?.category || 'N/A')}
                  </div>
                  <div>
                    <strong>Type:</strong> {service.isSeasonalCheck ? `${service.season} Check` : `Regular Service`}
                  </div>
                </div>

                {!service.isSeasonalCheck && service.services && service.services.length > 1 && (
                  <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <strong style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>All Services:</strong>
                    <div style={{ display: 'grid', gap: '5px' }}>
                      {service.services.map((svc, idx) => (
                        <div key={idx} style={{ color: '#ccc', fontSize: '14px' }}>
                          • {svc.label} - {formatCurrency(svc.price)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceTracking;
