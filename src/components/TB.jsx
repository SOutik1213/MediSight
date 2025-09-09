import React, { useState } from 'react';

const TB = ({ onBack }) => {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = `${import.meta.env.VITE_API_URL}/run/predict_tb`;

  // Drag-and-drop support
  const handleFileChange = (e) => {
    let file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];

    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPrediction(null);
      setError('');
    } else {
      setImageFile(null);
      setPreviewUrl('');
      setError('Please select a valid image file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFileChange(e);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handlePredict = async () => {
    if (!imageFile) {
      setError('Please upload an X-ray image first.');
      return;
    }

    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile); // convert image to base64
      reader.onloadend = async () => {
        const base64Image = reader.result;

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: [base64Image] }), // Gradio expects `data` array
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Prediction failed');
        }

        const result = await response.json();
        const pred = result.data?.[0];

        if (pred) {
          let recommendation = '';
          if (pred.Prediction === 'Tuberculosis') {
            recommendation = 'High risk detected. Please consult a doctor immediately.';
          } else {
            recommendation = 'No significant risk detected. Continue with regular health checkups.';
          }

          setPrediction({ ...pred, recommendation });
        } else {
          setPrediction(null);
          setError('Prediction failed.');
        }
      };
    } catch (err) {
      setError(err.message || 'An error occurred during prediction.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getResultClass = (pred) => {
    if (!pred) return '';
    return pred.toLowerCase() === 'tuberculosis' ? 'result-positive' : 'result-negative';
  };

  return (
    <div className="prediction-module-container">
      <button className="btn-secondary back-button" onClick={onBack}>
        ← Back
      </button>

      <div className="header">
        <h2>Tuberculosis (TB) Prediction</h2>
        <p className="description">
          Upload a chest X-ray image for an AI-powered analysis.<br />
          <span style={{ color: '#dc2626', fontWeight: 500 }}>
            <strong>Disclaimer:</strong> This is a preliminary analysis and not a medical diagnosis.
          </span>
        </p>
      </div>

      <div className="prediction-content-area" style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
        <div className="uploader-column" style={{ flex: 1, minWidth: 320 }}>
          <h3>Upload X-Ray</h3>
          <div
            className="image-dropzone tb-dropzone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{ cursor: 'pointer', minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, transition: 'border 0.2s' }}
            onClick={() => document.getElementById('tb-image-upload').click()}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="tb-preview-img" style={{ maxWidth: 220, maxHeight: 180, borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }} />
            ) : (
              <span className="drop-text" style={{ color: '#64748b', fontSize: 16 }}>
                <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>📤</span>
                Drag & drop or click to upload X-ray image
              </span>
            )}
          </div>

          <input
            id="tb-image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
            Supported: JPG, PNG, etc. Max 5MB.
          </div>

          <div className="upload-controls" style={{ display: 'flex', gap: 12 }}>
            <button className="btn-primary" onClick={handlePredict} disabled={!imageFile || loading}>
              {loading ? 'Analyzing...' : 'Predict'}
            </button>
            {imageFile && (
              <button className="btn-secondary" onClick={() => { setImageFile(null); setPreviewUrl(''); setPrediction(null); setError(''); }}>
                Remove
              </button>
            )}
          </div>

          {error && <div className="error-message" style={{ marginTop: 10 }}>{error}</div>}
        </div>

        <div className="results-column" style={{ flex: 1, minWidth: 320 }}>
          <h3>Analysis Results</h3>
          {loading && <div className="loader"></div>}

          {prediction && (
            <div className={`prediction-result-card ${getResultClass(prediction.Prediction)}`} style={{ marginTop: 12, padding: 24, borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 className="result-title" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 20 }}>
                {prediction.Prediction === 'Tuberculosis' ? <span style={{ color: '#dc2626', fontSize: 24 }}>⚠️</span> : <span style={{ color: '#16a34a', fontSize: 24 }}>✅</span>}
                {prediction.Prediction === 'Tuberculosis' ? 'Tuberculosis Detected' : 'Normal'}
              </h3>

              <div className="result-item" style={{ margin: '10px 0' }}>
                <strong>Prediction:</strong> {prediction.Prediction}
              </div>

              <div className="recommendation" style={{ background: '#f8fafc', borderRadius: 8, padding: 12, margin: '12px 0' }}>
                <h4 style={{ margin: 0, fontWeight: 600 }}>Recommendation:</h4>
                <p style={{ margin: 0 }}>{prediction.recommendation}</p>
              </div>

              <div className="disclaimer" style={{ marginTop: 10 }}>
                <strong>Important:</strong> This is not a medical diagnosis. Always consult a qualified doctor.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TB;