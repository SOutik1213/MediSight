import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Import Components
import LandingPage from "./components/LandingPage";
import AuthForm from "./components/AuthForm";
// Patient Components
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Dockinator from "./components/Dockinator";
import PredictDiseases from "./components/Predict";
import DocAppoint from "./components/DocAppoint";
import SkinCancer from "./components/SkinCancer"; // New import
import TB from "./components/TB"; // New import
// Doctor Components
import DoctorSidebar from "./components/DocSidebar";
import DoctorDashboard from "./components/DocDashboard";
import Requests from "./components/Requests";

// Firebase config (should be in your .env file)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("landing");
  const [currentPage, setCurrentPage] = useState("Dashboard");
  const [predictionPage, setPredictionPage] = useState(null); // New state for sub-navigation

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      } else {
        setUser(null);
        setUserRole(null);
        setView("landing");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSetCurrentPage = (page) => {
    setCurrentPage(page);
    // Reset sub-navigation when changing main pages
    setPredictionPage(null); 
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const renderPatientPage = () => {
    switch (currentPage) {
      case "Dockinator": return <Dockinator />;
      case "Predict Diseases":
        // Sub-routing for prediction pages
        switch (predictionPage) {
          case 'skin_cancer':
            return <SkinCancer onBack={() => setPredictionPage(null)} />;
          case 'tuberculosis':
            return <TB onBack={() => setPredictionPage(null)} />;
          default:
            return <PredictDiseases onNavigate={setPredictionPage} />;
        }
      case "Doc Appoint": return <DocAppoint />;
      default: return <Dashboard user={user} />;
    }
  };

  const renderDoctorPage = () => {
    switch (currentPage) {
      case "Requests": return <Requests />;
      default: return <DoctorDashboard user={user} />;
    }
  };

  if (loading) {
    return <div className="loading-screen"><p>Loading MediSight...</p></div>;
  }

  if (!user) {
    return (
      <main className="centered-container">
        {view === "landing" && <LandingPage onStart={() => setView("auth")} />}
        {view === "auth" && <AuthForm onBack={() => setView("landing")} />}
      </main>
    );
  }

  return (
    <div className="app-layout">
      {userRole === 'patient' && (
        <>
          <Sidebar currentPage={currentPage} setCurrentPage={handleSetCurrentPage} onLogout={handleLogout} />
          <main className="main-content">{renderPatientPage()}</main>
        </>
      )}
      {userRole === 'doctor' && (
        <>
          <DoctorSidebar currentPage={currentPage} setCurrentPage={handleSetCurrentPage} onLogout={handleLogout} />
          <main className="main-content">{renderDoctorPage()}</main>
        </>
      )}
      {!userRole && loading && <div className="loading-screen"><p>Fetching profile...</p></div>}
    </div>
  );
}

export default App;

