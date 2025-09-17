import React, { useRef, useEffect } from 'react';
import './Home.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SocialIcon } from 'react-social-icons';
gsap.registerPlugin(ScrollTrigger);

const Footer: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        [...colRefs.current, bottomRef.current],
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.13,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
          },
        }
      );
    }
  }, []);

  return (
    <footer className="footer-section" ref={sectionRef}>
      <div className="footer-container">
        <div className="footer-col logo-col" ref={el => { colRefs.current[0] = el; }}>
          <div className="footer-logo">
          <img id="imager1" src="/nlogo.png"/>
          </div>
          <div className="footer-desc">
            Professional automotive services with a commitment to honesty, reliability, and exceptional results.
          </div>
          <div className="footer-socials">
            <a href="https://www.tiktok.com/@j2mechanics" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="footer-social">
              <SocialIcon url="https://www.tiktok.com/@j2mechanics" network="tiktok" style={{ height: 32, width: 32 }} bgColor="#000" fgColor="#FFD600" />
            </a>
            <a href="https://www.facebook.com/people/J2-Mechanics/61579650955134" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="footer-social">
              <SocialIcon url="https://www.facebook.com/people/J2-Mechanics/61579650955134" network="facebook" style={{ height: 32, width: 32 }} bgColor="#000" fgColor="#FFD600" />
            </a>
            <a href="mailto:j2mechanicslondon@gmail.com" aria-label="Email" className="footer-social">
              <SocialIcon url="mailto:j2mechanicslondon@gmail.com" network="email" style={{ height: 32, width: 32 }} bgColor="#000" fgColor="#FFD600" />
            </a>
          </div>
        </div>
        <div className="footer-col" ref={el => { colRefs.current[1] = el; }}>
          <div className="footer-heading">Services</div>
          <ul className="footer-list">
            <li><a href="#services">Diagnostics</a></li>
            <li><a href="#services">Repairs</a></li>
            <li><a href="#services">Maintenance</a></li>
            <li><a href="#services">MOT Preparation</a></li>
            <li><a href="#services">Tyre Replacement</a></li>
          </ul>
        </div>
        <div className="footer-col" ref={el => { colRefs.current[2] = el; }}>
          <div className="footer-heading">Business Hours</div>
          <ul className="footer-list">
            <li><span className="footer-icon">🕒</span> Monday - Friday: 8am - 6pm</li>
            <li><span className="footer-icon">🕒</span> Saturday: 9am - 4pm</li>
            <li><span className="footer-icon">🕒</span> Sunday: Closed</li>
          </ul>
        </div>
        <div className="footer-col" ref={el => { colRefs.current[3] = el; }}>
          <div className="footer-heading">Contact Us</div>
          <ul className="footer-list">
            <li>North London</li>
            <li><a href="mailto:j2mechanicslondon@gmail.com" className="footer-email">j2mechanicslondon@gmail.com</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom" ref={bottomRef}>
        <div className="footer-bottom-left">© 2025 J<sup>2</sup> Mechanics. All rights reserved.</div>
        <div className="footer-bottom-links">
          <a href="#" className="footer-bottom-link">Privacy Policy</a>
          <a href="#" className="footer-bottom-link">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 