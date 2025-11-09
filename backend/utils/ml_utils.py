# utils/ml_utils.py
import mediapipe as mp
import cv2
import numpy as np
import tensorflow as tf
import tempfile
import json
import os

SEQ_LENGTH = 30
MODEL_PATH = "model_best.keras"
MAPPING_PATH = "server/mapping.json"

# Load trained LSTM model
model = tf.keras.models.load_model(MODEL_PATH)

# Load label mapping (index → sign label)
with open(MAPPING_PATH, "r") as f:
    mapping = json.load(f)
    
# Try to load label_encoder if available, otherwise load mapping.json
label_encoder = None
mapping = None
if os.path.exists("label_encoder.pkl"):
    import pickle
    with open("label_encoder.pkl", "rb") as f:
        label_encoder = pickle.load(f)
    print("Loaded label_encoder.pkl")
elif os.path.exists(MAPPING_PATH):
    with open(MAPPING_PATH, "r", encoding="utf-8") as f:
        mapping = json.load(f)
    print("Loaded mapping.json with", len(mapping), "classes")
else:
    raise FileNotFoundError("Neither models/label_encoder.pkl nor mapping.json found. Run prepare_dataset.py")

mp_hands = mp.solutions.hands
NUM_FEATURES = 21 * 3  # x, y, z for each of 21 hand landmarks

def extract_keypoints_from_video(file_path):
    """Extracts MediaPipe keypoints sequence from uploaded video"""
    cap = cv2.VideoCapture(file_path)
    sequence = []
    with mp_hands.Hands(static_image_mode=False, max_num_hands=1) as hands:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = hands.process(frame_rgb)
            if result.multi_hand_landmarks:
                for hand_landmarks in result.multi_hand_landmarks:
                    keypoints = np.array([[lm.x, lm.y, lm.z] for lm in hand_landmarks.landmark]).flatten()
                    sequence.append(keypoints)
            else:
                sequence.append(np.zeros(21*3))
    cap.release()
    return np.array(sequence)

def predict_sign(file):
    """Predict sign gesture from uploaded video"""
    try:
        # write bytes or file to temp
        if isinstance(file_or_bytes, (bytes, bytearray)):
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
                tmp.write(file_or_bytes)
                tmp_path = tmp.name
        else:
            # assume UploadFile-like
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
                tmp.write(file_or_bytes.file.read())
                tmp_path = tmp.name

        seq = extract_keypoints_from_video(tmp_path)
        os.remove(tmp_path)

        if seq.size == 0:
            return "no_hand_detected", None

        # ensure SEQ_LENGTH
        if seq.shape[0] > SEQ_LENGTH:
            seq = seq[-SEQ_LENGTH:]
        elif seq.shape[0] < SEQ_LENGTH:
            pad = np.zeros((SEQ_LENGTH - seq.shape[0], seq.shape[1]))
            seq = np.vstack([seq, pad])

        X = np.expand_dims(seq, axis=0)
        preds = model.predict(X, verbose=0)[0]
        idx = int(np.argmax(preds))
        confidence = float(preds[idx])

        # decode label
        if label_encoder is not None:
            label = label_encoder.inverse_transform([idx])[0]
        else:
            # mapping.json maps index->label (ensure keys are strings in file)
            label = mapping.get(str(idx), "unknown_sign")

        return label, confidence

    except Exception as e:
        print("Prediction error:", e)
        return "no_hand_detected", None