from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query, Path
from typing import List
from app.models.pdf import (
    PDFRequest, PDFResponse, 
    PDFURLRequest, APACitationResponse,
    PDFResponseItem # Modelo añadido para respuestas CRUD
)
from app.services.pdf_service import pdf_service
from pydantic import EmailStr # Para validación de email en parámetros

router = APIRouter(prefix="/pdf", tags=["pdf"])

# --- Endpoints CRUD para archivos PDF ---

@router.post("/upload", response_model=PDFResponseItem)
async def upload_pdf_file(
    email: EmailStr = Form(...),
    file: UploadFile = File(...)
):
    """
    Sube un archivo PDF y lo asocia a un usuario por su email.
    El PDF se guarda en Supabase Storage y se crea un registro en la base de datos.
    """
    try:
        created_pdf = await pdf_service.create_pdf_entry(file=file, email=email)
        return created_pdf
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir el PDF: {str(e)}")

@router.get("/user", response_model=List[PDFResponseItem])
async def list_user_pdfs(email: EmailStr = Query(..., description="Email del usuario para listar sus PDFs")):
    """
    Lista todos los PDFs asociados a un usuario.
    """
    try:
        pdfs = await pdf_service.get_pdfs_by_user(email=email)
        return pdfs
    except ValueError as ve: # Si el usuario no se encuentra
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al listar PDFs: {str(e)}")

@router.get("/{pdf_id}", response_model=PDFResponseItem)
async def get_single_pdf(
    pdf_id: int = Path(..., description="ID del PDF a obtener"),
    email: EmailStr = Query(..., description="Email del propietario del PDF")
):
    """
    Obtiene un PDF específico por su ID, verificando que pertenezca al usuario.
    """
    try:
        pdf = await pdf_service.get_pdf_by_id_for_user(pdf_id=pdf_id, email=email)
        return pdf
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener el PDF: {str(e)}")

@router.delete("/{pdf_id}", response_model=PDFResponseItem)
async def delete_pdf_file(
    pdf_id: int = Path(..., description="ID del PDF a eliminar"),
    email: EmailStr = Query(..., description="Email del propietario para autorización")
):
    """
    Elimina un PDF (archivo en Storage y registro en BD) por su ID, verificando propiedad.
    """
    try:
        deleted_pdf_info = await pdf_service.delete_pdf_entry(pdf_id=pdf_id, email=email)
        return deleted_pdf_info
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar el PDF: {str(e)}")


# --- Endpoints existentes para IA sobre PDFs ---
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

@router.post("/cite-apa", response_model=APACitationResponse)
async def generate_apa_citation(request: PDFURLRequest):
    """
    Genera una cita en formato APA para un PDF a partir de su URL.
    """
    try:
        apa_citation = await pdf_service.get_apa_citation_for_url(pdf_url=request.pdf_url)
        return APACitationResponse(apa_citation=apa_citation)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
