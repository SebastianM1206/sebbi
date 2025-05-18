from google import genai
from app.core.config import settings

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

gemini_service = GeminiService() 