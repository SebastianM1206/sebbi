from fastapi import APIRouter, HTTPException
from app.models.pdf import PDFRequest, PDFResponse
from app.services.pdf_service import pdf_service

router = APIRouter(prefix="/pdf", tags=["pdf"])

@router.post("/ask", response_model=PDFResponse)
async def process_pdf(request: PDFRequest):
    try:
        response = await pdf_service.process_pdf(
            pdf_url=request.pdf_url,
            prompt=request.prompt
        )
        return PDFResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
