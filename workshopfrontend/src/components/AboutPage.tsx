import React from 'react';
import './Home.css';
import Footer from './Footer';
import Navbar from './Navbar';

const AboutPage: React.FC = () => {
  return (
    <>

    <Navbar/>
    <div id="rre">
      <section className="about-section" style={{ background: '#111', color: '#eaeaea', padding: '64px 0 0 0' }}>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: 8 }}>
            About <span style={{ color: '#ffd600' }}>J<sup>2</sup> Mechanics</span>
          </h1>
          <div style={{ color: '#bdbdbd', fontSize: '1.15rem', marginBottom: 16 }}>
            Professional automotive services with a commitment to honesty, reliability, and exceptional results.
          </div>
          <div style={{ width: 64, height: 4, background: '#ffd600', borderRadius: 2, marginBottom: 40 }} />

          {/* Our Story Section */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'stretch', marginBottom: 64 }}>
            <div style={{ flex: 2, minWidth: 280, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Our Story</h2>
              <div style={{ width: 64, height: 4, background: '#ffd600', borderRadius: 2, marginBottom: 24 }} />
              <div style={{ color: '#eaeaea', fontSize: '1.08rem', lineHeight: 1.7 }}>
                J<sup>2</sup> Mechanics was founded with one simple goal: to bring honesty, reliability, and professionalism back into the automotive industry.<br /><br />
                The business takes its name from Joel, an internationally experienced automotive manager, and Jay, a highly skilled vehicle technician. Together, they recognised a growing need for a garage that put transparency and trust at the heart of every repair.<br /><br />
                What began as a partnership between two professionals with decades of combined experience has grown into a trusted team of certified technicians serving car owners across North London.<br /><br />
                Frustrated by the industry's lack of clarity and customer care, Joel and Jay set out to create a service where customers could always rely on:<br />
                • Fair, upfront pricing<br />
                • Expert workmanship<br />
                • Clear communication every step of the way<br /><br />
                From routine maintenance to complex diagnostics and repairs, we remain committed to the values that shaped our beginnings. At J<sup>2</sup> Mechanics, every vehicle is treated with the same care and attention as if it were our own—because our customers deserve nothing less than honest work and reliable results.
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '100%', height: '100%', minHeight: 220, maxHeight: 340, background: '#181818', borderRadius: 16, overflow: 'hidden', marginBottom: 8, boxShadow: '0 4px 24px #0006' }}>
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d79368.046792306!2d-0.19853366273448428!3d51.56362352093905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48761b1c5f1a9429%3A0x5ffdbed0f63cba58!2sCamden%20Town%2C%20London!5e0!3m2!1sen!2suk!4v1756385295009!5m2!1sen!2suk" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0, display: 'block', minHeight: '220px' }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="J2 Mechanics Location - Camden Town, London"
                />
              </div>
            </div>
          </div>

          {/* Our Values & Vision Section */}
          <div style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Our Values</h2>
            <div style={{ width: 64, height: 4, background: '#ffd600', borderRadius: 2, marginBottom: 24 }} />
            <div style={{ color: '#eaeaea', fontSize: '1.08rem', lineHeight: 1.7, marginBottom: 32 }}>
              <strong>Our Vision:</strong> To set the standard for honest, transparent, and high-quality automotive care in North London. We believe in building lasting relationships with our customers through trust, expertise, and a relentless commitment to their satisfaction. Our vision is to be the garage you recommend to friends and family, not just for our technical skill, but for our integrity and service.
            </div>
          </div>
        </div>
      </section>
      <Footer />
      </div>
    </>
  );
};

export default AboutPage; 