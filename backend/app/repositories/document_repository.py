import os
import uuid
import PyPDF2
import io
from typing import List
from app.models import Document, SearchResult

class DocumentService:
    def __init__(self):
        self.documents = {}
        self.chunk_index = {}  # Simple in-memory index

    async def process_document(self, file, filename: str) -> Document:
        content = ""
        
        # Leer el contenido del archivo
        file_content = await file.read()
        
        if filename.endswith('.txt'):
            content = file_content.decode('utf-8', errors='ignore')
        elif filename.endswith('.pdf'):
            try:
                # Usar BytesIO para leer el PDF
                pdf_file = io.BytesIO(file_content)
                pdf_reader = PyPDF2.PdfReader(pdf_file)
                
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        content += page_text + "\n"
            except Exception as e:
                print(f"Error procesando PDF {filename}: {str(e)}")
                content = f"Error al procesar PDF: {str(e)}"
        
        # Simple chunking by paragraphs or fixed size
        chunks = []
        if content:
            # Dividir en párrafos
            paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
            
            # Si los párrafos son muy largos, dividirlos en trozos más pequeños
            for paragraph in paragraphs:
                if len(paragraph) > 1000:
                    # Dividir párrafos largos en trozos de ~500 caracteres
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
        
        # Indexar chunks
        for i, chunk in enumerate(chunks):
            chunk_id = f"{doc_id}_{i}"
            self.chunk_index[chunk_id] = {
                "text": chunk,
                "document_name": filename,
                "doc_id": doc_id,
                "chunk_index": i
            }
        
        return document

    def search(self, query: str, top_k: int = 5) -> List[SearchResult]:
        results = []
        query_lower = query.lower()
        
        for chunk_id, chunk_data in self.chunk_index.items():
            text = chunk_data["text"].lower()
            
            # Mejorar el cálculo de relevancia
            query_words = query_lower.split()
            matching_words = sum(1 for word in query_words if word in text)
            
            # Calcular puntaje (proporción de palabras coincidentes)
            if query_words:
                score = matching_words / len(query_words)
                
                # Bonus por coincidencias exactas de frases
                if query_lower in text:
                    score += 0.5
                
                if score > 0:
                    results.append(SearchResult(
                        text=chunk_data["text"],
                        document_name=chunk_data["document_name"],
                        score=min(score, 1.0)  # Asegurar que no sea mayor a 1.0
                    ))
        
        # Sort by score and return top results
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:top_k]