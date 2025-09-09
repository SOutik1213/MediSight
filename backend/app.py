import gradio as gr
import tensorflow as tf
import numpy as np
from PIL import Image
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

# --- CONFIGURATIONS ---
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
TB_CLASS_NAMES = ['Tuberculosis', 'Normal']

# --- LOAD MODELS ---
skin_model = tf.keras.models.load_model("skin_cancer_model (2).keras")
tb_model = tf.keras.models.load_model("Tuberculosis_model.keras")
tokenizer = AutoTokenizer.from_pretrained("transformer_model")
transformer_model = AutoModelForSequenceClassification.from_pretrained("transformer_model")

# --- IMAGE PREPROCESSING ---
def preprocess_image(image, size=(224, 224)):
    img = image.convert('RGB').resize(size)
    img_array = np.array(img) / 255.0
    return np.expand_dims(img_array, axis=0)

# --- PREDICTION FUNCTIONS ---
def predict_skin(image):
    try:
        processed_image = preprocess_image(image)
        predictions = skin_model.predict(processed_image)
        prediction_prob = predictions[0]
        
        predicted_class_idx = np.argmax(prediction_prob)
        predicted_class = SKIN_CLASS_NAMES[predicted_class_idx]
        confidence = float(prediction_prob[predicted_class_idx])
        is_cancerous_type = predicted_class in SKIN_CANCEROUS_CLASSES
        is_confident = confidence >= SKIN_CONFIDENCE_THRESHOLD
        is_final_malignant = is_cancerous_type and is_confident

        return {
            "Prediction": predicted_class,
            "Confidence": confidence,
            "Is Malignant": is_final_malignant
        }
    except Exception as e:
        return {"Error": str(e)}

def predict_tb(image):
    try:
        processed_image = preprocess_image(image)
        predictions = tb_model.predict(processed_image)

        if predictions.shape[1] == 1:
            tb_confidence = float(predictions[0][0])
            if tb_confidence > 0.5:
                predicted_class = 'Tuberculosis'
                confidence = tb_confidence
            else:
                predicted_class = 'Normal'
                confidence = 1.0 - tb_confidence
        else:
            prediction_prob = predictions[0]
            normal_prob, tb_prob = prediction_prob[0], prediction_prob[1]
            if tb_prob > normal_prob:
                predicted_class = 'Tuberculosis'
                confidence = float(tb_prob)
            else:
                predicted_class = 'Normal'
                confidence = float(normal_prob)

        return {
            "Prediction": predicted_class,
            "Confidence": confidence
        }
    except Exception as e:
        return {"Error": str(e)}

def predict_symptoms(text):
    try:
        inputs = tokenizer(text, return_tensors="pt")
        with torch.no_grad():
            logits = transformer_model(**inputs).logits
        predicted_class_id = logits.argmax().item()
        predicted_class_name = DISEASE_NAMES[predicted_class_id] if 0 <= predicted_class_id < len(DISEASE_NAMES) else "Unknown Condition"
        confidence = torch.nn.functional.softmax(logits, dim=-1).max().item()
        return {
            "Prediction": predicted_class_name,
            "Confidence": confidence
        }
    except Exception as e:
        return {"Error": str(e)}

# --- GRADIO INTERFACES ---
skin_interface = gr.Interface(fn=predict_skin, inputs=gr.Image(type="pil"), outputs="json", title="Skin Cancer Prediction")
tb_interface = gr.Interface(fn=predict_tb, inputs=gr.Image(type="pil"), outputs="json", title="Tuberculosis Prediction")
symptom_interface = gr.Interface(fn=predict_symptoms, inputs="text", outputs="json", title="Symptom-based Disease Prediction")

demo = gr.TabbedInterface(
    [skin_interface, tb_interface, symptom_interface],
    ["Skin Cancer", "Tuberculosis", "Symptom Prediction"]
)

# --- LAUNCH ---
if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860, share=True, enable_queue=True)
