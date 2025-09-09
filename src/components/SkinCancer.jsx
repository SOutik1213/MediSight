import React, { useState } from 'react';

const SkinCancer = ({ onBack }) => {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = "https://soutik07-MediSight.hf.space/run/predict_skin";

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
      setError('Please select a valid image file.');
    }
  };

  const handleDrop = (e) => { e.preventDefault(); handleFileChange(e); };
  const handleDragOver = (e) => { e.preventDefault(); };

  const handlePredict = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError('');
    setPrediction(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = async () => {
        const base64Image = reader.result;

        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: [base64Image] }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Prediction failed');
        }

        const result = await response.json();
        console.log('Prediction result:', result);

        const pred = result; // HF Space returns object directly

        if (pred) {
          const isMalignant = pred["Is Malignant"];
          let riskLevel = 'Low';
          if (isMalignant) riskLevel = pred.Confidence > 0.7 ? 'High' : 'Medium';

          let recommendation = '';
          if (isMalignant && pred.Confidence > 0.7)
            recommendation = "High risk detected. Please consult a dermatologist immediately.";
          else if (isMalignant)
            recommendation = "A potential risk has been detected. We strongly recommend consulting a dermatologist.";
          else
            recommendation = "The analysis did not find a significant risk. Continue with regular skin self-examinations.";

          setPrediction({ ...pred, risk_level: riskLevel, recommendation });
        } else {
          setPrediction(null);
          setError('Prediction failed.');
        }
      };
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during prediction');
    } finally {
      setLoading(false);
    }
  };

  const getRiskClass = (level) => {
    if (!level) return '';
    if (level.toLowerCase() === 'high') return 'risk-high';
    if (level.toLowerCase() === 'medium') return 'risk-medium';
    return 'risk-low';
  };

  return (
    <div className="prediction-module-container">
      <button className="btn-secondary back-button" onClick={onBack}>← Back</button>

      <h2>Skin Cancer Prediction</h2>
      <p>Upload an image of a skin lesion for AI analysis. This is not a medical diagnosis.</p>

      <div
        className="image-dropzone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById('skin-image-upload').click()}
        style={{
          border: '2px dashed #ccc',
          borderRadius: 12,
          padding: 20,
          textAlign: 'center',
          cursor: 'pointer',
          marginBottom: 12
        }}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" style={{ maxWidth: 220, maxHeight: 180, borderRadius: 12 }} />
        ) : (
          <p>📤 Drag & drop or click to upload image</p>
        )}
      </div>

      <input
        id="skin-image-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <button className="btn-primary" onClick={handlePredict} disabled={!imageFile || loading}>
          {loading ? 'Analyzing...' : 'Predict'}
        </button>
        {imageFile && (
          <button className="btn-secondary" onClick={() => { setImageFile(null); setPreviewUrl(''); setPrediction(null); setError(''); }}>
            Remove
          </button>
        )}
      </div>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      {prediction && (
        <div className={`prediction-result-card ${getRiskClass(prediction.risk_level)}`} style={{ padding: 16, borderRadius: 12, border: '1px solid #ccc' }}>
          <p><strong>Prediction:</strong> {prediction.Prediction}</p>
          <p><strong>Confidence:</strong> {(prediction.Confidence*100).toFixed(2)}%</p>
          <p><strong>Risk Level:</strong> {prediction.risk_level}</p>
          <p><strong>Recommendation:</strong> {prediction.recommendation}</p>
        </div>
      )}
    </div>
  );
};

export default SkinCancer;
