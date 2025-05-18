from pydantic import BaseModel

class PDFRequest(BaseModel):
    pdf_url: str
    prompt: str

class PDFResponse(BaseModel):
    response: str
