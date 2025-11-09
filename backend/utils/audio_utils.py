import os
from gtts import gTTS
import tempfile
import speech_recognition as sr

def generate_tts(text: str):
    """Generate speech for given text and save as MP3"""
    os.makedirs("tts", exist_ok=True)
    safe_name = "_".join(text.strip().split())
    output_path = f"tts/{safe_name}.mp3"
    tts = gTTS(text)
    tts.save(output_path)
    return output_path

def speech_to_text(file):
    """Speech-to-text using SpeechRecognition (optional backend STT)"""
    recognizer = sr.Recognizer()
    with sr.AudioFile(file.file) as source:
        audio_data = recognizer.record(source)
        text = recognizer.recognize_google(audio_data)
    return text
