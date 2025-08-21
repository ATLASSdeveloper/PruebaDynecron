import os
import uuid
import PyPDF2
import io
from typing import List
from app.models import Document, SearchResult

class DocumentService:
    def __init__(self):
        self.documents = {}
        self.chunk_index = {}

    #Divide el documento, primero en parrafos y si tienen mucho contenido separa en 500 palabras
    async def process_document(self, file, filename: str) -> Document:
        content = ""
        
        file_content = await file.read()
        
        if filename.endswith('.txt'):
            content = file_content.decode('utf-8', errors='ignore')
        elif filename.endswith('.pdf'):
            try:
                pdf_file = io.BytesIO(file_content)
                pdf_reader = PyPDF2.PdfReader(pdf_file)
                
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        content += page_text + "\n"
            except Exception as e:
                print(f"Error procesando PDF {filename}: {str(e)}")
                content = f"Error al procesar PDF: {str(e)}"
        
        chunks = []
        if content:
            paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
            
            for paragraph in paragraphs:
                if len(paragraph) > 1000:
                    words = paragraph.split()
                    current_chunk = []
                    current_length = 0
                    
                    for word in words:
                        if current_length + len(word) + 1 > 500 and current_chunk:
                            chunks.append(" ".join(current_chunk))
                            current_chunk = [word]
                            current_length = len(word)
                        else:
                            current_chunk.append(word)
                            current_length += len(word) + 1
                    
                    if current_chunk:
                        chunks.append(" ".join(current_chunk))
                else:
                    chunks.append(paragraph)
        
        doc_id = str(uuid.uuid4())
        document = Document(
            id=doc_id,
            name=filename,
            content=content,
            chunks=chunks
        )
        
        self.documents[doc_id] = document
        
        for i, chunk in enumerate(chunks):
            chunk_id = f"{doc_id}_{i}"
            self.chunk_index[chunk_id] = {
                "text": chunk,
                "document_name": filename,
                "doc_id": doc_id,
                "chunk_index": i
            }
        
        return document

    #Busqueda por coincidencia de palabras con bonus por coincidencia exacta
    def search(self, query: str, top_k: int = 5) -> List[SearchResult]:
        results = []
        query_lower = query.lower()
        
        for chunk_id, chunk_data in self.chunk_index.items():
            text = chunk_data["text"].lower()
            
            query_words = query_lower.split()
            matching_words = sum(1 for word in query_words if word in text)
            
            if query_words:
                score = matching_words / len(query_words)
                
                if query_lower in text:
                    score += 0.5
                
                if score > 0:
                    results.append(SearchResult(
                        text=chunk_data["text"],
                        document_name=chunk_data["document_name"],
                        score=min(score, 1.0)
                    ))
        
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:top_k]