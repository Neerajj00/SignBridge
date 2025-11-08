# Usage: python data_recorder.py
# Press 'r' to start recording one sequence for the current action.
# Press 'n' to move to next action.
# Press 'q' to quit.

import cv2
import os
import numpy as np
from mediapipe_utils import extract_keypoints, NUM_FEATURES

ACTIONS = ['hello', 'thanks', 'iloveyou', 'help', 'yes', 'no', 
           'please', 'sorry', 'goodbye', 'congratulations', 'welcome', 
           'stop', 'come', 'go', 'wait', 'eat', 'drink', 'sleep', 'work', 'play']