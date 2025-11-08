# Helper utilities to extract landmarks using MediaPipe Holistic

# We'll extract pose (33), left hand (21), right hand (21) landmarks
# For each landmark we take x,y,z -> total features = (33+21+21)*3 = 75*3 = 225
# If you include face, the features grow; to keep it light we keep these three groups.

import mediapipe as mp
import numpy as np
import cv2

# Correct import for new MediaPipe versions (>=0.10.x)
mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils

# holistic = mp_holistic.Holistic(
#     static_image_mode=False,
#     model_complexity=1,
#     smooth_landmarks=True,
#     enable_segmentation=False,
#     refine_face_landmarks=True
# )

NUM_FEATURES = (33*4) + (21*3*2) + (468*3)  # pose + both hands + face

def extract_keypoints(results):
    """Extract and flatten all landmarks into a feature vector"""
    pose = np.array([[res.x, res.y, res.z, res.visibility] 
                     for res in results.pose_landmarks.landmark]).flatten() \
           if results.pose_landmarks else np.zeros(33*4)
    
    face = np.array([[res.x, res.y, res.z] 
                     for res in results.face_landmarks.landmark]).flatten() \
           if results.face_landmarks else np.zeros(468*3)
    
    left_hand = np.array([[res.x, res.y, res.z] 
                          for res in results.left_hand_landmarks.landmark]).flatten() \
                if results.left_hand_landmarks else np.zeros(21*3)
    
    right_hand = np.array([[res.x, res.y, res.z] 
                           for res in results.right_hand_landmarks.landmark]).flatten() \
                 if results.right_hand_landmarks else np.zeros(21*3)
    
    return np.concatenate([pose, face, left_hand, right_hand])

def mediapipe_process_frame(image, holistic):
    """Process frame through MediaPipe Holistic"""
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image_rgb.flags.writeable = False
    results = holistic.process(image_rgb)
    image_rgb.flags.writeable = True
    return results

def draw_landmarks(image, results):
    """Draw landmarks on image for visualization"""
    if results.pose_landmarks:
        mp_drawing.draw_landmarks(
            image, results.pose_landmarks, mp_holistic.POSE_CONNECTIONS)
    if results.left_hand_landmarks:
        mp_drawing.draw_landmarks(
            image, results.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS)
    if results.right_hand_landmarks:
        mp_drawing.draw_landmarks(
            image, results.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS)

def check_landmarks_present(results):
    """Check if key landmarks are detected"""
    return (results.pose_landmarks is not None and 
            (results.left_hand_landmarks is not None or 
             results.right_hand_landmarks is not None))

