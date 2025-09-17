import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { API_BASE_URL } from '../config';

interface BookingWithMessages {
  _id: string;
  customer: {
    name: string;
    email: string;
  };
  service?: {
    label: string;
    sub: string;
  };
  date: string;
  time: string;
  status: string;
  unreadMessageCount: number;
  lastMessage?: {
    message: string;
    senderName: string;
    createdAt: string;
  };
  // Premium service properties
  isPremiumService?: boolean;
  serviceName?: string;
  benefitType?: string;
  totalCost?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  vehicleDetails?: string;
}

interface MessagesPageProps {
  userEmail?: string;
  userName?: string;
}

const MessagesPage: React.FC<MessagesPageProps> = ({ userEmail, userName }) => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingWithMessages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showServicesSidebar, setShowServicesSidebar] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [lastBookingCount, setLastBookingCount] = useState(0);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Get user info from localStorage
  const currentUserEmail = userEmail || localStorage.getItem('userEmail');
  const currentUserName = userName || localStorage.getItem('userName') || 'Customer';

  useEffect(() => {
    if (currentUserEmail) {
      fetchBookingsWithMessages(true); // Initial load
    } else {
      setLoading(false);
    }
  }, []);  // Remove currentUserEmail dependency to prevent re-fetching

  // Auto-refresh bookings every 5 seconds for real-time messaging
  useEffect(() => {
    if (currentUserEmail && autoRefreshEnabled) {
      const interval = setInterval(() => {
        fetchBookingsWithMessages(false); // Background refresh
      }, 5000); // Refresh every 5 seconds for real-time messaging

      return () => clearInterval(interval);
    }
  }, [currentUserEmail, autoRefreshEnabled]);

  // Manual refresh function
  const refreshBookings = async () => {
    await fetchBookingsWithMessages(false); // Manual refresh
  };

  // Toggle auto-refresh function
  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
  };

  const fetchBookingsWithMessages = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await fetch(`${API_BASE_URL}/api/user/${currentUserEmail}/bookings-with-messages`);
      const data = await response.json();

      if (data.success) {
        const newBookings = data.bookings || [];

        // Check for new messages (only after initial load)
        if (!isInitialLoad) {
          const totalCurrentMessages = newBookings.reduce((sum: number, booking: any) => sum + (booking.unreadMessageCount || 0), 0);
          if (lastBookingCount > 0 && totalCurrentMessages > lastBookingCount) {
            setHasNewMessages(true);
            setTimeout(() => setHasNewMessages(false), 3000);
          }
          setLastBookingCount(totalCurrentMessages);
        } else {
          // Set initial count on first load
          const totalCurrentMessages = newBookings.reduce((sum: number, booking: any) => sum + (booking.unreadMessageCount || 0), 0);
          setLastBookingCount(totalCurrentMessages);
        }

        setBookings(newBookings);
        setError('');
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (err) {
      setError('Error fetching bookings');
      console.error('Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#4CAF50';
      case 'in-progress':
        return '#ffd700';
      case 'confirmed':
        return '#2196F3';
      case 'cancelled':
        return '#f44336';
      default:
        return '#888';
    }
  };

  // Filter bookings by selected service if one is selected
  const filteredBookings = selectedService
    ? bookings.filter(booking => {
      const serviceLabel = booking?.service?.label || '';
      const serviceSub = booking?.service?.sub || '';
      const selected = selectedService.toLowerCase();
      return serviceLabel.toLowerCase() === selected || serviceSub.toLowerCase().includes(selected);
    })
    : [...bookings].sort((a, b) => {
      // Sort by unread count first (highest first)
      if ((b.unreadMessageCount || 0) !== (a.unreadMessageCount || 0)) {
        return (b.unreadMessageCount || 0) - (a.unreadMessageCount || 0);
      }
      // Then by most recent message
      if (a.lastMessage && b.lastMessage) {
        return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
      }
      // Bookings with messages come first
      if (a.lastMessage && !b.lastMessage) return -1;
      if (!a.lastMessage && b.lastMessage) return 1;
      return 0;
    });

  const formatRelativeTime = (timestamp: string) => {
    const messageTime = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - messageTime.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }
  };

  // Mark messages as read when user clicks on a booking
  const handleMessageClick = async (booking: BookingWithMessages) => {
    try {
      // Mark messages as read for this booking
      const response = await fetch(`${API_BASE_URL}/api/bookings/${booking._id}/messages/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: currentUserEmail
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Update local state to reflect read status
        setBookings(prevBookings =>
          prevBookings.map(b =>
            b._id === booking._id
              ? { ...b, unreadMessageCount: data.updatedUnreadCount || 0 }
              : b
          )
        );
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }

    // Navigate to the booking messages page
    navigate(`/booking-messages/${booking._id}`);
  };

  // Get unique services from bookings
  const uniqueServices = Array.from(
    new Set(
      bookings
        .map(booking => booking?.service?.label || '')
        .filter(label => label && typeof label === 'string')
    )
  );

  // Toggle services sidebar
  const toggleServicesSidebar = () => {
    setShowServicesSidebar(!showServicesSidebar);
  };

  // Select a service
  const selectService = (service: string) => {
    setSelectedService(service === selectedService ? null : service);
    setShowServicesSidebar(false); // Close sidebar on mobile after selection
  };

  // Clear service filter
  const clearServiceFilter = () => {
    setSelectedService(null);
  };

  if (!currentUserEmail) {
    return (
      <>
        <Navbar />
        <div style={{
          background: '#111',
          minHeight: '100vh',
          padding: '24px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{
            maxWidth: 500,
            width: '100%',
            textAlign: 'center',
            color: '#fff',
            padding: '32px 24px',
            boxSizing: 'border-box'
          }}>
            <h1 style={{
              color: '#fff',
              fontWeight: 700,
              fontSize: 'clamp(1.8rem, 5vw, 2.2rem)',
              marginBottom: '24px',
              lineHeight: 1.2,
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}>
              Messages
            </h1>
            <div style={{
              color: '#bdbdbd',
              fontSize: 'clamp(1rem, 4vw, 1.15rem)',
              marginBottom: '32px',
              lineHeight: 1.5,
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}>
              Please log in to view your booking messages
            </div>
            <Link
              to="/login"
              style={{
                background: '#ffd700',
                color: '#111',
                padding: '14px 28px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-block',
                fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                minWidth: '140px',
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}
            >
              Login to Continue
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div id="mes" style={{
          background: '#111',
          minHeight: '100vh',
          padding: '24px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{
            maxWidth: 500,
            width: '100%',
            textAlign: 'center',
            color: '#fff',
            padding: '32px 24px',
            boxSizing: 'border-box'
          }}>
            <div style={{
              fontSize: 'clamp(1rem, 4vw, 1.2rem)',
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}>
              Loading your bookings...
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div id="mes" style={{
        background: '#111',
        minHeight: '100vh',
        padding: 0,
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative'
      }}>
        {/* Services Sidebar - Mobile First */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: showServicesSidebar ? 0 : '-100%',
          width: '85%',
          maxWidth: '350px',
          height: '100vh',
          background: '#1a1a1a',
          zIndex: 1000,
          transition: 'left 0.3s ease-in-out',
          overflowY: 'auto',
          overflowX: 'hidden',
          boxShadow: showServicesSidebar ? '2px 0 20px rgba(0,0,0,0.5)' : 'none',
          borderRight: '1px solid #333'
        }}>
          {/* Sidebar Header */}
          <div style={{
            background: '#232323',
            padding: '20px 16px',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{
              color: '#ffd700',
              margin: 0,
              fontSize: 'clamp(1.1rem, 4vw, 1.3rem)',
              fontWeight: 600
            }}>
              📋 Services
            </h3>
            <button
              onClick={toggleServicesSidebar}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </div>

          {/* Services List */}
          <div style={{ padding: '16px' }}>
            <div style={{
              marginBottom: '20px',
              padding: '12px',
              background: '#232323',
              borderRadius: '8px',
              border: '1px solid #333'
            }}>
              <div style={{
                color: '#bdbdbd',
                fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                marginBottom: '12px',
                lineHeight: 1.4
              }}>
                Select a service to filter messages
              </div>
              <button
                onClick={clearServiceFilter}
                style={{
                  background: '#ffd700',
                  color: '#111',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Show All Messages
              </button>
            </div>

            {uniqueServices.map((service, index) => (
              <div
                key={index}
                onClick={() => selectService(service)}
                style={{
                  background: selectedService === service ? '#ffd700' : '#232323',
                  color: selectedService === service ? '#111' : '#fff',
                  padding: '16px',
                  marginBottom: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${selectedService === service ? '#ffd700' : '#333'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div
                  className="service-letter-icon"
                  style={{
                    background: selectedService === service ? '#111' : '#ffd700',
                    color: selectedService === service ? '#ffd700' : '#111',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                  {service.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 600,
                    fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                    marginBottom: '4px',
                    lineHeight: 1.3
                  }}>
                    {service}
                  </div>
                  <div style={{
                    fontSize: 'clamp(0.75rem, 2.5vw, 0.8rem)',
                    opacity: 0.8
                  }}>
                    {bookings.filter(b => (b.isPremiumService ? b.serviceName : b.service?.label) === service).length} booking{bookings.filter(b => (b.isPremiumService ? b.serviceName : b.service?.label) === service).length !== 1 ? 's' : ''}
                  </div>
                </div>
                {selectedService === service && (
                  <div style={{
                    color: '#111',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}>
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Overlay for mobile */}
        {showServicesSidebar && (
          <div
            onClick={toggleServicesSidebar}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.5)',
              zIndex: 999,
              cursor: 'pointer'
            }}
          />
        )}

        {/* Main Content */}
        <div style={{
          maxWidth: 800,
          margin: '0 auto',
          padding: 'clamp(24px, 6vw, 48px) clamp(16px, 4vw, 24px) 0 clamp(16px, 4vw, 24px)',
          width: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}>
          {/* Header Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            marginBottom: '32px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <h1 style={{
                color: '#fff',
                fontWeight: 700,
                fontSize: 'clamp(1.8rem, 6vw, 2.2rem)',
                marginBottom: '8px',
                lineHeight: 1.2,
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                width: '100%'
              }}>
                {selectedService ? `${selectedService} Messages` : 'Booking Messages'}
              </h1>
              <div style={{
                color: '#bdbdbd',
                fontSize: 'clamp(0.9rem, 3vw, 1.15rem)',
                marginBottom: '8px',
                lineHeight: 1.5,
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                width: '100%'
              }}>
                {selectedService
                  ? `Messages for ${selectedService} service`
                  : filteredBookings.length === 0
                    ? 'You have no bookings yet. Book a service to start messaging with our staff.'
                    : `You have ${filteredBookings.length} booking${filteredBookings.length !== 1 ? 's' : ''} with message history. Unread messages are prioritized at the top.`
                }
              </div>

              {/* Auto-refresh status */}
              <div style={{
                color: hasNewMessages ? '#4CAF50' : '#888',
                fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                marginBottom: '12px',
                fontWeight: hasNewMessages ? '600' : 'normal'
              }}>
                {hasNewMessages ? '✨ New messages received!' : (autoRefreshEnabled ? (refreshing ? '🔄 Checking for new messages...' : '🔄 Auto-refresh active (5s)') : '⏸️ Auto-refresh paused')}
              </div>
            </div>

            {/* Action Buttons Row */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '12px',
              flexWrap: 'wrap',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              {/* Services Button - Mobile First */}
              <button
                onClick={toggleServicesSidebar}
                style={{
                  background: '#ffd700',
                  color: '#111',
                  border: 'none',
                  padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 24px)',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexShrink: 0
                }}
              >
                📋 {selectedService ? 'Change Service' : 'Select Service'}
              </button>

              {/* Admin Button */}
              {localStorage.getItem('role') === 'admin' && (
                <button
                  onClick={() => window.location.href = '/dashboard/admin-messages'}
                  style={{
                    background: '#17a2b8',
                    color: '#fff',
                    padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 24px)',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
                    flexShrink: 0
                  }}
                >
                  💬 Admin Messages
                </button>
              )}

              {/* Clear Filter Button */}
              {selectedService && (
                <button
                  onClick={clearServiceFilter}
                  style={{
                    background: '#666',
                    color: '#fff',
                    border: 'none',
                    padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 24px)',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
                    flexShrink: 0
                  }}
                >
                  ✕ Clear Filter
                </button>
              )}

              {/* Auto-refresh Toggle Button */}
              <button
                onClick={toggleAutoRefresh}
                style={{
                  background: autoRefreshEnabled ? '#4CAF50' : '#666',
                  color: '#fff',
                  border: 'none',
                  padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                  flexShrink: 0
                }}
              >
                {autoRefreshEnabled ? '🔄' : '⏸️'} {autoRefreshEnabled ? 'Auto' : 'Paused'}
              </button>

              {/* Manual Refresh Button */}
              <button
                onClick={refreshBookings}
                disabled={refreshing}
                style={{
                  background: refreshing ? '#666' : '#17a2b8',
                  color: '#fff',
                  border: 'none',
                  padding: 'clamp(8px, 2vw, 10px) clamp(12px, 3vw, 16px)',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: refreshing ? 'not-allowed' : 'pointer',
                  fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
                  flexShrink: 0
                }}
              >
                {refreshing ? '⏳' : '🔄'} {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#ff4444',
              color: '#fff',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px',
              textAlign: 'center',
              fontSize: 'clamp(0.9rem, 3vw, 1rem)',
              width: '100%',
              boxSizing: 'border-box',
              wordWrap: 'break-word',
              overflowWrap: 'break-word'
            }}>
              {error}
            </div>
          )}

          {/* No Bookings State */}
          {filteredBookings.length === 0 ? (
            <div style={{
              background: '#232323',
              padding: 'clamp(24px, 6vw, 40px)',
              borderRadius: '12px',
              textAlign: 'center',
              color: '#bdbdbd',
              border: '1px solid #333',
              width: '100%',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}>
              <div style={{
                marginBottom: '20px',
                fontSize: 'clamp(1rem, 4vw, 1.2rem)',
                lineHeight: 1.4,
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}>
                {selectedService ? `No messages found for ${selectedService}` : 'No messages found'}
              </div>
              <div style={{
                marginBottom: '20px',
                fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                color: '#888',
                lineHeight: 1.5,
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}>
                {selectedService
                  ? 'Try selecting a different service or clear the filter to see all messages.'
                  : 'You have no bookings with messages yet. Book a service to get started!'
                }
              </div>
              <Link
                to="/user-dashboard"
                style={{
                  background: '#ffd700',
                  color: '#111',
                  padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 24px)',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  display: 'inline-block',
                  fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}
              >
                Back to Dashboard →
              </Link>
            </div>
          ) : (
            <div style={{ width: '100%', boxSizing: 'border-box' }}>
              {/* Messages Section Header */}
              <div style={{ marginBottom: '24px', width: '100%', boxSizing: 'border-box' }}>
                <h3 style={{
                  color: '#ffd700',
                  marginBottom: '16px',
                  fontSize: 'clamp(1.1rem, 4vw, 1.3rem)',
                  lineHeight: 1.3,
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}>
                  💬 {selectedService ? `${selectedService} Messages` : 'All Messages'}
                </h3>
                <div style={{
                  color: '#bdbdbd',
                  fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                  marginBottom: '20px',
                  lineHeight: 1.4,
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}>
                  {selectedService
                    ? `Showing messages for ${selectedService} service only`
                    : 'All messages are shown with unread ones prioritized at the top'
                  }
                </div>

                {/* Priority Legend - Responsive */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: '20px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#1a1a1a',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #333',
                    fontSize: 'clamp(0.75rem, 2.5vw, 0.8rem)',
                    width: '100%',
                    boxSizing: 'border-box',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: '#ffd700',
                      color: '#111',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>
                      🔥
                    </div>
                    <span style={{ color: '#fff', wordWrap: 'break-word', overflowWrap: 'break-word' }}>Most Unread Messages</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#1a1a1a',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #333',
                    fontSize: 'clamp(0.75rem, 2.5vw, 0.8rem)',
                    width: '100%',
                    boxSizing: 'border-box',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: '#ff6b35',
                      color: '#fff',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>
                      ⏰
                    </div>
                    <span style={{ color: '#fff', wordWrap: 'break-word', overflowWrap: 'break-word' }}>Most Recent Activity</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#1a1a1a',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #333',
                    fontSize: 'clamp(0.75rem, 2.5vw, 0.8rem)',
                    width: '100%',
                    boxSizing: 'border-box',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: '#17a2b8',
                      color: '#fff',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>
                      📬
                    </div>
                    <span style={{ color: '#fff', wordWrap: 'break-word', overflowWrap: 'break-word' }}>Unread Messages</span>
                  </div>
                </div>
              </div>

              {/* Booking Cards */}
              {filteredBookings.map((booking, index) => (
                <div
                  key={booking._id}
                  style={{
                    background: '#232323',
                    borderRadius: '14px',
                    boxShadow: '0 2px 12px #0006',
                    padding: 'clamp(16px, 4vw, 24px)',
                    marginBottom: '18px',
                    color: '#fff',
                    border: `2px solid ${index === 0 && booking.unreadMessageCount > 0 ? '#ffd700' : '#333'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    width: '100%',
                    boxSizing: 'border-box',
                    overflow: 'hidden'
                  }}
                  onClick={() => handleMessageClick(booking)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#ffd700';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = index === 0 && booking.unreadMessageCount > 0 ? '#ffd700' : '#333';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Unread Message Badge */}
                  {booking.unreadMessageCount > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '20px',
                      background: '#ff4444',
                      color: '#fff',
                      borderRadius: '50%',
                      padding: '6px 10px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      minWidth: '24px',
                      textAlign: 'center',
                      animation: 'pulse 2s infinite',
                      boxShadow: '0 2px 8px rgba(255, 68, 68, 0.3)',
                      zIndex: 2
                    }}>
                      {booking.unreadMessageCount > 9 ? '9+' : booking.unreadMessageCount}
                    </div>
                  )}

                  {/* Priority Activity Indicator */}
                  {index === 0 && booking.unreadMessageCount > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      left: '20px',
                      background: '#ffd700',
                      color: '#111',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)',
                      fontWeight: '700',
                      zIndex: 1,
                      whiteSpace: 'nowrap',
                      maxWidth: 'calc(100% - 40px)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      🔥 Top Priority
                    </div>
                  )}

                  {/* Priority Indicator */}
                  {index < 3 && booking.unreadMessageCount > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      background: index === 0 ? '#ffd700' : index === 1 ? '#ff6b35' : '#17a2b8',
                      color: index === 0 ? '#111' : '#fff',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      zIndex: 1,
                      flexShrink: 0
                    }}>
                      {index === 0 ? '🔥' : index === 1 ? '⏰' : '📬'}
                    </div>
                  )}

                  {/* Main Content - Responsive Layout */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
                    {/* Service Info */}
                    <div style={{ width: '100%', boxSizing: 'border-box' }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: 'clamp(1rem, 4vw, 1.2rem)',
                        color: '#ffd700',
                        marginBottom: '8px',
                        lineHeight: 1.3,
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        width: '100%'
                      }}>
                        {(booking.service?.label || 'Service')} - {(booking.service?.sub || '')}
                      </div>
                      <div style={{
                        color: '#bdbdbd',
                        fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                        marginBottom: '8px',
                        lineHeight: 1.4,
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        width: '100%'
                      }}>
                        {formatDate(booking.date)} at {formatTime(booking.time)}
                      </div>
                      <div style={{
                        color: '#fff',
                        fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}>
                        <span>Status:</span>
                        <span style={{
                          color: getStatusColor(booking.status),
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}>
                          {booking.status}
                        </span>
                      </div>
                    </div>

                    {/* Right Side Info - Stacked on Mobile */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      alignItems: 'flex-start',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}>
                      {booking.unreadMessageCount > 0 && (
                        <div style={{
                          background: '#ff4444',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)',
                          fontWeight: 600
                        }}>
                          {booking.unreadMessageCount} new
                        </div>
                      )}

                      {/* Conversation Activity Indicator */}
                      {booking.lastMessage ? (
                        <div style={{
                          background: '#17a2b8',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)',
                          fontWeight: 600
                        }}>
                          💬 Active
                        </div>
                      ) : (
                        <div style={{
                          background: '#666',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)',
                          fontWeight: 600
                        }}>
                          ⏸️ No messages
                        </div>
                      )}

                      {/* Last Message Preview */}
                      {booking.lastMessage && (
                        <div style={{
                          color: '#aaa',
                          fontSize: 'clamp(0.8rem, 2.5vw, 0.85rem)',
                          fontStyle: 'italic',
                          marginTop: '8px',
                          padding: '8px 10px',
                          background: '#1a1a1a',
                          borderRadius: '8px',
                          borderLeft: '3px solid #ffd700',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}>
                          <div style={{ marginBottom: 4, color: '#ffd700', fontSize: '0.75rem', fontWeight: '600' }}>
                            Last message:
                          </div>
                          <div style={{ marginBottom: 4 }}>
                            "{booking.lastMessage.message.substring(0, 80)}..."
                          </div>
                          <div style={{ color: '#888', fontSize: '0.7rem' }}>
                            - {booking.lastMessage.senderName}
                          </div>
                        </div>
                      )}

                      <div style={{
                        color: '#888',
                        fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)',
                        textTransform: 'uppercase',
                        fontWeight: 600
                      }}>
                        Click to view
                      </div>
                    </div>
                  </div>

                  {/* Last Message Preview */}
                  {booking.lastMessage && (
                    <div style={{
                      background: '#1a1a1a',
                      padding: 'clamp(12px, 3vw, 16px)',
                      borderRadius: '8px',
                      marginTop: '16px',
                      borderLeft: `3px solid ${booking.unreadMessageCount > 0 ? '#ff4444' : '#4CAF50'}`,
                      width: '100%',
                      boxSizing: 'border-box',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}>
                          <div style={{
                            color: '#888',
                            fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)',
                            lineHeight: 1.4,
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            width: '100%'
                          }}>
                            Last message from <span style={{ color: '#ffd700', fontWeight: '600' }}>{booking.lastMessage.senderName}</span>
                          </div>
                          <div style={{
                            color: '#666',
                            fontSize: 'clamp(0.65rem, 2vw, 0.75rem)',
                            background: '#333',
                            padding: '2px 8px',
                            borderRadius: '8px',
                            alignSelf: 'flex-start',
                            flexShrink: 0
                          }}>
                            {formatRelativeTime(booking.lastMessage.createdAt)}
                          </div>
                        </div>
                        <div style={{
                          color: '#fff',
                          fontSize: 'clamp(0.8rem, 3vw, 0.9rem)',
                          marginBottom: '8px',
                          fontStyle: 'italic',
                          lineHeight: 1.4,
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          width: '100%'
                        }}>
                          "{booking.lastMessage.message.length > 60
                            ? booking.lastMessage.message.substring(0, 60) + '...'
                            : booking.lastMessage.message
                          }"
                        </div>
                      </div>
                    </div>
                  )}

                  {/* No Messages Yet Message */}
                  {!booking.lastMessage && (
                    <div style={{
                      background: '#1a1a1a',
                      padding: 'clamp(12px, 3vw, 16px)',
                      borderRadius: '8px',
                      marginTop: '16px',
                      borderLeft: '3px solid #666',
                      textAlign: 'center',
                      width: '100%',
                      boxSizing: 'border-box',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        color: '#888',
                        fontSize: 'clamp(0.8rem, 3vw, 0.9rem)',
                        lineHeight: 1.4,
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        width: '100%'
                      }}>
                        No messages yet. Start the conversation with our staff!
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default MessagesPage; 