import json
import os
import re
from typing import Any, Dict

try:
    import google.generativeai as genai

    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)

except ImportError:
    genai = None
    GEMINI_API_KEY = ""


def call_gemini_json(prompt: str, fallback: Dict[str, Any]) -> Dict[str, Any]:
    if genai is None or not GEMINI_API_KEY:
        return fallback

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")

        response = model.generate_content(
            prompt,
            generation_config={
                "response_mime_type": "application/json",
                "temperature": 0.3,
            },
        )

        text = response.text.strip()
        text = re.sub(r"^```json|```$", "", text).strip()

        return json.loads(text)

retrieved_chunks = retrieve_top_chunks(...)


def call_gemini_text(prompt: str, fallback: str) -> str:
    if genai is None or not GEMINI_API_KEY:
        return fallback

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")

        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.3,
            },
        )

        return response.text.strip()

    except Exception:
        return fallback