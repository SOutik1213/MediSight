MediSight – AI-Powered Early Disease Detection Assistant
MediSight is an intelligent web application designed to provide users with instant, AI-powered preliminary health assessments. By leveraging a suite of machine learning models, MediSight helps bridge the gap between noticing a symptom and consulting a healthcare professional, empowering users to make informed decisions about their health.

✨ Key Features
Symptom Analysis ("Dockinator"): An NLP-powered chatbot where users can describe their symptoms in natural language. The model analyzes the input and predicts a potential condition from a knowledge base of 41 diseases.

Skin Cancer Detection: Upload an image of a skin lesion, and our vision model will classify it as one of seven types, identifying potentially malignant conditions like Melanoma and Basal cell carcinoma and assessing the risk level.

Tuberculosis (TB) Screening: Analyze a chest X-ray image to get a preliminary prediction of whether it shows signs of Tuberculosis or appears normal.

The model will not work in the vercel app link but if you want a demo of the model see it the following link.

https://huggingface.co/spaces/soutik07/MediSight

User Authentication: Secure sign-up and login functionality for both patients and doctors, managed via Firebase.

Role-Based Dashboards: Separate, tailored dashboard views for patients and doctors, providing relevant options and information.

Doctor Appointment System: A feature for patients to view and potentially book appointments with registered doctors.

🛠️ Tech Stack
Frontend
Framework: React.js

Build Tool: Vite

Authentication: Firebase for Google Cloud

Styling: Custom CSS in App.css and index.css

Backend
Framework: Flask

ML Libraries: TensorFlow (Keras), Transformers, PyTorch

Server: Gunicorn

CORS Handling: Flask-CORS

🚀 Getting Started
Follow these instructions to get a local copy of the project up and running for development and testing purposes.

Prerequisites
Node.js and npm installed

Python 3.9+ and pip installed

A Firebase project set up for authentication

Installation
Clone the repository:

Bash

git clone https://github.com/your-username/medisight.git
cd medisight
Setup the Frontend:

Navigate to the root directory.

Install npm packages:

Bash

npm install
Create a .env file in the root directory and add your Firebase project configuration keys:

Code snippet

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
Setup the Backend:

Create and activate a virtual environment:

Bash

python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
Install Python packages:

Bash

pip install -r backend/requirements.txt
Running the Application
Start the Backend Server:

Bash

python backend/app.py
The Flask server will start, typically on http://127.0.0.1:5000.

Start the Frontend Development Server:

In a new terminal, run:

Bash

npm run dev
Open your browser and navigate to the local server address provided (usually http://localhost:5173).

Disclaimer: MediSight is a tool for preliminary informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or another qualified health provider with any questions you may have regarding a medical condition.
