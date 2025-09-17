import React, { useState } from 'react';
import Footer from './Footer';
import Navbar from './Navbar';
import { API_BASE_URL } from '../config';

const iconColor = '#FFD600';

const LocationIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8, minWidth: 22 }}>
    <path d="M12 21c-4.418 0-8-7.163-8-10.5A8 8 0 0 1 20 10.5C20 13.837 16.418 21 12 21z"/>
    <circle cx="12" cy="10.5" r="3"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8, minWidth: 22 }}>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const EmailIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8, minWidth: 22 }}>
    <rect x="2" y="4" width="20" height="16" rx="4"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitMessage(data.message);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        setSubmitError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Responsive styles for ContactPage only */}
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        @media (max-width: 900px) {
          .contact-flex-row {
            flex-direction: column !important;
            gap: 24px !important;
          }
          .contact-form-card, .contact-info-card {
            min-width: 0 !important;
            width: 100% !important;
          }
        }
        @media (max-width: 600px) {
          .contact-form-card, .contact-info-card {
            padding: 16px !important;
            border-radius: 8px !important;
          }
          .contact-form-card input,
          .contact-form-card select,
          .contact-form-card textarea {
            font-size: 0.98rem !important;
            padding: 8px 10px !important;
            border-radius: 6px !important;
            width: 100% !important;
            box-sizing: border-box !important;
            min-width: 0 !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
          .contact-form-card h2 {
            font-size: 1.05rem !important;
          }
          .contact-info-card {
            font-size: 0.98rem !important;
          }
        }
        .contact-form-card input,
        .contact-form-card select,
        .contact-form-card textarea {
          width: 100%;
          box-sizing: border-box;
          min-width: 0;
          max-width: 100%;
        }
      `}</style>
      <div id="navvber">
      <Navbar/>

      </div>

      <div id="rree">
      <section  style={{ background: '#111', color: '#eaeaea', minHeight: '100vh', padding: '64px 0 0 0' }}>
        <div  id="mes"style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ marginBottom: 40 }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: 8, textAlign: 'left' }}>Contact Us</h1>
            <div style={{ color: '#bdbdbd', fontSize: '1.15rem', marginBottom: 8, textAlign: 'left' }}>
              Get in touch with our team for inquiries, feedback, or assistance.
            </div>
            <div style={{ width: 64, height: 4, background: '#ffd600', borderRadius: 2, marginBottom: 0, marginTop: 0, marginLeft: 0 }} />
          </div>

          <div className="contact-flex-row" style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'stretch', marginBottom: 32 }}>
            {/* Contact Form */}
            <form className="contact-form-card" onSubmit={handleSubmit} style={{ flex: 2, minWidth: 340, background: '#181818', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px #0006', marginBottom: 0, display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 16 }}>Get in Touch</h2>
              
              {/* Success/Error Messages */}
              {submitMessage && (
                <div style={{ background: '#1a3a1a', color: '#4ade80', padding: '12px 16px', borderRadius: 8, border: '1px solid #22c55e', fontSize: '0.95rem' }}>
                  {submitMessage}
                </div>
              )}
              {submitError && (
                <div style={{ background: '#3a1a1a', color: '#f87171', padding: '12px 16px', borderRadius: 8, border: '1px solid #ef4444', fontSize: '0.95rem' }}>
                  {submitError}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label htmlFor="name" style={{ fontWeight: 500, marginBottom: 2 }}>Name</label>
                  <input 
                    id="name" 
                    name="name" 
                    type="text" 
                    placeholder="Your name" 
                    value={formData.name}
                    onChange={handleInputChange}
                    required 
                    style={{ background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem' }} 
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label htmlFor="email" style={{ fontWeight: 500, marginBottom: 2 }}>Email Address</label>
                  <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="Your email" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required 
                    style={{ background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem' }} 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label htmlFor="subject" style={{ fontWeight: 500, marginBottom: 2 }}>Subject</label>
                <select 
                  id="subject" 
                  name="subject" 
                  value={formData.subject}
                  onChange={handleInputChange}
                  required 
                  style={{ background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem' }}
                >
                  <option value="">Select a subject...</option>
                  <option value="general">General Inquiry</option>
                  <option value="booking">Booking</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label htmlFor="message" style={{ fontWeight: 500, marginBottom: 2 }}>Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  placeholder="Your message..." 
                  value={formData.message}
                  onChange={handleInputChange}
                  required 
                  rows={5} 
                  style={{ background: '#111', color: '#eaeaea', border: '1.5px solid #232323', borderRadius: 8, padding: '10px 14px', fontSize: '1rem', resize: 'vertical' }} 
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ 
                  background: isSubmitting ? '#666' : '#ffd600', 
                  color: '#111', 
                  fontWeight: 600, 
                  border: 'none', 
                  borderRadius: 8, 
                  padding: '12px 0', 
                  fontSize: '1.1rem', 
                  marginTop: 8, 
                  cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 8, 
                  boxShadow: '0 2px 8px #0003',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" strokeDasharray="31.416" strokeDashoffset="31.416" transform="rotate(-90 12 12)"/>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                  </>
                )}
              </button>
            </form>
            {/* Info Card */}
            <div className="contact-info-card" style={{ flex: 1, minWidth: 300, background: '#181818', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px #0006', marginBottom: 0, display: 'flex', flexDirection: 'column', gap: 18, justifyContent: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 8, color: '#fff' }}>Our Location</div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                <LocationIcon />
                <div>
                  <div style={{ color: '#bdbdbd', fontWeight: 500, fontSize: '1.05rem' }}>North London</div>
                  <div style={{ color: '#bdbdbd', fontWeight: 400, fontSize: '1.05rem' }}>London, UK</div>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', margin: '18px 0 4px 0', color: '#fff' }}>Business Hours</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 2 }}>
                <ClockIcon />
                <div>
                  <div style={{ color: '#bdbdbd', fontWeight: 500 }}>Monday - Friday</div>
                  <div style={{ color: '#bdbdbd', fontWeight: 400 }}>8:00 AM - 6:00 PM</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 2 }}>
                <div style={{ width: 22 }}></div>
                <div>
                  <div id="ii1" style={{ color: '#bdbdbd', fontWeight: 500 }}>Saturday</div>
                  <div   id="ii1"  style={{ color: '#bdbdbd', fontWeight: 400 }}>9:00 AM - 4:00 PM</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 2 }}>
                <div style={{ width: 22 }}></div>
                <div>
                  <div  id="ii1" style={{ color: '#bdbdbd', fontWeight: 500 }}>Sunday</div>
                  <div   id="ii1" style={{ color: '#bdbdbd', fontWeight: 400 }}>Closed</div>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', margin: '18px 0 4px 0', color: '#fff' }}>Email</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <EmailIcon />
                <a href="mailto:j2mechanicslondon@gmail.com" style={{ color: iconColor, textDecoration: 'none', fontWeight: 700, fontSize: '1.08rem' }}>j2mechanicslondon@gmail.com</a>
              </div>
            </div>
          </div>
          {/* Google Map */}
          <div style={{ background: '#181818', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px #0006', marginBottom: 48, width: '100%' }}>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d79368.046792306!2d-0.19853366273448428!3d51.56362352093905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48761b1c5f1a9429%3A0x5ffdbed0f63cba58!2sCamden%20Town%2C%20London!5e0!3m2!1sen!2suk!4v1756385295009!5m2!1sen!2suk" 
              width="100%" 
              height="450" 
              style={{ border: 0, display: 'block' }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="J2 Mechanics Location - Camden Town, London"
            />
          </div>
        </div>
      </section>
      <Footer />
      </div>
    </>
  );
};

export default ContactPage; 