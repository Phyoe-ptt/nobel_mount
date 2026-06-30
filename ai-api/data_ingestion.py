import json
import os
from rag_service import add_document_to_kb

def ingest_facebook_json(json_content: str) -> int:
    """
    Parses a JSON string of Facebook posts downloaded from 'Download Your Information'
    and ingests them into the Vector DB.
    """
    added_count = 0
    try:
        data = json.loads(json_content)
        
        # Facebook JSON exports vary, but usually posts are in a list
        # Let's assume a generic extraction: find all "post" or "message" values
        # If it's the exact 'your_posts_1.json' format, it typically looks like:
        # [ { "timestamp": ..., "data": [ { "post": "..." } ] }, ... ]
        
        # For robustness, we will extract any string that looks like a post message.
        # Here we just iterate over the typical structure:
        if isinstance(data, list):
            for item in data:
                # Look for "data" array which contains "post"
                if "data" in item and isinstance(item["data"], list):
                    for data_entry in item["data"]:
                        if "post" in data_entry:
                            message = data_entry["post"]
                            if isinstance(message, str) and len(message.strip()) > 10:
                                try:
                                    message = message.encode('latin1').decode('utf8')
                                except Exception:
                                    pass
                                # We can also extract timestamp if needed
                                timestamp = item.get("timestamp", "Unknown Date")
                                
                                # Chunk the message into smaller parts
                                paragraphs = [p.strip() for p in message.split('\n') if p.strip()]
                                current_chunk = ""
                                chunks = []
                                for p in paragraphs:
                                    if len(current_chunk) + len(p) < 800:
                                        current_chunk += p + "\n"
                                    else:
                                        chunks.append(current_chunk.strip())
                                        current_chunk = p + "\n"
                                if current_chunk:
                                    chunks.append(current_chunk.strip())
                                    
                                for chunk in chunks:
                                    if len(chunk) > 10:
                                        # Remove unencodable characters (like emojis that break charmap)
                                        clean_chunk = chunk.encode('utf-8', 'ignore').decode('utf-8')
                                        content = f"Historical Facebook Post: {clean_chunk}"
                                        if add_document_to_kb(content):
                                            added_count += 1

        elif isinstance(data, dict):
            # If it's a dict, it might be structured differently.
            # E.g. {"posts": [ ... ]}
            pass
            
        print(f"Successfully ingested {added_count} posts from uploaded JSON.")
        return added_count
    except Exception as e:
        print(f"Error ingesting JSON: {e}")
        return 0
