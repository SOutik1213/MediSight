import React, { useEffect } from 'react';
import Logo from './Logo';

const scrollToFeatures = () => {
  const section = document.querySelector('.features-section');
  if (section) section.scrollIntoView({ behavior: 'smooth' });
};

const animateOnScroll = () => {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const windowHeight = window.innerHeight;
  revealElements.forEach(el => {
    const top = el.getBoundingClientRect().top;
    if (top < windowHeight - 80) {
      el.classList.add('revealed');
    }
  });
};

const LandingPage = ({ onStart }) => {
  useEffect(() => {
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);
    return () => window.removeEventListener('scroll', animateOnScroll);
  }, []);

  return (
    <div className="landing-page-wrapper">
      {/* Hero Section */}
      <header className="landing-container parallax-hero">
        {/* Background Video */}
        <video autoPlay loop muted playsInline className="background-video">
          <source src="./hero.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Dynamic Overlay */}
        <div className="video-overlay parallax-overlay"></div>

        {/* Content */}
        <div className="landing-content hero-animate">
          <Logo height={250} width={500} />
          <h1 className="reveal-on-scroll" style={{ color: '#fff' }}>The Future of Healthcare.</h1>
          <p className="reveal-on-scroll" style={{ transitionDelay: '0.1s' }}>
            Leverage the power of AI to gain deep insights into your well-being.<br />
            Track, analyze, and understand your health like never before.
          </p>
          <button className="btn-primary reveal-on-scroll" style={{ transitionDelay: '0.2s' }} onClick={onStart}>
            Get Started →
          </button>
          <div className="scroll-indicator" onClick={scrollToFeatures} title="Scroll to features">↓</div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features-section reveal-on-scroll">
        <h2>Why Choose MediSight?</h2>
        <div className="features-grid">
          <div className="feature-item reveal-on-scroll">
            <span className="feature-icon">📊</span>
            <h3>Dockinator</h3>
            <p>Conversational AI to talk to patients to diagnose. Reduces patient panic</p>
          </div>
          <div className="feature-item reveal-on-scroll">
            <span className="feature-icon">🤖</span>
            <h3>Major Disease predictor</h3>
            <p>DL- Model to identity certain diseases by informational inputs</p>
          </div>
          <div className="feature-item reveal-on-scroll">
            <span className="feature-icon">🔒</span>
            <h3>Doc Appoint</h3>
            <p>Location, fees, specialty based filtering and doctor appointment and dashboard.</p>
          </div>
        </div>
      </section>

      {/* Interactive Section */}
      <section className="interactive-section reveal-on-scroll">
        <div className="interactive-image-container">
          <img src="./team.png" alt="Our Team" className="demo-image" style={{ width: '100%', borderRadius: '18px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }} />
        </div>
        <div className="interactive-text">
          <h2>About Us</h2>
          <p>
            We are a team of 4 second years, inspired by tech and AI. We want to built systems to leverage modern tech for the wellbeing of the masses.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; 2025 MediSight. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
