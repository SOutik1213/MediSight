import React from 'react';

// SVG icon for Skin analysis
const SkinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8Z"></path>
        <path d="M12 10v4"></path>
        <path d="M10 12h4"></path>
    </svg>
);

// SVG icon for Lungs/Tuberculosis analysis
const LungsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20a4 4 0 0 1-4-4V4a4 4 0 1 1 8 0v12a4 4 0 0 1-4 4Z"></path>
        <path d="M12 4V2"></path>
        <path d="M12 20v2"></path>
        <path d="M12 12a4 4 0 0 0-4 4"></path>
        <path d="M12 12a4 4 0 0 1 4 4"></path>
    </svg>
);


const PredictDiseases = ({ onNavigate }) => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Predict Diseases</h1>
        <p>Select a model to upload an image for AI-powered prediction.</p>
        <p>More models to be added later.</p>
      </div>

      <div className="prediction-list-container">
        <div className="prediction-list-item" onClick={() => onNavigate('skin_cancer')}>
          <div className="item-icon skin-icon">
            <SkinIcon />
          </div>
          <div className="item-text">
            <h3>Skin Cancer</h3>
            <p>Analyze images of skin lesions for potential malignancy.</p>
          </div>
          <div className="item-arrow">
            <span>&rarr;</span>
          </div>
        </div>
        
        <div className="prediction-list-item" onClick={() => onNavigate('tuberculosis')}>
           <div className="item-icon lungs-icon">
            <LungsIcon />
          </div>
          <div className="item-text">
            <h3>Tuberculosis</h3>
            <p>Analyze chest X-ray images for signs of TB.</p>
          </div>
          <div className="item-arrow">
            <span>&rarr;</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictDiseases;

