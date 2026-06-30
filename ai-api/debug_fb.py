import os
import sys
import json
import requests
from dotenv import load_dotenv

sys.stdout.reconfigure(encoding='utf-8')

load_dotenv()

TOKEN = os.getenv("FB_NOBEL_MOUNT_TOKEN")
print(f"Token loaded: {'YES' if TOKEN else 'NO'}")
print(f"Token (first 20 chars): {TOKEN[:20] if TOKEN else 'NONE'}")

# Step 1: Check who this token belongs to (page info)
print("\n--- Checking token identity (me?fields=id,name,category) ---")
resp = requests.get(
    f"https://graph.facebook.com/v20.0/me",
    params={"fields": "id,name,category,fan_count", "access_token": TOKEN}
)
print(f"Status: {resp.status_code}")
print(resp.json())

# Step 2: Try fetching posts with all fields
print("\n--- Fetching posts (me/posts with message,story,created_time) ---")
resp2 = requests.get(
    f"https://graph.facebook.com/v20.0/me/posts",
    params={"fields": "message,story,created_time", "limit": 10, "access_token": TOKEN}
)
print(f"Status: {resp2.status_code}")
data = resp2.json()
print(data)

# Step 3: Try me/feed which includes all content types
print("\n--- Fetching feed (me/feed) ---")
resp3 = requests.get(
    f"https://graph.facebook.com/v20.0/me/feed",
    params={"fields": "message,story,full_picture,created_time", "limit": 10, "access_token": TOKEN}
)
print(f"Status: {resp3.status_code}")
print(resp3.json())
