
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os
import requests
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch


app = Flask(__name__)
CORS(app) 



# Paths for models
skin_model_path = os.path.join(os.path.dirname(__file__), 'skin_cancer_model (2).keras')
tb_model_path = os.path.join(os.path.dirname(__file__), 'Tuberculosis_model.keras')
transformer_model_path = os.path.join(os.path.dirname(__file__), 'transformer_model')



# Load the models
skin_model = tf.keras.models.load_model(skin_model_path)
print(f"Skin Cancer model loaded successfully from: {skin_model_path}")
tb_model = tf.keras.models.load_model(tb_model_path)
print(f"Tuberculosis model loaded successfully from: {tb_model_path}")
# Load the transformer model and tokenizer
tokenizer = AutoTokenizer.from_pretrained(transformer_model_path)
transformer_model = AutoModelForSequenceClassification.from_pretrained(transformer_model_path)
print(f"Transformer model loaded successfully from: {transformer_model_path}")

# --- CONFIGURATIONS ---

# Skin Cancer configuration
DISEASE_NAMES = [
    '(vertigo) Paroymsal  Positional Vertigo', 'AIDS', 'Acne', 'Alcoholic hepatitis', 'Allergy', 
    'Arthritis', 'Bronchial Asthma', 'Cervical spondylosis', 'Chicken pox', 'Chronic cholestasis', 
    'Common Cold', 'Dengue', 'Diabetes ', 'Dimorphic hemmorhoids(piles)', 'Drug Reaction', 
    'Fungal infection', 'GERD', 'Gastroenteritis', 'Heart attack', 'Hepatitis B', 'Hepatitis C', 
    'Hepatitis D', 'Hepatitis E', 'Hypertension ', 'Hyperthyroidism', 'Hypoglycemia', 
    'Hypothyroidism', 'Impetigo', 'Jaundice', 'Malaria', 'Migraine', 'Osteoarthristis', 
    'Paralysis (brain hemorrhage)', 'Peptic ulcer diseae', 'Pneumonia', 'Psoriasis', 
    'Tuberculosis', 'Typhoid', 'Urinary tract infection', 'Varicose veins', 'hepatitis A'
]
SKIN_CLASS_NAMES = [
    'Actinic keratoses and intraepithelial carcinoma / Bowen\'s disease',
    'Basal cell carcinoma',
    'Benign keratosis-like lesions',
    'Dermatofibroma',
    'Melanoma',
    'Melanocytic nevi',
    'Vascular lesions'
]
SKIN_CANCEROUS_CLASSES = {
    'Actinic keratoses and intraepithelial carcinoma / Bowen\'s disease', 
    'Basal cell carcinoma', 
    'Melanoma'
}
SKIN_CONFIDENCE_THRESHOLD = 0.50 

# Tuberculosis configuration
TB_CLASS_NAMES = ['Tuberculosis', 'Normal']


# --- IMAGE PREPROCESSING ---

def preprocess_image(image_data, size=(224, 224)):
    """Preprocesses the uploaded image for model prediction."""
    try:
        image = Image.open(io.BytesIO(image_data)).convert('RGB')
        image = image.resize(size)
        image_array = np.array(image) / 255.0
        image_array = np.expand_dims(image_array, axis=0)
        return image_array
    except Exception as e:
        raise ValueError(f"Error preprocessing image: {str(e)}")


# --- API ROUTES ---

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Prediction API is running'})

@app.route('/api/predict/dockinator', methods=['POST'])
def predict_dockinator():
    try:
        data = request.get_json()
        user_input = data.get('user_input')
        if not user_input:
            return jsonify({'error': 'No input provided'}), 400

        inputs = tokenizer(user_input, return_tensors="pt")
        with torch.no_grad():
            logits = transformer_model(**inputs).logits
        
        predicted_class_id = logits.argmax().item()
        
        # Use the mapping to get the disease name
        predicted_class_name = DISEASE_NAMES[predicted_class_id] if 0 <= predicted_class_id < len(DISEASE_NAMES) else "Unknown Condition"
        
        result = {
            'prediction': predicted_class_name,
            'confidence': torch.nn.functional.softmax(logits, dim=-1).max().item()
        }
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': f'Dockinator prediction failed: {str(e)}'}), 500

@app.route('/api/predict/skin', methods=['POST'])
def predict_skin():
    """Endpoint for Skin Cancer prediction."""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        
        file = request.files['image']
        image_data = file.read()
        
        processed_image = preprocess_image(image_data)
        predictions = skin_model.predict(processed_image)
        prediction_prob = predictions[0]
        
        predicted_class_idx = np.argmax(prediction_prob)
        predicted_class = SKIN_CLASS_NAMES[predicted_class_idx]
        confidence = float(prediction_prob[predicted_class_idx])
        
        is_cancerous_type = predicted_class in SKIN_CANCEROUS_CLASSES
        is_confident = confidence >= SKIN_CONFIDENCE_THRESHOLD
        is_final_malignant = is_cancerous_type and is_confident
        
        top_3_indices = np.argsort(prediction_prob)[-3:][::-1]
        top_3_predictions = []
        for idx in top_3_indices:
            class_name = SKIN_CLASS_NAMES[idx]
            top_3_predictions.append({
                'class': class_name,
                'confidence': float(prediction_prob[idx]),
                'is_malignant': class_name in SKIN_CANCEROUS_CLASSES
            })
        
        show_re = ["Potential Risk Detected", "No Significant Risk Detected 👍🏼"]
        result = {
            'prediction': show_re[0] if is_final_malignant else show_re[1],
            'confidence': confidence,
            'is_malignant': is_final_malignant,
            'risk_level': 'High' if is_final_malignant and confidence > 0.7 else 'Medium' if is_final_malignant else 'Low',
            'top_predictions': top_3_predictions,
            'recommendation': get_skin_recommendation(is_final_malignant, confidence)
        }
        return jsonify(result)

    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route('/api/predict/tb', methods=['POST'])
def predict_tb():
    """New endpoint for Tuberculosis prediction with corrected logic."""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No X-ray image provided'}), 400

        file = request.files['image']
        image_data = file.read()

        processed_image = preprocess_image(image_data)
        predictions = tb_model.predict(processed_image)
        
        # --- LOGIC CORRECTION ---
        # This new logic correctly interprets the model's output.
        # It checks if the model gives one or two outputs and handles both cases.
        if predictions.shape[1] == 1:
            # Case 1: Model returns a single value (sigmoid output)
            # We assume this value is the probability of 'Tuberculosis'
            tb_confidence = float(predictions[0][0])
            if tb_confidence > 0.5:
                predicted_class = 'Tuberculosis'
                confidence = tb_confidence
            else:
                predicted_class = 'Normal'
                confidence = 1.0 - tb_confidence
        else:
            # Case 2: Model returns two values (softmax output)
            # The original logic works here, but we use the correct class order.
            prediction_prob = predictions[0]
            # Assuming class order is ['Normal', 'Tuberculosis']
            normal_prob, tb_prob = prediction_prob[0], prediction_prob[1]

            if tb_prob > normal_prob:
                predicted_class = 'Tuberculosis'
                confidence = float(tb_prob)
            else:
                predicted_class = 'Normal'
                confidence = float(normal_prob)


        result = {
            'prediction': predicted_class,
            'confidence': confidence,
            'recommendation': get_tb_recommendation(predicted_class, confidence)
        }
        return jsonify(result)

    except Exception as e:
        return jsonify({'error': f'TB Prediction failed: {str(e)}'}), 500

# --- RECOMMENDATION HELPERS ---

def get_skin_recommendation(is_final_malignant, confidence):
    if is_final_malignant and confidence > 0.7:
        return "High risk detected. Please consult a dermatologist immediately."
    elif is_final_malignant:
        return "A potential risk has been detected. We strongly recommend consulting a dermatologist."
    else:
        return "The analysis did not find a significant risk. Continue with regular skin self-examinations."

def get_tb_recommendation(prediction, confidence):
    if prediction == 'Tuberculosis' and confidence > 0.7:
        return "The analysis indicates a high probability of Tuberculosis. Please consult a doctor immediately for further tests."
    elif prediction == 'Tuberculosis':
        return "Potential signs of Tuberculosis were detected. A consultation with a healthcare professional is strongly recommended."
    else:
        return "The analysis shows no significant signs of Tuberculosis. If you have symptoms, please consult a doctor."


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)