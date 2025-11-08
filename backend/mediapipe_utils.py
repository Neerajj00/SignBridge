# Helper utilities to extract landmarks using MediaPipe Holistic

import mediapipe as mp
import numpy as np

mp_holistic=mp.solutions.holistic

# We'll extract pose (33), left hand (21), right hand (21) landmarks
# For each landmark we take x,y,z -> total features = (33+21+21)*3 = 75*3 = 225
# If you include face, the features grow; to keep it light we keep these three groups.

POSE_N = 33
HAND_N = 21
NUM_FEATURES = (POSE_N + HAND_N + HAND_N) * 3  # x,y,z for each landmark

holistic=mp.holistic.Holistic(static_image_mode=False,
                              model_complexity=1,
                              enable_segmentation=False,
                              refine_face_landmarks=False)

def extract_keypoints(image):
    """Given an RGB image frame (numpy), return a flattened array of landmarks or None."""
    results = holistic.process(image)
    if results.pose_landmarks is None and results.left_hand_landmarks is None and results.right_hand_landmarks is None:
        return None
    features=[]
    
    # Pose
    if results.pose_landmarks:
        for lm in results.pose_landmarks.landmark:
            features.extend([lm.x, lm.y, lm.z])
        else:
            features.extend([0.0] * POSE_N * 3)
    # Left Hand
    if results.left_hand_landmarks:
        for lm in results.left_hand_landmarks.landmark:
            features.extend([lm.x, lm.y, lm.z])
    else:
        features.extend([0.0] * HAND_N * 3)
    # Right Hand
    if results.right_hand_landmarks:
        for lm in results.right_hand_landmarks.landmark:
            features.extend([lm.x, lm.y, lm.z])
    else:
        features.extend([0.0] * HAND_N * 3)
    arr = np.array(features, dtype=np.float32)
    if arr.shape[0] != NUM_FEATURES:
        # safety pad/truncate
        arr = np.resize(arr, (NUM_FEATURES,))
    return arr