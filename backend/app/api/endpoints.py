from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import aiohttp
from app.models import AskRequest, AskResponse, SearchResult
from app.services.document_service import DocumentService
from app.services.llm_service import LLMService

router = APIRouter()

# Inicializar servicios
document_service = DocumentService()
llm_service = LLMService()

@router.post("/ingest")
async def ingest_documents(files: List[UploadFile] = File(...)):
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
async def search_documents(q: str, limit: int = 5) -> List[SearchResult]:
    if not q or len(q.strip()) < 2:
        raise HTTPException(
            status_code=400, 
            detail="Parámetro de búsqueda 'q' requerido (mínimo 2 caracteres)"
        )
    
    return document_service.search(q.strip(), top_k=limit)

@router.post("/ask")
async def ask_question(request: AskRequest) -> AskResponse:
    if not request.question or len(request.question.strip()) < 3:
        raise HTTPException(
            status_code=400, 
            detail="Pregunta requerida (mínimo 3 caracteres)"
        )
    
    # Primero buscar contenido relevante
    search_results = document_service.search(request.question, top_k=5)
    
    # Generar respuesta con LLM
    answer = await llm_service.generate_answer(request.question, search_results)
    
    # Preparar citaciones
    citations = []
    if search_results:
        # Usar los resultados más relevantes como citaciones
        for result in search_results[:3]:
            # Acortar el texto para la citación
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