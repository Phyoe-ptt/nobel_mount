import os
import requests
from dotenv import load_dotenv
from rag_service import add_document_to_kb

load_dotenv()

def get_fb_token_from_backend():
    """Fetch the Facebook Page Access Token from the Java Backend DB."""
    try:
        # ai-api container calls backend container
        resp = requests.get("http://backend:8080/api/settings/facebook-tokens", timeout=3)
        if resp.ok:
            data = resp.json()
            return data.get("syncToken")
    except Exception as e:
        print(f"Failed to fetch token from backend: {e}")
    return os.getenv("FB_NOBEL_MOUNT_TOKEN")  # Fallback to .env

def sync_page_posts(limit: int = 20) -> dict:
    """Fetches the latest posts from the Facebook Page (via Zernio API) and adds them to the Knowledge Base.
    
    Returns a dict with keys: added, skipped (already existed), total (fetched from FB).
    """
    api_key = os.getenv("ZERMIO_API_KEY")
    account_id = os.getenv("ZERMIO_SYNC_ACCOUNT_ID")
    
    if not api_key or not account_id:
        print("Error: Zernio API Key or Account ID not found in environment.")
        return {"added": 0, "skipped": 0, "total": 0, "error": "Missing Zernio Credentials. Please configure them in Settings."}

    url = f"https://zernio.com/api/v1/accounts/{account_id}/posts"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    added_count = 0
    skipped_count = 0
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        posts = data.get("posts", [])
        
        # Limit the number of posts to sync
        posts = posts[:limit]
        
        for post in posts:
            # Try to get the message (content) of the post
            message = post.get("message") or post.get("content") or post.get("text")
            created_at = post.get("createdAt") or post.get("publishedAt") or "Unknown Date"
            
            if message and len(message.strip()) > 10:  # Only sync meaningful text
                # Format it clearly so the AI knows it's a post
                content = f"Facebook Page Post (Date: {created_at}): {message}"
                success = add_document_to_kb(content)
                if success:
                    added_count += 1
                else:
                    skipped_count += 1

        print(f"Sync complete: {added_count} new, {skipped_count} already existed.")
        return {"added": added_count, "skipped": skipped_count, "total": len(posts)}
    except requests.exceptions.HTTPError as e:
        print(f"Error syncing Facebook posts via Zernio: {e}")
        error_msg = "Unknown Zernio API Error"
        if e.response is not None:
            err_data = e.response.json()
            print("Zernio API Response:", err_data)
            error_msg = err_data.get("error", "Zernio API Error")
        return {"added": 0, "skipped": 0, "total": 0, "error": error_msg}
    except Exception as e:
        print(f"Unexpected error: {e}")
        return {"added": 0, "skipped": 0, "total": 0, "error": str(e)}

if __name__ == "__main__":
    sync_page_posts()
