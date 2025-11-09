# 🧏‍♀️ Sign ↔ Speech ↔ Text Translator

An interactive web-based translator that bridges **sign language, speech, and text communication**.  
Built using **Google Teachable Machine**, **React**, and **FastAPI**, it enables:
- Real-time **Sign → Speech** translation using a custom Teachable Machine pose model.
- Real-time **Speech → Sign** visualization using **Gemini AI** and animated **ASL GIFs**.
- Grammar correction and speech synthesis for enhanced communication.

---

## 🚀 Features

### 🖐️ Sign → Speech
- Uses a **Teachable Machine pose model** for live sign recognition.
- Converts recognized signs into English text.
- Uses **Gemini API** to correct grammar and punctuation.
- Uses browser **Text-to-Speech (TTS)** for voice output.

### 🎤 Speech → Sign
- Converts live microphone speech to text using **Web Speech API**.
- Uses **Gemini AI** (`gemini-2.0-flash`) to map spoken English to **ASL glosses**.
- Displays matching **animated GIFs** for each ASL word from `/asl_gifs`.

### 🔊 Backend (FastAPI)
- Provides REST + WebSocket endpoints for text processing, sign detection, and TTS.
- Integrates external modules for:
  - **Gemini text interpretation**
  - **Sign prediction**
  - **Text-to-speech generation**
- Supports real-time sign detection over WebSocket.

---

## ⚠️ Current Limitation

> **Note:**  
> The trained Teachable Machine model currently struggles to **generalize and predict signs accurately in real time**.  
> This may be due to:
> - Limited or imbalanced training data  
> - Poor lighting or inconsistent background conditions  
> - Internal model or camera input errors  
>
> As a result, live predictions may fluctuate or fail to detect certain signs.  
> Further dataset expansion, model retraining, and pose calibration are recommended for improved accuracy.

---

## 🧩 Project Structure
```bash
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── SignToSpeech.jsx # Handles live webcam + Teachable Machine model
│ │ │ ├── SpeechToSign.jsx # Speech-to-ASL translation via Gemini API
│ │ │ ├── ASLGifDisplay.jsx # Displays animated sign GIFs
│ │ ├── public/
│ │ │ └── my_models/ # Trained Teachable Machine model files
│ │ │ ├── model.json
│ │ │ ├── metadata.json
│ │ │ ├── weights.bin
│ │ └── asl_gifs/ # Folder with ASL animations
│ └── .env # Contains API keys
│
├── backend/
│ ├── app.py # FastAPI backend
│ ├── utils/
│ │ ├── audio_utils.py # For TTS synthesis
│ │ ├── gemini_utils.py # For Gemini-based text interpretation
│ │ └── ml_utils.py # For sign prediction
│ ├── mapping.json # Maps sign text → GIF filename
│ ├── uploads/ # Temporary uploads
│ └── requirements.txt
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/sign-speech-translator.git
cd sign-speech-translator
```

### 2. Setup Environment Variables
Create a .env file in your frontend directory:
```bash
VITE_GEMINI_KEY=your_gemini_api_key
```

---

## 🖥️ Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Place Your Model
```bash
public/my_models/

It should Contain:
model.json
metadata.json
weights.bin

```

### 3. Run the Frontend
```bash
npm run dev
```
The app will start on http://localhost:5173 (or similar).

---

## ⚡ Backend Setup

### 1. Create Virtual Environment
```bash
cd backend
python -m venv venv
source venv/bin/activate   # (or venv\Scripts\activate on Windows)
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run FastAPI Server
```bash
uvicorn app:app --reload
```
The backend will start on http://localhost:8000.

---

## 🔌 Connecting Frontend & Backend
- The frontend communicates with the backend through /process_text (REST) and /ws/sign_detect (WebSocket).
- CORS is enabled for all origins in app.py, so no manual configuration is needed during local development.

---

## 🧠 Model & AI Usage
### Teachable Machine
- Trained model must detect body poses or hand signs.
- Exported as a pose model with model.json, metadata.json, and weights.bin.

### Gemini API
Used in two parts:
1. **Grammar correction** (SignToSpeech.jsx)
2. **Speech-to-sign translation** (SpeechToSign.jsx)
Model: gemini-2.0-flash

---

## 🧪 Example Flow

### 1️⃣ Sign → Speech
- User performs sign in front of webcam.
- Model predicts the sign and appends it to a sentence.
- Gemini corrects grammar.
- Text is spoken aloud using Web Speech API.

### 2️⃣ Speech → Sign
- User speaks into the mic.
- SpeechRecognition captures text.
- Gemini maps words to available ASL glosses.
- Animated ASL GIFs display sequentially.

---

## 📦 API Endpoints (Backend)
| Method | Endpoint          | Description                            |
| ------ | ----------------- | -------------------------------------- |
| `GET`  | `/`               | Health check                           |
| `POST` | `/process_text`   | Convert text → sign asset + TTS        |
| `POST` | `/sign_detect`    | Detect sign from uploaded video        |
| `WS`   | `/ws/sign_detect` | Real-time webcam-based sign prediction |

---

## 🧰 Technologies Used
### Frontend:
- React + Vite
- Google Teachable Machine
- Framer Motion
- Web Speech API
- Gemini AI (@google/genai)

### Backend:
- FastAPI
- OpenAI / Gemini for text processing
- OpenCV + NumPy
- WebSockets

---

## 🔮 Future Work

To make this system production-ready and enhance real-time sign recognition, the following improvements are planned:

1. **Dataset Enhancement**
   - Collect a larger, more diverse dataset covering different users, backgrounds, and lighting conditions.
   - Include dynamic and compound signs to improve model coverage.

2. **Model Optimization**
   - Retrain using TensorFlow.js or MediaPipe for faster inference.
   - Experiment with **transfer learning** using pretrained pose estimation models.
   - Implement **smoothing filters** or **temporal averaging** to stabilize predictions.

3. **Performance Improvements**
   - Use **Web Workers** or GPU acceleration for real-time video processing.
   - Add confidence-based filtering to reduce false detections.

4. **Enhanced User Interaction**
   - Add a real-time **sign confidence graph** and detection logs.
   - Include multilingual text-to-speech options for inclusivity.

5. **Accessibility & Deployment**
   - Host the app on a public platform (e.g., Render, Vercel, or Hugging Face Spaces).
   - Add offline mode for local usage with preloaded models.

---

### Contributors
1. **Neeraj Gupta**
2. **Samarth Chugh**
3. **Ayush Kumar Jha**

---

## 🙌 Acknowledgements
- [Google Teachable Machine](https://teachablemachine.withgoogle.com/)
- [Google Gemini](https://aistudio.google.com/)
- [React Speech Recognition](https://www.npmjs.com/package/react-speech-recognition)
- [FastAPI](https://fastapi.tiangolo.com/)
