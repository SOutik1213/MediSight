import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import Logo from './Logo';

const AuthForm = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState('patient'); // 'patient' or 'doctor'
  const [formData, setFormData] = useState({});

  const auth = getAuth();
  const db = getFirestore();

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      // --- SIGN UP LOGIC ---
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 1. Create role document in 'users' collection
        await setDoc(doc(db, 'users', user.uid), { role });

        // 2. Create profile document in 'patients' or 'doctors' collection
        if (role === 'patient') {
          await setDoc(doc(db, 'patients', user.uid), {
            name: formData.name || '',
            age: Number(formData.age) || 0,
            location: formData.location || '',
            phone: formData.phone || '',
          });
        } else {
          await setDoc(doc(db, 'doctors', user.uid), {
            name: formData.name || '',
            experience: Number(formData.experience) || 0,
            location: formData.location || '',
            specialty: formData.specialty || '',
            fees: Number(formData.fees) || 0,
          });
        }
      } catch (err) {
        setError(err.message.replace('Firebase: ', ''));
      }
    } else {
      // --- LOGIN LOGIC ---
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err) {
        setError(err.message.replace('Firebase: ', ''));
      }
    }
  };

  return (
    <div className="auth-container">
  <Logo height={200} width={350} />

      {isSignUp && (
        <div className="role-selector">
          <button className={role === 'patient' ? 'active' : ''} onClick={() => setRole('patient')}>I'm a Patient</button>
          <button className={role === 'doctor' ? 'active' : ''} onClick={() => setRole('doctor')}>I'm a Doctor</button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        
        {isSignUp && role === 'patient' && (
          <>
            <input name="name" type="text" placeholder="Full Name" onChange={handleFormChange} required />
            <input name="age" type="number" placeholder="Age" onChange={handleFormChange} required />
            <input name="location" type="text" placeholder="Location (e.g., City)" onChange={handleFormChange} required />
            <input name="phone" type="tel" placeholder="Phone Number" onChange={handleFormChange} required />
          </>
        )}

        {isSignUp && role === 'doctor' && (
          <>
            <input name="name" type="text" placeholder="Full Name" onChange={handleFormChange} required />
            <input name="specialty" type="text" placeholder="Specialty (e.g., Cardiologist)" onChange={handleFormChange} required />
            <input name="experience" type="number" placeholder="Years of Experience" onChange={handleFormChange} required />
            <input name="location" type="text" placeholder="Location (e.g., City)" onChange={handleFormChange} required />
            <input name="fees" type="number" placeholder="Average Visiting Fees (Rs)" onChange={handleFormChange} required />
          </>
        )}

        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn-primary">{isSignUp ? 'Sign Up' : 'Login'}</button>
      </form>

      <p>{isSignUp ? 'Already have an account?' : "Don't have an account?"}
        <button className="link-btn" onClick={() => setIsSignUp(!isSignUp)}>{isSignUp ? 'Login' : 'Sign Up'}</button>
      </p>
      <button className="btn-secondary" onClick={onBack}>← Back to Home</button>
    </div>
  );
};

export default AuthForm;

