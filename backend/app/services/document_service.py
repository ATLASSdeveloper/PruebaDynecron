import os
import re
import uuid
import json
import aiofiles
from pathlib import Path
import PyPDF2
from typing import List,Dict
from app.models import Document, SearchResult

class DocumentService:
    def __init__(self, json_path: str = "documents_data.json"):
        self.json_path = json_path
        self.documents = {}
        self.chunk_index = {}
        self.load_data()
    
    def load_data(self):
        """Cargar datos desde el archivo JSON si existe"""
        try:
            if Path(self.json_path).exists():
                with open(self.json_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                    self.documents = {
                        doc_id: Document(**doc_data) 
                        for doc_id, doc_data in data.get('documents', {}).items()
                    }
                    self.chunk_index = data.get('chunk_index', {})
                    print(f"✅ Datos cargados: {len(self.documents)} documentos, {len(self.chunk_index)} chunks")
        except Exception as e:
            print(f"❌ Error cargando datos: {e}")
            self.documents = {}
            self.chunk_index = {}

    async def save_data(self):
        """Guardar datos al archivo JSON (async)"""
        try:
            print(f"🔍 Documentos keys: {list(self.documents.keys())}")
            if self.documents:
                first_doc = list(self.documents.values())[0]
                print(f"🔍 Primer documento tipo: {type(first_doc)}")
                print(f"🔍 Primer documento atributos: {dir(first_doc)}")
            
            documents_dict = {}
            for doc_id, doc in self.documents.items():
                documents_dict[doc_id] = {
                    "id": getattr(doc, 'id', ''),
                    "name": getattr(doc, 'name', ''),
                    "content": getattr(doc, 'content', ''),
                    "chunks": getattr(doc, 'chunks', [])
                }
            
            data = {
                'documents': documents_dict,
                'chunk_index': self.chunk_index
            }
            
            print(f"🔍 Data a guardar: {json.dumps(data, indent=2)[:500]}...")
            
            json_data = json.dumps(data, ensure_ascii=False, indent=2)
            
            print(f"🔍 JSON data length: {len(json_data)}")
            
            async with aiofiles.open(self.json_path, 'w', encoding='utf-8') as f:
                await f.write(json_data)
            
            print(f"✅ Datos guardados exitosamente")
            
        except Exception as e:
            print(f"❌ Error grave en save_data: {e}")
            import traceback
            traceback.print_exc()

    # Almacenamiento con persistencia
    async def process_document(self, file, filename: str) -> Document:
        content = ""
        if filename.endswith('.txt'):
            content = (await file.read()).decode('utf-8')
        elif filename.endswith('.pdf'):
            await file.seek(0)
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
        
        # Almacenar en memoria
        self.documents[doc_id] = document
        for i, chunk in enumerate(chunks):
            chunk_id = f"{doc_id}_{i}"
            self.chunk_index[chunk_id] = {
                "text": chunk,
                "document_name": filename,
                "doc_id": doc_id,
                "chunk_index": i
            }
        
        # Guardar persistencia en JSON
        await self.save_data()
        
        return document

    # Búsqueda semántica
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