from google import genai
from google.genai import types
import httpx
from app.core.config import settings

class PDFService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)
    
    async def process_pdf(self, pdf_url: str, prompt: str) -> str:
        try:
            # Obtener el contenido del PDF
            async with httpx.AsyncClient() as client:
                response = await client.get(pdf_url)
                if response.status_code != 200:
                    raise Exception(f"Error al obtener el PDF: {response.status_code}")
                pdf_data = response.content

            # Generar la respuesta usando Gemini
            response = self.client.models.generate_content(
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

pdf_service = PDFService()
