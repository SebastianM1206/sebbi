from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google import genai
from fastapi.middleware.cors import CORSMiddleware

# Configurar el cliente de Gemini
GOOGLE_API_KEY = "AIzaSyCx8rHobpabwcTR-6Wmmh-J_1bqF5gJZ3M"
client = genai.Client(api_key=GOOGLE_API_KEY)

app = FastAPI()

# Configurar CORS
origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    text: str

@app.post("/ask")
async def ask_gemini(question: Question):
    try:
        # Generar respuesta usando Gemini con el nuevo método
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=question.text
        )
        return {"response": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "API de Gemini funcionando. Usa el endpoint /ask para hacer preguntas."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
