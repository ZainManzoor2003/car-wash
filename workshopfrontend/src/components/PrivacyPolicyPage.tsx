import React from 'react';
import './PrivacyPolicyPage.css';
import Navbar from './Navbar';
import Footer from './Footer';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div id="pri" className="privacy-policy-page">
      <Navbar />
      <div className="privacy-policy-container">
        <div className="privacy-policy-header">
          <h1>Privacy Policy</h1>
          <div className="company-name">J2 MECHANICS</div>
          <p className="effective-date">Effective Date: 31st August 2025</p>
        </div>

        <div className="privacy-policy-content">
          <section className="privacy-section">
            <h2>1. Introduction</h2>
            <p>
              J2 Mechanics respects your privacy and is committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, store, and safeguard your information 
              in compliance with the UK GDPR and Data Protection Act 2018.
            </p>
          </section>

          <section className="privacy-section">
            <h2>2. Data We Collect</h2>
            <p>We may collect the following data:</p>
            <ul className="data-list">
              <li><strong>Personal Information</strong> - name, address, phone number, email address</li>
              <li><strong>Vehicle Information</strong> - make, model, registration, service history</li>
              <li><strong>Booking Information</strong> - service type, appointment details, payments</li>
              <li><strong>Technical Data</strong> - IP address, browser type, cookies for website functionality</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>3. How We Use Your Data</h2>
            <p>We use your data for:</p>
            <ul className="usage-list">
              <li>Processing bookings and providing services</li>
              <li>Contacting you about appointments, updates, and invoices</li>
              <li>Sending service reminders and loyalty program benefits</li>
              <li>Improving our website and services</li>
              <li>Legal and accounting obligations</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>4. Lawful Basis for Processing</h2>
            <p>We rely on the following lawful grounds under GDPR:</p>
            <ul className="legal-basis-list">
              <li><strong>Contractual necessity</strong> – to provide services you request</li>
              <li><strong>Legitimate interest</strong> – for business administration and service improvement</li>
              <li><strong>Consent</strong> – for marketing communications</li>
              <li><strong>Legal obligation</strong> – for tax, VAT, and regulatory compliance</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>5. Data Sharing</h2>
            <p>We do not sell or rent your data. We may share data with:</p>
            <ul className="sharing-list">
              <li>Payment processors</li>
              <li>Vehicle parts suppliers (only if needed for your booking)</li>
              <li>IT/website hosting providers</li>
              <li>Regulators and law enforcement (where legally required)</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>6. Data Retention</h2>
            <ul className="retention-list">
              <li>Service records are kept for 6 years (legal/accounting requirement)</li>
              <li>Marketing consent records kept until consent is withdrawn</li>
              <li>Customer accounts may be deleted upon request</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2>7. Data Security</h2>
            <p>
              All customer data is stored securely in line with GDPR. We use encryption, 
              access controls, and secure servers. In the event of a data breach, we will 
              notify affected individuals and the ICO as required by law.
            </p>
          </section>

          <section className="privacy-section">
            <h2>8. Your Rights</h2>
            <p>Under GDPR you have the right to:</p>
            <ul className="rights-list">
              <li>Access your data</li>
              <li>Request correction or deletion</li>
              <li>Restrict or object to processing</li>
              <li>Withdraw consent for marketing at any time</li>
              <li>Request data portability</li>
            </ul>
            <p className="contact-info">
              Requests can be made by contacting: 
              <a href="mailto:j2mechanicslondon@gmail.com" className="email-link">
                j2mechanicslondon@gmail.com
              </a>
            </p>
          </section>

          <section className="privacy-section">
            <h2>9. Cookies</h2>
            <p>Our website uses cookies for:</p>
            <ul className="cookies-list">
              <li>Session management (keeping your booking active)</li>
              <li>Analytics (improving site performance)</li>
              <li>Marketing (only with your consent)</li>
            </ul>
            <p>
              You can disable cookies in your browser settings, but this may affect functionality.
            </p>
          </section>

          <section className="privacy-section">
            <h2>10. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party sites. We are not responsible 
              for their privacy practices.
            </p>
          </section>

          <section className="privacy-section">
            <h2>11. Updates</h2>
            <p>
              We may update this Privacy Policy from time to time. Updates will be posted 
              on our website with a revised "Effective Date."
            </p>
          </section>

          <section className="privacy-section">
            <h2>12. Complaints</h2>
            <p>
              If you are unhappy with how we handle your data, you can contact the 
              Information Commissioner's Office (ICO) at:
            </p>
            <p className="ico-link-container">
              <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="ico-link">
                ico.org.uk
              </a>
            </p>
          </section>
        </div>

        <div className="privacy-policy-footer">
          <p>Last updated: 31st August 2025</p>
          <p>© 2025 J2 Mechanics. All rights reserved.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
