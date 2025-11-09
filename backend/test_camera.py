import cv2
import numpy as np
from tensorflow.keras.models import load_model
import mediapipe as mp
import json

# --- Load model and mapping ---
model = load_model("model_best.keras")
with open("server/mapping.json", "r") as f:
    mapping = json.load(f)

SEQ_LENGTH = model.input_shape[1]  # 30
NUM_FEATURES = model.input_shape[2]  # 1662

mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils

# --- Your fixed extract_keypoints() function ---
def extract_keypoints(results):
   # Pose (33 landmarks, each has x, y, z, visibility)
    pose = np.array([[res.x, res.y, res.z, res.visibility] 
                     for res in results.pose_landmarks.landmark]) if results.pose_landmarks else np.zeros((33, 4))
    
    # Face (468 landmarks, each has x, y, z)
    face = np.array([[res.x, res.y, res.z] 
                     for res in results.face_landmarks.landmark]) if results.face_landmarks else np.zeros((468, 3))
    
    # Left hand (21 landmarks, each has x, y, z)
    lh = np.array([[res.x, res.y, res.z] 
                   for res in results.left_hand_landmarks.landmark]) if results.left_hand_landmarks else np.zeros((21, 3))
    
    # Right hand (21 landmarks, each has x, y, z)
    rh = np.array([[res.x, res.y, res.z] 
                   for res in results.right_hand_landmarks.landmark]) if results.right_hand_landmarks else np.zeros((21, 3))

    # Flatten and concatenate
    feature_vector = np.concatenate([
        pose.flatten(), 
        face.flatten(), 
        lh.flatten(), 
        rh.flatten()
    ])
    
    print("Feature vector length:", feature_vector.shape[0])  # Debug
    return feature_vector


# --- Start Camera ---
cap = cv2.VideoCapture(0)
sequence = []

with mp_holistic.Holistic(
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
) as holistic:
    print("[INFO] Starting camera... Press 'q' to quit.")
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = holistic.process(image)
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        # Draw landmarks
        mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_holistic.POSE_CONNECTIONS)
        mp_drawing.draw_landmarks(image, results.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS)
        mp_drawing.draw_landmarks(image, results.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS)

        # Extract keypoints
        keypoints = extract_keypoints(results)
        print("Feature vector length:", keypoints.shape[0])
        sequence.append(keypoints)
        sequence = sequence[-SEQ_LENGTH:]  # keep only last 30 frames

        # When we have 30 frames -> predict
        if len(sequence) == SEQ_LENGTH:
            X = np.expand_dims(sequence, axis=0)  # (1, 30, 1662)
            preds = model.predict(X, verbose=0)[0]
            label = np.argmax(preds)
            confidence = np.max(preds)

            # Display
            text = f"{mapping[str(label)]} ({confidence:.2f})"
            cv2.putText(image, text, (10, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

        cv2.imshow('SignBridge - Live', image)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

cap.release()
cv2.destroyAllWindows()
