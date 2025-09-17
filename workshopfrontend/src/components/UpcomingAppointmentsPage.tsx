import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const upcomingAppointments = [
  { service: 'Interim Service', date: '18 Jul 2024, 10:00 AM', car: 'Toyota Yaris' },
  { service: 'Tyre Replacement', date: '25 Aug 2024, 2:30 PM', car: 'Honda Civic' },
];

const UpcomingAppointmentsPage: React.FC = () => (
  <>
    <Navbar />
    <div id="tpast">

</div>
    <div  id="past"style={{ background: '#111', minHeight: '100vh', padding: 0 }}>
      <div id="past2" style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px 0 24px' }}>
        <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '2.2rem', marginBottom: 8 }}>Upcoming Appointments</h1>
        <div style={{ color: '#bdbdbd', fontSize: '1.15rem', marginBottom: 32 }}>Your future bookings are listed below.</div>
        {upcomingAppointments.map((item, i) => (
          <div key={i} style={{ background: '#232323', borderRadius: 14, boxShadow: '0 2px 12px #0006', padding: 24, marginBottom: 18, color: '#fff', display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '1.18rem', color: '#ffd600', marginBottom: 4 }}>{item.service}</div>
              <div style={{ color: '#bdbdbd', fontSize: '1.05rem', marginBottom: 2 }}>{item.car}</div>
              <div style={{ color: '#fff', fontSize: '1.01rem' }}>{item.date}</div>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  </>
);

export default UpcomingAppointmentsPage; 