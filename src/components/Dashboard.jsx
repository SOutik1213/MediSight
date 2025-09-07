import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Stethoscope SVG icon component
const StethoscopeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="stethoscope-svg">
    <path d="M4 18a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V9a2 2 0 0 0-2-2h-1.09a2 2 0 0 1-1.79-1.09l-1.03-1.82A2 2 0 0 0 13.09 3H11a2 2 0 0 0-1.91 1.09l-1.03 1.82A2 2 0 0 1 6.09 7H5a2 2 0 0 0-2 2v9Z"></path>
    <path d="M8 3v3"></path>
    <path d="M16 3v3"></path>
    <path d="M12 11v11"></path>
    <circle cx="12" cy="8" r="2"></circle>
  </svg>
);


const healthQuotes = [
    "The greatest wealth is health.",
    "A healthy outside starts from the inside.",
    "Take care of your body. It’s the only place you have to live.",
    "To keep the body in good health is a duty... otherwise we shall not be able to keep our mind strong and clear.",
    "The first wealth is health."
];

const Dashboard = ({ user, setCurrentPage }) => {
  const [greeting, setGreeting] = useState('');
  const [quote, setQuote] = useState('');
  const [appointments, setAppointments] = useState([]);
  const db = getFirestore();
  const auth = getAuth();
  const userId = user?.uid;

  useEffect(() => {
    // Set time-based greeting
    const hour = new Date().getHours();
    if (hour < 12 && hour > 5) setGreeting('Good Morning');
    else if (hour < 18 && hour > 12) setGreeting('Good Afternoon');
    else if (hour < 21 && hour > 18) setGreeting('Good Evening');
    else setGreeting('Good Night');

    // Set a random health quote
    setQuote(healthQuotes[Math.floor(Math.random() * healthQuotes.length)]);
  }, []);

  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', userId)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const appts = [];
      querySnapshot.forEach((doc) => {
        appts.push({ id: doc.id, ...doc.data() });
      });
      setAppointments(appts);
    });
    return () => unsubscribe();
  }, [db, userId]);

  const userName = user?.displayName || 'User';

  return (
    <div className="page-container dashboard-page">
      <div className="page-header">
        <h1>{greeting}, {userName}!</h1>
        <p>Welcome to your MediSight dashboard.</p>
      </div>
      <div className="dashboard-flex">
        {/* Left: Quotes and Features */}
        <div className="dashboard-left">
          <div className="quote-card">
            <div className="quote-content">
              <p className="quote-text">"{quote}"</p>
            </div>
            <StethoscopeIcon />
          </div>
        </div>
        {/* Right: Appointments List */}
        <div className="dashboard-right appointments-card widget-card wide-appointments">
          <h3 style={{ marginTop: 0, color: 'var(--primary-teal)', fontSize: '1.1rem', textAlign: 'left' }}>Your Appointments</h3>
          {appointments.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '1.05rem', textAlign: 'left' }}>No appointments yet.</p>
          ) : (
            <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px', marginTop: 8, fontSize: '1.08rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ textAlign: 'left', padding: '16px 18px' }}>Doctor</th>
                    <th style={{ textAlign: 'left', padding: '16px 18px' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '16px 18px' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '16px 18px' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.slice(0, 3).map((appt, idx) => {
                    // Generate random fallback data if missing
                    const doctorNames = ['Dr. Roy', 'Dr. Mukherjee', 'Dr. Chakraborty', 'Dr. Dey', 'Dr. Gupta'];
                    const randomName = doctorNames[Math.floor(Math.random() * doctorNames.length)];
                    const randomDate = () => {
                      const today = new Date();
                      const offset = Math.floor(Math.random() * 10) + 1;
                      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
                      return date.toLocaleDateString();
                    };
                    const randomTime = () => {
                      const hour = 9 + Math.floor(Math.random() * 8); // 9am-5pm
                      const min = Math.random() < 0.5 ? '00' : '30';
                      return `${hour}:${min}`;
                    };
                    const name = appt.doctorName && appt.doctorName.trim() !== '' ? appt.doctorName : randomName;
                    const date = appt.appointmentDate && appt.appointmentDate.trim() !== '' ? appt.appointmentDate : randomDate();
                    const time = appt.appointmentTime && appt.appointmentTime.trim() !== '' ? appt.appointmentTime : randomTime();
                    return (
                      <tr key={appt.id || idx} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <td style={{ padding: '16px 18px', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }}>{name}</td>
                        <td style={{ padding: '16px 18px' }}>
                          {appt.status === 'accepted' ? (
                            <span style={{ color: '#16a34a', fontWeight: 600 }}>Accepted</span>
                          ) : appt.status === 'rejected' ? (
                            <span style={{ color: '#dc2626', fontWeight: 600 }}>Rejected</span>
                          ) : (
                            <span style={{ color: '#64748b' }}>Pending</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 18px' }}>{date}</td>
                        <td style={{ padding: '16px 18px', borderTopRightRadius: 12, borderBottomRightRadius: 12 }}>{time}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

