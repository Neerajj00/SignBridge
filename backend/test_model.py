import numpy as np
from tensorflow.keras.models import load_model
import json

# --- Load the model ---
model = load_model("model_best.keras")

# --- Load mapping ---
with open("server/mapping.json", "r") as f:
    mapping = json.load(f)

# --- Print model input shape ---
print("Model input shape:", model.input_shape)

# --- Suppose you extracted one sequence of features (e.g. from MediaPipe) ---
# You must make sure it matches NUM_FEATURES (e.g. 1662)
# Example: pose(33*3) + left_hand(21*3) + right_hand(21*3) = 75*3 = 225
# But your training probably used flattened sequences of frames (maybe 30 frames * 1662 features)

# So your input should be shaped as (1, SEQ_LENGTH, NUM_FEATURES)
SEQ_LENGTH = model.input_shape[1]
NUM_FEATURES = model.input_shape[2]

# Dummy test example (to check working)
X = np.random.rand(1, SEQ_LENGTH, NUM_FEATURES).astype(np.float32)

# --- Predict ---
preds = model.predict(X, verbose=0)[0]
label = np.argmax(preds)
confidence = np.max(preds)

print(f"Predicted Sign: {mapping[str(label)]} (confidence: {confidence:.2f})")
