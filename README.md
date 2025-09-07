# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# MediSight Backend - Skin Cancer Prediction API

This backend provides a REST API for skin cancer prediction using a trained Keras model.

## Setup

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Start the backend server:**
   ```bash
   # From the MediSight root directory
   python start_backend.py
   
   # Or directly from backend directory
   cd backend
   python app.py
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
- **GET** `/api/health`
- Returns server status

### Skin Cancer Prediction
- **POST** `/api/predict`
- **Body:** Form data with `image` field (file upload)
- **Response:** JSON with prediction results

Example response:
```json
{
  "prediction": "Melanoma",
  "confidence": 0.85,
  "is_malignant": true,
  "risk_level": "High",
  "top_predictions": [
    {
      "class": "Melanoma",
      "confidence": 0.85,
      "is_malignant": true
    }
  ],
  "recommendation": "High risk detected. Please consult a dermatologist immediately..."
}
```

## Model Information

- **Model file:** `skin_cancer_model.keras` (27MB)
- **Input size:** 224x224 RGB images
- **Classes:** 7 different skin lesion types
- **Malignant classes:** Actinic keratoses, Basal cell carcinoma, Melanoma
- **Benign classes:** Benign keratosis, Dermatofibroma, Melanocytic nevi, Vascular lesions

## Frontend Integration

The React frontend (`src/components/SkinCancer.jsx`) is configured to call this API at `http://localhost:5000/api/predict`.

## Running Both Frontend and Backend

1. **Terminal 1 - Backend:**
   ```bash
   python start_backend.py
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173` and will automatically connect to the backend API.

