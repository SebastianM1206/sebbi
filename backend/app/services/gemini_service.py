from google import genai
from google.genai import types
from app.core.config import settings
import httpx  # Para descargar los PDFs

class GeminiService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GOOGLE_API_KEY)
        self.system_prompt = """Eres un profesor universitario experto en redacción académica. Tu objetivo es proporcionar respuestas 
        detalladas y profesionales en formato de ensayo académico.

        Instrucciones para tus respuestas:
        1. Escribe en formato de ensayo académico, con párrafos bien estructurados y cohesivos
        2. Usa un lenguaje formal pero accesible
        3. Incluye citas en formato APA 7ª edición (2025) cuando sea necesario
        4. Si mencionas una fuente web, incluye el enlace en formato markdown [texto](url)
        5. Destaca conceptos importantes en **negrita**
        6. Usa ejemplos relevantes para ilustrar tus puntos
        7. Mantén un tono profesional y académico
        8. Si la pregunta es técnica, proporciona explicaciones detalladas y paso a paso

        Formato de citas APA:
        - Cita en texto: (Apellido, Año)
        - Cita con autor en el texto: Apellido (Año) afirma que...
        - Referencias al final: Apellido, A. (Año). Título. Editorial/URL

        Ejemplo de enlace: [Nombre del recurso](https://ejemplo.com)

        Tu respuesta debe fluir naturalmente como un ensayo académico, sin secciones predefinidas."""
    
    async def generate_response(self, text: str) -> str:
        try:
            prompt = f"{self.system_prompt}\n\nPregunta del usuario: {text}"
            
            # Generar la respuesta usando el método correcto
            response = self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            
            return response.text
        except Exception as e:
            raise Exception(f"Error al generar respuesta con Gemini: {str(e)}")

    async def generate_response_with_context(self, text: str, pdf_urls: list[str]) -> str:
        """
        Genera una respuesta basada en la pregunta del usuario y el contenido de los PDFs proporcionados.
        
        Args:
            text: La pregunta del usuario
            pdf_urls: Lista de URLs de PDFs que servirán como contexto
            
        Returns:
            Respuesta generada por Gemini basada en la pregunta y los PDFs
        """
        try:
            # Descargar todos los PDFs
            pdf_contents = []
            async with httpx.AsyncClient() as client:
                for url in pdf_urls:
                    try:
                        response = await client.get(url)
                        if response.status_code != 200:
                            print(f"Error al obtener el PDF {url}: {response.status_code}")
                            continue
                        
                        # Añadir el contenido del PDF como parte
                        pdf_contents.append(
                            types.Part.from_bytes(
                                data=response.content,
                                mime_type='application/pdf'
                            )
                        )
                    except Exception as e:
                        print(f"Error al procesar el PDF {url}: {str(e)}")

            if not pdf_contents:
                raise Exception("No se pudo descargar ningún PDF válido de los enlaces proporcionados")
            
            # Crear el prompt con el contexto de PDFs
            prompt_with_context = f"{self.system_prompt}\n\nPregunta del usuario: {text}\n\nUsa la información de los PDFs proporcionados para elaborar tu respuesta."
            
            # Construir los contents con los PDFs y el prompt
            contents = pdf_contents + [prompt_with_context]
            
            # Generar la respuesta usando el método correcto
            response = self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents=contents
            )
            
            return response.text
        except Exception as e:
            raise Exception(f"Error al generar respuesta con Gemini usando contexto de PDFs: {str(e)}")

    async def autocomplete_text(self, text_input: str) -> str:
        """
        Autocompleta el texto proporcionado utilizando Gemini y devuelve solo la continuación.
        """
        try:
            # Un prompt más específico para la tarea de autocompletar
            prompt = f"""Eres un asistente de escritura. Tu tarea es SOLO proporcionar la continuación del texto que te doy.
            NO repitas el texto original.
            NO uses formato especial como *, **, etc.
            NO incluyas el texto que te proporciono en tu respuesta.
            NO empieces tu respuesta con el mismo texto que te pido continuar.
            
            Texto a continuar: {text_input}
            
            Continúa el texto de manera coherente y natural:"""
            
            response_object = self.client.models.generate_content(
                model="gemini-2.0-flash", 
                contents=prompt,
            )
            
            return response_object.text.strip()
        except Exception as e:
            raise Exception(f"Error al autocompletar texto con Gemini: {str(e)}")


gemini_service = GeminiService() 