from pydantic import BaseModel
from typing import List, Optional

class Question(BaseModel):
    text: str
    context: Optional[List[str]] = None  # Lista opcional de URLs de PDFs para dar contexto a la respuesta

class QuestionResponse(BaseModel):
    response: str 