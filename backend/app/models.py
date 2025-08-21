from pydantic import BaseModel, Field
from typing import List, Dict, Any,Optional

class Document(BaseModel):
    id: str
    name: str
    content: str
    chunks: List[str]

class SearchResult(BaseModel):
    text: str
    document_name: str
    score: float = Field(..., ge=0, le=1)

class AskRequest(BaseModel):
    question: str = Field(..., min_length=3)

class AskResponse(BaseModel):
    answer: str
    citations: List[str]