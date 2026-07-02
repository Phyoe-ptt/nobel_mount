from google import genai
from google.genai import types
import os, base64

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)

try:
    response = client.models.generate_images(
        model="imagen-4.0-generate-001",
        prompt="A beautiful professional photo of students studying in a modern college classroom, bright lighting, 4k quality.",
        config=types.GenerateImagesConfig(
            number_of_images=1,
            aspect_ratio="16:9",
        )
    )
    if response.generated_images:
        image_bytes = response.generated_images[0].image.image_bytes
        b64 = base64.b64encode(image_bytes).decode("utf-8")
        print("SUCCESS! Base64 length:", len(b64))
    else:
        print("No images returned")
except Exception as e:
    print("Error:", type(e).__name__, str(e))
