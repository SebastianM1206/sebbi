from fastapi import APIRouter, HTTPException, Path, Query
from typing import List
from app.models.document import DocumentCreate, DocumentUpdate, DocumentResponse, DocumentDelete, AutocompleteRequest, AutocompleteResponse
from app.services.document_service import document_service
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/", response_model=DocumentResponse)
async def create_document(document_data: DocumentCreate):
    """
    Crea un nuevo documento
    """
    try:
        document = await document_service.create_document(
            content=document_data.content,
            email=document_data.email
        )
        return document
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[DocumentResponse])
async def get_documents(email: str = Query(..., description="Email del usuario")):
    """
    Obtiene todos los documentos de un usuario
    """
    try:
        documents = await document_service.get_documents_by_email(email)
        return documents
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int = Path(..., description="ID del documento"), 
    email: str = Query(..., description="Email del usuario")
):
    """
    Obtiene un documento por su ID
    """
    try:
        document = await document_service.get_document_by_id(document_id, email)
        return document
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_data: DocumentUpdate,
    document_id: int = Path(..., description="ID del documento"),
    email: str = Query(..., description="Email del usuario")
):
    """
    Actualiza un documento
    """
    try:
        document = await document_service.update_document(
            document_id=document_id,
            content=document_data.content,
            email=email
        )
        return document
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{document_id}", response_model=DocumentResponse)
async def delete_document(
    document_id: int = Path(..., description="ID del documento"),
    email: str = Query(..., description="Email del usuario")
):
    """
    Elimina un documento
    """
    try:
        document = await document_service.delete_document(document_id, email)
        return document
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/autocomplete", response_model=AutocompleteResponse)
async def autocomplete_text_document(request_data: AutocompleteRequest):
    """
    Autocompleta un texto utilizando Gemini.
    El texto puede ser un título o un párrafo.
    """
    try:
        autocompleted_text = await gemini_service.autocomplete_text(request_data.text_input)
        return AutocompleteResponse(autocompleted_text=autocompleted_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al autocompletar el texto: {str(e)}") 