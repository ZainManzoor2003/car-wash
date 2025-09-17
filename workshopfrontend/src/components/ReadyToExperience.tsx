import React, { useRef, useEffect } from 'react';
import './Home.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="#FFD600" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M16 3v4"/><path d="M8 3v4"/><path d="M3 10h18"/></svg>
    ),
    text: 'Easy online booking with real-time availability',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="#FFD600" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 8v4l3 2"/><circle cx="12" cy="12" r="10"/></svg>
    ),
    text: 'Professional service by certified mechanics',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="#FFD600" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
    ),
    text: 'Quality work guaranteed every time',
  },
];

const ReadyToExperience: React.FC = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const featuresRef = useRef<(HTMLDivElement | null)[]>([]);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Check if user is logged in
  const isLoggedIn = () => {
    return localStorage.getItem('token') !== null;
  };

  const handleBookService = () => {
    if (isLoggedIn()) {
      navigate('/user-dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleContactUs = () => {
    navigate('/contact');
  };

  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        [titleRef.current, descRef.current, ...featuresRef.current, actionsRef.current],
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.13,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );
    }
  }, []);

  return (
    <section className="ready-section" ref={sectionRef}>
      <div className="ready-container">
        <div className="ready-card">
          <h2 className="ready-title" ref={titleRef}>Ready to experience the J<sup>2</sup> difference?</h2>
          <p className="ready-desc" ref={descRef}>
            Book your appointment today and join our growing list of satisfied customers. Our skilled technicians are ready to help keep your vehicle running at its best.
          </p>
          <div className="ready-features">
            {features.map((f, i) => (
              <div className="ready-feature" key={i} ref={el => { featuresRef.current[i] = el; }}>
                <span className="ready-feature-icon">{f.icon}</span>
                <span className="ready-feature-text">{f.text}</span>
              </div>
            ))}
          </div>
          <div className="ready-actions" ref={actionsRef}>
            <button className="ready-book-btn" onClick={handleBookService}>Book Your Service</button>
            <button className="ready-contact-btn" onClick={handleContactUs}>Contact Us</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReadyToExperience; 