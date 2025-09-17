import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

interface Message {
  _id: string;
  senderName: string;
  senderEmail: string;
  senderType: 'customer' | 'admin';
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Booking {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  service?: {
    label: string;
    sub: string;
    description: string;
  };
  date: string;
  time: string;
  status: string;
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

interface BookingMessagesProps {
  userEmail?: string;
  userName?: string;
  isAdmin?: boolean;
}

const BookingMessages: React.FC<BookingMessagesProps> = ({ 
  userEmail, 
  userName, 
  isAdmin = false 
}) => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [lastTypingTime, setLastTypingTime] = useState(0);
  
  // Add useRef to store the interval ID
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Smart auto-scroll - only scroll if user is near bottom
  const smartScrollToBottom = () => {
    const messagesContainer = document.querySelector('[style*="maxHeight: 400px"]') as HTMLElement;
    if (messagesContainer) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100; // Within 100px of bottom
      
      if (isNearBottom) {
        scrollToBottom();
      }
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    smartScrollToBottom();
  }, [messages]);

  // Get user info from localStorage
  const currentUserEmail = userEmail || localStorage.getItem('userEmail');
  const currentUserName = userName || localStorage.getItem('userName') || 'Guest';
  const currentIsAdmin = isAdmin || localStorage.getItem('role') === 'admin';
  
  // Get customer info from booking when available
  const getCustomerInfo = () => {
    // If this is a customer view and we have booking data, prefer booking values
    if (booking && !currentIsAdmin) {
      const fallbackEmail = currentUserEmail || localStorage.getItem('userEmail') || '';
      const fallbackName = currentUserName || localStorage.getItem('userName') || 'Guest';
      return {
        name: (booking.customer && booking.customer.name) ? booking.customer.name : fallbackName,
        email: (booking.customer && booking.customer.email) ? booking.customer.email : fallbackEmail
      };
    }
    // Admins or no booking: use current user values
    return {
      name: currentUserName,
      email: currentUserEmail || localStorage.getItem('userEmail')
    };
  };

  useEffect(() => {
    if (bookingId) {
      fetchMessages();
    }
  }, [bookingId]);

  // Cleanup interval when component unmounts
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Set up auto-refresh when component loads and when auto-refresh is enabled
  useEffect(() => {
    if (autoRefreshEnabled && !refreshIntervalRef.current && !isTyping) {
      refreshIntervalRef.current = setInterval(async () => {
        // Don't refresh if user is typing
        if (!isTyping) {
          await fetchMessages();
        }
      }, 15000); // Increased from 5 seconds to 15 seconds
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [autoRefreshEnabled, isTyping]); // Added isTyping dependency

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/messages`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
        setBooking(data.booking);
        
        // Mark messages as read if user is logged in
        if (currentUserEmail) {
          markMessagesAsRead();
        }
      } else {
        setError('Failed to fetch messages');
      }
    } catch (err) {
      setError('Error fetching messages');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
              await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/messages/read`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userEmail: currentUserEmail })
        });
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !booking) return;

    try {
      setSending(true);
      const customerInfo = getCustomerInfo();
      
      // Debug logging
      console.log('🔍 Debug - User info:', {
        currentUserName,
        currentUserEmail,
        currentIsAdmin,
        role: localStorage.getItem('role'),
        userEmail: localStorage.getItem('userEmail'),
        userName: localStorage.getItem('userName'),
        customerInfo,
        bookingCustomer: booking?.customer
      });

      const messageData = {
        message: newMessage.trim(),
        senderName: customerInfo.name,
        senderEmail: customerInfo.email,
        senderType: currentIsAdmin ? 'admin' : 'customer'
      };

      // Prevent sending if essential sender details are missing
      if (!messageData.senderEmail || !messageData.senderName) {
        setError('Missing your name or email. Please log in again or update your profile.');
        setSending(false);
        return;
      }

      console.log('📤 Sending message data:', messageData);

      const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });

      const data = await response.json();
      
      if (data.success) {
        setNewMessage('');
        // Refresh messages to show the new one
        await fetchMessages();
      } else {
        setError('Failed to send message');
      }
    } catch (err) {
      setError('Error sending message');
      console.error('Error:', err);
    } finally {
      setSending(false);
    }
  };

  const refreshMessages = async () => {
    setRefreshing(true);
    try {
      await fetchMessages();
    } finally {
      setRefreshing(false);
    }
  };

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
    
    if (autoRefreshEnabled) {
      // Disable auto-refresh
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    } else {
      // Enable auto-refresh
      refreshIntervalRef.current = setInterval(async () => {
        await fetchMessages();
      }, 5000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ background: '#111', minHeight: '100vh', padding: '48px 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', color: '#fff' }}>
            <div>Loading messages...</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <Navbar />
        <div style={{ background: '#111', minHeight: '100vh', padding: '48px 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', color: '#fff' }}>
            <div>Booking not found</div>
            <button 
              onClick={() => navigate('/dashboard/messages')}
              style={{
                background: '#ffd700',
                color: '#111',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                marginTop: '20px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Back to Messages
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <div id="booker" style={{ background: '#111', minHeight: '100vh', padding: '0', marginTop: '120px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <button 
              onClick={() => navigate('/dashboard/messages')}
              style={{
                background: 'transparent',
                color: '#ffd700',
                border: '2px solid #ffd700',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                marginBottom: '20px',
                fontWeight: 600
              }}
            >
              ← Back to Messages
            </button>
            
            <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '2.2rem', marginBottom: '8px' }}>
              Booking Messages
            </h1>
            
            <div style={{ color: '#bdbdbd', fontSize: '1.15rem', marginBottom: '24px' }}>
              Service: {booking.isPremiumService ? (
  <>
    💎 {booking.serviceName}
    <span style={{ color: '#4CAF50', marginLeft: 8, fontSize: '0.8rem' }}>FREE</span>
  </>
) : (
  `${booking.service?.label || 'Unknown Service'} - ${booking.service?.sub || 'Service'}`
)}
            </div>
            
            <div style={{ 
              background: '#232323', 
              borderRadius: '12px', 
              padding: '20px', 
              marginBottom: '24px',
              border: '1px solid #333'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', color: '#fff' }}>
                <div>
                  <strong style={{ color: '#ffd700' }}>Date:</strong> {new Date(booking.date).toLocaleDateString()}
                </div>
                <div>
                  <strong style={{ color: '#ffd700' }}>Time:</strong> {booking.time}
                </div>
                <div>
                  <strong style={{ color: '#ffd700' }}>Status:</strong> {booking.status}
                </div>
                <div>
                  <strong style={{ color: '#ffd700' }}>Customer:</strong> {booking.customer.name}
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
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

          {/* Messages */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ color: '#ffd700', fontSize: '1.5rem', marginBottom: '4px' }}>
                  Messages ({messages.length})
                </h2>
                <div style={{ color: '#888', fontSize: '0.9rem' }}>
                  {autoRefreshEnabled ? '🔄 Auto-refresh active (5s)' : '⏸️ Auto-refresh paused'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={toggleAutoRefresh}
                  style={{ 
                    background: autoRefreshEnabled ? '#4CAF50' : '#666', 
                    color: '#fff', 
                    border: 'none',
                    borderRadius: '6px', 
                    padding: '6px 12px', 
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.8rem'
                  }}
                >
                  {autoRefreshEnabled ? '🔄' : '⏸️'} {autoRefreshEnabled ? 'Auto' : 'Paused'}
                </button>
                <button 
                  onClick={refreshMessages}
                  disabled={refreshing}
                  style={{ 
                    background: refreshing ? '#666' : '#17a2b8', 
                    color: '#fff', 
                    border: 'none',
                    borderRadius: '6px', 
                    padding: '6px 12px', 
                    cursor: refreshing ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '0.8rem'
                  }}
                >
                  {refreshing ? '⏳' : '🔄'} {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
                <button 
                  onClick={scrollToBottom}
                  style={{ 
                    background: '#6c5ce7', 
                    color: '#fff', 
                    border: 'none',
                    borderRadius: '6px', 
                    padding: '6px 12px', 
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.8rem'
                  }}
                >
                  ⬇️ Bottom
                </button>
              </div>
            </div>
            
            {messages.length === 0 ? (
              <div style={{ 
                background: '#232323', 
                padding: '40px', 
                borderRadius: '12px', 
                textAlign: 'center',
                color: '#bdbdbd',
                border: '1px solid #333'
              }}>
                No messages yet. Start the conversation!
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {messages.map((message) => (
                  <div key={message._id} style={{ display: 'flex', justifyContent: message.senderType === 'customer' ? 'flex-end' : 'flex-start' }}>
                    <div 
                      style={{ 
                        background: '#232323', 
                        padding: '20px', 
                        borderRadius: '12px', 
                        marginBottom: '16px',
                        border: '1px solid #333',
                        borderLeft: `4px solid ${message.senderType === 'admin' ? '#ffd700' : '#4CAF50'}`,
                        maxWidth: '80%'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '12px'
                      }}>
                        <div style={{ 
                          color: message.senderType === 'admin' ? '#ffd700' : '#4CAF50',
                          fontWeight: 700,
                          fontSize: '1.1rem'
                        }}>
                          {message.senderName}
                          {message.senderType === 'admin' && ' (Staff)'}
                        </div>
                        <div style={{ color: '#888', fontSize: '0.9rem', marginLeft: 12 }}>
                          {formatDate(message.createdAt)}
                        </div>
                      </div>
                      <div style={{ color: '#fff', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                        {message.message}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Send Message Form */}
          <div style={{ 
            background: '#232323', 
            padding: '24px', 
            borderRadius: '12px',
            border: '1px solid #333'
          }}>
            <h3 style={{ color: '#ffd700', marginBottom: '20px', fontSize: '1.3rem' }}>
              Send Message
            </h3>
            
            {/* Auto-refresh status indicator */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              marginBottom: '20px',
              fontSize: '0.9rem',
              color: '#bdbdbd'
            }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: isTyping ? '#ffd700' : '#00ff88',
                animation: isTyping ? 'pulse 1.5s infinite' : 'none'
              }} />
              <span>
                {isTyping ? 'Auto-refresh paused while typing...' : 'Auto-refresh active'}
              </span>
              <button
                type="button"
                onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                style={{
                  background: 'none',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '0.8rem',
                  color: autoRefreshEnabled ? '#00ff88' : '#ff6b6b',
                  cursor: 'pointer',
                  marginLeft: 'auto'
                }}
              >
                {autoRefreshEnabled ? 'Disable' : 'Enable'} Auto-refresh
              </button>
            </div>
            
            <form onSubmit={sendMessage}>
              <textarea
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  // Set typing state to pause auto-refresh
                  setIsTyping(true);
                  setLastTypingTime(Date.now());
                  
                  // Clear typing state after 2 seconds of no typing
                  setTimeout(() => {
                    if (Date.now() - lastTypingTime > 2000) {
                      setIsTyping(false);
                    }
                  }, 2000);
                }}
                onBlur={() => setIsTyping(false)}
                placeholder="Type your message here..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #444',
                  background: '#1a1a1a',
                  color: '#fff',
                  fontSize: '16px',
                  resize: 'vertical',
                  marginBottom: '16px'
                }}
                disabled={sending}
              />
              
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                style={{
                  background: newMessage.trim() && !sending ? '#ffd700' : '#444',
                  color: newMessage.trim() && !sending ? '#111' : '#888',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: newMessage.trim() && !sending ? 'pointer' : 'not-allowed',
                  opacity: newMessage.trim() && !sending ? 1 : 0.6
                }}
              >
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BookingMessages; 