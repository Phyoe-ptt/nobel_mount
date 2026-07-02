from fastapi import FastAPI, Request, HTTPException, UploadFile, File
from pydantic import BaseModel
import os

app = FastAPI(title="AI API Backend", description="FastAPI service for Video Generation and RAG")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)
import requests
from dotenv import load_dotenv

load_dotenv(override=True)

# Facebook Tokens (Fallback)
FB_VERIFY_TOKEN = os.getenv("FB_VERIFY_TOKEN", "nobel_mount_secret_token")

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

def send_facebook_message(sender_id: str, message_text: str):
    """Sends a message back to the user via Facebook Graph API"""
    token = get_fb_publish_token()
    if not token:
        print("Error: No Facebook Publish Token found!")
        return
        
    url = f"https://graph.facebook.com/v20.0/me/messages?access_token={token}"
    payload = {
        "recipient": {"id": sender_id},
        "message": {"text": message_text},
        "messaging_type": "RESPONSE"
    }
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.post(url, json=payload, headers=headers)
        
        # Log AI reply to DB FIRST, before checking if Facebook succeeded
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
            
        # Now raise for status so we can catch Facebook errors
        response.raise_for_status()
        print(f"Message sent successfully to {sender_id}")
            
    except requests.exceptions.HTTPError as e:
        print(f"Error sending message: {e}")
        print("Facebook API Response:", e.response.json())
    except Exception as e:
        print(f"Unexpected Error sending message: {e}")

@app.post("/webhook")
async def handle_webhook(request: Request):
    """Handle incoming messages from ITCollegetest Facebook Page"""
    try:
        data = await request.json()
        try:
            print("Received Webhook Data")
        except:
            pass
        
        if data.get("object") == "page":
            for entry in data.get("entry", []):
                for messaging_event in entry.get("messaging", []):
                    if "message" in messaging_event and "text" in messaging_event["message"]:
                        sender_id = messaging_event["sender"]["id"]
                        message_text = messaging_event["message"]["text"]
                        
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
                                "recipientId": "ITCollegetest",
                                "messageText": message_text,
                                "fromAi": False,
                                "requiresHuman": requires_human,
                                "resolved": False
                            }, timeout=3)
                        except Exception as e:
                            print("Failed to log user message to DB:", e)
                        
                        # Send the reply back to the user
                        send_facebook_message(sender_id, reply_text)
                        
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

import base64
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

@app.post("/did/create-talk")
def create_did_talk(payload: DIDVideoPayload):
    """Create a D-ID AI talking head video from a script."""
    headers = get_did_auth_header()
    body = {
        "source_url": "https://d-id-public-bucket.s3.amazonaws.com/alice.jpg",
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
- MUST be at least 15-20 sentences long — detailed and thorough
- Use emojis generously throughout the post (every 2-3 sentences)
- Include a strong opening hook sentence to grab attention
- Include a numbered or bullet list of at least 5-7 specific tips/points
- Include a call-to-action at the end (e.g. contact Nobel Mount, enroll now, share with friends)
- End with 5-8 relevant hashtags like #GED #NobelMount #Myanmar
- Make it feel like a real, engaging Facebook post from an education page — NOT a short summary

Format your response EXACTLY like this — use "===POST_START===" and "===POST_END===" to separate each post:

===POST_START===
[Long, detailed Post 1 content here — minimum 15 sentences]
===POST_END===

===POST_START===
[Long, detailed Post 2 content here — minimum 15 sentences]
===POST_END===

Write {payload.draft_count} long, detailed posts now:"""

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
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

class ImagePayload(BaseModel):
    prompt: str

@app.post("/rag/image/generate")
def generate_image_endpoint(payload: ImagePayload):
    import urllib.parse
    try:
        # User does not have enough Gemini tokens/quota for Imagen
        # We will use Pollinations.ai which is a free public image generation API
        encoded_prompt = urllib.parse.quote(payload.prompt)
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true"
        
        return {"status": "success", "image_url": image_url}
    except Exception as e:
        print("Image generation failed:", str(e))
        return {"status": "success", "image_url": "https://placehold.co/600x600?text=Image+Generation+Failed"}

class PublishPayload(BaseModel):
    message: str
    image_url: str

@app.post("/facebook/publish")
def publish_to_facebook(payload: PublishPayload):
    """Publish a post directly to the Facebook Page"""
    import requests
    token = get_fb_publish_token()
    if not token:
        raise HTTPException(status_code=500, detail="Facebook Publish Token is missing in Settings")
        
    url = f"https://graph.facebook.com/v20.0/me/photos"
    
    try:
        # Check if the image_url is a base64 data URL
        if payload.image_url.startswith("data:image/"):
            import base64
            header, encoded = payload.image_url.split(",", 1)
            image_data = base64.b64decode(encoded)
            
            files = {
                'source': ('image.jpg', image_data, 'image/jpeg')
            }
            data = {
                'message': payload.message,
                'access_token': token
            }
            response = requests.post(url, data=data, files=files)
        else:
            # It's a standard URL (Pollinations API returns this)
            data = {
                'message': payload.message,
                'url': payload.image_url,
                'access_token': token
            }
            response = requests.post(url, data=data)
            
        response.raise_for_status()
        return {"status": "success", "post_id": response.json().get("post_id")}
    except requests.exceptions.HTTPError as e:
        print("FB Publish Error:", e.response.text)
        raise HTTPException(status_code=500, detail=f"Facebook API Error: {e.response.text}")
    except Exception as e:
        print("Publishing Error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/rag/verify-payment-slip")
async def verify_payment_slip(file: UploadFile = File(...)):
    import google.generativeai as genai
    import json
    try:
        content = await file.read()
        model = genai.GenerativeModel('gemini-2.5-flash')
        
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
