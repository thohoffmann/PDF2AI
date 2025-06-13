"""
PDF text extraction and summarization using Ollama/Gemma3.
"""

import PyPDF2
import requests
import os
from typing import Optional

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from a PDF file."""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")

def call_gemma3(prompt: str) -> str:
    """Call Gemma3 model through Ollama API."""
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "gemma3",
                "prompt": prompt,
                "stream": False
            }
        )
        response.raise_for_status()
        return response.json()["response"]
    except Exception as e:
        raise Exception(f"Error calling Gemma3: {str(e)}")

def summarize_text(text: str) -> str:
    """AI summarization using Ollama/Gemma3."""
    prompt = f"Summarize the following text concisely and clearly:\n\n{text}"
    return call_gemma3(prompt) 