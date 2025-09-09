import React, { useState, useRef } from 'react';

const TB = ({ onBack }) => {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Hugging Face Space API
  const API_URL = 'https://soutik07-medisight-api.hf.space/api/predict/';
  const FN_INDEX = 1; // predict_tb function index in your Gradio app

  // Drag & drop / file handling
  const handleFileChange = (e) => {
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPrediction(null);
      setError('');
    } else {
      setImageFile(null);
      setPreviewUrl('');
      setPrediction(null);
      setError('Please select a valid image file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFileChange(e);
  };

  const handleDragOver = (e) => e.preventDefault();

  // Prediction
  const handlePredict = async () => {
    if (!imageFile) {
      setError('Please upload a chest X-ray image first.');
      return;
    }

    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result.split(',')[1]; // remove prefix

          const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: [base64Image],
              fn_index: FN_INDEX,
            }),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || 'Prediction failed');
          }

          const result = await response.json();
          console.log('Gradio response:', result);

          const pred = result.data?.[0];
          if (pred) {
            let recommendation =
              pred.Prediction === 'Tuberculosis'
                ? 'High risk detected. Please consult a doctor immediately.'
                : 'No significant risk detected. Continue with regular health checkups.';

            setPrediction({ ...pred, recommendation });
          } else {
            setError('Prediction failed.');
          }
        } catch (err) {
          console.error(err);
          setError(err.message || 'Prediction failed.');
        } finally {
          setLoading(false);
        }
      };
    } catch (err) {
      setLoading(false);
      setError(err.message || 'An error occurred.');
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
        {/* Upload Column */}
        <div className="uploader-column" style={{ flex: 1, minWidth: 320 }}>
          <h3>Upload X-Ray</h3>
          <div
            className="image-dropzone tb-dropzone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current.click()}
            style={{
              cursor: 'pointer',
              minHeight: 180,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              transition: 'border 0.2s',
            }}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                style={{ maxWidth: 220, maxHeight: 180, borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
              />
            ) : (
              <span style={{ color: '#64748b', fontSize: 16, textAlign: 'center' }}>
                <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>📤</span>
                Drag & drop or click to upload X-ray image
              </span>
            )}
          </div>

          <input
            ref={fileInputRef}
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
              <button
                className="btn-secondary"
                onClick={() => {
                  setImageFile(null);
                  setPreviewUrl('');
                  setPrediction(null);
                  setError('');
                }}
              >
                Remove
              </button>
            )}
          </div>

          {error && <div className="error-message" style={{ marginTop: 10 }}>{error}</div>}
        </div>

        {/* Results Column */}
        <div className="results-column" style={{ flex: 1, minWidth: 320 }}>
          <h3>Analysis Results</h3>
          {loading && <div className="loader"></div>}

          {prediction && (
            <div
              className={`prediction-result-card ${getResultClass(prediction.Prediction)}`}
              style={{
                marginTop: 12,
                padding: 24,
                borderRadius: 14,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 20 }}>
                {prediction.Prediction === 'Tuberculosis' ? (
                  <span style={{ color: '#dc2626', fontSize: 24 }}>⚠️</span>
                ) : (
                  <span style={{ color: '#16a34a', fontSize: 24 }}>✅</span>
                )}
                {prediction.Prediction === 'Tuberculosis' ? 'Tuberculosis Detected' : 'Normal'}
              </h3>

              <div style={{ margin: '10px 0' }}>
                <strong>Prediction:</strong> {prediction.Prediction}
              </div>

              <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, margin: '12px 0' }}>
                <h4 style={{ margin: 0, fontWeight: 600 }}>Recommendation:</h4>
                <p style={{ margin: 0 }}>{prediction.recommendation}</p>
              </div>

              <div style={{ marginTop: 10 }}>
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
