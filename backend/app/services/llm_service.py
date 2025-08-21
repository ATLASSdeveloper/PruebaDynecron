import aiohttp
import os
import asyncio
from typing import List
from app.models import SearchResult

class LLMService:
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://ollama:11434")
        self.model = os.getenv("OLLAMA_MODEL", "tinyllama:1.1b")
        self.timeout = aiohttp.ClientTimeout(total=500)

    #promp simple por limitaciones del modelo a usar
    async def generate_answer(self, question: str, context: List[SearchResult]) -> str:
        if not context:
            return "No encuentro esa información en los documentos cargados"
        
        context_text = "\n".join([
            f"[{result.document_name}]: {result.text[:100]}..." 
            for result in context[:2]
        ])
        
        prompt = f"""Responde en español basado solo en esta información:

{context_text}

Pregunta: {question}

Respuesta breve:"""
        
        try:
            async with aiohttp.ClientSession(timeout=self.timeout) as session:
                async with session.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "options": { #configuración optimizada en respuesta y longitud
                            "temperature": 0.1,
                            "num_predict": 80,
                            "top_k": 20,
                            "top_p": 0.9,
                            "repeat_penalty": 1.1
                        }
                    }
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        answer = result.get("response", "").strip()
                        return answer if answer else "No se pudo generar respuesta"
                    else:
                        return f"Error en Ollama: HTTP {response.status}"
        except asyncio.TimeoutError:
            return "El modelo tardó demasiado en responder. Intenta con una pregunta más específica."
        except Exception as e:
            return f"Error: {str(e)}"