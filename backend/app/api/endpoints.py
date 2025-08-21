import os
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from typing import List
import aiohttp
from app.limiter import limiter
from app.models import AskRequest, AskResponse, SearchResult
from app.services.document_service import DocumentService
from app.services.llm_service import LLMService

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parent.parent
document_service = DocumentService(os.path.join(BASE_DIR, "data", "content_data.json"))
llm_service = LLMService()

@router.post("/ingest")
@limiter.limit("3/minute")
async def ingest_documents(request: Request,files: List[UploadFile] = File(...)):
    if len(files) < 3 or len(files) > 10:
        raise HTTPException(
            status_code=400, 
            detail="Debe subir entre 3 y 10 archivos"
        )
    
    processed_files = []
    for file in files:
        if not file.filename or not file.filename.endswith(('.txt', '.pdf')):
            raise HTTPException(
                status_code=400, 
                detail=f"El archivo {file.filename} debe ser .txt o .pdf"
            )
        
        document = await document_service.process_document(file, file.filename)
        processed_files.append({"name": document.name, "id": document.id, "chunks": len(document.chunks)})
    
    return {
        "message": f"{len(processed_files)} documentos procesados correctamente", 
        "files": processed_files
    }

@router.get("/search")
@limiter.limit("3/minute")
async def search_documents(request: Request,q: str, limit: int = 5) -> List[SearchResult]:
    if not q or len(q.strip()) < 2:
        raise HTTPException(
            status_code=400, 
            detail="Parámetro de búsqueda 'q' requerido (mínimo 2 caracteres)"
        )
    
    return document_service.search(q.strip(), top_k=limit)

@router.post("/ask")
@limiter.limit("3/minute")
async def ask_question(request: Request,ask_request: AskRequest) -> AskResponse:
    if not ask_request.question or len(ask_request.question.strip()) < 3:
        raise HTTPException(
            status_code=400, 
            detail="Pregunta requerida (mínimo 3 caracteres)"
        )
    
    # Obtiene contenido relevante
    search_results = document_service.search(ask_request.question, top_k=5)
    
    # Respuesta del modelo MLL
    answer = await llm_service.generate_answer(ask_request.question, search_results)
    
    # Preparar citaciones
    citations = []
    if search_results:
        for result in search_results[:3]:
            text_preview = result.text
            if len(text_preview) > 150:
                text_preview = text_preview[:147] + "..."
            citations.append(f"{result.document_name}: {text_preview}")
    
    return AskResponse(answer=answer, citations=citations)

@router.get("/stats")
async def get_stats():
    total_docs = len(document_service.documents)
    total_chunks = len(document_service.chunk_index)
    return {
        "documents": total_docs,
        "chunks": total_chunks,
        "document_names": [doc.name for doc in document_service.documents.values()]
    }

@router.get("/ollama-status")
async def check_ollama_status():
    """Verificar el estado de la conexión con Ollama"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{llm_service.base_url}/api/tags") as response:
                if response.status == 200:
                    data = await response.json()
                    models = [model['name'] for model in data.get('models', [])]
                    return {
                        "status": "connected",
                        "models": models,
                        "default_model": llm_service.model
                    }
                else:
                    return {
                        "status": "error", 
                        "message": f"Ollama responded with status {response.status}"
                    }
    except Exception as e:
        return {
            "status": "error", 
            "message": f"Could not connect to Ollama: {str(e)}"
        }