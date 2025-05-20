from supabaseConnection.client import get_supabase_client
from typing import Dict, List, Optional

class DocumentService:
    def __init__(self):
        self.client = get_supabase_client()
    
    async def get_user_by_email(self, email: str) -> Dict:
        """
        Obtiene el ID de usuario a partir de su email
        """
        try:
            result = self.client.table("users").select("*").eq("email", email).execute()
            if not result.data:
                raise Exception("Usuario no encontrado")
            return result.data[0]
        except Exception as e:
            raise Exception(f"Error al buscar usuario: {str(e)}")
    
    async def create_document(self, content: str, email: str) -> Dict:
        """
        Crea un nuevo documento
        """
        try:
            # Obtener el ID del usuario por su email
            user = await self.get_user_by_email(email)
            owner_id = user["user_id"]
            
            # Crear el documento
            data = {
                "content": content,
                "owner_id": owner_id,
                "created_at": "now()",
                "updated_at": "now()"
            }
            
            result = self.client.table("documents").insert(data).execute()
            
            if not result.data:
                raise Exception("Error al crear el documento")
                
            return result.data[0]
        except Exception as e:
            raise Exception(f"Error al crear documento: {str(e)}")
    
    async def get_documents_by_email(self, email: str) -> List[Dict]:
        """
        Obtiene todos los documentos de un usuario
        """
        try:
            # Obtener el ID del usuario por su email
            user = await self.get_user_by_email(email)
            owner_id = user["user_id"]
            
            # Obtener documentos
            result = self.client.table("documents").select("*").eq("owner_id", owner_id).execute()
            
            return result.data
        except Exception as e:
            raise Exception(f"Error al obtener documentos: {str(e)}")
    
    async def get_document_by_id(self, document_id: int, email: str) -> Dict:
        """
        Obtiene un documento por su ID y verifica que pertenezca al usuario
        """
        try:
            # Obtener el ID del usuario por su email
            user = await self.get_user_by_email(email)
            owner_id = user["user_id"]
            
            # Obtener el documento
            result = self.client.table("documents").select("*").eq("id", document_id).execute()
            
            if not result.data:
                raise Exception("Documento no encontrado")
            
            document = result.data[0]
            
            # Verificar que el documento pertenezca al usuario
            if document["owner_id"] != owner_id:
                raise Exception("No tienes permiso para acceder a este documento")
                
            return document
        except Exception as e:
            raise Exception(f"Error al obtener documento: {str(e)}")
    
    async def update_document(self, document_id: int, content: str, email: str) -> Dict:
        """
        Actualiza un documento
        """
        try:
            # Verificar que el documento exista y pertenezca al usuario
            await self.get_document_by_id(document_id, email)
            
            # Actualizar el documento
            data = {
                "content": content,
                "updated_at": "now()"
            }
            
            result = self.client.table("documents").update(data).eq("id", document_id).execute()
            
            if not result.data:
                raise Exception("Error al actualizar el documento")
                
            return result.data[0]
        except Exception as e:
            raise Exception(f"Error al actualizar documento: {str(e)}")
    
    async def delete_document(self, document_id: int, email: str) -> Dict:
        """
        Elimina un documento
        """
        try:
            # Verificar que el documento exista y pertenezca al usuario
            document = await self.get_document_by_id(document_id, email)
            
            # Eliminar el documento
            result = self.client.table("documents").delete().eq("id", document_id).execute()
            
            if not result.data:
                raise Exception("Error al eliminar el documento")
                
            return document
        except Exception as e:
            raise Exception(f"Error al eliminar documento: {str(e)}")

document_service = DocumentService() 