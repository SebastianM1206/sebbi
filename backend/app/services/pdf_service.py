from google import genai
from google.genai import types
import httpx
from app.core.config import settings
from supabaseConnection.client import get_supabase_client # Para interactuar con Supabase DB y Storage
from fastapi import UploadFile # Para tipado de archivos subidos
from pydantic import EmailStr
from typing import List, Dict
import re # Para sanitizar nombres de carpetas

class PDFService:
    def __init__(self):
        self.supabase = get_supabase_client() # Cliente Supabase para DB y Storage
        self.gemini_client = genai.Client(api_key=settings.GOOGLE_API_KEY) # Cliente Gemini para IA
        self.pdf_bucket_name = "pdfs" # Nombre del bucket en Supabase Storage

    async def _get_owner_id_by_email(self, email: EmailStr) -> int:
        response = self.supabase.table("users").select("user_id").eq("email", email).single().execute()
        if not response.data:
            raise ValueError(f"Usuario con email {email} no encontrado.")
        return response.data["user_id"]

    def _sanitize_folder_name(self, email: str) -> str:
        # Crea un nombre de carpeta seguro a partir del email
        username = email.split('@')[0]
        sanitized_username = re.sub(r'[^a-zA-Z0-9_.-]', '_', username)
        return f"user_{sanitized_username}_{email.split('@')[-1].split('.')[0]}" # Ej: user_john_doe_gmail

    async def create_pdf_entry(self, file: UploadFile, email: EmailStr) -> Dict:
        owner_id = await self._get_owner_id_by_email(email)
        
        folder_name = self._sanitize_folder_name(email)
        # Sanitizar el nombre del archivo también es una buena práctica, pero se omite por brevedad
        file_path_in_bucket = f"{folder_name}/{file.filename}"

        file_content = await file.read()
        
        try:
            self.supabase.storage.from_(self.pdf_bucket_name).upload(
                path=file_path_in_bucket,
                file=file_content,
                file_options={"content-type": file.content_type, "upsert": "true"} # upsert:true permite sobrescribir
            )
        except Exception as e:
            raise Exception(f"Error al subir el archivo PDF a Supabase Storage: {str(e)}")

        public_url = self.supabase.storage.from_(self.pdf_bucket_name).get_public_url(file_path_in_bucket)

        # Guardar el path del bucket junto con el link y owner_id
        db_entry = {
            "link": public_url, 
            "owner_id": owner_id,
            "bucket_path": file_path_in_bucket # Nueva columna
        }
        db_response = self.supabase.table("pdfs").insert(db_entry).execute()

        db_operation_error_message = None
        if hasattr(db_response, 'error') and db_response.error:
            db_operation_error_message = db_response.error.message
        
        if db_operation_error_message:
            try:
                self.supabase.storage.from_(self.pdf_bucket_name).remove([file_path_in_bucket])
            except Exception as storage_del_exc:
                print(f"Error al eliminar PDF del storage tras fallo de BD: {storage_del_exc}")
            raise Exception(f"Error al guardar PDF en la base de datos: {db_operation_error_message}")
        
        if not db_response.data:
            try:
                self.supabase.storage.from_(self.pdf_bucket_name).remove([file_path_in_bucket])
            except Exception as storage_del_exc:
                print(f"Error al eliminar PDF del storage tras no recibir datos de la BD: {storage_del_exc}")
            raise Exception("Error al guardar PDF en la base de datos: no se recibieron datos de confirmación tras la inserción.")
        
        return db_response.data[0]

    async def get_pdfs_by_user(self, email: EmailStr) -> List[Dict]:
        owner_id = await self._get_owner_id_by_email(email)
        response = self.supabase.table("pdfs").select("*").eq("owner_id", owner_id).execute()
        if hasattr(response, 'error') and response.error:
            raise Exception(f"Error al obtener PDFs del usuario: {response.error.message}")
        return response.data if response.data else []

    async def get_pdf_by_id_for_user(self, pdf_id: int, email: EmailStr) -> Dict:
        owner_id = await self._get_owner_id_by_email(email)
        response = self.supabase.table("pdfs").select("*").eq("pdf_id", pdf_id).eq("owner_id", owner_id).single().execute()
        if not response.data:
            raise ValueError(f"PDF con id {pdf_id} no encontrado para este usuario o no existe.")
        # No es necesario chequear response.error aquí si single() ya maneja el no encontrar datos como ValueError
        return response.data
    
    async def delete_pdf_entry(self, pdf_id: int, email: EmailStr) -> Dict:
        owner_id = await self._get_owner_id_by_email(email)
        
        # Obtener el registro completo, incluyendo bucket_path
        pdf_record_response = self.supabase.table("pdfs").select("*, bucket_path").eq("pdf_id", pdf_id).single().execute()

        if not pdf_record_response.data:
            raise ValueError(f"PDF con id {pdf_id} no encontrado.")
        if pdf_record_response.data["owner_id"] != owner_id:
            raise PermissionError("No tienes permiso para eliminar este PDF.")

        file_path_in_bucket = pdf_record_response.data.get("bucket_path") # Obtener el path guardado

        if file_path_in_bucket:
            try:
                self.supabase.storage.from_(self.pdf_bucket_name).remove([file_path_in_bucket])
            except Exception as e:
                # Si falla la eliminación del storage, es importante decidir la política.
                # Por ahora, lanzamos excepción y no eliminamos de la BD para mantener consistencia.
                raise Exception(f"Error al eliminar PDF de Supabase Storage: {str(e)}. El registro en BD no fue eliminado.")
        else:
            print(f"Advertencia: No se encontró bucket_path para el PDF id {pdf_id}. No se intentará eliminar del storage.")

        delete_db_response = self.supabase.table("pdfs").delete().eq("pdf_id", pdf_id).eq("owner_id", owner_id).execute()

        db_operation_error_message = None
        if hasattr(delete_db_response, 'error') and delete_db_response.error:
            db_operation_error_message = delete_db_response.error.message
        
        if db_operation_error_message:
            # Aquí el archivo ya pudo haber sido eliminado del storage, o no si no había bucket_path.
            # La consistencia podría estar comprometida si la eliminación del storage tuvo éxito pero la de BD falló.
            raise Exception(f"Error al eliminar PDF de la base de datos: {db_operation_error_message}")
        
        return pdf_record_response.data # Devolver los datos del registro que fue eliminado

    async def process_pdf(self, pdf_url: str, prompt: str) -> str:
        try:
            # Obtener el contenido del PDF
            async with httpx.AsyncClient() as client:
                response = await client.get(pdf_url)
                if response.status_code != 200:
                    raise Exception(f"Error al obtener el PDF: {response.status_code}")
                pdf_data = response.content

            # Generar la respuesta usando Gemini
            response = self.gemini_client.models.generate_content(
                model="gemini-2.0-flash",
                contents=[
                    types.Part.from_bytes(
                        data=pdf_data,
                        mime_type='application/pdf',
                    ),
                    prompt
                ]
            )
            
            return response.text
        except Exception as e:
            raise Exception(f"Error al procesar el PDF: {str(e)}")

    async def get_apa_citation_for_url(self, pdf_url: str) -> str:
        """
        Obtiene una cita APA para un PDF a partir de su URL, procesando el contenido del PDF.
        """
        try:
            # Obtener el contenido del PDF
            async with httpx.AsyncClient() as client:
                pdf_response = await client.get(pdf_url)
                if pdf_response.status_code != 200:
                    raise Exception(f"Error al obtener el PDF para citación: {pdf_response.status_code}")
                pdf_data = pdf_response.content

            # Prompt específico para generar citas APA
            apa_prompt = (
                "Genera únicamente la cita completa en formato APA 7ª edición, sin ninguna explicación ni texto adicional, "
                "basándote en el contenido del siguiente PDF. No incluyas frases introductorias, aclaraciones ni comentarios, "
                "solo la cita en formato APA."
            )

            # Generar la cita usando Gemini con el contenido del PDF
            citation_response = self.gemini_client.models.generate_content(
                model="gemini-2.0-flash",
                contents=[
                    types.Part.from_bytes(
                        data=pdf_data,
                        mime_type='application/pdf',
                    ),
                    apa_prompt
                ]
            )
            
            return citation_response.text.strip()
        except Exception as e:
            raise Exception(f"Error al generar la cita APA desde el PDF: {str(e)}")

pdf_service = PDFService()
