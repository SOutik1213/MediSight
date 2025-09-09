import React, { useState } from 'react';

const TB = ({ onBack }) => {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = "https://soutik07-medisight-api.hf.space/run/predict_tb";

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
      setError('Please select a valid X-ray image.');
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

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: [base64Image] }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Prediction failed');
        }

        const result = await response.json();
        console.log('TB Prediction Result:', result);

        const pred = result; // HF Space returns object directly
        if (pred) {
          let recommendation = pred.Prediction === 'Tuberculosis'
            ? 'High risk detected. Please consult a doctor immediately.'
            : 'No significant risk detected. Continue with regular health checkups.';
          setPrediction({ ...pred, recommendation });
        } else {
          setError('Prediction failed.');
        }
      };
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during prediction.');
    } finally {
      setLoading(false);
    }
  };

  const getResultClass = (pred) => !pred ? '' : pred.Prediction.toLowerCase() === 'tuberculosis' ? 'result-positive' : 'result-negative';

  return (
    <div className="prediction-module-container">
      <button onClick={onBack}>← Back</button>
      <h2>Tuberculosis Prediction</h2>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById('tb-image-upload').click()}
      >
        {previewUrl ? <img src={previewUrl} alt="Preview" /> : "Drag & drop or click to upload X-ray image"}
      </div>
      <input id="tb-image-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
      <button onClick={handlePredict} disabled={!imageFile || loading}>{loading ? 'Analyzing...' : 'Predict'}</button>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      {prediction && (
        <div className={`prediction-result-card ${getResultClass(prediction)}`}>
          <p><strong>Prediction:</strong> {prediction.Prediction}</p>
          <p><strong>Confidence:</strong> {(prediction.Confidence*100).toFixed(2)}%</p>
          <p><strong>Recommendation:</strong> {prediction.recommendation}</p>
        </div>
      )}
    </div>
  );
};

export default TB;
