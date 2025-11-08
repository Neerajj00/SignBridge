# This script loads the recorded .npy sequences and creates X.npy, y.npy for training
import numpy as np
import json
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.utils import to_categorical

DATA_DIR = "dataset"
SEQ_LENGTH = 10  # Number of frames per sequence
seq_lengths=[]
for action in os.listdir(DATA_DIR):
    action_dir = os.path.join(DATA_DIR, action)
    if not os.path.isdir(action_dir):
        continue
    for seq_file in os.listdir(action_dir):
        if seq_file.endswith('.npy'):
            seq_data = np.load(os.path.join(action_dir, seq_file))
            seq_lengths.append(seq_data.shape[0])

if seq_lengths:
    # choose median to avoid extremes
    SEQ_LENGTH = int(np.median(seq_lengths))
    print(f"[INFO] Auto-detected SEQ_LENGTH = {SEQ_LENGTH}")
else:
    SEQ_LENGTH = SEQ_LENGTH
    print(f"[WARNING] No sequences found — using default SEQ_LENGTH = {SEQ_LENGTH}")

# step 2
labels = []
X = []

actions = sorted(os.listdir(DATA_DIR))
for action in actions:
    action_dir = os.path.join(DATA_DIR, action)
    if not os.path.isdir(action_dir):
        continue
    for file in sorted(os.listdir(action_dir)):
        if not file.endswith('.npy'):
            continue
        seq = np.load(os.path.join(action_dir, file))  # shape: (frames, features)

        # pad or truncate to SEQ_LENGTH
        if seq.shape[0] != SEQ_LENGTH:
            if seq.shape[0] < SEQ_LENGTH:
                pad = np.zeros((SEQ_LENGTH - seq.shape[0], seq.shape[1]), dtype=np.float32)
                seq = np.vstack([seq, pad])
            else:
                seq = seq[:SEQ_LENGTH]

        X.append(seq)
        labels.append(action)

X = np.array(X)
labels = np.array(labels)

# step 3
le = LabelEncoder()
y = le.fit_transform(labels)

mapping = {int(i): str(c) for i, c in enumerate(le.classes_)}
os.makedirs('server', exist_ok=True)
with open('server/mapping.json', 'w') as f:
    json.dump(mapping, f)

# Step 4: Prepare one-hot encoded targets and split data
num_classes = len(le.classes_)
y_onehot = to_categorical(y, num_classes=num_classes)

X_train, X_val, y_train, y_val = train_test_split(
    X, y_onehot, test_size=0.15, random_state=42, stratify=y
)

#  Step 5: Save results
np.save('X_train.npy', X_train)
np.save('X_val.npy', X_val)
np.save('y_train.npy', y_train)
np.save('y_val.npy', y_val)

print(f'Saved arrays: X_train.npy, X_val.npy, y_train.npy, y_val.npy')
print(f'Number of classes: {num_classes}, SEQ_LENGTH used: {SEQ_LENGTH}')