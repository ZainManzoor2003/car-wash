import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

interface MaintenanceReminder {
  service: string;
  lastServiceDate?: string;
  nextDueDate?: string;
  daysUntilDue?: number;
  appointmentDate?: string;
  daysUntilAppointment?: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
  carRegistration: string;
  carDetails: {
    make: string;
    model: string;
    year: string;
  };
  time?: string;
  bookingId?: string;
}

const MaintenanceNotifications: React.FC = () => {
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchMaintenanceReminders();
  }, []);

  const fetchMaintenanceReminders = async () => {
    try {
      setLoading(true);
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) return;

      const response = await fetch(`${API_BASE_URL}/api/maintenance-reminders/${encodeURIComponent(userEmail)}`);
      if (!response.ok) throw new Error('Failed to fetch maintenance reminders');
      
      const data = await response.json();
      setReminders(data);
    } catch (err) {
      console.error('Error fetching maintenance reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#ffd600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" fill="#ff4757"/>
          <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
      case 'medium': return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" fill="#ffa502"/>
          <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
      case 'low': return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" fill="#2ed573"/>
          <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
      default: return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" fill="#ffd600"/>
          <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    }
  };

  const getPriorityGradient = (priority: string) => {
    switch (priority) {
      case 'high': return 'linear-gradient(135deg, #ff4757, #ff3742)';
      case 'medium': return 'linear-gradient(135deg, #ffa502, #ff9500)';
      case 'low': return 'linear-gradient(135deg, #2ed573, #20bf6b)';
      default: return 'linear-gradient(135deg, #ffd600, #ffed4e)';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getTimeUntilText = (days: number) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `${days} days`;
    if (days < 30) return `${Math.floor(days / 7)} weeks`;
    return `${Math.floor(days / 30)} months`;
  };

  if (loading) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
        `
      }} />
      
      {/* Notification Bell */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          style={{
            background: 'linear-gradient(135deg, #ffd600, #ffed4e)',
            border: 'none',
            borderRadius: '50%',
            width: '45px',
            height: '45px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: '0 4px 15px rgba(255, 214, 0, 0.4)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1) rotate(10deg)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 214, 0, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 214, 0, 0.4)';
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
        
        {/* Notification Badge */}
        {reminders.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: 'linear-gradient(135deg, #ff4757, #ff3742)',
            color: 'white',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid white',
            boxShadow: '0 2px 8px rgba(255, 71, 87, 0.4)',
            animation: 'pulse 2s infinite'
          }}>
            {reminders.length > 99 ? '99+' : reminders.length}
          </div>
        )}
      </div>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div style={{
          position: 'absolute',
          top: '60px',
          right: '0',
          width: '380px',
          backgroundColor: '#1a1a1a',
          border: '2px solid #ffd600',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          zIndex: 1000,
          maxHeight: '500px',
          overflowY: 'auto',
          animation: 'slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px 25px',
            background: 'linear-gradient(135deg, #ffd600, #ffed4e)',
            borderRadius: '18px 18px 0 0',
            color: '#1a1a1a',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-50%',
              width: '100px',
              height: '100px',
              background: 'rgba(255, 214, 0, 0.1)',
              borderRadius: '50%',
              animation: 'float 3s ease-in-out infinite'
            }} />
            
            {/* Close Button */}
            <button
              onClick={() => setShowNotifications(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: '#000',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#333';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#000';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            
            <h3 style={{ 
              margin: 0, 
              fontSize: '18px', 
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#1a1a1a',
              paddingRight: '40px' // Add padding to avoid overlap with close button
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              Maintenance Reminders
            </h3>
            <p style={{ 
              margin: '8px 0 0 0', 
              fontSize: '13px', 
              opacity: 0.8,
              fontWeight: '500',
              color: '#1a1a1a'
            }}>
              {reminders.length} total reminders
            </p>
          </div>

          {/* Reminders List */}
          <div style={{ padding: '15px', backgroundColor: '#1a1a1a' }}>
            {reminders.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#ffd600',
                fontSize: '14px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </div>
                <div style={{ fontWeight: '600', marginBottom: '5px', color: '#ffd600' }}>No reminders</div>
                <div style={{ color: '#cccccc' }}>You're all caught up!</div>
              </div>
            ) : (
              reminders.map((reminder, index) => (
                <div
                  key={index}
                  style={{
                    padding: '18px',
                    marginBottom: '12px',
                    background: 'linear-gradient(135deg, #2a2a2a, #1f1f1f)',
                    borderRadius: '15px',
                    border: '1px solid #333333',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 214, 0, 0.2)';
                    e.currentTarget.style.borderColor = '#ffd600';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#333333';
                  }}
                >
                  {/* Priority Indicator */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    background: getPriorityGradient(reminder.priority),
                    borderRadius: '0 4px 4px 0'
                  }} />
                  
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ 
                      marginRight: '12px', 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {getPriorityIcon(reminder.priority)}
                    </span>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: '700',
                      color: getPriorityColor(reminder.priority),
                      background: 'rgba(255, 214, 0, 0.2)',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      border: '1px solid rgba(255, 214, 0, 0.3)'
                    }}>
                      {reminder.priority}
                    </span>
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: '11px',
                      color: '#ffd600',
                      background: 'rgba(255, 214, 0, 0.1)',
                      padding: '4px 8px',
                      borderRadius: '10px',
                      fontWeight: '600',
                      border: '1px solid rgba(255, 214, 0, 0.2)'
                    }}>
                      {reminder.category}
                    </span>
                  </div>
                  
                  <div style={{ marginBottom: '8px' }}>
                    <strong style={{ 
                      color: '#ffd600', 
                      fontSize: '15px',
                      fontWeight: '700',
                      display: 'block',
                      marginBottom: '4px'
                    }}>
                      {reminder.service}
                    </strong>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#cccccc',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 17h2l.64-2.54A2 2 0 0 0 19.65 12H4.35a2 2 0 0 0-1.99 2.46L3 17h2"/>
                        <path d="M14 9V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v4"/>
                        <rect x="2" y="17" width="20" height="4" rx="1"/>
                      </svg>
                      <span style={{ fontWeight: '600' }}>
                        {reminder.carDetails.make} {reminder.carDetails.model}
                      </span>
                    </div>
                    
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#cccccc',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                      <span style={{ fontWeight: '600' }}>
                        {reminder.carRegistration}
                      </span>
                    </div>
                  </div>
                  
                  {reminder.appointmentDate && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#cccccc', 
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span style={{ fontWeight: '600' }}>
                        {formatDate(reminder.appointmentDate)} at {reminder.time}
                      </span>
                    </div>
                  )}
                  
                  {reminder.lastServiceDate && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#cccccc', 
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                      </svg>
                      <span style={{ fontWeight: '600' }}>
                        Last: {formatDate(reminder.lastServiceDate)}
                      </span>
                    </div>
                  )}
                  
                  {reminder.nextDueDate && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#cccccc', 
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                      <span style={{ fontWeight: '600' }}>
                        Due: {formatDate(reminder.nextDueDate)}
                      </span>
                    </div>
                  )}
                  
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: '700',
                    color: getPriorityColor(reminder.priority),
                    textAlign: 'right',
                    marginTop: '8px'
                  }}>
                    {reminder.daysUntilAppointment !== undefined ? (
                      <span style={{
                        background: getPriorityGradient(reminder.priority),
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {getTimeUntilText(reminder.daysUntilAppointment)}
                      </span>
                    ) : (
                      <span style={{
                        background: getPriorityGradient(reminder.priority),
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {getTimeUntilText(reminder.daysUntilDue || 0)} until due
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MaintenanceNotifications;
