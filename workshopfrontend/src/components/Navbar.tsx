import React, { useState, useRef, useEffect } from 'react';
import './Navbar.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import MaintenanceNotifications from './MaintenanceNotifications';
import { API_BASE_URL } from '../config';

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
  const [membershipType, setMembershipType] = useState<string>('free');

  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        if (window.scrollY < 20) {
          gsap.to(navRef.current, { opacity: 1, pointerEvents: 'auto', duration: 0.4, ease: 'power2.out' });
        } else {
          gsap.to(navRef.current, { opacity: 0, pointerEvents: 'none', duration: 0.4, ease: 'power2.out' });
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    if (heroTextRef.current) {
      Array.from(heroTextRef.current.children).forEach((el) => {
        (el as HTMLElement).style.opacity = '0';
        (el as HTMLElement).style.transform = 'translateY(40px)';
      });
    }
    if (navRef.current) {
      gsap.set(navRef.current, { opacity: 1, pointerEvents: 'auto' });
    }
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
    }, 800);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const currentRole = localStorage.getItem('role');
    setRole(currentRole);
  }, [location]);

  useEffect(() => {
    const fetchMembershipType = async () => {
      const userEmail = localStorage.getItem('userEmail');
      const userRole = localStorage.getItem('role');
      if (userEmail && userRole) {
        try {
          console.log('🔍 Fetching membership for:', userEmail);
          const response = await fetch(`${API_BASE_URL}/api/membership/${userEmail}`);
          if (response.ok) {
            const data = await response.json();
            console.log('🔍 Membership data:', data);
            setMembershipType(data.membershipType || 'free');
          } else {
            console.log('🔍 Failed to fetch membership, setting to free');
            setMembershipType('free');
          }
        } catch (error) {
          console.error('Error fetching membership type:', error);
          setMembershipType('free');
        }
      } else {
        setMembershipType('free');
      }
    };
    fetchMembershipType();
  }, [role, location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setRole(null);
    navigate('/');
    setMenuOpen(false);
  };

  // If user is logged in, show appropriate nav based on role
  if (role) {
    return (
      <nav  id="nna" className="new-navbar" ref={navRef}>
        <div className="new-navbar-logo">
          <img id="imager1" src="/nlogo.png" alt="Logo"/>
        </div>
        {isMobile && (
          <button
            className={`hamburger${menuOpen ? ' open' : ''}`}
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        )}
        <div className={`new-navbar-menu${menuOpen ? ' open' : ''}`}>
          <ul className="new-nav-menu">
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
            {role === 'admin' ? (
              // Admin navigation
              <>
                <li><Link to="/dashboard" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link></li>
                <li><Link to="/dashboard/admin-messages" onClick={() => setMenuOpen(false)}>Admin Messages</Link></li>
                <li><Link to="/dashboard/quote-requests" onClick={() => setMenuOpen(false)}>Quote Requests</Link></li>
                <li><Link to="/dashboard/fluid-topups" onClick={() => setMenuOpen(false)}>Fluid Topup</Link></li>
                <li><Link to="/dashboard/seasonal-checks" onClick={() => setMenuOpen(false)}>Upload Images</Link></li>
                <li><Link to="/dashboard/seasonal-settings" onClick={() => setMenuOpen(false)}>Seasonal Settings</Link></li>
                <li><Link to="/membership-lookup" onClick={() => setMenuOpen(false)}>Membership Lookup</Link></li>
                {/* Contact and Privacy removed for logged-in admin */}
              </>
            ) : (
              // Regular user navigation
              <>
                <li><Link to="/user-dashboard" onClick={() => setMenuOpen(false)}>Services</Link></li>
                <li><Link to="/membership" onClick={() => setMenuOpen(false)}>Membership</Link></li>
                {membershipType === 'premium' && (
                  <li><Link to="/referral" onClick={() => setMenuOpen(false)} >Referral</Link></li>
                )}
                <li><Link to="/dashboard/past-services" onClick={() => setMenuOpen(false)}>Past Services</Link></li>
                <li><Link to="/dashboard/messages" onClick={() => setMenuOpen(false)}>Messages</Link></li>
                {/* Contact and Privacy removed for logged-in users */}
                <li><Link to="/seasonal-check" onClick={() => setMenuOpen(false)}>Seasonal Check</Link></li>
              </>
            )}
            <li>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {role !== 'admin' && <MaintenanceNotifications />}
                <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>Logout</button>
              </div>
            </li>
          </ul>
        </div>
      </nav>
    );
  }

  // Guest nav - only show basic links
  return (
    <nav className="new-navbar" ref={navRef}>
      <div className="new-navbar-logo">
        <img id="imager1" src="/nlogo.png" alt="Logo"/>
      </div>
      {isMobile && (
        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      )}
      <div className={`new-navbar-menu${menuOpen ? ' open' : ''}`}>
        <ul className="new-nav-menu">
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link to="/about" onClick={() => setMenuOpen(false)}>About</Link></li>
          <li><Link to="/membership" onClick={() => setMenuOpen(false)}>Membership</Link></li>
          <li><Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link></li>
          <li><Link to="/privacy-policy" onClick={() => setMenuOpen(false)}>Privacy Policy</Link></li>
          <li>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button className="new-login-btn">
                <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>Log In</Link>
              </button>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
