import os
import requests
from dotenv import load_dotenv
from rag_service import add_document_to_kb

load_dotenv()

def get_fb_token_from_backend():
    """Fetch the Facebook Page Access Token from the Java Backend DB."""
    try:
        # ai-api container calls backend container
        resp = requests.get("http://backend:8080/api/settings/facebook-token", timeout=3)
        if resp.ok:
            data = resp.json()
            return data.get("token")
    except Exception as e:
        print(f"Failed to fetch token from backend: {e}")
    return os.getenv("FB_NOBEL_MOUNT_TOKEN")  # Fallback to .env

def sync_page_posts(limit: int = 20) -> dict:
    """Fetches the latest posts from the Facebook Page and adds them to the Knowledge Base.
    
    Returns a dict with keys: added, skipped (already existed), total (fetched from FB).
    """
    token = get_fb_token_from_backend()
    if not token:
        print("Error: Facebook Page Access Token not found in DB or environment.")
        return {"added": 0, "skipped": 0, "total": 0, "error": "Missing Facebook Token. Please add it in Settings."}

    # Use /me/feed instead of /me/posts — feed returns ALL content types including
    # image posts, shared posts, and stories. /me/posts silently drops anything without a message.
    url = f"https://graph.facebook.com/v20.0/me/feed?fields=message,story,created_time&limit={limit}&access_token={token}"
    
    added_count = 0
    skipped_count = 0
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        posts = data.get("data", [])
        for post in posts:
            # Prefer typed message; fall back to auto-generated story text
            message = post.get("message") or post.get("story")
            if message and len(message.strip()) > 10:  # Only sync meaningful text
                # Format it clearly so the AI knows it's a post
                content = f"Facebook Page Post (Date: {post.get('created_time')}): {message}"
                success = add_document_to_kb(content)
                if success:
                    added_count += 1
                else:
                    skipped_count += 1

        print(f"Sync complete: {added_count} new, {skipped_count} already existed.")
        return {"added": added_count, "skipped": skipped_count, "total": len(posts)}
    except requests.exceptions.HTTPError as e:
        print(f"Error syncing Facebook posts: {e}")
        error_msg = "Unknown Error"
        if e.response is not None:
            err_data = e.response.json()
            print("Facebook API Response:", err_data)
            error_msg = err_data.get("error", {}).get("message", "Facebook API Error")
            if "expired" in error_msg.lower():
                error_msg = "Your Facebook Token has expired! Please generate a new one and paste it in the Settings page."
        return {"added": 0, "skipped": 0, "total": 0, "error": error_msg}
    except Exception as e:
        print(f"Unexpected error: {e}")
        return {"added": 0, "skipped": 0, "total": 0, "error": str(e)}

if __name__ == "__main__":
    sync_page_posts()
