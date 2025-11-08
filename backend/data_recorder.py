# Usage: python data_recorder.py
# Press 'r' to start recording one sequence for the current action.
# Press 'n' to move to next action.
# Press 'q' to quit.

import cv2
import os
import numpy as np
from mediapipe_utils import extract_keypoints, mediapipe_process_frame, NUM_FEATURES, check_landmarks_present, draw_landmarks, mp_holistic, mp_drawing
import mediapipe as mp
import time

# Define actions
ACTIONS = [
    'hello', 'goodbye', 'welcome', 'thanks', 'sorry', 'please', 'congratulations',
    'iloveyou', 'happy', 'sad', 'angry', 'surprised', 'tired', 'excited',
    'help', 'yes', 'no', 'maybe', 'stop', 'wait',
    'eat', 'drink', 'sleep', 'work', 'play', 'come', 'go', 'sit', 'stand',
    'morning', 'night', 'today', 'tomorrow', 'now', 'later',
    'good', 'bad', 'friend', 'family', 'love', 'thankyou'
]

SEQ_LENGTH = 30           # number of frames per sequence
RECORDS_PER_ACTION = 30   # number of sequences per action
DATA_DIR = 'dataset'
COUNTDOWN_SECONDS = 10
FRAME_DELAY_MS = 100      # milliseconds between frames

# Make dataset directories
os.makedirs(DATA_DIR, exist_ok=True)
for action in ACTIONS:
    os.makedirs(os.path.join(DATA_DIR, action), exist_ok=True)

def display_text(frame, text, y_offset=40, color=(0, 255, 0), size=1):
    """Helper to display text on frame"""
    cv2.putText(frame, text, (10, y_offset), 
                cv2.FONT_HERSHEY_SIMPLEX, size, color, 2, cv2.LINE_AA)

def record_sequence(cap, holistic, action, label_dir):
    """Record one sequence with countdown"""
    
    # Countdown
    for i in range(COUNTDOWN_SECONDS, 0, -1):
        start = time.time()
        while time.time() - start < 1.0:
            ret, frame = cap.read()
            if not ret:
                continue
            
            frame = cv2.flip(frame, 1)  # Mirror for intuitive recording
            results = mediapipe_process_frame(frame, holistic)
            draw_landmarks(frame, results)
            
            display_text(frame, f'GET READY: {i}', 40, (0, 165, 255), 1.5)
            display_text(frame, f'Action: {action.upper()}', 100, (255, 255, 255), 1)
            
            cv2.imshow('Sign Language Recorder', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                return None
    
    # Record sequence
    print(f"🎥 Recording '{action}'...")
    frames = []
    last_capture_time = time.time()
    
    while len(frames) < SEQ_LENGTH:
        ret, frame = cap.read()
        if not ret:
            continue
        
        frame = cv2.flip(frame, 1)
        results = mediapipe_process_frame(frame, holistic)
        # Check if enough time has passed since last capture
        current_time = time.time()
        time_since_capture = (current_time - last_capture_time) * 1000  # Convert to ms
        should_capture = time_since_capture >= FRAME_DELAY_MS
        
        # Check if landmarks detected
        if not check_landmarks_present(results):
            display_text(frame, '⚠ NO HANDS/POSE DETECTED', 40, (0, 0, 255), 1)
        else:
            keypoints = extract_keypoints(results)
            frames.append(keypoints)
            
            # Visual feedback
            draw_landmarks(frame, results)
            progress = len(frames)
            display_text(frame, f'RECORDING: {progress}/{SEQ_LENGTH}', 40, (0, 255, 0), 1.2)
            display_text(frame, f'Action: {action.upper()}', 90, (255, 255, 255), 0.8)
            
            # Progress bar
            bar_width = int((progress / SEQ_LENGTH) * 600)
            cv2.rectangle(frame, (10, 120), (610, 140), (50, 50, 50), -1)
            cv2.rectangle(frame, (10, 120), (10 + bar_width, 140), (0, 255, 0), -1)
        
        cv2.imshow('Sign Language Recorder', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            return None
    
    # Save sequence
    seq_idx = len(os.listdir(label_dir))
    np.save(os.path.join(label_dir, f'seq_{seq_idx}.npy'), np.array(frames))
    print(f"✅ Saved sequence {seq_idx} for '{action}' ({len(frames)} frames)")
    
    return seq_idx

def main():
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    if not cap.isOpened():
        print("❌ Error: Could not open webcam")
        return
    
    print("\n" + "="*60)
    print("SIGN LANGUAGE DATA RECORDER")
    print("="*60)
    print("Controls:")
    print("  'r' - Start recording (3s countdown)")
    print("  'n' - Next action")
    print("  'p' - Previous action")
    print("  'q' - Quit")
    print("="*60 + "\n")
    
    action_index = 0
    
    with mp_holistic.Holistic(
        static_image_mode=False,
        model_complexity=1,
        smooth_landmarks=True,
        enable_segmentation=False,
        refine_face_landmarks=False  # Set to False for better performance
    ) as holistic:
        
        while action_index < len(ACTIONS):
            action = ACTIONS[action_index]
            label_dir = os.path.join(DATA_DIR, action)
            saved_sequences = len(os.listdir(label_dir))
            
            # Live preview mode
            ret, frame = cap.read()
            if ret:
                frame = cv2.flip(frame, 1)
                results = mediapipe_process_frame(frame, holistic)
                draw_landmarks(frame, results)
                
                # Display info
                display_text(frame, f"Action: {action.upper()} ({action_index+1}/{len(ACTIONS)})", 
                           30, (255, 255, 255), 0.9)
                display_text(frame, f"Sequences: {saved_sequences}/{RECORDS_PER_ACTION}", 
                           60, (0, 255, 255), 0.7)
                display_text(frame, "Press 'r' to record | 'n' next | 'p' prev | 'q' quit", 
                           frame.shape[0] - 20, (200, 200, 200), 0.6)
                
                cv2.imshow('Sign Language Recorder', frame)
            
            key = cv2.waitKey(30) & 0xFF
            
            if key == ord('q'):
                break
            elif key == ord('n'):
                action_index = min(action_index + 1, len(ACTIONS) - 1)
            elif key == ord('p'):
                action_index = max(action_index - 1, 0)
            elif key == ord('r'):
                result = record_sequence(cap, holistic, action, label_dir)
                if result is None:  # User quit during recording
                    break
                if saved_sequences + 1 >= RECORDS_PER_ACTION:
                    print(f"✨ Completed all sequences for '{action}'!")
                    action_index += 1
    
    cap.release()
    cv2.destroyAllWindows()
    print("\n✅ Recording session complete!")
    print(f"📁 Dataset saved to: {os.path.abspath(DATA_DIR)}")

if __name__ == "__main__":
    main()