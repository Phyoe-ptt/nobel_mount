import os
import google.generativeai as genai
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Database Configuration
DB_URL = "postgresql://postgres.vusexelcckkqncjkiuch:wENwO2e7G968rmmu@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres"

def get_db_connection():
    return psycopg2.connect(DB_URL)

def generate_embedding(text: str) -> list[float]:
    """Generates a text embedding using Gemini."""
    try:
        result = genai.embed_content(
            model="models/gemini-embedding-2",
            content=text,
            task_type="retrieval_document"
        )
        return result['embedding']
    except Exception as e:
        print(f"Embedding error: {e}")
        return []

def add_document_to_kb(content: str):
    """Adds a document to the Knowledge Base (Supabase pgvector)."""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Deduplication check
        cursor.execute("SELECT id FROM documents WHERE content = %s LIMIT 1", (content,))
        if cursor.fetchone():
            print("Document already exists, skipping.")
            return False

        embedding = generate_embedding(content)
        if not embedding:
            return False
            
        # Convert list of floats to Postgres vector format: '[0.1, 0.2, ...]'
        vector_str = "[" + ",".join(map(str, embedding)) + "]"
        
        cursor.execute(
            "INSERT INTO documents (content, embedding) VALUES (%s, %s)",
            (content, vector_str)
        )
        conn.commit()
        clean_content_for_print = content[:50].encode('ascii', 'replace').decode('ascii')
        print(f"Added document: {clean_content_for_print}...")
        return True
    except Exception as e:
        print(f"DB Insert Error: {e}")
        return False
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def search_knowledge_base(query: str, limit: int = 15) -> str:
    """Searches Supabase pgvector for relevant context based on the query."""
    query_embedding = generate_embedding(query)
    if not query_embedding:
        return ""
        
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        vector_str = "[" + ",".join(map(str, query_embedding)) + "]"
        
        # Use cosine distance (<=>) for vector search
        cursor.execute(
            """
            SELECT content, 1 - (embedding <=> %s) AS similarity
            FROM documents
            ORDER BY embedding <=> %s
            LIMIT %s;
            """,
            (vector_str, vector_str, limit)
        )
        
        results = cursor.fetchall()
        contexts = [row[0] for row in results if row[1] > 0.1] # Similarity threshold
        return "\n\n".join(contexts)
    except Exception as e:
        print(f"Vector Search Error: {e}")
        return ""
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def generate_rag_response(message_text: str) -> str:
    """Combines vector search context with Gemini generation."""
    context = search_knowledge_base(message_text)
    
    from datetime import datetime
    current_date = datetime.now().strftime("%Y-%m-%d")

    prompt = f"""You are a helpful customer service assistant for Nobel Mount College.
    The current date is {current_date}. 
    Answer the user's message concisely and politely in the Burmese language based ONLY on the provided context below.
    Carefully read all the provided context. If the context contains information related to the user's question (e.g. course names, fees, details), use it to form your answer in Burmese.
    IMPORTANT: If the context mentions a class start date that is in the past relative to {current_date}, do NOT say the class "will start" on that date. Instead, explain that the class was previously opened on that date, and advise the user to contact the school for upcoming schedules.
    CRITICAL RULE: If the context absolutely does not contain the exact answer to the user's question, DO NOT apologize and DO NOT try to answer. You MUST output EXACTLY this exact string and NOTHING ELSE: [HUMAN_NEEDED]

    [Context from Knowledge Base]
    {context if context else "No context found."}

    User Message: {message_text}
    Response in Burmese:"""
    
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return "Sorry, I am currently upgrading my AI brain and cannot process your message right now!"
