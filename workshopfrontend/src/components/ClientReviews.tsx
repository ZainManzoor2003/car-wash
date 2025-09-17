import React, { useState, useEffect, useRef } from 'react';
import './Home.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const reviews = [
  {
    name: 'Emma Thompson',
    car: 'Mercedes C-Class',
    rating: 5,
    text: 'I appreciate the transparent pricing and honest assessment of what my car needed. No unnecessary upselling - just reliable service and quality work.'
  },
  {
    name: 'James Patel',
    car: 'BMW 3 Series',
    rating: 5,
    text: 'Quick, efficient, and friendly service. My car was ready on time and the price was exactly as quoted.'
  },
  {
    name: 'Sarah Lee',
    car: 'Audi A4',
    rating: 4,
    text: 'Great experience! The team explained everything clearly and I felt confident in their expertise.'
  },
  {
    name: 'Michael Brown',
    car: 'VW Golf',
    rating: 5,
    text: 'Professional mechanics and excellent customer service. Highly recommended!'
  },
];

const AUTO_ADVANCE = 6000;

const ClientReviews: React.FC = () => {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        [titleRef.current, cardRef.current],
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.18,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );
    }
  }, []);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % reviews.length);
    }, AUTO_ADVANCE);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [index]);

  const goTo = (i: number) => setIndex(i);
  const prev = () => setIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  const next = () => setIndex((prev) => (prev + 1) % reviews.length);

  return (
    <section className="reviews-section" ref={sectionRef}>
      <div className="reviews-container">
        <h2 className="reviews-title" ref={titleRef}>
          What Our Customers Say
          <span className="reviews-title-underline"></span>
        </h2>
        <p className="reviews-desc">
          Don't just take our word for it. Here's what our satisfied customers have to say about their experience with J<sup>2</sup> Mechanics.
        </p>
        <div className="reviews-carousel">
          <button className="reviews-arrow left" onClick={prev} aria-label="Previous review">&#60;</button>
          <div className="review-card" ref={cardRef}>
            <div className="review-stars">
              {Array.from({ length: reviews[index].rating }).map((_, i) => (
                <span key={i} className="review-star">★</span>
              ))}
            </div>
            <blockquote className="review-text">“<i>{reviews[index].text}</i>”</blockquote>
            <div className="review-author">
              <span className="review-name">{reviews[index].name}</span>
              <span className="review-car">{reviews[index].car}</span>
            </div>
          </div>
          <button className="reviews-arrow right" onClick={next} aria-label="Next review">&#62;</button>
        </div>
        <div className="reviews-dots">
          {reviews.map((_, i) => (
            <button
              key={i}
              className={`reviews-dot${i === index ? ' active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to review ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientReviews; 