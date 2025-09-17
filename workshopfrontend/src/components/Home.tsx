import React, { useState, useRef, useEffect } from 'react';
import './Home.css';
import Services from './Services';
import WhyChoose from './WhyChoose';
import ClientReviews from './ClientReviews';
import ReadyToExperience from './ReadyToExperience';
import Footer from './Footer';
import gsap from 'gsap';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const Home: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const [showReward, setShowReward] = useState(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [eligibleInfo, setEligibleInfo] = useState<{plan?: string; startedAt?: string} | null>(null);

  useEffect(() => {
    // Set initial state
    if (heroTextRef.current) {
      Array.from(heroTextRef.current.children).forEach((el) => {
        (el as HTMLElement).style.opacity = '0';
        (el as HTMLElement).style.transform = 'translateY(40px)';
      });
    }
    // Animate in after a short delay
    const timeout = setTimeout(() => {
      if (heroTextRef.current) {
        gsap.to(heroTextRef.current.children, {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 0.8,
          ease: 'power3.out',
        });
      }
    }, 800); // 0.8s delay
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // After login, token and userEmail stored
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail') || localStorage.getItem('email');
    if (!token || !email) { setShowReward(false); setEligibilityChecked(true); return; }
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/reward/eligibility/${encodeURIComponent(email)}`);
        const data = await res.json();
        if (data.eligible) {
          setEligibleInfo({ plan: data.plan, startedAt: data.startedAt });
          setShowReward(true);
        } else {
          setShowReward(false);
        }
      } catch {
        setShowReward(false);
      } finally {
        setEligibilityChecked(true);
      }
    })();
  }, []);

  const handleClaim = async (choice: 'cash' | 'tshirt') => {
    const email = localStorage.getItem('userEmail') || localStorage.getItem('email');
    if (!email) { setShowReward(false); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/api/reward/claim`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, choice })
      });
      const data = await res.json();
      if (data.success) {
        setShowReward(false);
      } else {
        setShowReward(false);
      }
    } catch {
      setShowReward(false);
    }
  };

  return (
    <div className="home new-home-bg">
 <Navbar/>
      {showReward && (
        <div style={{ position: 'fixed', inset: 0, background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#181818', border: '2px solid #ffd600', borderRadius: 16, padding: 24, maxWidth: 520, width: '92%', color: '#fff', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8, color: '#ffd600' }}>🎉 Anniversary Reward</div>
            <div style={{ color: '#bdbdbd', marginBottom: 16 }}>
              Thanks for being with us for a year! Choose your reward:
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => handleClaim('cash')} style={{ background: '#ffd600', color: '#111', border: 'none', borderRadius: 10, padding: '12px 18px', fontWeight: 700, cursor: 'pointer' }}>Get $10</button>
              <button onClick={() => handleClaim('tshirt')} style={{ background: '#232323', color: '#fff', border: '1px solid #444', borderRadius: 10, padding: '12px 18px', fontWeight: 700, cursor: 'pointer' }}>Get T‑Shirt</button>
            </div>
            <div style={{ marginTop: 12 }}>
              <button onClick={() => setShowReward(false)} style={{ background: 'none', color: '#bdbdbd', border: 'none', padding: 8, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
      <main className="new-hero-section">
        <div className="new-hero-center" ref={heroTextRef}>
          <div className="new-hero-logo">
          <img id="imager2" src="/nlogo.png"/>
          </div>


   
          <div className="new-hero-label">MECHANICS</div>
          <h1 className="new-hero-title">Professional<br/>Automotive Services</h1>
          <div className="new-hero-buttons">
            <button className="new-book-btn large">
              <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Book Your Service</Link>
            </button>
            <button className="new-view-btn large" onClick={() => {
              const servicesSection = document.getElementById('services');
              if (servicesSection) {
                servicesSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}>View Our Services</button>
          </div>
        </div>
        <div id="ilifter"className="scroll-indicator">Scroll to explore<br/><span className="scroll-mouse"></span></div>

      </main>
      <Services />
      <WhyChoose />
      <ClientReviews />
      <ReadyToExperience />
      <Footer />
    </div>
  );
};

export default Home; 