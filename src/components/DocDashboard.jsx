import React from 'react';


const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const DoctorDashboard = ({ user }) => {
  const userName = user.email.split('@')[0];
  const greeting = getGreeting();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Doctor Dashboard</h1>
        <p>{greeting}, Dr. {userName.charAt(0).toUpperCase() + userName.slice(1)}! 👋</p>
      </div>
      <div className="widget-card" style={{ background: 'linear-gradient(90deg, #ede9fe 0%, #ccfbf1 100%)', color: '#7c3aed', fontWeight: 600, fontSize: '1.2rem', marginBottom: 24 }}>
        "The art of medicine consists of amusing the patient while nature cures the disease." <span style={{ color: '#0d9488', fontWeight: 700 }}>&mdash; Voltaire</span>
      </div>
      <div className="widget-card">
        <h3>Manage Appointments & Grow Your Practice</h3>
        <ul style={{ margin: '1rem 0 0 1.5rem', color: '#64748b', fontSize: '1.08rem' }}>
          <li>View and manage patient appointment requests in real time.</li>
          <li>Accept or reject requests with a single click.</li>
          <li>Grow your patient base by providing timely care and building trust.</li>
        </ul>
      </div>
    </div>
  );
};

export default DoctorDashboard;
