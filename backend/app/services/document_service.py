import os
import uuid
import PyPDF2
from typing import List
from app.models import Document, SearchResult

class DocumentService:
    def __init__(self):
        self.documents = {}
        self.chunk_index = {}

    #Almacenamiento
    async def process_document(self, file, filename: str) -> Document:
        content = ""
        if filename.endswith('.txt'):
            content = (await file.read()).decode('utf-8')
        elif filename.endswith('.pdf'):
            pdf_reader = PyPDF2.PdfReader(file.file)
            for page in pdf_reader.pages:
                content += page.extract_text() + "\n"
        
        chunks = [chunk for chunk in content.split('\n\n') if chunk.strip()]
        
        doc_id = str(uuid.uuid4())
        document = Document(
            id=doc_id,
            name=filename,
            content=content,
            chunks=chunks
        )
        
        self.documents[doc_id] = document
        for i, chunk in enumerate(chunks):
            self.chunk_index[f"{doc_id}_{i}"] = {
                "text": chunk,
                "document_name": filename,
                "doc_id": doc_id,
                "chunk_index": i
            }
        
        return document

    #Búsqueda semántica
    def search(self, query: str, top_k: int = 3) -> List[SearchResult]:
        results = []
        query_lower = query.lower()
        
        for chunk_id, chunk_data in self.chunk_index.items():
            text = chunk_data["text"].lower()
            
            query_words = query_lower.split()
            matching_words = sum(1 for word in query_words if word in text)
            
            if query_words:
                score = matching_words / len(query_words)
                
                if any(word in text for word in query_words):
                    score += 0.3
                
                if all(word in text for word in query_words):
                    score += 0.5
                    
                if score > 0.2:
                    results.append(SearchResult(
                        text=chunk_data["text"],
                        document_name=chunk_data["document_name"],
                        score=min(score, 1.0)
                    ))
        
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:top_k]