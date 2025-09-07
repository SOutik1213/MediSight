import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const DocAppoint = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ location: '', specialty: '', fees: '' });
  const [message, setMessage] = useState('');
  
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const fetchDoctors = async () => {
      const doctorsCollection = collection(db, 'doctors');
      const doctorSnapshot = await getDocs(doctorsCollection);
      const doctorList = doctorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDoctors(doctorList);
      setFilteredDoctors(doctorList);
      setLoading(false);
    };
    fetchDoctors();
  }, [db]);
  
  useEffect(() => {
    let result = doctors;
    if (filters.location) {
        result = result.filter(doc => doc.location.toLowerCase().includes(filters.location.toLowerCase()));
    }
    if (filters.specialty) {
        result = result.filter(doc => doc.specialty.toLowerCase().includes(filters.specialty.toLowerCase()));
    }
    if (filters.fees) {
        result = result.filter(doc => doc.fees <= parseInt(filters.fees));
    }
    setFilteredDoctors(result);
  }, [filters, doctors]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleRequestAppointment = async (doctorId, doctorName) => {
    const patient = auth.currentUser;
    if (!patient) {
        setMessage('You must be logged in to make a request.');
        return;
    }
    
    // In a real app, you'd fetch the patient's name from their profile.
    const patientName = patient.email; 

    try {
        await addDoc(collection(db, "appointments"), {
            doctorId: doctorId,
            patientId: patient.uid,
            patientName: patientName,
            status: "pending",
            createdAt: serverTimestamp()
        });
        setMessage(`Appointment request sent to Dr. ${doctorName}!`);
        setTimeout(() => setMessage(''), 3000);
    } catch (error) {
        console.error("Error sending request: ", error);
        setMessage('Failed to send request. Please try again.');
    }
  };

  if (loading) return <p>Loading doctors...</p>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Find a Doctor</h1>
      </div>

      <div className="filters-container">
        <input name="location" placeholder="Filter by Location" onChange={handleFilterChange} />
        <input name="specialty" placeholder="Filter by Specialty" onChange={handleFilterChange} />
        <input name="fees" type="number" placeholder="Max Fee" onChange={handleFilterChange} />
      </div>

      {message && (
        <div className="message-toast floating-toast">{message}</div>
      )}

      <div className="table-container">
        <table className="doctors-table">
          <thead>
            <tr>
              <th>Doctor Name</th>
              <th>Specialty</th>
              <th>Location</th>
              <th>Fees</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.length > 0 ? filteredDoctors.map(doc => (
              <tr key={doc.id}>
                <td>Dr. {doc.name}</td>
                <td>{doc.specialty}</td>
                <td>{doc.location}</td>
                <td>Rs {doc.fees}</td>
                <td>
                  <button className="btn-primary" onClick={() => handleRequestAppointment(doc.id, doc.name)}>
                    Request
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5">No doctors found matching your criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocAppoint;

