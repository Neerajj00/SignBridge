import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping

# hyperparams
NUM_FEATURES = None  # will be inferred
BATCH_SIZE = 32
EPOCHS = 60

# load
X_train = np.load('X_train.npy')
X_val = np.load('X_val.npy')
y_train = np.load('y_train.npy')
y_val = np.load('y_val.npy')

SEQ_LENGTH = X_train.shape[1]
NUM_FEATURES = X_train.shape[2]
NUM_CLASSES = y_train.shape[1]

# Normalize data (feature scaling)

print("[INFO] Normalizing features...")
mean = X_train.mean(axis=0)
std = X_train.std(axis=0) + 1e-8
X_train = (X_train - mean) / std
X_val = (X_val - mean) / std

print('X_train shape', X_train.shape)

# Build improved LSTM model
# =============================================================================
print("[INFO] Building improved LSTM model...")
model = Sequential([
    LSTM(128, return_sequences=True, input_shape=(SEQ_LENGTH, NUM_FEATURES)),
    Dropout(0.3),
    BatchNormalization(),

    LSTM(64, return_sequences=False),
    Dropout(0.3),
    BatchNormalization(),

    Dense(64, activation='relu'),
    Dropout(0.3),

    Dense(NUM_CLASSES, activation='softmax')
])

opt = Adam(learning_rate=0.0005)
model.compile(optimizer=opt, loss='categorical_crossentropy', metrics=['accuracy'])
model.summary()

# Training callbacks
# =============================================================================
es = EarlyStopping(monitor='val_accuracy', patience=10, restore_best_weights=True)
mc = ModelCheckpoint('model_best.keras', monitor='val_accuracy', save_best_only=True)

print("[INFO] Starting training...")
history = model.fit(
    X_train, y_train,
    validation_data=(X_val, y_val),
    epochs=100,
    batch_size=16,
    callbacks=[es, mc],
    verbose=1
)

# checkpoint = ModelCheckpoint('model_lstm.h5', monitor='val_accuracy', save_best_only=True, verbose=1)
# early = EarlyStopping(monitor='val_accuracy', patience=8, restore_best_weights=True, verbose=1)

# model.fit(X_train, y_train, validation_data=(X_val,y_val), batch_size=BATCH_SIZE, epochs=EPOCHS, callbacks=[checkpoint, early])

# evaluation
loss, acc = model.evaluate(X_val, y_val, verbose=0)
print('Validation loss', loss, 'acc', acc)