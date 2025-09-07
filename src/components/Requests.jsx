import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();
  const auth = getAuth();
  const doctorId = auth.currentUser?.uid;
  const [showDateTime, setShowDateTime] = useState(null); // request id or null
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    if (!doctorId) return;

    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctorId),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const appointments = [];
      querySnapshot.forEach((doc) => {
        appointments.push({ id: doc.id, ...doc.data() });
      });
      setRequests(appointments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, doctorId]);

  const handleRequest = async (id, newStatus, dateVal, timeVal) => {
    const requestDocRef = doc(db, 'appointments', id);
    try {
      const updateObj = { status: newStatus };
      if (newStatus === 'accepted') {
        updateObj.appointmentDate = dateVal;
        updateObj.appointmentTime = timeVal;
      }
      await updateDoc(requestDocRef, updateObj);
      setShowDateTime(null);
      setDate('');
      setTime('');
    } catch (error) {
      console.error("Error updating request: ", error);
    }
  };

  if (loading) return <p>Loading requests...</p>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Appointment Requests</h1>
        <p>Review and respond to incoming patient requests.</p>
      </div>
      {requests.length === 0 ? (
        <div className="widget-card"><p>No pending requests.</p></div>
      ) : (
        <div className="requests-list">
          {requests.map(req => (
            <div key={req.id} className="request-card">
              <h4>Request from: {req.patientName}</h4>
              <p>Received: {new Date(req.createdAt?.toDate()).toLocaleString()}</p>
              <div className="request-actions">
                {showDateTime === req.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      style={{ padding: 4, borderRadius: 6, border: '1px solid #e2e8f0' }}
                    />
                    <input
                      type="time"
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      style={{ padding: 4, borderRadius: 6, border: '1px solid #e2e8f0' }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn-success"
                        disabled={!date || !time}
                        onClick={() => handleRequest(req.id, 'accepted', date, time)}
                      >
                        Confirm
                      </button>
                      <button className="btn-reject" onClick={() => setShowDateTime(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button className="btn-success" onClick={() => setShowDateTime(req.id)}>Accept</button>
                    <button className="btn-reject" onClick={() => handleRequest(req.id, 'rejected')}>Reject</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Requests;
