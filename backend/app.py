from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field
import time
import asyncio
from typing import Optional
import json
import os
import tempfile
import logging
from pathlib import Path
import base64
import numpy as np
import cv2

# Import your ML utilities
from utils.audio_utils import generate_tts
from utils.gemini_utils import interpret_text
from utils.ml_utils import predict_sign

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="Sign ↔ Voice ↔ Visual Translator",
    description="Multi-modal translation system for sign language",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
BASE_DIR = Path(__file__).resolve().parent
MAPPING_FILE = BASE_DIR / "mapping.json"
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed file types
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".webm"}
ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".ogg", ".webm", ".m4a"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

# Load sign mapping
try:
    with open(MAPPING_FILE, "r", encoding="utf-8") as f:
        mapping = json.load(f)
    logger.info(f"Loaded {len(mapping)} sign mappings")
except FileNotFoundError:
    logger.error(f"Mapping file not found: {MAPPING_FILE}")
    mapping = {"default": "unknown_sign.gif"}

# --------------- MODELS ---------------

class TextRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=500, description="Input text to translate")

class TextResponse(BaseModel):
    input_text: str
    interpreted_text: str
    sign_asset: str
    audio_path: Optional[str] = None

class SignDetectResponse(BaseModel):
    predicted_sign: str
    confidence: Optional[float] = None
    audio_path: Optional[str] = None

# --------------- ROUTES ---------------

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "online", "message": "Real-time Sign Translator Ready"}

@app.post("/process_text", response_model=TextResponse)
async def process_text(req: TextRequest):
    """Voice → Sign: Interpret text and generate TTS + Sign visual"""
    try:
        user_text = req.text.lower()
        interpreted_text = interpret_text(user_text)
        sign_asset = mapping.get(interpreted_text, mapping.get("default"))
        audio_path = generate_tts(interpreted_text)
        return {
        "input_text": user_text,
        "interpreted_text": interpreted_text,
        "sign_asset": sign_asset,
        "audio_path": audio_path,
        }
    except Exception as e:
        logger.error(f"Error in process_text: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Keep old file-based route for reference
@app.post("/sign_detect", response_model=SignDetectResponse)
async def sign_detect(file: UploadFile = File(...)):
    """Single video prediction"""
    result_text, confidence = predict_sign(file)
    audio_path = generate_tts(result_text)
    return {
        "predicted_sign": result_text,
        "confidence": confidence,
        "audio_path": audio_path
    }

# --------------- REALTIME WEBSOCKET ROUTE ---------------

@app.websocket("/ws/sign_detect")
async def websocket_sign_detect(websocket: WebSocket):
    """
    Real-time Sign Detection via WebSocket.
    Frontend sends base64 frames from webcam.
    Backend returns live predictions.
    """
    await websocket.accept()
    logger.info("✅ WebSocket connection established")
    sign_sequence = []
    last_detection_time = time.time()
    try:
        while True:
            try:
                # Receive chunk of video bytes
                data = await websocket.receive_bytes()
                predicted_sign, confidence = predict_sign(data)
                current_time = time.time()
                
                if predicted_sign != "no_hand_detected":
                    sign_sequence.append(predicted_sign)
                    last_detection_time = current_time
                    
                    # send intermediate prediction
                    await websocket.send_json({
                        "current_sign": predicted_sign,
                        "confidence": confidence
                    })
                    
                # If pause detected -> form full sentence
                if current_time - last_detection_time > 2 and len(sign_sequence) > 0:
                    raw_sentence = " ".join(sign_sequence)
                    sign_sequence = []  # reset for next sentence
                    
                    # gemini refinement
                    clean_senetence = interpret_text(raw_sentence)
                    
                    # generate TTS
                    audio_path = generate_tts(clean_senetence)
                    
                    await websocket.send_json({
                        "final_sentence": clean_sentence,
                        "audio_path": audio_path
                    })
                await asyncio.sleep(0.1)  # slight delay to yield control
            except Exception as e:
                logger.error(f"WebSocket processing error: {e}")
                print("Websocket closed:",e)
                break
            


    except WebSocketDisconnect:
        logger.info("❌ WebSocket connection closed")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        await websocket.close()

# --------------- SERVER STARTUP ---------------

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Real-time Sign Translator starting up...")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("👋 Shutting down server...")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
