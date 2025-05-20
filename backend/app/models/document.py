from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class DocumentCreate(BaseModel):
    content: str
    email: EmailStr  # El email del propietario en lugar del owner_id

class DocumentUpdate(BaseModel):
    content: Optional[str] = None

class DocumentResponse(BaseModel):
    id: int
    content: str
    owner_id: int
    created_at: str
    updated_at: str

class DocumentDelete(BaseModel):
    id: int
    email: EmailStr  # Para verificar que el usuario es dueño del documento

class AutocompleteRequest(BaseModel):
    text_input: str

class AutocompleteResponse(BaseModel):
    autocompleted_text: str 