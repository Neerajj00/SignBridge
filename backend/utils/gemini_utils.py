import google.generativeai as genai
from dotenv import load_dotenv
load_dotenv()
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY") )

def interpret_text(text: str) -> str:
    """Use Gemini to clean and interpret detected sign phrases"""
    model = genai.GenerativeModel("gemini-pro")
    prompt = f"Convert this raw sign sequence into a natural English sentence: '{text}'. Keep it short and meaningful."
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print("Gemini error:", e)
        return text
