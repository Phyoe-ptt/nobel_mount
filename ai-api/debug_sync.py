import os
import sys
import requests
from dotenv import load_dotenv

sys.stdout.reconfigure(encoding='utf-8')
load_dotenv()

TOKEN = os.getenv("FB_NOBEL_MOUNT_TOKEN")

url = f"https://graph.facebook.com/v20.0/me/feed?fields=message,story,created_time&limit=5&access_token={TOKEN}"
response = requests.get(url)
data = response.json()

posts = data.get("data", [])
print(f"Total posts fetched: {len(posts)}")

for i, post in enumerate(posts):
    message = post.get("message") or post.get("story")
    print(f"\nPost {i+1}:")
    print(f"  has message: {bool(post.get('message'))}")
    print(f"  has story: {bool(post.get('story'))}")
    print(f"  message value: {repr(message[:80]) if message else None}")
    if message:
        stripped = message.strip()
        print(f"  len(stripped): {len(stripped)}")
        passes = len(stripped) > 10
        print(f"  passes filter (>10): {passes}")
        if passes:
            # Try adding to KB
            from rag_service import add_document_to_kb
            content = f"Facebook Page Post (Date: {post.get('created_time')}): {message}"
            print(f"  Attempting add_document_to_kb...")
            result = add_document_to_kb(content)
            print(f"  add_document_to_kb result: {result}")
