import os
import pandas as pd
import fitz  # PyMuPDF
from docx import Document
from rag_service import add_document_to_kb

def parse_document(file_path: str, filename: str) -> str:
    """Parses a document (PDF, Word, Excel, CSV, TXT) and returns its text content."""
    ext = os.path.splitext(filename)[1].lower()
    
    try:
        if ext == '.pdf':
            return parse_pdf(file_path)
        elif ext == '.docx':
            return parse_docx(file_path)
        elif ext in ['.xlsx', '.xls']:
            return parse_excel(file_path)
        elif ext == '.csv':
            return parse_csv(file_path)
        elif ext == '.txt':
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        else:
            raise ValueError(f"Unsupported file extension: {ext}")
    except Exception as e:
        print(f"Error parsing document {filename}: {e}")
        raise e

def parse_pdf(file_path: str) -> str:
    text = []
    with fitz.open(file_path) as doc:
        for page in doc:
            text.append(page.get_text())
    return "\n\n".join(text)

def parse_docx(file_path: str) -> str:
    doc = Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])

def parse_excel(file_path: str) -> str:
    # Read all sheets
    dfs = pd.read_excel(file_path, sheet_name=None)
    text_chunks = []
    for sheet_name, df in dfs.items():
        text_chunks.append(f"--- Sheet: {sheet_name} ---")
        # Convert each row to a string representation
        for index, row in df.iterrows():
            row_dict = row.dropna().to_dict()
            if row_dict:
                row_str = ", ".join([f"{k}: {v}" for k, v in row_dict.items()])
                text_chunks.append(row_str)
    return "\n".join(text_chunks)

def parse_csv(file_path: str) -> str:
    df = pd.read_csv(file_path)
    text_chunks = []
    for index, row in df.iterrows():
        row_dict = row.dropna().to_dict()
        if row_dict:
            row_str = ", ".join([f"{k}: {v}" for k, v in row_dict.items()])
            text_chunks.append(row_str)
    return "\n".join(text_chunks)

def chunk_text(text: str, max_words: int = 200) -> list[str]:
    """Splits text into smaller chunks for vector embeddings."""
    words = text.split()
    chunks = []
    current_chunk = []
    current_count = 0
    
    for word in words:
        current_chunk.append(word)
        current_count += 1
        if current_count >= max_words:
            chunks.append(" ".join(current_chunk))
            # Keep a small overlap
            current_chunk = current_chunk[-20:]
            current_count = len(current_chunk)
            
    if current_chunk and len(current_chunk) > 20:
        chunks.append(" ".join(current_chunk))
        
    return chunks

def process_and_store_document(file_path: str, filename: str) -> int:
    """Parses a document, chunks it, and stores the chunks in the Knowledge Base. Returns number of chunks stored."""
    text = parse_document(file_path, filename)
    if not text.strip():
        return 0
        
    chunks = chunk_text(text, max_words=200)
    stored_count = 0
    for chunk in chunks:
        # Add filename as context to each chunk
        chunk_with_context = f"Source Document ({filename}):\n{chunk}"
        success = add_document_to_kb(chunk_with_context)
        if success:
            stored_count += 1
            
    return stored_count
