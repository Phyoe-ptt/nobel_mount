from fastapi import FastAPI, Request, HTTPException, UploadFile, File, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
import os
import requests
import base64
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

app = FastAPI(title="AI API Backend", description="FastAPI service for Video Generation and RAG")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

load_dotenv(override=True)

# Serve avatars folder statically so D-ID can download the generated avatar images
os.makedirs("avatars", exist_ok=True)
app.mount("/avatars", StaticFiles(directory="avatars"), name="avatars")

import asyncio
from datetime import datetime
import pytz

# Serve uploads folder for manually uploaded images
os.makedirs("uploads", exist_ok=True)
app.mount("/rag/uploads", StaticFiles(directory="uploads"), name="uploads")

# Facebook Tokens (Fallback)
FB_VERIFY_TOKEN = os.getenv("FB_VERIFY_TOKEN", "nobel_mount_secret_token")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Background Autopilot Loop
last_run_minute = None

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(autopilot_loop())

async def autopilot_loop():
    global last_run_minute
    tz = pytz.timezone('Asia/Bangkok') # +07:00 timezone
    while True:
        try:
            # Check every minute using timezone-aware time
            now = datetime.now(tz)
            current_minute = now.strftime("%Y-%m-%d %H:%M")
            current_time_str = now.strftime("%I:%M %p").lstrip("0") # e.g. "3:32 AM"
            current_time_str_padded = now.strftime("%I:%M %p")      # e.g. "03:32 AM"
            
            if last_run_minute != current_minute:
                last_run_minute = current_minute # Update immediately to prevent spamming
                
                # Fetch config from Java backend
                resp = requests.get("http://backend:8080/api/autopilot", timeout=5)
                if resp.ok:
                    config = resp.json()
                    if config.get("dailyPostingEnabled"):
                        times_str = config.get("scheduleTimes", "")
                        times = [t.strip().upper() for t in times_str.split(",")]
                        
                        if current_time_str in times or current_time_str_padded in times:
                            print(f"[AutoPilot] Triggering scheduled post for {current_time_str}")
                            # Run generation in background
                            asyncio.create_task(run_autopilot_generation(config))
        except Exception as e:
            print(f"[AutoPilot] Background loop error: {e}")
        
        await asyncio.sleep(20)

async def run_autopilot_generation(config: dict):
    try:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        keywords = config.get("pageProfileText", "Nobel Mount College updates")
        
        # 1. Generate text
        prompt = f"""You are an expert social media content writer for Nobel Mount College.
Task: Write 1 LONG and DETAILED Facebook post about: "{keywords}".
Requirements:
- Written in Burmese (မြန်မာဘာသာ)
- Engaging, professional, around 10 sentences
- Use emojis generously"""
        
        response = client.models.generate_content(
            model='gemini-3.1-flash-lite',
            contents=prompt
        )
        post_text = response.text.strip()
        
        # 2. Generate Image
        img_url = ""
        try:
            img_prompt = f"Professional marketing banner, {keywords}, high quality, beautiful photography"
            img_response = client.models.generate_images(
                model="imagen-3.0-generate-001",
                prompt=img_prompt,
                config=types.GenerateImagesConfig(number_of_images=1, aspect_ratio="16:9")
            )
            if img_response.generated_images:
                image_bytes = img_response.generated_images[0].image.image_bytes
                import base64
                b64 = base64.b64encode(image_bytes).decode("utf-8")
                img_url = f"data:image/jpeg;base64,{b64}"
        except Exception as img_err:
            print(f"[AutoPilot] Imagen failed, using Unsplash fallback: {img_err}")
            import random, urllib.parse
            query = "students college education classroom university learning"
            seed = random.randint(1, 9999)
            img_url = f"https://source.unsplash.com/featured/1024x576/?{urllib.parse.quote(query)}&sig={seed}"

            
        # 3. Publish or Save to Queue
        publish_mode = config.get("publishMode", "auto")
        if publish_mode == "draft":
            import requests
            resp = requests.post("http://backend:8080/api/social-posts", json={
                "content": post_text,
                "imageUrl": img_url,
                "status": "DRAFT"
            }, timeout=10)
            if not resp.ok:
                raise Exception(f"Failed to save to draft queue: {resp.text}")
            print("[AutoPilot] Post saved to draft queue.")
        else:
            # Publish to Facebook immediately (since it's already the scheduled time)
            publish_payload = {
                "message": post_text,
                "image_url": img_url,
                "scheduled_date": None
            }
            # Call our own endpoint function internally to avoid localhost deadlock
            publish_to_facebook(FacebookPublishPayload(**publish_payload))
            print("[AutoPilot] Post published to Facebook.")
            
    except Exception as e:
        error_str = str(e)
        print(f"[AutoPilot] Generation error: {error_str}")
        try:
            import requests
            requests.post("http://backend:8080/api/social-posts", json={
                "content": f"🚨 AUTOPILOT FAILED: {error_str}",
                "imageUrl": "",
                "status": "FAILED"
            }, timeout=3)
        except Exception as inner_e:
            print(f"Failed to log error to backend: {inner_e}")

def get_fb_publish_token():
    try:
        resp = requests.get("http://backend:8080/api/settings/facebook-tokens", timeout=3)
        if resp.ok:
            return resp.json().get("publishToken")
    except Exception:
        pass
    return os.getenv("FB_TEST_PAGE_TOKEN")

class MessagePayload(BaseModel):
    sender_id: str
    message: str

class DocumentPayload(BaseModel):
    content: str

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI API Backend"}

@app.get("/webhook")
def verify_webhook(request: Request):
    """Facebook Webhook Verification"""
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    if mode and token:
        if mode == "subscribe" and token == FB_VERIFY_TOKEN:
            return int(challenge)
        else:
            raise HTTPException(status_code=403, detail="Verification token mismatch")
    raise HTTPException(status_code=400, detail="Bad Request")

def send_facebook_message(sender_id: str, message_text: str, conversation_id: str = None, account_id: str = None):
    """Sends a message back to the user via Zernio API"""
    api_key = os.getenv("ZERMIO_API_KEY")
    
    # Use provided account_id, or fallback to .env
    if not account_id:
        account_id = os.getenv("ZERMIO_ACCOUNT_ID")
    
    if not api_key or not account_id:
        print("Error: ZERMIO_API_KEY or ZERMIO_ACCOUNT_ID missing!")
        return
        
    if conversation_id:
        # Use the official Zernio inbox API endpoint
        url = f"https://zernio.com/api/v1/inbox/conversations/{conversation_id}/messages"
        payload = {
            "accountId": account_id,
            "message": message_text
        }
    else:
        # Fallback if no conversation ID is known
        url = f"https://zernio.com/api/v1/accounts/{account_id}/messages"
        payload = {
            "platform": "facebook",
            "recipientId": sender_id,
            "message": message_text
        }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(url, json=payload, headers=headers)
        
        # Log AI reply to DB FIRST
        try:
            requests.post("http://backend:8080/api/inbox", json={
                "senderId": "ITCollegetest",
                "recipientId": sender_id,
                "messageText": message_text,
                "fromAi": True,
                "requiresHuman": False,
                "resolved": False
            }, timeout=3)
        except Exception as e:
            print("Failed to log AI reply to DB:", e)
            
        # Check Zernio errors
        response.raise_for_status()
        print(f"Message sent successfully to {sender_id} via Zernio")
            
    except requests.exceptions.HTTPError as e:
        print(f"Error sending message via Zernio: {e}")
        print("Zernio API Response:", e.response.text)
    except Exception as e:
        print(f"Unexpected Error sending message: {e}")

def process_zernio_message(message_text: str, sender_id: str, sender_name: str, conversation_id: str, account_id: str):
    """Background task to process the message and reply"""
    try:
        # Call our Gemini logic
        reply_text = generate_rag_response(message_text)
        
        requires_human = False
        if "[HUMAN_NEEDED]" in reply_text:
            requires_human = True
            reply_text = "မင်္ဂလာပါခင်ဗျာ၊ ဒီမေးခွန်းအတွက် ကျွန်တော့်မှာ အချက်အလက် အပြည့်အစုံ မရှိသေးတဲ့အတွက် တာဝန်ရှိသူနဲ့ ခဏလောက် ချိတ်ဆက်ပေးပါမယ်ခင်ဗျာ။ ခဏလေး စောင့်ပေးပါနော်..."

        # Log incoming user message to DB
        try:
            requests.post("http://backend:8080/api/inbox", json={
                "senderId": sender_id,
                "senderName": sender_name,
                "recipientId": "ITCollegetest",
                "messageText": message_text,
                "fromAi": False,
                "requiresHuman": requires_human,
                "resolved": False
            }, timeout=3)
        except Exception as e:
            print("Failed to log user message to DB:", e)
        
        # Send the reply back to the user via Zernio
        send_facebook_message(sender_id, reply_text, conversation_id=conversation_id, account_id=account_id)
    except Exception as e:
        print(f"Error in background task: {e}")

@app.post("/webhook")
async def handle_webhook(request: Request, background_tasks: BackgroundTasks):
    """Handle incoming messages from ITCollegetest Facebook Page"""
    try:
        data = await request.json()
        try:
            import json
            print("Received Webhook Data:", json.dumps(data, indent=2))
        except Exception as e:
            print("Failed to print data:", e)
        
        # --- Zernio Webhook Support (Only listen to Zernio to prevent double replies) ---
        if data.get("event") == "message.received":
            message_obj = data.get("message", {})
            message_text = message_obj.get("text", "")
            sender_id = message_obj.get("sender", {}).get("id", "")
            sender_name = message_obj.get("sender", {}).get("name", "")
            direction = message_obj.get("direction", "")
            conversation_id = message_obj.get("conversationId", "")
            account_id = data.get("account", {}).get("id", "")
            
            # CRITICAL: Only allow auto-replies on the ITCollegetest page to protect the real page!
            TEST_ACCOUNT_ID = os.getenv("ZERNIO_TEST_ACCOUNT_ID", "6a4ff1243ecd8aa3447feda8")
            if account_id != TEST_ACCOUNT_ID:
                print(f"Ignored message for real account {account_id}")
                return {"status": "IGNORED"}
            
            # We only want to reply to incoming messages (from customers)
            if direction == "incoming" and message_text and sender_id:
                # Add to background tasks so we can return 200 OK immediately and prevent Zernio retries
                background_tasks.add_task(process_zernio_message, message_text, sender_id, sender_name, conversation_id, account_id)
                        
        return {"status": "EVENT_RECEIVED"}
    except Exception as e:
        print(f"Webhook error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

class ManualReplyPayload(BaseModel):
    recipient_id: str
    message: str

@app.post("/facebook/send")
def manual_facebook_reply(payload: ManualReplyPayload):
    """Admin Manual Reply Endpoint"""
    send_facebook_message(payload.recipient_id, payload.message)
    return {"status": "success"}

from rag_service import generate_rag_response

import time

DID_API_KEY = os.getenv("DID_API_KEY", "")
DID_EMAIL = os.getenv("DID_EMAIL", "")

def get_did_auth_header():
    """Build the Basic Auth header for D-ID API.
    D-ID provides credentials as base64(email):secret — we must base64-encode the whole string."""
    encoded = base64.b64encode(DID_API_KEY.encode()).decode()
    return {"Authorization": f"Basic {encoded}", "Content-Type": "application/json"}

class DIDVideoPayload(BaseModel):
    script: str
    voice_id: str = "en-US-SaraNeural"
    avatar_url: Optional[str] = "https://d-id-public-bucket.s3.amazonaws.com/alice.jpg"

@app.post("/did/create-talk")
def create_did_talk(payload: DIDVideoPayload):
    """Create a D-ID AI talking head video from a script."""
    headers = get_did_auth_header()
    body = {
        "source_url": payload.avatar_url,
        "script": {
            "type": "text",
            "subtitles": "false",
            "provider": {
                "type": "microsoft",
                "voice_id": payload.voice_id
            },
            "input": payload.script
        },
        "config": {
            "fluent": True,
            "pad_audio": 0
        }
    }
    try:
        resp = requests.post("https://api.d-id.com/talks", json=body, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        return {"id": data.get("id"), "status": data.get("status", "created")}
    except requests.exceptions.HTTPError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/did/talk/{talk_id}")
def get_did_talk(talk_id: str):
    """Poll D-ID for video status and get result URL when done."""
    headers = get_did_auth_header()
    try:
        resp = requests.get(f"https://api.d-id.com/talks/{talk_id}", headers=headers)
        resp.raise_for_status()
        data = resp.json()
        return {
            "id": data.get("id"),
            "status": data.get("status"),
            "result_url": data.get("result_url"),
            "error": data.get("error")
        }
    except requests.exceptions.HTTPError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from rag_service import add_document_to_kb
from facebook_sync import sync_page_posts

@app.post("/rag/sync-facebook")
def trigger_facebook_sync():
    result = sync_page_posts(limit=20)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    added = result.get("added", 0)
    skipped = result.get("skipped", 0)
    total = result.get("total", 0)
    
    if total == 0:
        message = "No posts found on the Facebook page."
    elif added == 0:
        message = f"All {skipped} posts are already up to date in the Knowledge Base."
    else:
        message = f"Synced {added} new post(s). {skipped} were already up to date."

    return {
        "status": "success",
        "synced_posts": added,
        "skipped_posts": skipped,
        "total_fetched": total,
        "message": message,
    }

from data_ingestion import ingest_facebook_json

@app.post("/rag/upload-facebook-data")
async def upload_facebook_data(file: UploadFile = File(...)):
    if not file.filename.endswith(".json"):
        raise HTTPException(status_code=400, detail="Only JSON files are supported")
    
    content = await file.read()
    json_str = content.decode("utf-8")
    count = ingest_facebook_json(json_str)
    
    return {"status": "success", "synced_posts": count, "message": f"Successfully ingested {count} posts"}

@app.post("/rag/upload-document")
async def upload_multi_format_document(file: UploadFile = File(...)):
    import tempfile
    import os
    from document_parser import process_and_store_document
    from data_ingestion import ingest_facebook_json
    
    allowed_exts = [".pdf", ".docx", ".xlsx", ".xls", ".csv", ".txt", ".json"]
    ext = os.path.splitext(file.filename)[1].lower()
    
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Unsupported file format: {ext}. Allowed: {', '.join(allowed_exts)}")
        
    if ext == ".json":
        content = await file.read()
        json_str = content.decode("utf-8")
        count = ingest_facebook_json(json_str)
        return {"status": "success", "chunks_stored": count, "message": f"Successfully ingested {count} posts from JSON"}
        
    try:
        # Save to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp:
            content = await file.read()
            temp.write(content)
            temp_path = temp.name
            
        # Parse and store
        chunks_stored = process_and_store_document(temp_path, file.filename)
        
        # Cleanup
        os.remove(temp_path)
        
        return {"status": "success", "chunks_stored": chunks_stored, "message": f"Successfully learned {chunks_stored} pieces of information from {file.filename}"}
    except Exception as e:
        print(f"Error processing document upload: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

@app.post("/rag/add-document")
def add_custom_document(payload: DocumentPayload):
    success = add_document_to_kb(payload.content)
    if success:
        return {"status": "success", "message": "Document added to knowledge base"}
    raise HTTPException(status_code=500, detail="Failed to add document")

class ChatPayload(BaseModel):
    message: str

@app.post("/rag/chat")
def chat_with_ai(payload: ChatPayload):
    """Test endpoint: send a message, get an AI reply powered by the Knowledge Base."""
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    reply = generate_rag_response(payload.message)
    return {"reply": reply}


class GeneratePostPayload(BaseModel):
    keywords: str
    topic: str = ""
    draft_count: int = 3
    writing_mode: str = "informative"

@app.post("/rag/generate-post")
def generate_social_post(payload: GeneratePostPayload):
    """Generate Facebook posts for Nobel Mount College based on keywords."""
    from rag_service import search_knowledge_base
    import google.generativeai as genai
    from datetime import datetime

    context = search_knowledge_base(payload.keywords, limit=10)
    current_date = datetime.now().strftime("%Y-%m-%d")

    mode_descriptions = {
        "informative": "educational and informative, sharing knowledge and tips",
        "promotional": "promotional, highlighting benefits and encouraging enrollment",
        "storytelling": "engaging storytelling style, using real student scenarios",
    }
    mode_desc = mode_descriptions.get(payload.writing_mode, "informative")

    prompt = f"""You are an expert social media content writer for Nobel Mount College, an IT and education college in Yangon, Myanmar.

Today is {current_date}.

Use the following context from the knowledge base about Nobel Mount College courses and programs:
[Context]
{context if context else "Nobel Mount College offers GED, Pre-IGCSE, ITPEC, Network Engineering Diploma, Japanese Language, and other IT courses."}

Task: Write exactly {payload.draft_count} separate, LONG and DETAILED Facebook posts about the topic: "{payload.keywords}".

Writing style: {mode_desc}
Requirements for EACH post:
- Written in Burmese (မြန်မာဘာသာ), can mix with English technical terms
- Make it detailed and engaging (around 10-15 sentences)
- Use emojis generously to make it visually appealing
- Include a strong opening hook sentence to grab attention
- Focus on the benefits and key details of the course/program
- Include a call-to-action at the end (e.g. contact Nobel Mount, enroll now, share with friends)
- End with relevant hashtags like #NobelMount #Myanmar

Format your response EXACTLY like this — use "===POST_START===" and "===POST_END===" to separate each post:

===POST_START===
[Long, detailed Post 1 content here — minimum 15 sentences]
===POST_END===

===POST_START===
[Long, detailed Post 2 content here — minimum 15 sentences]
===POST_END===

Write {payload.draft_count} long, detailed posts now:"""

    try:
        model = genai.GenerativeModel('gemini-3.1-flash-lite')
        response = model.generate_content(prompt)
        raw = response.text.strip()

        # Parse posts from the formatted response
        posts = []
        parts = raw.split("===POST_START===")
        for part in parts:
            if "===POST_END===" in part:
                post_text = part.split("===POST_END===")[0].strip()
                if post_text:
                    posts.append(post_text)

        # Fallback: if parsing fails, split by double newline
        if not posts:
            posts = [p.strip() for p in raw.split("\n\n") if len(p.strip()) > 50]

        posts = posts[:payload.draft_count]
        return {"status": "success", "posts": posts, "count": len(posts)}

    except Exception as e:
        print(f"Post generation error: {e}")
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

class RewritePayload(BaseModel):
    content: str

@app.post("/rag/rewrite-post")
def rewrite_post(payload: RewritePayload):
    try:
        from google import genai
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        prompt = f"Rewrite the following Facebook post content to be more engaging and professional. Use Burmese language. Emojis are allowed.\n\nOriginal:\n{payload.content}"
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        return {"status": "success", "rewritten_content": response.text.strip()}
    except Exception as e:
        print(f"Rewrite error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class ImagePayload(BaseModel):
    prompt: str
    save_as_file: Optional[bool] = False

@app.post("/rag/image/generate")
def generate_image_endpoint(payload: ImagePayload):
    import base64
    import uuid
    try:
        from google import genai as gai
        from google.genai import types as gtypes
        
        client = gai.Client(api_key=GEMINI_API_KEY)
        
        # Build a focused English prompt for best image quality
        prompt_text = payload.prompt.lower()
        if payload.save_as_file:
            # If generating an avatar for D-ID, we want a front-facing portrait
            style = "A realistic, front-facing portrait photo of a professional person, head and shoulders, looking directly at the camera with a neutral expression, plain light background, realistic 8k photography, ideal for an avatar"
        elif any(k in prompt_text for k in ["japan", "japanese", "n5", "jlpt"]):
            style = "Japanese language class, students studying Japanese, classroom in Myanmar, education"
        elif any(k in prompt_text for k in ["ged", "pre-ged", "pre ged", "igcse"]):
            style = "students studying for exams, books and notebooks, bright classroom, Myanmar students education"
        elif any(k in prompt_text for k in ["ccna", "network", "cisco", "it", "cyber"]):
            style = "IT students with computers and networking equipment, modern computer lab, technology education"
        elif any(k in prompt_text for k in ["english", "ielts", "toefl"]):
            style = "English language class, students speaking and learning English, classroom setting"
        else:
            style = "students in a modern college classroom, education, learning, Myanmar"
        
        image_prompt = f"A beautiful, professional, high-quality photo. {style}. Bright, colorful, inspiring, professional photography, sharp focus, 4k quality."
        
        response = client.models.generate_images(
            model="imagen-3.0-generate-001",
            prompt=image_prompt,
            config=gtypes.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio="1:1" if payload.save_as_file else "16:9",
            )
        )
        
        if response.generated_images:
            image_bytes = response.generated_images[0].image.image_bytes
            
            if payload.save_as_file:
                # Save to disk so D-ID can fetch it via URL
                filename = f"{uuid.uuid4().hex}.jpg"
                filepath = os.path.join("avatars", filename)
                with open(filepath, "wb") as f:
                    f.write(image_bytes)
                # Note: This requires the frontend to pass the server IP/domain
                return {"status": "success", "image_url": f"/avatars/{filename}"}
            else:
                b64 = base64.b64encode(image_bytes).decode("utf-8")
                data_url = f"data:image/jpeg;base64,{b64}"
                return {"status": "success", "image_url": data_url}
        else:
            raise Exception("No image generated")
            
    except Exception as e:
        print("Imagen 4 failed, using fallback:", str(e))
        # Fallback to Unsplash
        import random, urllib.parse
        query = "students college education classroom university learning"
        seed = random.randint(1, 9999)
        image_url = f"https://source.unsplash.com/featured/1024x576/?{urllib.parse.quote(query)}&sig={seed}"
        return {"status": "success", "image_url": image_url}

@app.post("/rag/upload-image")
async def upload_image(request: Request, file: UploadFile = File(...)):
    """Upload an image manually for a post"""
    try:
        import uuid
        ext = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join("uploads", filename)
        
        with open(filepath, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            
        # Return full URL for Zernio to access
        host = request.headers.get("host", "168.144.47.213")
        scheme = request.url.scheme
        # Often behind proxy, so force http/https logic if needed, but relative or domain is fine.
        # Since this is behind Nginx, host is correct.
        image_url = f"http://168.144.47.213/rag/uploads/{filename}"
        
        return {"status": "success", "image_url": image_url}
    except Exception as e:
        print("Upload error:", e)
        raise HTTPException(status_code=500, detail=str(e))

class PublishPayload(BaseModel):
    message: str
    image_url: str
    scheduled_date: Optional[str] = None

@app.post("/facebook/publish")
def publish_to_facebook(payload: PublishPayload):
    """Publish a post via Zernio API"""
    import requests
    
    api_key = os.getenv("ZERMIO_API_KEY")
    account_id = os.getenv("ZERMIO_PUBLISH_ACCOUNT_ID")
    
    if not api_key or not account_id:
        raise HTTPException(status_code=500, detail="Zernio credentials missing in backend settings")
        
    url = "https://zernio.com/api/v1/posts"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    media_items = []
    if payload.image_url and payload.image_url.startswith("http"):
        is_video = payload.image_url.endswith(".mp4")
        media_items.append({
            "type": "video" if is_video else "image",
            "url": payload.image_url
        })

    zernio_payload = {
        "content": payload.message,
        "platforms": [{"platform": "facebook", "accountId": account_id}],
        "publishNow": True if not payload.scheduled_date else False
    }
    
    if payload.scheduled_date:
        zernio_payload["scheduledDate"] = payload.scheduled_date
    
    if media_items:
        zernio_payload["mediaItems"] = media_items

    try:
        response = requests.post(url, json=zernio_payload, headers=headers)
        response.raise_for_status()
        return {"status": "success", "message": "Post published successfully via Zernio"}
    except requests.exceptions.HTTPError as e:
        print("Zernio Publish Error:", e.response.text)
        raise HTTPException(status_code=500, detail=f"Zernio API Error: {e.response.text}")
    except Exception as e:
        print("Publishing Error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rag/verify-payment-slip")
async def verify_payment_slip(file: UploadFile = File(...)):
    import google.generativeai as genai
    import json
    try:
        content = await file.read()
        model = genai.GenerativeModel('gemini-3.1-flash-lite')
        
        prompt = """Analyze this image. It is supposed to be a Myanmar payment slip (KPay or WavePay).
        Extract the following:
        1. Is it a valid payment slip? (true/false)
        2. Amount transferred (number only, no commas or currency symbols)
        3. Transaction Date (YYYY-MM-DD format if possible)
        4. Transaction ID
        
        Return ONLY a raw JSON object (no markdown formatting, no backticks) with keys: {"valid": true/false, "amount": 0, "date": "", "transaction_id": ""}
        """
        
        response = model.generate_content([
            prompt,
            {"mime_type": file.content_type, "data": content}
        ])
        
        text = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(text)
        return {"status": "success", "data": data}
    except Exception as e:
        print(f"Vision error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class ScriptPayload(BaseModel):
    topic: str

@app.post("/rag/generate-video-script")
def generate_video_script(payload: ScriptPayload):
    """Generate a short 15-second video script using Gemini."""
    try:
        from google import genai as gai
        client = gai.Client(api_key=GEMINI_API_KEY)
        
        prompt = f"Write a very short, engaging 15-second video script (about 3 sentences) for a talking head video about this topic: '{payload.topic}'. Make it sound natural, enthusiastic, and professional. Do NOT include any stage directions like [smiles] or [music plays], just the spoken words."
        
        response = client.models.generate_content(
            model='gemini-3.1-flash-lite',
            contents=prompt,
        )
        return {"status": "success", "script": response.text.strip()}
    except Exception as e:
        print("Error generating script:", e)
        raise HTTPException(status_code=500, detail=str(e))
