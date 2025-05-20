from pydantic import BaseModel, EmailStr
from typing import List, Optional

class PDFRequest(BaseModel):
    pdf_url: str
    prompt: str

class PDFResponse(BaseModel):
    response: str

class PDFURLRequest(BaseModel):
    pdf_url: str

class APACitationResponse(BaseModel):
    apa_citation: str

# Nuevos modelos para el CRUD de archivos PDF
class PDFResponseItem(BaseModel):
    pdf_id: int
    link: str
    owner_id: int
    created_at: str
    bucket_path: Optional[str] = None

    class Config:
        orm_mode = True
