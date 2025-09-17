import React, { useRef, useEffect } from 'react';
import './Home.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: (
      <svg width="32" height="32" fill="none" stroke="#FFD600" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2l7 4v6c0 5.25-3.5 10-7 10s-7-4.75-7-10V6l7-4z"/><path d="M9 9h6v4H9z"/></svg>
    ),
    title: 'Quality Guaranteed',
    desc: 'All repairs come with our quality guarantee. We stand behind our work with confidence.'
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" stroke="#FFD600" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
    ),
    title: 'Efficient Service',
    desc: 'We value your time and strive to complete all services within the promised timeframe.'
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" stroke="#FFD600" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-3-3.87"/><path d="M4 21v-2a4 4 0 0 1 3-3.87"/><circle cx="12" cy="7" r="4"/></svg>
    ),
    title: 'Skilled Technicians',
    desc: 'Our certified mechanics have years of experience working with all vehicle makes and models.'
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" stroke="#FFD600" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3h-8v4h8V3z"/></svg>
    ),
    title: 'Transparent Pricing',
    desc: 'No hidden fees or surprise costs. We provide clear, upfront pricing for all our services.'
  },
];

const WhyChoose: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );
      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.13,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          },
        }
      );
    }
  }, []);

  return (
    <section className="whychoose-section" ref={sectionRef}>
      <div className="whychoose-container">
        <h2 className="whychoose-title" ref={titleRef}>
          Why Choose <span className="whychoose-highlight">J<sup>2</sup> Mechanics</span>
          <span className="whychoose-title-underline"></span>
        </h2>
        <div className="whychoose-features">
          {features.map((f, i) => (
            <div className="whychoose-card" key={i} ref={el => { cardsRef.current[i] = el; }}>
              <div className="whychoose-icon">{f.icon}</div>
              <div className="whychoose-card-title">{f.title}</div>
              <div className="whychoose-card-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChoose; 