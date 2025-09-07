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
            <h3>Smart Tracking</h3>
            <p>Easily log and monitor your health metrics with our intuitive interface.</p>
          </div>
          <div className="feature-item reveal-on-scroll">
            <span className="feature-icon">🤖</span>
            <h3>AI-Powered Insights</h3>
            <p>Receive personalized recommendations and predictions from our advanced AI.</p>
          </div>
          <div className="feature-item reveal-on-scroll">
            <span className="feature-icon">🔒</span>
            <h3>Secure & Private</h3>
            <p>Your health data is encrypted and stored with the highest security standards.</p>
          </div>
        </div>
      </section>

      {/* Interactive Section */}
      <section className="interactive-section reveal-on-scroll">
        <div className="interactive-image-container">
          <video autoPlay loop muted playsInline className="demo-video">
            <source src="./hero.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="interactive-text">
          <h2>Visualize Your Progress</h2>
          <p>
            Our interactive dashboard brings your health data to life. See trends,
            spot patterns, and take control of your well-being with visually rich
            charts and reports.
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
